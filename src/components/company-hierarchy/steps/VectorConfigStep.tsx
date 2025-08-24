"use client";

import { useState } from "react";
import { Brain, Loader2, Plus, ArrowLeft, ArrowRight, X } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { DatabaseConfigData } from "@/types/api";
import { DatabaseConfig } from "@/lib/api/services/database-config-service";
import { VectorConfigStepProps } from "../types";
import { useAuthContext } from "@/components/providers/AuthContextProvider";

export function VectorConfigStep({
  selectedUserConfigId,
  setSelectedUserConfigId,
  userConfigs,
  userConfigLoading,
  createDatabaseConfig,
  setCurrentStep,
  refreshUserConfigs,
}: VectorConfigStepProps) {
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState("existing");
  const [creatingConfig, setCreatingConfig] = useState(false);

  // New vector database config form states
  const [newConfigHost, setNewConfigHost] = useState("");
  const [newConfigPort, setNewConfigPort] = useState(5432);
  const [newConfigDatabase, setNewConfigDatabase] = useState("");
  const [newConfigUsername, setNewConfigUsername] = useState("");
  const [newConfigPassword, setNewConfigPassword] = useState("");

  const handlePrevious = () => {
    setCurrentStep("database-config");
  };

  const handleNext = () => {
    if (selectedUserConfigId) {
      setCurrentStep("final-creation");
    } else {
      toast.error("Please select or create a vector database configuration first");
    }
  };

  const handleCreateConfig = async () => {
    if (
      !newConfigHost.trim() ||
      !newConfigDatabase.trim() ||
      !newConfigUsername.trim()
    ) {
      toast.error("Host, database, and username are required");
      return;
    }

    if (!user?.user_id) {
      toast.error("User authentication required");
      return;
    }

    setCreatingConfig(true);
    try {
      const configRequest: DatabaseConfig = {
        DB_HOST: newConfigHost.trim(),
        DB_PORT: newConfigPort,
        DB_NAME: newConfigDatabase.trim(),
        DB_USER: newConfigUsername.trim(),
        DB_PASSWORD: newConfigPassword.trim(),
        schema: "public", // Default schema
        user_id: user.user_id // Add user ID from auth context
      };

      const newConfig = await createDatabaseConfig(configRequest);
      
      if (newConfig) {
        // Reset form and switch to existing tab
        resetForm();
        setActiveTab("existing");
        
        // Refresh the configurations list to include the new one
        await refreshUserConfigs();
        
        // Set the newly created config as selected
        setSelectedUserConfigId(newConfig.db_id);
        
        toast.success("Vector database configuration created and selected successfully");
      } else {
        toast.error("Failed to create vector database configuration");
      }
    } catch (error) {
      toast.error("Failed to create vector database configuration");
    } finally {
      setCreatingConfig(false);
    }
  };

  const resetForm = () => {
    setNewConfigHost("");
    setNewConfigPort(5432);
    setNewConfigDatabase("");
    setNewConfigUsername("");
    setNewConfigPassword("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-green-400">Vector Configuration</h3>
          <p className="text-sm text-gray-400 mt-1">
            Select existing or create new vector database configuration for AI operations
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handlePrevious}
          className="border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
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
            <Label className="text-gray-300">Select Vector Database Configuration</Label>
            {userConfigLoading ? (
              <div className="flex items-center gap-2 p-4 bg-gray-800/50 rounded-lg">
                <Loader2 className="w-4 h-4 animate-spin text-green-400" />
                <span className="text-gray-400">Loading configurations...</span>
              </div>
            ) : (
              <Select
                value={selectedUserConfigId?.toString() || ""}
                onValueChange={(value) => setSelectedUserConfigId(parseInt(value))}
              >
                <SelectTrigger className="bg-gray-800/50 border-green-400/30 text-white">
                  <SelectValue placeholder="Choose a vector database configuration" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-green-400/30">
                  {userConfigs.map((config) => (
                    <SelectItem
                      key={config.db_id}
                      value={config.db_id.toString()}
                    >
                      <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-green-400" />
                        <span>
                          {config.db_config.DB_NAME || 'Unnamed'} - {config.db_config.DB_HOST}:{config.db_config.DB_PORT}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {userConfigs.length === 0 && !userConfigLoading && (
              <div className="text-center py-8 text-gray-400">
                <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No vector database configurations found</p>
                <p className="text-sm">Create one to get started</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="new" className="space-y-4">
          {/* User Information Display */}
          <div className="space-y-3">
            <Label className="text-gray-300">User</Label>
            <div className="p-3 bg-gray-800/50 border border-green-400/30 rounded-lg">
              <div className="text-green-400 font-medium">{user?.username || 'Not authenticated'}</div>
              <div className="text-xs text-gray-400 mt-1">User ID: {user?.user_id || 'N/A'}</div>
              <div className="text-xs text-gray-400">Automatically set from your account</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="newConfigHost">Host *</Label>
              <Input
                id="newConfigHost"
                value={newConfigHost}
                onChange={(e) => setNewConfigHost(e.target.value)}
                placeholder="localhost"
                className="bg-gray-800/50 border-green-400/30 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newConfigPort">Port *</Label>
              <Input
                id="newConfigPort"
                type="number"
                value={newConfigPort}
                onChange={(e) => setNewConfigPort(parseInt(e.target.value) || 5432)}
                placeholder="5432"
                className="bg-gray-800/50 border-green-400/30 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newConfigDatabase">Database Name *</Label>
              <Input
                id="newConfigDatabase"
                value={newConfigDatabase}
                onChange={(e) => setNewConfigDatabase(e.target.value)}
                placeholder="vectordb"
                className="bg-gray-800/50 border-green-400/30 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="newConfigUsername">Username *</Label>
              <Input
                id="newConfigUsername"
                value={newConfigUsername}
                onChange={(e) => setNewConfigUsername(e.target.value)}
                placeholder="admin"
                className="bg-gray-800/50 border-green-400/30 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newConfigPassword">Password *</Label>
              <Input
                id="newConfigPassword"
                type="password"
                value={newConfigPassword}
                onChange={(e) => setNewConfigPassword(e.target.value)}
                placeholder="Enter password"
                className="bg-gray-800/50 border-green-400/30 text-white"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              onClick={handleCreateConfig}
              disabled={
                !newConfigHost.trim() ||
                !newConfigDatabase.trim() ||
                !newConfigUsername.trim() ||
                !user?.user_id ||
                creatingConfig
              }
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {creatingConfig ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Configuration...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Vector Database Configuration
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
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
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        {selectedUserConfigId && (
          <Button
            onClick={handleNext}
            className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
          >
            Continue to Final Step
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>

      {/* Skip option */}
      <div className="border-t border-gray-700 pt-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Vector configuration is optional. You can configure it later.
          </p>
          <Button
            variant="outline"
            onClick={() => setCurrentStep("final-creation")}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Skip for Now
          </Button>
        </div>
      </div>
    </div>
  );
}
