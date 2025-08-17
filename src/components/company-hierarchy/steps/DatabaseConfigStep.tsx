"use client";

import { useState } from "react";
import { Database, Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { MSSQLConfigData } from "@/types/api";
import { DatabaseConfigStepProps } from "../types";

export function DatabaseConfigStep({
  selectedDbId,
  setSelectedDbId,
  databases,
  mssqlLoading,
  setConfig,
  setCurrentStep,
  setDatabaseCreationData,
  setCurrentTaskId,
}: DatabaseConfigStepProps) {
  const [activeTab, setActiveTab] = useState("existing");

  // New database form states
  const [newDbUrl, setNewDbUrl] = useState("");
  const [newDbName, setNewDbName] = useState("");
  const [newDbBusinessRule, setNewDbBusinessRule] = useState("");
  const [newDbUserId, setNewDbUserId] = useState("admin");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handlePrevious = () => {
    setCurrentStep("company-info");
  };

  const handleNext = () => {
    if (selectedDbId) {
      setCurrentStep("vector-config");
    } else {
      toast.error("Please select or create a database first");
    }
  };

  const handleCreateDatabase = async () => {
    if (!newDbUrl.trim() || !newDbName.trim() || !newDbUserId.trim()) {
      toast.error("Database URL, name, and user ID are required");
      return;
    }

    try {
      const dbConfig = {
        db_url: newDbUrl.trim(),
        db_name: newDbName.trim(),
        business_rule: newDbBusinessRule.trim() || undefined,
        user_id: newDbUserId.trim(),
        file: selectedFile,
      };

      setDatabaseCreationData({ dbConfig, selectedFile });

      const taskResponse = await setConfig(dbConfig);
      const taskId = (taskResponse as any)?.data?.task_id ?? (taskResponse as any)?.task_id ?? null;

      if (!taskId) {
        toast.error("Failed to start database creation");
        return;
      }

      setCurrentTaskId(taskId);
      setCurrentStep("database-creation");
    } catch (error) {
      toast.error("Failed to create database");
    }
  };

  const resetNewDbForm = () => {
    setNewDbUrl("");
    setNewDbName("");
    setNewDbBusinessRule("");
    setNewDbUserId("admin");
    setSelectedFile(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-green-400">Database Configuration</h3>
          <p className="text-sm text-gray-400 mt-1">
            Choose an existing database or create a new one
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handlePrevious}
          className="border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          Back
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-800/50">
          <TabsTrigger
            value="existing"
            className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400"
          >
            Select Existing
          </TabsTrigger>
          <TabsTrigger
            value="new"
            className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400"
          >
            Create New
          </TabsTrigger>
        </TabsList>

        <TabsContent value="existing" className="space-y-4">
          <div className="space-y-3">
            <Label className="text-gray-300">Select Database</Label>
            {mssqlLoading ? (
              <div className="flex items-center gap-2 p-4 bg-gray-800/50 rounded-lg">
                <Loader2 className="w-4 h-4 animate-spin text-green-400" />
                <span className="text-gray-400">Loading databases...</span>
              </div>
            ) : (
              <Select
                value={selectedDbId?.toString() || ""}
                onValueChange={(value) => setSelectedDbId(parseInt(value))}
              >
                <SelectTrigger className="bg-gray-800/50 border-green-400/30 text-white">
                  <SelectValue placeholder="Choose a database" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-green-400/30">
                  {databases.map((db) => (
                    <SelectItem key={db.db_id} value={db.db_id.toString()}>
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-green-400" />
                        <span>{db.db_name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {databases.length === 0 && !mssqlLoading && (
              <div className="text-center py-8 text-gray-400">
                <Database className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No databases found</p>
                <p className="text-sm">Create one to get started</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="new" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="newDbName">Database Name *</Label>
              <Input
                id="newDbName"
                value={newDbName}
                onChange={(e) => setNewDbName(e.target.value)}
                placeholder="MyDatabase"
                className="bg-gray-800/50 border-green-400/30 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newDbUserId">User ID *</Label>
              <Input
                id="newDbUserId"
                value={newDbUserId}
                onChange={(e) => setNewDbUserId(e.target.value)}
                placeholder="admin"
                className="bg-gray-800/50 border-green-400/30 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newDbUrl">Database URL *</Label>
            <Input
              id="newDbUrl"
              value={newDbUrl}
              onChange={(e) => setNewDbUrl(e.target.value)}
              placeholder="mssql+pyodbc://sa:password@server:1433/database..."
              className="bg-gray-800/50 border-green-400/30 text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="newDbBusinessRule">Business Rules (Optional)</Label>
              <Textarea
                id="newDbBusinessRule"
                value={newDbBusinessRule}
                onChange={(e) => setNewDbBusinessRule(e.target.value)}
                placeholder="Enter business rules for this database"
                className="bg-gray-800/50 border-green-400/30 text-white min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Database File (Optional)</Label>
              <div className="space-y-2">
                <div className="text-sm text-gray-400">
                  Supported: .bak, .sql, .mdf, .ldf, .trn, .dmp, .dump
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept=".bak,.sql,.mdf,.ldf,.trn,.dmp,.dump"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="bg-gray-800 border-green-400/30 text-white file:bg-green-600 file:text-white file:border-0 file:rounded file:px-3 file:py-1"
                  />
                  {selectedFile && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                {selectedFile && (
                  <div className="text-sm text-green-400">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              onClick={handleCreateDatabase}
              disabled={!newDbUrl.trim() || !newDbName.trim() || !newDbUserId.trim()}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Database
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={resetNewDbForm}
              className="border-gray-600 text-gray-300 hover:bg-gray-700 w-full sm:w-auto"
            >
              Reset
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t border-gray-700">
        <Button
          variant="outline"
          onClick={handlePrevious}
          className="border-gray-600 text-gray-300 hover:bg-gray-700 w-full sm:w-auto"
        >
          Back
        </Button>
        
        {selectedDbId && (
          <Button
            onClick={handleNext}
            className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
          >
            Continue to Vector Config
          </Button>
        )}
      </div>
    </div>
  );
}
