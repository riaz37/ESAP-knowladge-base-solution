"use client";

import React, { useState, useEffect, useCallback } from "react";
import { EnhancedBackground } from "@/components/ui/enhanced-background";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Database, 
  Settings, 
  Save, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  RefreshCw,
  Key,
  Building2,
  Building
} from "lucide-react";
import { toast } from "sonner";
import { UserCurrentDBService } from "@/lib/api/services/user-current-db-service";
import { useUserContext } from "@/lib/hooks";
import { ParentCompanyService } from "@/lib/api/services/parent-company-service";
import { SubCompanyService } from "@/lib/api/services/sub-company-service";

interface UserConfig {
  userId: string;
  parentCompanyId: number | null;
  subCompanyId: number | null;
  databaseId: number | null;
  databaseName: string;
  databaseUrl: string;
}

interface ParentCompanyOption {
  parent_company_id: number;
  company_name: string;
  description: string;
  db_id: number;
}

interface SubCompanyOption {
  sub_company_id: number;
  company_name: string;
  description: string;
  db_id: number;
  parent_company_name: string;
}

export default function UserConfigurationPage() {
  const { userId, databaseId, databaseName, refreshUserConfig, updateBusinessRules } = useUserContext();
  
  const [userConfig, setUserConfig] = useState<UserConfig>({
    userId: userId || "",
    parentCompanyId: null,
    subCompanyId: null,
    databaseId: databaseId || null,
    databaseName: databaseName || "",
    databaseUrl: ""
  });

  const [parentCompanies, setParentCompanies] = useState<ParentCompanyOption[]>([]);
  const [subCompanies, setSubCompanies] = useState<SubCompanyOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasEnteredUserId, setHasEnteredUserId] = useState(false);

  // Update local state when context changes
  useEffect(() => {
    setUserConfig(prev => ({
      ...prev,
      userId: userId || "",
      databaseId: databaseId || null,
      databaseName: databaseName || "",
      databaseUrl: "" // Removed businessRules from here
    }));
  }, [userId, databaseId, databaseName]);

  // Load parent companies and sub companies
  const loadCompanyData = async () => {
    if (!userConfig.userId || !userConfig.userId.trim()) {
      console.log('No user ID provided, skipping company data load');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Load parent companies
      try {
        console.log('Fetching parent companies...');
        const parentCompaniesResponse = await ParentCompanyService.getParentCompanies();
        console.log('Parent companies response:', parentCompaniesResponse);
        
        if (parentCompaniesResponse && parentCompaniesResponse.companies) {
          setParentCompanies(parentCompaniesResponse.companies);
        } else {
          setParentCompanies([]);
        }
      } catch (error: any) {
        console.error("Failed to load parent companies:", error);
        setParentCompanies([]);
      }

      // Load sub companies
      try {
        console.log('Fetching sub companies...');
        const subCompaniesResponse = await SubCompanyService.getSubCompanies();
        console.log('Sub companies response:', subCompaniesResponse);
        
        if (subCompaniesResponse && subCompaniesResponse.companies) {
          setSubCompanies(subCompaniesResponse.companies);
        } else {
          setSubCompanies([]);
        }
      } catch (error: any) {
        console.error("Failed to load sub companies:", error);
        setSubCompanies([]);
      }

      // Try to load current user configuration after companies are loaded
      await loadCurrentUserConfig();
    } catch (error) {
      console.error("Failed to load company data:", error);
      setError("Failed to load company data");
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentUserConfig = async () => {
    try {
      // Get user ID from localStorage if it exists
      const currentUserId = localStorage.getItem("currentUserId");
      if (currentUserId) {
        setUserConfig(prev => ({ ...prev, userId: currentUserId }));

        // Try to get current database configuration and business rules
        try {
          const currentDB = await UserCurrentDBService.getUserCurrentDB(currentUserId);
          if (currentDB && currentDB.db_id) {
            setUserConfig(prev => ({ 
              ...prev, 
              databaseId: currentDB.db_id,
              databaseName: `Database ${currentDB.db_id}`
            }));

            // Update business rules in the context if available
            if (currentDB.business_rule) {
              updateBusinessRules(currentDB.business_rule);
            }

            // Now that we have companies loaded, try to find which company this database belongs to
            const parentCompany = parentCompanies.find(pc => pc.db_id === currentDB.db_id);
            if (parentCompany) {
              setUserConfig(prev => ({ 
                ...prev, 
                parentCompanyId: parentCompany.parent_company_id 
              }));
            }

            const subCompany = subCompanies.find(sc => sc.db_id === currentDB.db_id);
            if (subCompany) {
              setUserConfig(prev => ({ 
                ...prev, 
                subCompanyId: subCompany.sub_company_id 
              }));
            }
          }
        } catch (error) {
          console.log("No current database configured for user");
        }
      }
    } catch (error) {
      console.error("Failed to load user configuration:", error);
    }
  };

  const handleParentCompanyChange = (parentCompanyId: string) => {
    const pcId = parseInt(parentCompanyId);
    const selectedParentCompany = parentCompanies.find(pc => pc.parent_company_id === pcId);
    
    if (selectedParentCompany) {
      setUserConfig(prev => ({
        ...prev,
        parentCompanyId: pcId,
        subCompanyId: null, // Reset sub company when parent changes
        databaseId: selectedParentCompany.db_id,
        databaseName: selectedParentCompany.company_name,
        databaseUrl: `Database ${selectedParentCompany.db_id}`
      }));

      // Set the database for the user and get business rules
      setDatabaseForUser(selectedParentCompany.db_id);
    }
  };

  const handleSubCompanyChange = (subCompanyId: string) => {
    const scId = parseInt(subCompanyId);
    const selectedSubCompany = subCompanies.find(sc => sc.sub_company_id === scId);
    
    if (selectedSubCompany) {
      setUserConfig(prev => ({
        ...prev,
        subCompanyId: scId,
        parentCompanyId: null, // Reset parent company when sub company is selected
        databaseId: selectedSubCompany.db_id,
        databaseName: selectedSubCompany.company_name,
        databaseUrl: `Database ${selectedSubCompany.db_id}`
      }));

      // Set the database for the user and get business rules
      setDatabaseForUser(selectedSubCompany.db_id);
    }
  };

  // Set the database for the user and get business rules
  const setDatabaseForUser = async (dbId: number) => {
    if (!userConfig.userId.trim() || !dbId) return;

    setLoading(true);
    
    try {
      console.log('Setting database for user:', { userId: userConfig.userId, dbId });
      
      // Step 1: Set the database for the user using PUT endpoint
      const setDbResponse = await UserCurrentDBService.setUserCurrentDB(userConfig.userId, {
        db_id: dbId
      });
      
      console.log('Database set response:', setDbResponse);
      toast.success(`Database ${dbId} set for user ${userConfig.userId}`);

      // Step 2: Get the business rules using GET endpoint
      console.log('Getting business rules for user:', userConfig.userId);
      const getDbResponse = await UserCurrentDBService.getUserCurrentDB(userConfig.userId);
      
      console.log('Get database response:', getDbResponse);
      
      if (getDbResponse && getDbResponse.business_rule) {
        // Update the business rules in the user context
        updateBusinessRules(getDbResponse.business_rule);
        console.log('Business rules loaded:', getDbResponse.business_rule);
        toast.success(`Business rules loaded for Database ${dbId}`);
      } else {
        console.log('No business rules found for database');
        updateBusinessRules(""); // Clear business rules if none found
        toast.info(`No business rules configured for Database ${dbId}`);
      }

    } catch (error: any) {
      console.error('Failed to set database or get business rules:', error);
      const errorMessage = error?.response?.data?.detail || error?.message || "Failed to set database";
      toast.error(`Failed to set database: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfiguration = async () => {
    if (!userConfig.userId.trim()) {
      toast.error("User ID is required");
      return;
    }

    if (!userConfig.databaseId) {
      toast.error("Please select a company to get database access");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('Saving user configuration:', {
        userId: userConfig.userId,
        databaseId: userConfig.databaseId,
        // Removed businessRules from here
      });

      // Save user's current database using real API
      console.log('Calling setUserCurrentDB with:', {
        userId: userConfig.userId,
        request: { db_id: userConfig.databaseId }
      });
      
      const dbResponse = await UserCurrentDBService.setUserCurrentDB(userConfig.userId, {
        db_id: userConfig.databaseId
      });
      
      console.log('Database response:', dbResponse);

      // Save user ID to localStorage
      localStorage.setItem("currentUserId", userConfig.userId);

      setSuccess("Configuration saved successfully!");
      toast.success("User configuration saved!");

      // Refresh the global user context
      await refreshUserConfig();
    } catch (error: any) {
      console.error('Error saving configuration:', error);
      const errorMessage = error?.response?.data?.detail || error?.message || "Failed to save configuration";
      setError(errorMessage);
      toast.error(`Failed to save configuration: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = () => {
    refreshUserConfig();
  };

  const handleClearConfiguration = () => {
    // Clear localStorage
    localStorage.removeItem("currentUserId");
    
    // Reset local state
    setUserConfig({
      userId: "",
      parentCompanyId: null,
      subCompanyId: null,
      databaseId: null,
      databaseName: "",
      databaseUrl: ""
    });
    
    // Clear success/error messages
    setSuccess(null);
    setError(null);
    
    toast.info("Configuration cleared. Please set up a new configuration.");
  };

  const handleUserIdChange = (newUserId: string) => {
    setUserConfig(prev => ({ ...prev, userId: newUserId }));
    
    // Clear previous selections when user ID changes
    setUserConfig(prev => ({ 
      ...prev, 
      parentCompanyId: null,
      subCompanyId: null,
      databaseId: null,
      databaseName: "",
      databaseUrl: ""
    }));
    
    // Clear company data when user ID changes
    setParentCompanies([]);
    setSubCompanies([]);
    
    // Clear success/error messages
    setSuccess(null);
    setError(null);

    // Track if user has entered an ID
    setHasEnteredUserId(newUserId.trim().length > 0);
  };

  const isConfigurationValid = userConfig.userId.trim() && userConfig.databaseId;

  if (loading) {
    return (
      <EnhancedBackground intensity="medium" className="min-h-screen">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-green-500" />
              <span className="text-lg text-gray-600 dark:text-gray-300">
                Loading company data...
              </span>
            </div>
          </div>
        </div>
      </EnhancedBackground>
    );
  }

  return (
    <EnhancedBackground intensity="medium" className="min-h-screen">
     <div className="container mx-auto px-6 py-8" style={{ paddingTop: "120px" }}>
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            User Configuration
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Configure your database access by selecting your company. Business rules are automatically loaded.
          </p>
          <div className="mt-2 p-3 bg-blue-900/20 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-blue-300">
              🔗 <strong>Database Selection:</strong> Choose one database from your parent company or sub company. Business rules are automatically loaded from the user-current-db endpoint.
            </p>
          </div>
        </div>

        {/* Configuration Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - User and Company Configuration */}
          <div className="space-y-6">
            {/* User ID Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  User Identification
                </CardTitle>
                <CardDescription>
                  Set your unique user identifier for this system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="userId">User ID</Label>
                  <div className="flex gap-2">
                    <Input
                      id="userId"
                      value={userConfig.userId}
                      onChange={(e) => handleUserIdChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && userConfig.userId.trim() && !loading) {
                          loadCompanyData();
                        }
                      }}
                      placeholder="Enter your user ID"
                      className="bg-white dark:bg-gray-800 flex-1"
                    />
                    <Button
                      onClick={() => {
                        if (userConfig.userId.trim()) {
                          loadCompanyData();
                        } else {
                          toast.error("Please enter a User ID first");
                        }
                      }}
                      disabled={!userConfig.userId.trim() || loading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Load Databases"
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Enter your unique user identifier. This ID will be used to identify your queries and configurations.
                  </p>
                  <p className="text-xs text-blue-500">
                    💡 Tip: Use your company username, email, or any unique identifier you prefer.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Company Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Database Selection
                </CardTitle>
                <CardDescription>
                  {!userConfig.userId.trim() 
                    ? "Enter your User ID above to see available databases"
                    : "Select your company to get access to its database"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!userConfig.userId.trim() ? (
                  <div className="p-3 bg-blue-900/20 border border-blue-500/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-400" />
                      <span className="text-sm text-blue-400">User ID Required</span>
                    </div>
                    <p className="text-xs text-blue-300 mt-1">
                      Please enter your User ID above and click "Load Companies" to see available databases.
                    </p>
                  </div>
                ) : hasEnteredUserId && parentCompanies.length === 0 && subCompanies.length === 0 && !loading ? (
                  <div className="p-3 bg-blue-900/20 border border-blue-500/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-400" />
                      <span className="text-sm text-blue-400">Ready to Load Databases</span>
                    </div>
                    <p className="text-xs text-blue-300 mt-1">
                      You've entered "{userConfig.userId}". Click the "Load Companies" button above to fetch available databases.
                    </p>
                  </div>
                ) : loading ? (
                  <div className="flex items-center gap-2 p-3 bg-gray-800/50 rounded-lg">
                    <Loader2 className="h-4 w-4 animate-spin text-green-400" />
                    <span className="text-sm text-gray-300">Loading available databases...</span>
                  </div>
                ) : parentCompanies.length === 0 && subCompanies.length === 0 ? (
                  <div className="p-3 bg-yellow-900/20 border border-yellow-500/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm text-yellow-400">No Databases Available</span>
                    </div>
                    <p className="text-xs text-yellow-300 mt-1">
                      No databases are currently available for user "{userConfig.userId}". Please contact your administrator.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Database Selection - Parent Companies */}
                    {parentCompanies.length > 0 && (
                      <div className="space-y-2">
                        <Label htmlFor="parent-company-select">Parent Company Database</Label>
                        <Select 
                          value={userConfig.parentCompanyId?.toString() || ""} 
                          onValueChange={handleParentCompanyChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a parent company database" />
                          </SelectTrigger>
                          <SelectContent>
                            {parentCompanies.map((pc) => (
                              <SelectItem key={pc.parent_company_id} value={pc.parent_company_id.toString()}>
                                <div className="flex flex-col">
                                  <span className="font-medium">{pc.company_name}</span>
                                  <span className="text-xs text-gray-500">Database ID: {pc.db_id}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500">
                          Select a parent company to access its database
                        </p>
                      </div>
                    )}

                    {/* Database Selection - Sub Companies */}
                    {subCompanies.length > 0 && (
                      <div className="space-y-2">
                        <Label htmlFor="sub-company-select">Sub Company Database</Label>
                        <Select 
                          value={userConfig.subCompanyId?.toString() || ""} 
                          onValueChange={handleSubCompanyChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a sub company database" />
                          </SelectTrigger>
                          <SelectContent>
                            {subCompanies.map((sc) => (
                              <SelectItem key={sc.sub_company_id} value={sc.sub_company_id.toString()}>
                                <div className="flex flex-col">
                                  <span className="font-medium">{sc.company_name}</span>
                                  <span className="text-xs text-gray-500">
                                    Database ID: {sc.db_id} (Parent: {sc.parent_company_name})
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500">
                          Select a sub company to access its database
                        </p>
                      </div>
                    )}

                    {/* Database Selection Info */}
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-blue-800 dark:text-blue-200 font-medium">Database Selection</span>
                      </div>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                        Choose only one database from either parent company or sub company.
                      </p>
                    </div>

                    {userConfig.databaseId && (
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <span className="text-sm text-green-800 dark:text-green-200">
                            Database Selected: {userConfig.databaseName}
                          </span>
                        </div>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                          Database ID: {userConfig.databaseId}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Business Rules and Actions */}
          <div className="space-y-6">
            {/* Configuration Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuration Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">User ID</span>
                    <Badge variant={userConfig.userId.trim() ? "default" : "secondary"}>
                      {userConfig.userId.trim() ? "Set" : "Not Set"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Database</span>
                    <Badge variant={userConfig.databaseId ? "default" : "secondary"}>
                      {userConfig.databaseId ? `Selected (ID: ${userConfig.databaseId})` : "Not Selected"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Business Rules</span>
                    <Badge variant={userConfig.databaseId ? "default" : "secondary"}>
                      {userConfig.databaseId ? "Auto-loaded" : "Not Available"}
                    </Badge>
                  </div>
                </div>

                {isConfigurationValid && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm text-green-800 dark:text-green-200">
                        Configuration is valid and ready to use
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleSaveConfiguration}
                    disabled={!isConfigurationValid || saving}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Configuration
                  </Button>
                  <Button
                    onClick={handleRefresh}
                    variant="outline"
                    className="flex-1"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Button
                    onClick={handleClearConfiguration}
                    variant="outline"
                    className="flex-1"
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Clear Configuration
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <Alert className="mt-6 border-red-200 bg-red-50 dark:bg-red-900/20">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mt-6 border-green-200 bg-green-50 dark:bg-green-900/20">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              {success}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </EnhancedBackground>
  );
} 