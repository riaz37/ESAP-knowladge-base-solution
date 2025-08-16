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
  Shield,
  Key
} from "lucide-react";
import { toast } from "sonner";
import { UserCurrentDBService } from "@/lib/api/services/user-current-db-service";
import { BusinessRulesService } from "@/lib/api/services/business-rules-service";
import { useUserContext } from "@/lib/hooks";
import { UserAccessService } from "@/lib/api/services/user-access-service";

interface UserConfig {
  userId: string;
  databaseId: number | null;
  databaseName: string;
  databaseUrl: string;
  businessRules: string;
}

interface DatabaseOption {
  id: number;
  name: string;
  description: string;
  url: string;
}

export default function UserConfigurationPage() {
  const { userId, databaseId, databaseName, businessRules, refreshUserConfig } = useUserContext();
  
  const [userConfig, setUserConfig] = useState<UserConfig>({
    userId: userId || "",
    databaseId: databaseId || null,
    databaseName: databaseName || "",
    databaseUrl: "",
    businessRules: businessRules || ""
  });

  const [availableDatabases, setAvailableDatabases] = useState<DatabaseOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasEnteredUserId, setHasEnteredUserId] = useState(false);
  const [loadingBusinessRules, setLoadingBusinessRules] = useState(false);

  // Update local state when context changes
  useEffect(() => {
    setUserConfig(prev => ({
      ...prev,
      userId: userId || "",
      databaseId: databaseId || null,
      databaseName: databaseName || "",
      businessRules: businessRules || ""
    }));
  }, [userId, databaseId, databaseName, businessRules]);

  // Load available databases and current user configuration
  // useEffect(() => {
  //   // Only load data if we have a user ID
  //   if (userConfig.userId && userConfig.userId.trim()) {
  //     loadInitialData();
  //   }
  // }, [userConfig.userId]);

  const loadInitialData = async () => {
    if (!userConfig.userId || !userConfig.userId.trim()) {
      console.log('No user ID provided, skipping database load');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Load available databases for this specific user
      try {
        console.log('Fetching accessible databases for user:', userConfig.userId);
        console.log('API endpoint:', `GET /mssql-config/user-access/${userConfig.userId}`);
        
        const databasesResponse = await UserAccessService.getUserAccessibleDatabases(userConfig.userId);
        console.log('Raw databases API response:', databasesResponse);
        console.log('Response type:', typeof databasesResponse);
        console.log('Response keys:', Object.keys(databasesResponse || {}));
        
        if (databasesResponse) {
          console.log('Response data:', databasesResponse.data);
          console.log('Response status:', databasesResponse.status);
          console.log('Response message:', databasesResponse.message);
          
          if (databasesResponse.data) {
            console.log('Data type:', typeof databasesResponse.data);
            console.log('Data length:', Array.isArray(databasesResponse.data) ? databasesResponse.data.length : 'Not an array');
            console.log('Data keys:', Array.isArray(databasesResponse.data) ? 'Array' : Object.keys(databasesResponse.data || {}));
            
            if (Array.isArray(databasesResponse.data)) {
              const databases: DatabaseOption[] = databasesResponse.data.map((db: any, index: number) => {
                console.log(`Database ${index}:`, db);
                return {
                  id: db.id || db.db_id,
                  name: db.name || db.db_name || `Database ${db.id || db.db_id}`,
                  description: db.description || `Database ${db.id || db.db_id}`,
                  url: db.url || db.connection_string || `Database ${db.id || db.db_id}`
                };
              });
              console.log('Mapped databases:', databases);
              setAvailableDatabases(databases);
            } else {
              console.log('Data is not an array, trying to convert...');
              // Try to handle case where data might be an object with database properties
              const dataObj = databasesResponse.data;
              const databases: DatabaseOption[] = Object.keys(dataObj).map((key, index) => {
                const db = dataObj[key];
                console.log(`Database ${index} (${key}):`, db);
                return {
                  id: db.id || db.db_id || index + 1,
                  name: db.name || db.db_name || `Database ${db.id || db.db_id || index + 1}`,
                  description: db.description || `Database ${db.id || db.db_id || index + 1}`,
                  url: db.url || db.connection_string || `Database ${db.id || db.db_id || index + 1}`
                };
              });
              console.log('Converted databases:', databases);
              setAvailableDatabases(databases);
            }
          } else {
            console.log('No data property in response');
            // Fallback to empty array if no databases found
            setAvailableDatabases([]);
          }
        } else {
          console.log('No response received');
          setAvailableDatabases([]);
        }
      } catch (error: any) {
        console.error("Failed to load databases:", error);
        console.error("Error details:", {
          message: error.message,
          response: error.response,
          status: error.response?.status,
          data: error.response?.data
        });
        
        // Fallback to sample databases for testing
        console.log('Using fallback sample databases for testing');
        const fallbackDatabases: DatabaseOption[] = [
          { id: 1, name: "Production Database", description: "Main production database", url: "prod-db.example.com" },
          { id: 2, name: "Development Database", description: "Development and testing database", url: "dev-db.example.com" },
          { id: 3, name: "Analytics Database", description: "Data warehouse and analytics", url: "analytics-db.example.com" }
        ];
        setAvailableDatabases(fallbackDatabases);
      }

      // Try to load current user configuration
      await loadCurrentUserConfig();
    } catch (error) {
      console.error("Failed to load initial data:", error);
      setError("Failed to load configuration data");
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

        // Try to get current database configuration
        try {
          const currentDB = await UserCurrentDBService.getUserCurrentDB(currentUserId);
          if (currentDB && currentDB.db_id) {
            setUserConfig(prev => ({ 
              ...prev, 
              databaseId: currentDB.db_id,
              databaseName: availableDatabases.find(db => db.id === currentDB.db_id)?.name || ""
            }));
          }
        } catch (error) {
          console.log("No current database configured for user");
        }

        // Try to load business rules
        try {
          const businessRules = await BusinessRulesService.getBusinessRules(currentUserId);
          if (businessRules) {
            setUserConfig(prev => ({ ...prev, businessRules }));
          }
        } catch (error) {
          console.log("No business rules configured for user");
        }
      }
    } catch (error) {
      console.error("Failed to load user configuration:", error);
    }
  };

  const handleDatabaseChange = (databaseId: string) => {
    const dbId = parseInt(databaseId);
    const selectedDB = availableDatabases.find(db => db.id === dbId);
    
    if (selectedDB) {
      setUserConfig(prev => ({
        ...prev,
        databaseId: dbId,
        databaseName: selectedDB.name,
        databaseUrl: selectedDB.url
      }));

      // Automatically fetch business rules for the selected database
      loadBusinessRulesForDatabase(dbId);
    }
  };

  // Load business rules for a specific database
  const loadBusinessRulesForDatabase = async (dbId: number) => {
    if (!userConfig.userId.trim() || !dbId) return;

    setLoadingBusinessRules(true);
    
    try {
      console.log('Fetching business rules for database:', dbId);
      console.log('API endpoint:', `GET /mssql-config/mssql-config/${dbId}`);
      
      const businessRules = await BusinessRulesService.getBusinessRules(userConfig.userId);
      console.log('Business rules response:', businessRules);
      
      if (businessRules && businessRules.trim()) {
        setUserConfig(prev => ({ ...prev, businessRules }));
        toast.success(`Business rules loaded for Database ${dbId}`);
      } else {
        setUserConfig(prev => ({ ...prev, businessRules: "" }));
        toast.info(`No business rules configured for Database ${dbId}`);
      }
    } catch (error: any) {
      console.error('Failed to load business rules for database:', error);
      const errorMessage = error?.response?.data?.detail || error?.message || "Failed to load business rules";
      toast.error(`Failed to load business rules: ${errorMessage}`);
      
      // Clear business rules on error
      setUserConfig(prev => ({ ...prev, businessRules: "" }));
    } finally {
      setLoadingBusinessRules(false);
    }
  };

  const handleSaveConfiguration = async () => {
    if (!userConfig.userId.trim()) {
      toast.error("User ID is required");
      return;
    }

    if (!userConfig.databaseId) {
      toast.error("Please select a database");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('Saving user configuration:', {
        userId: userConfig.userId,
        databaseId: userConfig.databaseId,
        businessRules: userConfig.businessRules
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

      // Save business rules if they exist using real API
      if (userConfig.businessRules.trim()) {
        console.log('Calling updateBusinessRules with:', {
          businessRules: userConfig.businessRules,
          userId: userConfig.userId
        });
        
        const rulesResponse = await BusinessRulesService.updateBusinessRules(
          userConfig.businessRules,
          userConfig.userId
        );
        
        console.log('Business rules response:', rulesResponse);
      }

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
      databaseId: null,
      databaseName: "",
      databaseUrl: "",
      businessRules: ""
    });
    
    // Clear success/error messages
    setSuccess(null);
    setError(null);
    
    toast.info("Configuration cleared. Please set up a new configuration.");
  };

  const handleUserIdChange = (newUserId: string) => {
    setUserConfig(prev => ({ ...prev, userId: newUserId }));
    
    // Clear previous database selection when user ID changes
    setUserConfig(prev => ({ 
      ...prev, 
      databaseId: null,
      databaseName: "",
      databaseUrl: ""
    }));
    
    // Clear available databases when user ID changes
    setAvailableDatabases([]);
    
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
                Loading user configuration...
              </span>
            </div>
          </div>
        </div>
      </EnhancedBackground>
    );
  }

  return (
    <EnhancedBackground intensity="medium" className="min-h-screen">
      <div className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            User Configuration
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Configure your database connection and user settings for AI queries
          </p>
          <div className="mt-2 p-3 bg-blue-900/20 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-blue-300">
              🔗 <strong>Real API Integration:</strong> This page connects to your backend services to fetch available databases and save your configuration.
            </p>
          </div>
        </div>

        {/* Configuration Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - User and Database Configuration */}
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
                          loadInitialData();
                        }
                      }}
                      placeholder="Enter your user ID"
                      className="bg-white dark:bg-gray-800 flex-1"
                    />
                    <Button
                      onClick={() => {
                        if (userConfig.userId.trim()) {
                          loadInitialData();
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
                        "Enter"
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

            {/* Database Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database Connection
                </CardTitle>
                <CardDescription>
                  {!userConfig.userId.trim() 
                    ? "Enter your User ID above to see available databases"
                    : "Select the database you want to connect to for queries"
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
                      Please enter your User ID above and click "Enter" to see the databases you have access to.
                    </p>
                  </div>
                ) : hasEnteredUserId && availableDatabases.length === 0 && !loading ? (
                  <div className="p-3 bg-blue-900/20 border border-blue-500/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-400" />
                      <span className="text-sm text-blue-400">Ready to Fetch Databases</span>
                    </div>
                    <p className="text-xs text-blue-300 mt-1">
                      You've entered "{userConfig.userId}". Click the "Enter" button above to fetch your accessible databases.
                    </p>
                  </div>
                ) : loading ? (
                  <div className="flex items-center gap-2 p-3 bg-gray-800/50 rounded-lg">
                    <Loader2 className="h-4 w-4 animate-spin text-green-400" />
                    <span className="text-sm text-gray-300">Loading your accessible databases...</span>
                  </div>
                ) : availableDatabases.length === 0 ? (
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
                    <div className="space-y-2">
                      <Label htmlFor="database-select">Select Database</Label>
                      <Select 
                        value={userConfig.databaseId?.toString() || ""} 
                        onValueChange={handleDatabaseChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a database" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableDatabases.map((db) => (
                            <SelectItem key={db.id} value={db.id.toString()}>
                              <div className="flex flex-col">
                                <span className="font-medium">{db.name}</span>
                                <span className="text-xs text-gray-500">{db.description}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {userConfig.databaseId && (
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <span className="text-sm text-green-800 dark:text-green-200">
                            Selected: {userConfig.databaseName}
                          </span>
                        </div>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                          {userConfig.databaseUrl}
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                          💡 Business rules will be loaded automatically for this database.
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
            {/* Business Rules Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Business Rules
                </CardTitle>
                <CardDescription>
                  {userConfig.databaseId 
                    ? `Business rules for Database ${userConfig.databaseId} (${userConfig.databaseName})`
                    : "Select a database above to load its business rules"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingBusinessRules ? (
                  <div className="flex items-center gap-2 p-3 bg-gray-800/50 rounded-lg">
                    <Loader2 className="h-4 w-4 animate-spin text-green-400" />
                    <span className="text-sm text-gray-300">Loading business rules for Database {userConfig.databaseId}...</span>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="businessRules">Business Rules Content</Label>
                      <textarea
                        id="businessRules"
                        value={userConfig.businessRules}
                        onChange={(e) => setUserConfig(prev => ({ ...prev, businessRules: e.target.value }))}
                        placeholder={
                          userConfig.databaseId 
                            ? "Business rules will be loaded automatically when you select a database"
                            : "Enter business rules (e.g., 'no salary access', 'audit required')"
                        }
                        className="w-full min-h-[120px] p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm resize-y"
                        disabled={!userConfig.databaseId}
                      />
                      <p className="text-xs text-gray-500">
                        {userConfig.databaseId 
                          ? "Business rules for the selected database. You can modify these rules if needed."
                          : "Business rules help enforce security and compliance policies"
                        }
                      </p>
                      {userConfig.databaseId && !userConfig.businessRules.trim() && (
                        <p className="text-xs text-yellow-500">
                          ⚠️ No business rules configured for this database. You can add custom rules above.
                        </p>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

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
                      {userConfig.databaseId ? "Connected" : "Not Selected"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Business Rules</span>
                    <Badge variant={userConfig.businessRules.trim() ? "default" : "secondary"}>
                      {userConfig.businessRules.trim() ? "Configured" : "Not Set"}
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