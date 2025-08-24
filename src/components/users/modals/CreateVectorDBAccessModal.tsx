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
import { useAuthContext } from "@/components/providers";
import { useVectorDB } from "@/lib/hooks/use-vector-db";
import { UserConfigCreateRequest } from "@/types/api";
import { VectorDBService } from "@/lib/api/services/vector-db-service";
import { ServiceRegistry } from "@/lib/api/services/service-registry";

interface CreateVectorDBAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedUser?: string;
  editingUser?: string;
}

export function CreateVectorDBAccessModal({
  isOpen,
  onClose,
  onSuccess,
  selectedUser = "",
  editingUser = "",
}: CreateVectorDBAccessModalProps) {
  // Form state
  const [selectedUserId, setSelectedUserId] = useState<string>(selectedUser || "");
  const [selectedDatabase, setSelectedDatabase] = useState<string>("");
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [newTableName, setNewTableName] = useState("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // User table fetching state
  const [existingUserTables, setExistingUserTables] = useState<string[]>([]);
  const [isFetchingUserTables, setIsFetchingUserTables] = useState(false);
  const [userTablesError, setUserTablesError] = useState<string>("");

  // Database loading state
  // Removed local availableDatabases state - using context directly

  // Hooks
  const { user } = useAuthContext();
  
  // Placeholder state - will be implemented with proper database context
  const isLoading = false;
  const error = null;
  
  const createUserConfig = async (data: UserConfigCreateRequest) => {
    try {
      const response = await ServiceRegistry.userConfig.createUserConfig(data);
      return response;
    } catch (error) {
      console.error('Error creating user config:', error);
      throw error;
    }
  };
  const { vectorDBConfigs, getVectorDBConfigs, isLoading: isLoadingDatabases } = useVectorDB();

  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  // Update local state when props change
  useEffect(() => {
    setSelectedUserId(selectedUser || "");
  }, [selectedUser]);

  const loadData = async () => {
    try {
      // Load vector DB configurations
      const result = await getVectorDBConfigs();
      console.log('Vector DB configs loaded:', result);
      console.log('vectorDBConfigs state:', vectorDBConfigs);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  // Load existing user tables when user is authenticated
  useEffect(() => {
    if (user?.user_id && isOpen) {
      fetchExistingUserTables(user.user_id);
    }
  }, [user?.user_id, isOpen]);

  // Fetch existing tables for the authenticated user
  const fetchExistingUserTables = async (userId: string) => {
    if (!userId.trim()) return;

    setIsFetchingUserTables(true);
    setUserTablesError("");

    try {
      // TODO: Implement actual API call to fetch user tables
      // For now, simulate with empty array
      setExistingUserTables([]);
    } catch (error) {
      console.error("Error fetching user tables:", error);
      setUserTablesError("Failed to fetch user tables");
    } finally {
      setIsFetchingUserTables(false);
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

  // Filter tables based on search
  const filteredTables = existingUserTables.filter((table) =>
    table.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle form submission
  const handleSubmit = async () => {
    // Clear previous errors
    setSubmitError("");
    setSubmitSuccess(false);

    // Validation
    if (!selectedUserId) {
      setSubmitError("User ID is required");
      return;
    }

    if (!selectedDatabase || selectedTables.length === 0) {
      setSubmitError("Please select a database and at least one table");
      return;
    }

    setIsSubmitting(true);

    try {
      const request: UserConfigCreateRequest = {
        user_id: selectedUserId,
        db_id: parseInt(selectedDatabase),
        access_level: 2, // Default value as per your spec
        accessible_tables: [], // Empty array as per your spec
        table_names: selectedTables,
      };

      console.log("Submitting vector DB access request:", request);

      const result = await createUserConfig(request);

      if (result && (result.status === 'success' || result.config_id)) {
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
    setSelectedUserId("");
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
    // setAvailableDatabases([]); // This line is no longer needed
  };

  // Handle close
  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-800 border-purple-500/30">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white flex items-center">
            <Brain className="w-5 h-5 mr-2 text-purple-400" />
            {editingUser ? "Edit Vector DB Access" : "Create Vector DB Access"}
          </DialogTitle>
          <p className="text-gray-400 text-sm">
            {editingUser 
              ? "Update user access to vector databases" 
              : "Grant user access to vector databases for AI operations"
            }
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* User ID Input */}
          <div className="space-y-3">
            <Label className="text-white font-medium">User ID *</Label>
            <Input
              placeholder="Enter user ID (email)"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
            />
            <div className="text-sm text-gray-400">
              Enter the email address of the user you want to grant vector database access to
            </div>
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
            ) : vectorDBConfigs.length === 0 ? (
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
                  {Array.isArray(vectorDBConfigs) && vectorDBConfigs.map((db) => (
                    <SelectItem key={db.db_id} value={db.db_id.toString()}>
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          <Database className="w-4 h-4 mr-2 text-purple-400" />
                          <span className="font-medium">{db.db_config.DB_NAME}</span>
                        </div>
                        <div className="text-xs text-gray-400 ml-6">
                          {db.db_config.DB_HOST}:{db.db_config.DB_PORT}
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
                    <span className="text-white ml-2">{selectedUserId || 'Not specified'}</span>
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
                Vector DB access {editingUser ? 'updated' : 'created'} successfully!
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
              !selectedUserId ||
              !selectedDatabase ||
              selectedTables.length === 0
            }
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
          >
            {isSubmitting 
              ? (editingUser ? "Updating..." : "Creating...") 
              : (editingUser ? "Update Vector Access" : "Create Vector Access")
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
