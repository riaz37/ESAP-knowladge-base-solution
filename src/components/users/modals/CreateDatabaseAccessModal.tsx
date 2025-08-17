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
  Users, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  X,
  Plus,
  Search
} from "lucide-react";
import { useUserAccess } from "@/lib/hooks/use-user-access";
import { useDatabaseConfig } from "@/lib/hooks/use-database-config";
import { useParentCompanies } from "@/lib/hooks/use-parent-companies";
import { useSubCompanies } from "@/lib/hooks/use-sub-companies";
import { UserAccessCreateRequest } from "@/types/api";

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
  const [accessLevel, setAccessLevel] = useState<string>("5");
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [availableTables, setAvailableTables] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Hooks
  const { createUserAccess, isLoading, error } = useUserAccess();
  const { databaseConfigs } = useDatabaseConfig();
  const { parentCompanies } = useParentCompanies();
  const { subCompanies } = useSubCompanies();

  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      // Load necessary data
    }
  }, [isOpen]);

  // Update userId when selectedUser prop changes
  useEffect(() => {
    setUserId(selectedUser);
  }, [selectedUser]);

  // Get available databases based on selection
  const getAvailableDatabases = () => {
    if (selectedParentCompany) {
      return databaseConfigs.filter(db => 
        db.parent_company_id === parseInt(selectedParentCompany)
      );
    }
    if (selectedSubCompany) {
      return databaseConfigs.filter(db => 
        db.sub_company_id === parseInt(selectedSubCompany)
      );
    }
    return [];
  };

  // Get available tables for selected database
  const getAvailableTablesForDatabase = () => {
    if (!selectedDatabase) return [];
    
    const dbConfig = databaseConfigs.find(db => db.db_id === parseInt(selectedDatabase));
    if (!dbConfig) return [];
    
    // This would typically come from the database schema
    // For now, we'll use a placeholder
    return [
      "users", "orders", "products", "customers", "invoices",
      "payments", "shipping", "categories", "suppliers", "employees"
    ];
  };

  // Handle table selection
  const handleTableSelection = (tableName: string, checked: boolean) => {
    if (checked) {
      setSelectedTables(prev => [...prev, tableName]);
    } else {
      setSelectedTables(prev => prev.filter(t => t !== tableName));
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!userId || !selectedDatabase || selectedTables.length === 0) {
      return;
    }

    const request: UserAccessCreateRequest = {
      user_id: userId,
      parent_company_id: selectedParentCompany ? parseInt(selectedParentCompany) : undefined,
      sub_company_id: selectedSubCompany ? parseInt(selectedSubCompany) : undefined,
      database_access: {
        parent_databases: selectedParentCompany ? [{
          db_id: parseInt(selectedDatabase),
          access_level: parseInt(accessLevel),
          accessible_tables: selectedTables
        }] : [],
        sub_databases: selectedSubCompany ? [{
          sub_company_id: parseInt(selectedSubCompany),
          databases: [{
            db_id: parseInt(selectedDatabase),
            access_level: parseInt(accessLevel),
            accessible_tables: selectedTables
          }]
        }] : []
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
    setAccessLevel("5");
    setSelectedTables([]);
    setSearchTerm("");
  };

  // Handle close
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Filter tables based on search
  const filteredTables = availableTables.filter(table =>
    table.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Parent Company */}
            <div className="space-y-3">
              <Label className="text-white font-medium flex items-center">
                <Building2 className="w-4 h-4 mr-2 text-blue-400" />
                Parent Company
              </Label>
              <Select value={selectedParentCompany} onValueChange={setSelectedParentCompany}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Select parent company" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="none">None</SelectItem>
                  {parentCompanies?.map((company) => (
                    <SelectItem key={company.id} value={company.id.toString()}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sub Company */}
            <div className="space-y-3">
              <Label className="text-white font-medium flex items-center">
                <Building2 className="w-4 h-4 mr-2 text-green-400" />
                Sub Company
              </Label>
              <Select value={selectedSubCompany} onValueChange={setSelectedSubCompany}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Select sub company" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="none">None</SelectItem>
                  {subCompanies?.map((company) => (
                    <SelectItem key={company.id} value={company.id.toString()}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Database Selection */}
          <div className="space-y-3">
            <Label className="text-white font-medium flex items-center">
              <Database className="w-4 h-4 mr-2 text-purple-400" />
              Database
            </Label>
            <Select 
              value={selectedDatabase} 
              onValueChange={(value) => {
                setSelectedDatabase(value);
                setSelectedTables([]);
                setAvailableTables(getAvailableTablesForDatabase());
              }}
            >
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Select database" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                {getAvailableDatabases().map((db) => (
                  <SelectItem key={db.db_id} value={db.db_id.toString()}>
                    Database {db.db_id} - {db.db_config.DB_NAME}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Access Level */}
          <div className="space-y-3">
            <Label className="text-white font-medium flex items-center">
              <Shield className="w-4 h-4 mr-2 text-yellow-400" />
              Access Level
            </Label>
            <Select value={accessLevel} onValueChange={setAccessLevel}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="1">1 - Read Only</SelectItem>
                <SelectItem value="2">2 - Basic Access</SelectItem>
                <SelectItem value="3">3 - Standard Access</SelectItem>
                <SelectItem value="4">4 - Advanced Access</SelectItem>
                <SelectItem value="5">5 - Full Access</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table Selection */}
          {selectedDatabase && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-white font-medium flex items-center">
                  <Users className="w-4 h-4 mr-2 text-green-400" />
                  Accessible Tables
                </Label>
                <div className="text-sm text-gray-400">
                  {selectedTables.length} of {availableTables.length} selected
                </div>
              </div>

              {/* Search Tables */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search tables..."
                  className="pl-10 bg-slate-700 border-slate-600 text-white"
                />
              </div>

              {/* Table List */}
              <div className="max-h-48 overflow-y-auto border border-slate-600 rounded-lg p-3 bg-slate-700/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {filteredTables.map((table) => (
                    <div key={table} className="flex items-center space-x-2">
                      <Checkbox
                        id={table}
                        checked={selectedTables.includes(table)}
                        onCheckedChange={(checked) => 
                          handleTableSelection(table, checked as boolean)
                        }
                        className="border-slate-500"
                      />
                      <Label 
                        htmlFor={table} 
                        className="text-sm text-white cursor-pointer flex-1"
                      >
                        {table}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Tables Display */}
              {selectedTables.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-white text-sm">Selected Tables:</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedTables.map((table) => (
                      <Badge 
                        key={table} 
                        variant="secondary" 
                        className="bg-blue-600/20 text-blue-400 border-blue-500"
                      >
                        {table}
                        <button
                          onClick={() => handleTableSelection(table, false)}
                          className="ml-2 hover:text-red-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Access Summary */}
          {selectedDatabase && (
            <Card className="bg-slate-700/50 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white text-lg">Access Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">User:</span>
                    <span className="text-white ml-2">{userId || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Database:</span>
                    <span className="text-white ml-2">Database {selectedDatabase}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Access Level:</span>
                    <span className="text-white ml-2">{accessLevel}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Tables:</span>
                    <span className="text-white ml-2">{selectedTables.length}</span>
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
            disabled={isLoading || !userId || !selectedDatabase || selectedTables.length === 0}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "Creating..." : "Create Access"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 