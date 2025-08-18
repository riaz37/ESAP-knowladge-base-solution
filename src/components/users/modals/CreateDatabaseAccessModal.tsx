"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Database, 
  Building2, 
  CheckCircle, 
  AlertCircle
} from "lucide-react";
import { useUserAccess } from "@/lib/hooks/use-user-access";
import { useDatabaseConfig } from "@/lib/hooks/use-database-config";
import { useParentCompanies } from "@/lib/hooks/use-parent-companies";
import { useSubCompanies } from "@/lib/hooks/use-sub-companies";
import { UserAccessCreateRequest, ParentCompanyData, SubCompanyData } from "@/types/api";

interface CreateDatabaseAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedUser?: string;
}

export function CreateDatabaseAccessModal({
  isOpen,
  onClose,
  onSuccess,
  selectedUser = "",
}: CreateDatabaseAccessModalProps) {
  // Form state
  const [userId, setUserId] = useState(selectedUser);
  const [selectedParentCompany, setSelectedParentCompany] = useState<string>("");
  const [selectedSubCompany, setSelectedSubCompany] = useState<string>("");
  const [selectedDatabase, setSelectedDatabase] = useState<string>("");

  // Data state
  const [parentCompanies, setParentCompanies] = useState<ParentCompanyData[]>([]);
  const [subCompanies, setSubCompanies] = useState<SubCompanyData[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);

  // Hooks
  const { createUserAccess, isLoading, error } = useUserAccess();
  const { databaseConfigs, fetchDatabaseConfigs } = useDatabaseConfig();
  const { getParentCompanies } = useParentCompanies();
  const { getSubCompanies } = useSubCompanies();

  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadCompanyData();
      loadDatabaseConfigs();
    }
  }, [isOpen]);

  // Load company data
  const loadCompanyData = async () => {
    setIsLoadingCompanies(true);
    try {
      // Load parent companies
      const parentData = await getParentCompanies();
      if (parentData) {
        setParentCompanies(parentData);
      }

      // Load sub companies
      const subData = await getSubCompanies();
      if (subData) {
        setSubCompanies(subData);
      }
    } catch (error) {
      console.error("Error loading company data:", error);
    } finally {
      setIsLoadingCompanies(false);
    }
  };

  // Load database configurations
  const loadDatabaseConfigs = async () => {
    try {
      console.log('Loading database configurations...');
      const result = await fetchDatabaseConfigs();
      console.log('Database configs loaded:', result);
      console.log('Current databaseConfigs state:', databaseConfigs);
    } catch (error) {
      console.error("Error loading database configs:", error);
    }
  };

  // Update userId when selectedUser prop changes
  useEffect(() => {
    setUserId(selectedUser);
  }, [selectedUser]);

  // Auto-populate database when company selection changes
  useEffect(() => {
    console.log('Company selection changed:', { selectedParentCompany, selectedSubCompany });
    
    if (selectedParentCompany || selectedSubCompany) {
      let databaseId = "";
      
      if (selectedParentCompany) {
        // Get database ID from parent company
        const parentCompany = parentCompanies.find(c => c.parent_company_id === parseInt(selectedParentCompany));
        if (parentCompany) {
          databaseId = parentCompany.db_id.toString();
          console.log('Setting database ID from parent company:', databaseId);
        }
      } else if (selectedSubCompany) {
        // Get database ID from sub company
        const subCompany = subCompanies.find(c => c.sub_company_id === parseInt(selectedSubCompany));
        if (subCompany) {
          databaseId = subCompany.db_id.toString();
          console.log('Setting database ID from sub company:', databaseId);
        }
      }
      
      if (databaseId) {
        setSelectedDatabase(databaseId);
      }
    } else {
      setSelectedDatabase("");
    }
  }, [selectedParentCompany, selectedSubCompany, parentCompanies, subCompanies]);

  // Get available databases based on selection - simplified for now
  const getAvailableDatabases = () => {
    // This function is no longer needed for the current flow
    // We're directly setting the database ID when company is selected
    return [];
  };

  // Handle company selection changes
  const handleParentCompanyChange = (value: string) => {
    setSelectedParentCompany(value);
    setSelectedSubCompany(""); // Clear sub company when parent changes
    setSelectedDatabase(""); // Clear database selection
  };

  const handleSubCompanyChange = (value: string) => {
    setSelectedSubCompany(value);
    setSelectedDatabase(""); // Clear database selection
  };

  // Get available sub companies for selected parent company
  const getAvailableSubCompanies = () => {
    if (!selectedParentCompany) return [];
    return subCompanies.filter(sub => 
      sub.parent_company_id === parseInt(selectedParentCompany)
    );
  };

  // Handle table selection
  const handleTableSelection = (tableName: string, checked: boolean) => {
    // This function is no longer needed
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!userId || !selectedParentCompany || !selectedDatabase) {
      return;
    }

    const request: UserAccessCreateRequest = {
      user_id: userId,
      parent_company_id: parseInt(selectedParentCompany),
      sub_company_ids: selectedSubCompany ? [parseInt(selectedSubCompany)] : [],
      database_access: {
        parent_databases: [{
          db_id: parseInt(selectedDatabase),
          access_level: "full" // Use string enum instead of number
        }],
        sub_databases: selectedSubCompany ? [{
          sub_company_id: parseInt(selectedSubCompany),
          databases: [{
            db_id: parseInt(selectedDatabase),
            access_level: "full" // Use string enum instead of number
          }]
        }] : []
      },
      table_shows: {
        [selectedDatabase]: [] // Empty array for tables since we removed table selection
      }
    };

    try {
      const result = await createUserAccess(request);
      if (result) {
        onSuccess();
        onClose();
        resetForm();
      }
    } catch (error) {
      console.error("Error creating user access:", error);
    }
  };

  // Reset form
  const resetForm = () => {
    setUserId("");
    setSelectedParentCompany("");
    setSelectedSubCompany("");
    setSelectedDatabase("");
  };

  // Handle close
  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-800 border-blue-500/30">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white flex items-center">
            <Database className="w-5 h-5 mr-2 text-blue-400" />
            Create Database Access
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Selection */}
          <div className="space-y-3">
            <Label className="text-white font-medium">User ID</Label>
            <Input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter user ID or email"
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          {/* Company Selection */}
          <div className="space-y-4">
            {/* Parent Company - Required */}
            <div className="space-y-3">
              <Label className="text-white font-medium flex items-center">
                <Building2 className="w-4 h-4 mr-2 text-blue-400" />
                Parent Company *
              </Label>
              <Select value={selectedParentCompany} onValueChange={handleParentCompanyChange}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder={isLoadingCompanies ? "Loading..." : "Select parent company"} />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  {parentCompanies.map((company) => (
                    <SelectItem key={company.parent_company_id} value={company.parent_company_id.toString()}>
                      {company.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sub Company - Optional */}
            {selectedParentCompany && (
              <div className="space-y-3">
                <Label className="text-white font-medium flex items-center">
                  <Building2 className="w-4 h-4 mr-2 text-green-400" />
                  Sub Company (Optional)
                </Label>
                <Select value={selectedSubCompany} onValueChange={handleSubCompanyChange}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select sub company (optional)" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="none">None</SelectItem>
                    {getAvailableSubCompanies().map((company) => (
                      <SelectItem key={company.sub_company_id} value={company.sub_company_id.toString()}>
                        {company.company_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="text-sm text-gray-400">
                  Only sub companies belonging to {parentCompanies.find(c => c.parent_company_id === parseInt(selectedParentCompany))?.company_name} are shown
                </div>
              </div>
            )}
          </div>

          {/* Database Display (Auto-populated) */}
          {selectedDatabase && (
            <div className="space-y-3">
              <Label className="text-white font-medium flex items-center">
                <Database className="w-4 h-4 mr-2 text-purple-400" />
                Selected Database
              </Label>
              <div className="p-3 bg-slate-700 border border-slate-600 rounded-lg">
                <div className="text-white font-medium">
                  Database {selectedDatabase}
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  {selectedParentCompany 
                    ? `Parent Company Database` 
                    : `Sub Company Database`
                  }
                </div>
              </div>
            </div>
          )}

          {/* Debug Info - Show when no database is selected */}
          {(selectedParentCompany || selectedSubCompany) && !selectedDatabase && (
            <div className="space-y-3">
              <Label className="text-white font-medium flex items-center">
                <Database className="w-4 h-4 mr-2 text-yellow-400" />
                Database Selection Issue
              </Label>
              <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                <div className="text-yellow-400 text-sm">
                  No databases found for the selected company configuration.
                </div>
                <div className="text-xs text-yellow-300 mt-2">
                  Available databases: {getAvailableDatabases().length}
                  {selectedParentCompany && (
                    <div>Parent Company ID: {selectedParentCompany}</div>
                  )}
                  {selectedSubCompany && (
                    <div>Sub Company ID: {selectedSubCompany}</div>
                  )}
                  <div>Total DB Configs: {databaseConfigs.length}</div>
                </div>
              </div>
            </div>
          )}

          {/* Access Summary */}
          {selectedDatabase && (
            <Card className="bg-slate-700/50 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white text-lg">Access Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">User:</span>
                    <span className="text-white ml-2">{userId || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Parent Company:</span>
                    <span className="text-white ml-2">
                      {parentCompanies.find(c => c.parent_company_id === parseInt(selectedParentCompany))?.company_name || 'Not selected'}
                    </span>
                  </div>
                  {selectedSubCompany && (
                    <div>
                      <span className="text-gray-400">Sub Company:</span>
                      <span className="text-white ml-2">
                        {subCompanies.find(c => c.sub_company_id === parseInt(selectedSubCompany))?.company_name || 'Not selected'}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-400">Database:</span>
                    <span className="text-white ml-2">Database {selectedDatabase}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Access Level:</span>
                    <span className="text-white ml-2">Full Access</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Sub Companies:</span>
                    <span className="text-white ml-2">
                      {selectedSubCompany ? '1 selected' : 'None'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Display */}
          {error && (
            <div className="flex items-center p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-600">
          <Button
            variant="outline"
            onClick={handleClose}
            className="border-slate-600 text-gray-300 hover:bg-slate-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !userId || !selectedParentCompany || !selectedDatabase}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "Creating..." : "Create Access"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 