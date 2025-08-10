"use client";

import { useState } from "react";
import { User, Loader2, Plus } from "lucide-react";
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
import { UserConfigData, UserConfigCreateRequest } from "@/types/api";
import { WorkflowStep } from "../CompanyCreationModal";

interface UserConfigStepProps {
  selectedUserConfigId: number | null;
  setSelectedUserConfigId: (id: number | null) => void;
  userConfigs: UserConfigData[];
  userConfigLoading: boolean;
  createUserConfig: (request: UserConfigCreateRequest) => Promise<any>;
  loadUserConfigs: () => Promise<void>;
  setCurrentStep: (step: WorkflowStep) => void;
}

export function UserConfigStep({
  selectedUserConfigId,
  setSelectedUserConfigId,
  userConfigs,
  userConfigLoading,
  createUserConfig,
  loadUserConfigs,
  setCurrentStep,
}: UserConfigStepProps) {
  const [activeUserConfigTab, setActiveUserConfigTab] = useState("existing");
  const [creatingUserConfig, setCreatingUserConfig] = useState(false);

  // New user config form states
  const [newUserConfigUserId, setNewUserConfigUserId] = useState("");
  const [newUserConfigAccessLevel, setNewUserConfigAccessLevel] = useState(2);
  const [newUserConfigDbHost, setNewUserConfigDbHost] = useState("");
  const [newUserConfigDbPort, setNewUserConfigDbPort] = useState(1433);
  const [newUserConfigDbName, setNewUserConfigDbName] = useState("");
  const [newUserConfigDbUser, setNewUserConfigDbUser] = useState("");
  const [newUserConfigDbPassword, setNewUserConfigDbPassword] = useState("");
  const [newUserConfigDbSchema, setNewUserConfigDbSchema] = useState("public");

  const handlePrevious = () => {
    setCurrentStep("database-config");
  };

  const handleCreateUserConfig = async () => {
    if (
      !newUserConfigUserId.trim() ||
      !newUserConfigDbHost.trim() ||
      !newUserConfigDbName.trim() ||
      !newUserConfigDbUser.trim()
    ) {
      toast.error("User ID, database host, name, and user are required");
      return;
    }

    setCreatingUserConfig(true);
    try {
      const userConfigRequest: UserConfigCreateRequest = {
        user_id: newUserConfigUserId.trim(),
        db_config: {
          DB_HOST: newUserConfigDbHost.trim(),
          DB_PORT: newUserConfigDbPort,
          DB_NAME: newUserConfigDbName.trim(),
          DB_USER: newUserConfigDbUser.trim(),
          DB_PASSWORD: newUserConfigDbPassword.trim(),
          schema: newUserConfigDbSchema.trim(),
        },
        access_level: newUserConfigAccessLevel,
        accessible_tables: [],
      };

      await createUserConfig(userConfigRequest);
      await loadUserConfigs();

      // Clear form and switch to existing tab
      setNewUserConfigUserId("");
      setNewUserConfigDbHost("");
      setNewUserConfigDbPort(1433);
      setNewUserConfigDbName("");
      setNewUserConfigDbUser("");
      setNewUserConfigDbPassword("");
      setNewUserConfigDbSchema("public");
      setNewUserConfigAccessLevel(2);
      setActiveUserConfigTab("existing");

      toast.success("User configuration created successfully");
    } catch (error) {
      console.error("Error creating user config:", error);
      toast.error("Failed to create user configuration");
    } finally {
      setCreatingUserConfig(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-green-400">User Configuration</h3>
        <Button
          variant="outline"
          onClick={handlePrevious}
          className="border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          Back
        </Button>
      </div>

      <Tabs
        value={activeUserConfigTab}
        onValueChange={setActiveUserConfigTab}
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
          <div className="space-y-2">
            <Label className="text-gray-300">Select User Configuration</Label>
            {userConfigLoading ? (
              <div className="flex items-center gap-2 p-3 bg-gray-800/50 rounded-lg">
                <Loader2 className="w-4 h-4 animate-spin text-green-400" />
                <span className="text-gray-400">
                  Loading user configurations...
                </span>
              </div>
            ) : (
              <Select
                value={selectedUserConfigId?.toString() || ""}
                onValueChange={(value) => setSelectedUserConfigId(parseInt(value))}
              >
                <SelectTrigger className="bg-gray-800/50 border-green-400/30 text-white">
                  <SelectValue placeholder="Choose a user configuration" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-green-400/30">
                  {userConfigs.map((config) => (
                    <SelectItem
                      key={config.config_id}
                      value={config.config_id.toString()}
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-green-400" />
                        <span>
                          {config.user_id} (Level {config.access_level})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {userConfigs.length === 0 && !userConfigLoading && (
              <p className="text-sm text-gray-400">
                No user configurations found. Create one to get started.
              </p>
            )}
          </div>

          {selectedUserConfigId && (
            <div className="flex justify-end">
              <Button
                onClick={() => setCurrentStep("final-creation")}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Continue to Final Step
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="new" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="newUserConfigUserId" className="text-gray-300">
                User ID *
              </Label>
              <Input
                id="newUserConfigUserId"
                value={newUserConfigUserId}
                onChange={(e) => setNewUserConfigUserId(e.target.value)}
                placeholder="user123"
                className="bg-gray-800/50 border-green-400/30 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newUserConfigAccessLevel" className="text-gray-300">
                Access Level *
              </Label>
              <Select
                value={newUserConfigAccessLevel.toString()}
                onValueChange={(value) =>
                  setNewUserConfigAccessLevel(parseInt(value))
                }
              >
                <SelectTrigger className="bg-gray-800/50 border-green-400/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-green-400/30">
                  <SelectItem value="0">0 - Read Only</SelectItem>
                  <SelectItem value="1">1 - Limited Access</SelectItem>
                  <SelectItem value="2">2 - Standard Access</SelectItem>
                  <SelectItem value="3">3 - Full Access</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newUserConfigDbHost" className="text-gray-300">
                Database Host *
              </Label>
              <Input
                id="newUserConfigDbHost"
                value={newUserConfigDbHost}
                onChange={(e) => setNewUserConfigDbHost(e.target.value)}
                placeholder="localhost"
                className="bg-gray-800/50 border-green-400/30 text-white placeholder:text-gray-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="newUserConfigDbPort" className="text-gray-300">
                Database Port *
              </Label>
              <Input
                id="newUserConfigDbPort"
                type="number"
                value={newUserConfigDbPort}
                onChange={(e) =>
                  setNewUserConfigDbPort(parseInt(e.target.value) || 1433)
                }
                placeholder="1433"
                className="bg-gray-800/50 border-green-400/30 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newUserConfigDbName" className="text-gray-300">
                Database Name *
              </Label>
              <Input
                id="newUserConfigDbName"
                value={newUserConfigDbName}
                onChange={(e) => setNewUserConfigDbName(e.target.value)}
                placeholder="MyDatabase"
                className="bg-gray-800/50 border-green-400/30 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newUserConfigDbUser" className="text-gray-300">
                Database User *
              </Label>
              <Input
                id="newUserConfigDbUser"
                value={newUserConfigDbUser}
                onChange={(e) => setNewUserConfigDbUser(e.target.value)}
                placeholder="sa"
                className="bg-gray-800/50 border-green-400/30 text-white placeholder:text-gray-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="newUserConfigDbPassword" className="text-gray-300">
                Database Password *
              </Label>
              <Input
                id="newUserConfigDbPassword"
                type="password"
                value={newUserConfigDbPassword}
                onChange={(e) => setNewUserConfigDbPassword(e.target.value)}
                placeholder="Enter password"
                className="bg-gray-800/50 border-green-400/30 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newUserConfigDbSchema" className="text-gray-300">
                Database Schema
              </Label>
              <Input
                id="newUserConfigDbSchema"
                value={newUserConfigDbSchema}
                onChange={(e) => setNewUserConfigDbSchema(e.target.value)}
                placeholder="public"
                className="bg-gray-800/50 border-green-400/30 text-white placeholder:text-gray-500"
              />
            </div>
          </div>

          <Button
            type="button"
            onClick={handleCreateUserConfig}
            disabled={
              !newUserConfigUserId.trim() ||
              !newUserConfigDbHost.trim() ||
              !newUserConfigDbName.trim() ||
              !newUserConfigDbUser.trim() ||
              creatingUserConfig
            }
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            {creatingUserConfig ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating User Configuration...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create User Configuration
              </>
            )}
          </Button>
        </TabsContent>
      </Tabs>

      {/* Skip option */}
      <div className="border-t border-gray-700 pt-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            User configuration is optional. You can configure it later.
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