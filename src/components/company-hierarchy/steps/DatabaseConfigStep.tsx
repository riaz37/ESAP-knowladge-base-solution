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
import { DatabaseConfigStepProps } from "../types"

export function DatabaseConfigStep({
  selectedDbId,
  setSelectedDbId,
  databases,
  mssqlLoading,
  setConfig,
  loadDatabases,
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

  const handleCreateDatabase = async () => {
    if (!newDbUrl.trim() || !newDbName.trim() || !newDbUserId.trim()) {
      toast.error("Database URL, name, and user ID are required");
      return;
    }

    try {
      // Prepare the database configuration data
      const dbConfig: any = {
        db_url: newDbUrl.trim(),
        db_name: newDbName.trim(),
        business_rule: newDbBusinessRule.trim() || undefined,
        user_id: newDbUserId.trim(),
      };

      if (selectedFile) {
        dbConfig.file = selectedFile;
      }

      // Cache creation input so it can be reused after completion
      setDatabaseCreationData({ dbConfig, selectedFile });

      // Kick off async creation task (non-blocking)
      const taskResponse = await setConfig(dbConfig);
      // `taskResponse` shape can vary depending on axios interceptor; attempt multiple selectors
      const taskId: string | null =
        (taskResponse as any)?.data?.task_id ??
        (taskResponse as any)?.task_id ??
        null;

      if (!taskId) {
        console.error("Unexpected create-database response", taskResponse);
        toast.error("Server did not return a task ID");
        return;
      }

      setCurrentTaskId(taskId);

      // Move to database creation step so the user can see progress
      setCurrentStep("database-creation");
      
    } catch (error) {
      console.error("Error creating database:", error);
      toast.error("Failed to create database");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-green-400">
          Database Configuration
        </h3>
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
          <div className="space-y-2">
            <Label className="text-gray-300">Select Database *</Label>
            {mssqlLoading ? (
              <div className="flex items-center gap-2 p-3 bg-gray-800/50 rounded-lg">
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
              <p className="text-sm text-gray-400">
                No databases found. Create one to get started.
              </p>
            )}
          </div>

          {selectedDbId && (
            <div className="flex justify-end">
              <Button
                onClick={() => setCurrentStep("user-config")}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Next: Configure User Access
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="new" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="newDbName" className="text-gray-300">
                Database Name *
              </Label>
              <Input
                id="newDbName"
                value={newDbName}
                onChange={(e) => setNewDbName(e.target.value)}
                placeholder="MyDatabase"
                className="bg-gray-800/50 border-green-400/30 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newDbUserId" className="text-gray-300">
                User ID *
              </Label>
              <Input
                id="newDbUserId"
                value={newDbUserId}
                onChange={(e) => setNewDbUserId(e.target.value)}
                placeholder="admin"
                className="bg-gray-800/50 border-green-400/30 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newDbUrl" className="text-gray-300">
                Database URL *
              </Label>
              <Input
                id="newDbUrl"
                value={newDbUrl}
                onChange={(e) => setNewDbUrl(e.target.value)}
                placeholder="mssql+pyodbc://sa:password@server:1433/database..."
                className="bg-gray-800/50 border-green-400/30 text-white placeholder:text-gray-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="newDbBusinessRule" className="text-gray-300">
                Business Rules (Optional)
              </Label>
              <Textarea
                id="newDbBusinessRule"
                value={newDbBusinessRule}
                onChange={(e) => setNewDbBusinessRule(e.target.value)}
                placeholder="Enter business rules for this database"
                className="bg-gray-800/50 border-green-400/30 text-white placeholder:text-gray-500 min-h-[80px] resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Database File (Optional)</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Database className="w-4 h-4" />
                  <span>
                    Supported: .bak, .sql, .mdf, .ldf, .trn, .dmp, .dump
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept=".bak,.sql,.mdf,.ldf,.trn,.dmp,.dump"
                    onChange={(e) =>
                      setSelectedFile(e.target.files?.[0] || null)
                    }
                    className="bg-gray-800/50 border-green-400/30 text-white file:bg-green-600 file:text-white file:border-0 file:rounded file:px-3 file:py-1"
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
                    Selected: {selectedFile.name} (
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                )}
              </div>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleCreateDatabase}
            disabled={
              !newDbUrl.trim() || !newDbName.trim() || !newDbUserId.trim()
            }
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Database
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
