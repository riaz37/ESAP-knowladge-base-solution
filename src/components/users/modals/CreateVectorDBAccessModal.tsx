"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Brain,
  Database,
  CheckCircle,
  AlertCircle,
  X,
  Plus,
  Search,
} from "lucide-react";
import { useUserConfig } from "@/lib/hooks/use-user-config";
import { useDatabaseConfig } from "@/lib/hooks/use-database-config";
import { UserConfigCreateRequest } from "@/types/api";
import { VectorDBService } from "@/lib/api/services/vector-db-service";

interface CreateVectorDBAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedUser?: string;
}

export function CreateVectorDBAccessModal({
  isOpen,
  onClose,
  onSuccess,
  selectedUser = "",
}: CreateVectorDBAccessModalProps) {
  // Form state
  const [userId, setUserId] = useState(selectedUser);
  const [selectedDatabase, setSelectedDatabase] = useState<string>("");
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [newTableName, setNewTableName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // User table fetching state
  const [existingUserTables, setExistingUserTables] = useState<string[]>([]);
  const [isFetchingUserTables, setIsFetchingUserTables] = useState(false);
  const [userTablesError, setUserTablesError] = useState<string>("");

  // Database loading state
  const [availableDatabases, setAvailableDatabases] = useState<any[]>([]);

  // Hooks
  const { createUserConfig, isLoading, error } = useUserConfig();
  const { databaseConfigs, fetchDatabaseConfigs, isLoading: isLoadingDatabases } = useDatabaseConfig();

  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      // Load available databases automatically since they don't depend on user ID
      loadAvailableDatabases();
      
      if (selectedUser) {
        setUserId(selectedUser);
      }
    }
  }, [isOpen, selectedUser]);

  // Update userId when selectedUser prop changes
  useEffect(() => {
    setUserId(selectedUser);
  }, [selectedUser]);

  // Watch for changes in databaseConfigs and update availableDatabases
  useEffect(() => {
    if (databaseConfigs.length > 0) {
      console.log("databaseConfigs changed, updating availableDatabases...");
      // Call getAvailableDatabases asynchronously
      getAvailableDatabases().then(databases => {
        setAvailableDatabases(databases || []);
      }).catch(error => {
        console.error("Error getting available databases:", error);
        setAvailableDatabases([]);
      });
    }
  }, [databaseConfigs]);

  // Fetch existing user tables when userId changes
  const fetchExistingUserTables = async (userIdInput: string) => {
    if (!userIdInput.trim()) {
      setExistingUserTables([]);
      setUserTablesError("");
      return;
    }

    setIsFetchingUserTables(true);
    setUserTablesError("");

    try {
      const tables = await VectorDBService.getUserTableNames(
        userIdInput.trim()
      );
      setExistingUserTables(tables);
      console.log(
        `Found ${tables.length} existing tables for user ${userIdInput}:`,
        tables
      );
    } catch (error: any) {
      console.error(`Error fetching tables for user ${userIdInput}:`, error);
      setUserTablesError(
        error.message || "Failed to fetch existing user tables"
      );
      setExistingUserTables([]);
    } finally {
      setIsFetchingUserTables(false);
    }
  };

  // Load available databases for the user
  const loadAvailableDatabases = async () => {
    try {
      console.log("Starting to load available databases...");
      console.log("Current databaseConfigs:", databaseConfigs);
      
      // First fetch database configs if they haven't been loaded yet
      if (databaseConfigs.length === 0) {
        console.log("No database configs found, fetching from API...");
        await fetchDatabaseConfigs();
        console.log("After fetchDatabaseConfigs, databaseConfigs:", databaseConfigs);
      }
      
      // Then get available databases from the loaded configs
      const databases = await getAvailableDatabases();
      setAvailableDatabases(databases);
      console.log(`Loaded ${databases.length} available databases:`, databases);
    } catch (error) {
      console.error(`Error loading databases:`, error);
      setAvailableDatabases([]);
    }
  };

  // Handle user ID input with Enter key
  const handleUserIdKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && userId.trim()) {
      fetchExistingUserTables(userId);
    }
  };

  // Get available databases from the database-config API
  const getAvailableDatabases = async () => {
    try {
      // Return all available databases from the database-config API
      // This is independent of user ID - shows all available databases
      const userDatabases = databaseConfigs.filter(db => 
        db.db_config && db.db_config.DB_NAME && db.db_config.DB_HOST
      );

      console.log("Filtered databases:", userDatabases);
      return userDatabases || [];
    } catch (error) {
      console.error("Error fetching available databases:", error);
      return databaseConfigs.filter(db => 
        db.db_config && db.db_config.DB_NAME && db.db_config.DB_HOST
      ) || [];
    }
  };

  // Handle table selection
  const handleTableSelection = (tableName: string, checked: boolean) => {
    if (checked) {
      setSelectedTables((prev) => [...prev, tableName]);
    } else {
      setSelectedTables((prev) => prev.filter((t) => t !== tableName));
    }
  };

  // Add new table
  const handleAddNewTable = () => {
    if (newTableName.trim() && !selectedTables.includes(newTableName.trim())) {
      setSelectedTables((prev) => [...prev, newTableName.trim()]);
      setNewTableName("");
    }
  };

  // Remove table
  const handleRemoveTable = (tableName: string) => {
    setSelectedTables((prev) => prev.filter((t) => t !== tableName));
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Clear previous errors
    setSubmitError("");
    setSubmitSuccess(false);

    // Validation
    if (!userId.trim()) {
      setSubmitError("User ID is required");
      return;
    }

    if (!selectedDatabase) {
      setSubmitError("Please select a database");
      return;
    }

    if (selectedTables.length === 0) {
      setSubmitError("Please select at least one table");
      return;
    }

    setIsSubmitting(true);

    try {
      const request: UserConfigCreateRequest = {
        user_id: userId.trim(),
        db_id: parseInt(selectedDatabase),
        access_level: 2, // Default value as per your spec
        accessible_tables: [], // Empty array as per your spec
        table_names: selectedTables,
      };

      console.log("Submitting vector DB access request:", request);

      const result = await createUserConfig(request);

      if (result) {
        setSubmitSuccess(true);
        console.log("Vector DB access created successfully:", result);

        // Wait a moment to show success message
        setTimeout(() => {
          onSuccess();
          onClose();
          resetForm();
        }, 1500);
      } else {
        setSubmitError("Failed to create vector DB access. Please try again.");
      }
    } catch (error: any) {
      console.error("Error creating vector DB access:", error);

      // Provide user-friendly error messages
      if (error.response?.status === 400) {
        setSubmitError("Invalid request data. Please check your input.");
      } else if (error.response?.status === 409) {
        setSubmitError("User already has access to this database.");
      } else if (error.response?.status === 404) {
        setSubmitError("Database not found. Please select a valid database.");
      } else if (error.message) {
        setSubmitError(`Error: ${error.message}`);
      } else {
        setSubmitError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setUserId("");
    setSelectedDatabase("");
    setSelectedTables([]);
    setNewTableName("");
    setSearchTerm("");
    setSubmitError("");
    setSubmitSuccess(false);
    setIsSubmitting(false);
    setExistingUserTables([]);
    setIsFetchingUserTables(false);
    setUserTablesError("");
    setAvailableDatabases([]);
    setIsLoadingDatabases(false);
  };

  // Handle close
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Filter tables based on search
  const filteredTables = existingUserTables.filter((table) =>
    table.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-800 border-purple-500/30">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white flex items-center">
            <Brain className="w-5 h-5 mr-2 text-purple-400" />
            Create Vector Database Access
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400"></div>
                <span className="text-gray-400">
                  Loading database configurations...
                </span>
              </div>
            </div>
          )}

          {/* User ID Input */}
          <div className="space-y-3">
            <Label className="text-white font-medium">User ID</Label>
            <div className="text-sm text-gray-400 mb-2">
              Enter a user ID and press{" "}
              <kbd className="bg-slate-600 px-2 py-1 rounded text-xs">
                Enter
              </kbd>{" "}
              to fetch existing tables for that user
            </div>
            <div className="flex gap-2">
              <Input
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                onKeyPress={handleUserIdKeyPress}
                placeholder="Enter user ID or email"
                className="bg-slate-700 border-slate-600 text-white flex-1"
              />
              <Button
                onClick={() => {
                  if (userId.trim()) {
                    fetchExistingUserTables(userId);
                  }
                }}
                disabled={!userId.trim() || isFetchingUserTables}
                variant="outline"
                size="sm"
                className="border-slate-600 text-gray-300 hover:bg-slate-700"
              >
                {isFetchingUserTables ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400"></div>
                ) : (
                  "Load Data"
                )}
              </Button>
            </div>
            {userId.trim() && (
              <div className="text-sm text-gray-400">
                {isFetchingUserTables ? (
                  <span>Fetching tables for "{userId}"...</span>
                ) : userTablesError ? (
                  <span className="text-red-400">{userTablesError}</span>
                ) : (
                  <span>
                    Found {existingUserTables.length} existing tables for this
                    user.
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Database Selection */}
          <div className="space-y-3">
            <Label className="text-white font-medium flex items-center">
              <Database className="w-4 h-4 mr-2 text-purple-400" />
              Database
            </Label>
            
            {isLoadingDatabases ? (
              <div className="flex items-center space-x-2 p-3 bg-slate-700/50 rounded-lg">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400"></div>
                <span className="text-gray-400 text-sm">Loading available databases...</span>
              </div>
            ) : availableDatabases.length === 0 ? (
              <div className="text-sm text-gray-400 bg-slate-700/50 p-3 rounded-lg">
                No databases available. Please check your database configuration.
              </div>
            ) : (
              <Select
                value={selectedDatabase}
                onValueChange={setSelectedDatabase}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Select database" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  {Array.isArray(availableDatabases) && availableDatabases.map((db) => (
                    <SelectItem key={db.db_id} value={db.db_id.toString()}>
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          <Database className="w-4 h-4 mr-2 text-purple-400" />
                          <span className="font-medium">Database {db.db_id}</span>
                        </div>
                        <div className="text-xs text-gray-400 ml-6">
                          {db.db_config.DB_NAME} • {db.db_config.DB_HOST}:
                          {db.db_config.DB_PORT}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Table Selection */}
          <div className="space-y-3">
            <Label className="text-white font-medium flex items-center">
              <Brain className="w-4 h-4 mr-2 text-green-400" />
              Tables
            </Label>

            {/* Add New Table */}
            <div className="flex gap-2">
              <Input
                value={newTableName}
                onChange={(e) => setNewTableName(e.target.value)}
                placeholder="Enter new table name"
                className="bg-slate-700 border-slate-600 text-white flex-1"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleAddNewTable();
                  }
                }}
              />
              <Button
                onClick={handleAddNewTable}
                disabled={!newTableName.trim()}
                variant="outline"
                size="sm"
                className="border-green-600 text-green-400 hover:bg-green-600/20"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Table
              </Button>
            </div>

            {/* Search Existing Tables */}
            {existingUserTables.length > 0 && (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search existing tables..."
                    className="pl-10 bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                {/* Existing Tables List */}
                <div className="max-h-48 overflow-y-auto border border-slate-600 rounded-lg p-3 bg-slate-700/50">
                  <div className="text-sm text-gray-400 mb-2">
                    Select from existing tables:
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {filteredTables.map((table) => (
                      <div key={table} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`existing-${table}`}
                          checked={selectedTables.includes(table)}
                          onChange={(e) => handleTableSelection(table, e.target.checked)}
                          className="rounded border-slate-500 bg-slate-600 text-purple-400 focus:ring-purple-400"
                        />
                        <Label
                          htmlFor={`existing-${table}`}
                          className="text-sm text-white cursor-pointer flex-1"
                        >
                          {table}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Selected Tables Display */}
            {selectedTables.length > 0 && (
              <div className="space-y-2">
                <Label className="text-white text-sm">
                  Selected Tables ({selectedTables.length}):
                </Label>
                <div className="flex flex-wrap gap-2">
                  {selectedTables.map((table) => (
                    <Badge
                      key={table}
                      variant="secondary"
                      className="bg-purple-600/20 text-purple-400 border-purple-500"
                    >
                      {table}
                      <button
                        onClick={() => handleRemoveTable(table)}
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

          {/* Summary */}
          {selectedDatabase && selectedTables.length > 0 && (
            <Card className="bg-slate-700/50 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-purple-400" />
                  Access Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">User ID:</span>
                    <span className="text-white ml-2">{userId}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Database ID:</span>
                    <span className="text-white ml-2">{selectedDatabase}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Tables:</span>
                    <span className="text-white ml-2">{selectedTables.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Access Level:</span>
                    <span className="text-white ml-2">2 (Default)</span>
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

          {/* Submit Error Display */}
          {submitError && (
            <div className="flex items-center p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-red-400 text-sm">{submitError}</span>
            </div>
          )}

          {/* Submit Success Display */}
          {submitSuccess && (
            <div className="flex items-center p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
              <span className="text-green-400 text-sm">
                Vector DB access created successfully!
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-600">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="border-slate-600 text-gray-300 hover:bg-slate-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              !userId ||
              !selectedDatabase ||
              selectedTables.length === 0
            }
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Create Vector Access"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
