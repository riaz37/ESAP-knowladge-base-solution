"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  Database,
  Plus,
  Loader2,
  User,
  Settings,
  Upload,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Separator } from "@/components/ui/separator";
import { MSSQLConfigService } from "@/lib/api/services/mssql-config-service";
import { UserConfigService } from "@/lib/api/services/user-config-service";
import {
  MSSQLConfigData,
  UserConfigData,
  UserConfigCreateRequest,
} from "@/types/api";
import { toast } from "sonner";

interface CompanyCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (companyData: CompanyFormData) => Promise<void>;
  type: "parent" | "sub";
  parentCompanyId?: number;
}

export interface CompanyFormData {
  name: string;
  description: string;
  address: string;
  contactEmail: string;
  dbId: number;
  parentCompanyId?: number;
}

export interface DatabaseFormData {
  db_url: string;
  db_name: string;
  business_rule?: string;
}

export function CompanyCreationModal({
  isOpen,
  onClose,
  onSubmit,
  type,
  parentCompanyId,
}: CompanyCreationModalProps) {
  // Form states
  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [selectedDbId, setSelectedDbId] = useState<number | null>(null);

  // Database states
  const [databases, setDatabases] = useState<MSSQLConfigData[]>([]);
  const [loadingDatabases, setLoadingDatabases] = useState(false);
  const [creatingDatabase, setCreatingDatabase] = useState(false);
  const [creatingCompany, setCreatingCompany] = useState(false);

  // New database form states
  const [newDbUrl, setNewDbUrl] = useState("");
  const [newDbName, setNewDbName] = useState("");
  const [newDbBusinessRule, setNewDbBusinessRule] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // User Configuration states
  const [userConfigs, setUserConfigs] = useState<UserConfigData[]>([]);
  const [loadingUserConfigs, setLoadingUserConfigs] = useState(false);
  const [creatingUserConfig, setCreatingUserConfig] = useState(false);
  const [selectedUserConfigId, setSelectedUserConfigId] = useState<
    number | null
  >(null);

  // New user config form states
  const [newUserConfigUserId, setNewUserConfigUserId] = useState("");
  const [newUserConfigAccessLevel, setNewUserConfigAccessLevel] = useState(2);
  const [newUserConfigDbHost, setNewUserConfigDbHost] = useState("");
  const [newUserConfigDbPort, setNewUserConfigDbPort] = useState(1433);
  const [newUserConfigDbName, setNewUserConfigDbName] = useState("");
  const [newUserConfigDbUser, setNewUserConfigDbUser] = useState("");
  const [newUserConfigDbPassword, setNewUserConfigDbPassword] = useState("");
  const [newUserConfigDbSchema, setNewUserConfigDbSchema] = useState("public");

  // Tab states
  const [activeTab, setActiveTab] = useState("existing");
  const [activeUserConfigTab, setActiveUserConfigTab] = useState("existing");

  // Load databases and user configs when modal opens
  useEffect(() => {
    if (isOpen) {
      loadDatabases();
      loadUserConfigs();
    }
  }, [isOpen]);

  const loadDatabases = async () => {
    setLoadingDatabases(true);
    try {
      const response = await MSSQLConfigService.getMSSQLConfigs();
      console.log("Database loading response:", response);

      // The service returns response.data, which could be either:
      // 1. { configs: MSSQLConfigData[], count: number } (if service extracts .data)
      // 2. { status, message, data: { configs: MSSQLConfigData[], count: number } } (full response)
      let configs: MSSQLConfigData[];

      if (
        response.data &&
        response.data.configs &&
        Array.isArray(response.data.configs)
      ) {
        // Case 1: Full wrapped response
        configs = response.data.configs;
      } else if (response.configs && Array.isArray(response.configs)) {
        // Case 2: Direct data object
        configs = response.configs;
      } else {
        console.error("Invalid response structure:", response);
        throw new Error("No database configurations found in response");
      }

      console.log("Extracted configs:", configs);
      setDatabases(configs);
    } catch (error) {
      console.error("Error loading databases:", error);
      toast.error("Failed to load databases");
      setDatabases([]); // Set empty array as fallback
    } finally {
      setLoadingDatabases(false);
    }
  };

  const loadUserConfigs = async () => {
    setLoadingUserConfigs(true);
    try {
      const response = await UserConfigService.getUserConfigs();
      console.log("User configs loading response:", response);

      let configs: UserConfigData[];
      if (
        response.data &&
        response.data.configs &&
        Array.isArray(response.data.configs)
      ) {
        configs = response.data.configs;
      } else if (response.configs && Array.isArray(response.configs)) {
        configs = response.configs;
      } else {
        console.error("Invalid user config response structure:", response);
        throw new Error("No user configurations found in response");
      }

      console.log("Extracted user configs:", configs);
      setUserConfigs(configs);
    } catch (error) {
      console.error("Error loading user configs:", error);
      toast.error("Failed to load user configurations");
      setUserConfigs([]);
    } finally {
      setLoadingUserConfigs(false);
    }
  };

  const handleCreateDatabase = async () => {
    if (!newDbUrl.trim() || !newDbName.trim()) {
      toast.error("Database URL and name are required");
      return;
    }

    setCreatingDatabase(true);
    try {
      console.log("Creating database with data:", {
        db_url: newDbUrl,
        db_name: newDbName,
        business_rule: newDbBusinessRule || undefined,
        file: selectedFile,
      });

      let response;

      // Use file upload API if file is selected, otherwise use regular API
      if (selectedFile) {
        response = await MSSQLConfigService.createMSSQLConfigWithFile({
          db_url: newDbUrl,
          db_name: newDbName,
          business_rule: newDbBusinessRule || undefined,
          file: selectedFile,
        });
      } else {
        response = await MSSQLConfigService.createMSSQLConfig({
          db_url: newDbUrl,
          db_name: newDbName,
          business_rule: newDbBusinessRule || undefined,
        });
      }

      console.log("Database creation response:", response);

      // The service returns response.data, which could be either:
      // 1. MSSQLConfigData directly (if service extracts .data)
      // 2. MSSQLConfigResponse with { status, message, data: MSSQLConfigData }
      let databaseConfig: MSSQLConfigData;

      if (response.data && response.data.db_id) {
        // Case 1: Response is wrapped { status, message, data: MSSQLConfigData }
        databaseConfig = response.data;
      } else if (response.db_id) {
        // Case 2: Response is directly MSSQLConfigData
        databaseConfig = response;
      } else {
        console.error("Invalid response structure:", response);
        throw new Error("Invalid response from server");
      }

      // Add the new database to the list
      setDatabases((prev) => [...prev, databaseConfig]);
      setSelectedDbId(databaseConfig.db_id);

      // Clear form and switch to existing tab
      setNewDbUrl("");
      setNewDbName("");
      setNewDbBusinessRule("");
      setSelectedFile(null);
      setActiveTab("existing");

      toast.success("Database created successfully");
    } catch (error) {
      console.error("Error creating database:", error);
      toast.error("Failed to create database");
    } finally {
      setCreatingDatabase(false);
    }
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

      console.log("Creating user config with data:", userConfigRequest);

      const response = await UserConfigService.createUserConfig(
        userConfigRequest
      );
      console.log("User config creation response:", response);

      // Reload user configs to get the updated list
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyName.trim()) {
      toast.error("Company name is required");
      return;
    }

    if (!selectedDbId) {
      toast.error("Please select or create a database");
      return;
    }

    setCreatingCompany(true);
    try {
      const companyData: CompanyFormData = {
        name: companyName.trim(),
        description: description.trim(),
        address: address.trim(),
        contactEmail: contactEmail.trim(),
        dbId: selectedDbId,
        parentCompanyId,
      };

      await onSubmit(companyData);
      handleClose();
      toast.success(
        `${type === "parent" ? "Parent" : "Sub"} company created successfully`
      );
    } catch (error) {
      console.error("Error creating company:", error);
      toast.error("Failed to create company");
    } finally {
      setCreatingCompany(false);
    }
  };

  const handleClose = () => {
    // Reset all form states
    setCompanyName("");
    setDescription("");
    setAddress("");
    setContactEmail("");
    setSelectedDbId(null);
    setNewDbUrl("");
    setNewDbName("");
    setNewDbBusinessRule("");
    setSelectedFile(null);
    setActiveTab("existing");

    // Reset user config states
    setSelectedUserConfigId(null);
    setNewUserConfigUserId("");
    setNewUserConfigAccessLevel(2);
    setNewUserConfigDbHost("");
    setNewUserConfigDbPort(1433);
    setNewUserConfigDbName("");
    setNewUserConfigDbUser("");
    setNewUserConfigDbPassword("");
    setNewUserConfigDbSchema("public");
    setActiveUserConfigTab("existing");

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900/95 backdrop-blur-md border border-green-400/30 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-green-400" />
            </div>
            Create {type === "parent" ? "Parent" : "Sub"} Company
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {type === "parent"
              ? "Create a new parent company and associate it with a database"
              : "Create a new sub-company under the selected parent company"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-green-400">
              Company Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-gray-300">
                  Company Name *
                </Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Enter company name"
                  className="bg-gray-800/50 border-green-400/30 text-white placeholder:text-gray-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail" className="text-gray-300">
                  Contact Email
                </Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="contact@company.com"
                  className="bg-gray-800/50 border-green-400/30 text-white placeholder:text-gray-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-300">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the company"
                className="bg-gray-800/50 border-green-400/30 text-white placeholder:text-gray-500 min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-gray-300">
                Address
              </Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Company address"
                className="bg-gray-800/50 border-green-400/30 text-white placeholder:text-gray-500"
              />
            </div>
          </div>

          <Separator className="my-6 bg-green-400/20" />

          {/* User Configuration Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-green-400 flex items-center gap-2">
              <User className="w-5 h-5" />
              User Configuration
            </h3>

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
                  <Label className="text-gray-300">
                    Select User Configuration
                  </Label>
                  {loadingUserConfigs ? (
                    <div className="flex items-center gap-2 p-3 bg-gray-800/50 rounded-lg">
                      <Loader2 className="w-4 h-4 animate-spin text-green-400" />
                      <span className="text-gray-400">
                        Loading user configurations...
                      </span>
                    </div>
                  ) : (
                    <Select
                      value={selectedUserConfigId?.toString() || ""}
                      onValueChange={(value) =>
                        setSelectedUserConfigId(parseInt(value))
                      }
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
                                {config.user_id} - {config.db_config.DB_NAME}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {userConfigs.length === 0 && !loadingUserConfigs && (
                    <p className="text-sm text-gray-400">
                      No user configurations found. Create one to get started.
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="new" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="newUserConfigUserId"
                      className="text-gray-300"
                    >
                      User ID *
                    </Label>
                    <Input
                      id="newUserConfigUserId"
                      value={newUserConfigUserId}
                      onChange={(e) => setNewUserConfigUserId(e.target.value)}
                      placeholder="john_doe"
                      className="bg-gray-800/50 border-green-400/30 text-white placeholder:text-gray-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="newUserConfigAccessLevel"
                      className="text-gray-300"
                    >
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
                        <SelectItem value="0">0 - No Access</SelectItem>
                        <SelectItem value="1">1 - Read Only</SelectItem>
                        <SelectItem value="2">2 - Standard</SelectItem>
                        <SelectItem value="3">3 - Full Access</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-300">
                    Database Connection
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="newUserConfigDbHost"
                        className="text-gray-300"
                      >
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

                    <div className="space-y-2">
                      <Label
                        htmlFor="newUserConfigDbPort"
                        className="text-gray-300"
                      >
                        Database Port *
                      </Label>
                      <Input
                        id="newUserConfigDbPort"
                        type="number"
                        value={newUserConfigDbPort}
                        onChange={(e) =>
                          setNewUserConfigDbPort(
                            parseInt(e.target.value) || 1433
                          )
                        }
                        placeholder="1433"
                        className="bg-gray-800/50 border-green-400/30 text-white placeholder:text-gray-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="newUserConfigDbName"
                        className="text-gray-300"
                      >
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
                      <Label
                        htmlFor="newUserConfigDbUser"
                        className="text-gray-300"
                      >
                        Database User *
                      </Label>
                      <Input
                        id="newUserConfigDbUser"
                        value={newUserConfigDbUser}
                        onChange={(e) => setNewUserConfigDbUser(e.target.value)}
                        placeholder="admin"
                        className="bg-gray-800/50 border-green-400/30 text-white placeholder:text-gray-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="newUserConfigDbPassword"
                        className="text-gray-300"
                      >
                        Database Password *
                      </Label>
                      <Input
                        id="newUserConfigDbPassword"
                        type="password"
                        value={newUserConfigDbPassword}
                        onChange={(e) =>
                          setNewUserConfigDbPassword(e.target.value)
                        }
                        placeholder="••••••••"
                        className="bg-gray-800/50 border-green-400/30 text-white placeholder:text-gray-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="newUserConfigDbSchema"
                        className="text-gray-300"
                      >
                        Database Schema
                      </Label>
                      <Input
                        id="newUserConfigDbSchema"
                        value={newUserConfigDbSchema}
                        onChange={(e) =>
                          setNewUserConfigDbSchema(e.target.value)
                        }
                        placeholder="public"
                        className="bg-gray-800/50 border-green-400/30 text-white placeholder:text-gray-500"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleCreateUserConfig}
                  disabled={
                    creatingUserConfig ||
                    !newUserConfigUserId.trim() ||
                    !newUserConfigDbHost.trim() ||
                    !newUserConfigDbName.trim() ||
                    !newUserConfigDbUser.trim()
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
          </div>

          <Separator className="my-6 bg-green-400/20" />

          {/* Database Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-green-400">
              Database Configuration
            </h3>

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
                <div className="space-y-2">
                  <Label className="text-gray-300">Select Database *</Label>
                  {loadingDatabases ? (
                    <div className="flex items-center gap-2 p-3 bg-gray-800/50 rounded-lg">
                      <Loader2 className="w-4 h-4 animate-spin text-green-400" />
                      <span className="text-gray-400">
                        Loading databases...
                      </span>
                    </div>
                  ) : (
                    <Select
                      value={selectedDbId?.toString() || ""}
                      onValueChange={(value) =>
                        setSelectedDbId(parseInt(value))
                      }
                    >
                      <SelectTrigger className="bg-gray-800/50 border-green-400/30 text-white">
                        <SelectValue placeholder="Choose a database" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-green-400/30">
                        {databases.map((db) => (
                          <SelectItem
                            key={db.db_id}
                            value={db.db_id.toString()}
                          >
                            <div className="flex items-center gap-2">
                              <Database className="w-4 h-4 text-green-400" />
                              <span>{db.db_name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="new" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <Label htmlFor="newDbUrl" className="text-gray-300">
                      Database URL *
                    </Label>
                    <Input
                      id="newDbUrl"
                      value={newDbUrl}
                      onChange={(e) => setNewDbUrl(e.target.value)}
                      placeholder="mssql+pyodbc://..."
                      className="bg-gray-800/50 border-green-400/30 text-white placeholder:text-gray-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newDbBusinessRule" className="text-gray-300">
                    Business Rules (Optional)
                  </Label>
                  <Textarea
                    id="newDbBusinessRule"
                    value={newDbBusinessRule}
                    onChange={(e) => setNewDbBusinessRule(e.target.value)}
                    placeholder="Enter business rules for this database"
                    className="bg-gray-800/50 border-green-400/30 text-white placeholder:text-gray-500 min-h-[80px]"
                  />
                </div>

                {/* File Upload Section */}
                <div className="space-y-2">
                  <Label className="text-gray-300">
                    Database File (Optional)
                  </Label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Database className="w-4 h-4" />
                      <span>
                        Allowed types: .bak, .sql, .mdf, .ldf, .trn, .dmp, .dump
                      </span>
                    </div>

                    {selectedFile ? (
                      <div className="flex items-center justify-between p-3 bg-gray-800/50 border border-green-400/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Upload className="w-4 h-4 text-green-400" />
                          <span className="text-white">
                            {selectedFile.name}
                          </span>
                          <span className="text-gray-400 text-sm">
                            ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedFile(null)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="relative">
                        <input
                          type="file"
                          id="databaseFile"
                          accept=".bak,.sql,.mdf,.ldf,.trn,.dmp,.dump"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              // Validate file type
                              const allowedTypes = [
                                ".bak",
                                ".sql",
                                ".mdf",
                                ".ldf",
                                ".trn",
                                ".dmp",
                                ".dump",
                              ];
                              const fileName = file.name.toLowerCase();
                              const isValidType = allowedTypes.some((type) =>
                                fileName.endsWith(type)
                              );

                              if (!isValidType) {
                                toast.error(
                                  `Invalid file type. Allowed types: ${allowedTypes.join(
                                    ", "
                                  )}`
                                );
                                return;
                              }

                              // Check file size (500MB limit)
                              const maxSizeInMB = 500;
                              const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
                              if (file.size > maxSizeInBytes) {
                                toast.error(
                                  `File size exceeds ${maxSizeInMB}MB limit`
                                );
                                return;
                              }

                              setSelectedFile(file);
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex items-center justify-center p-6 border-2 border-dashed border-green-400/30 rounded-lg hover:border-green-400/50 transition-colors cursor-pointer">
                          <div className="text-center">
                            <Upload className="w-8 h-8 text-green-400 mx-auto mb-2" />
                            <p className="text-gray-300 mb-1">
                              Click to upload database file
                            </p>
                            <p className="text-gray-500 text-sm">
                              Max size: 500MB
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleCreateDatabase}
                  disabled={
                    creatingDatabase || !newDbUrl.trim() || !newDbName.trim()
                  }
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  {creatingDatabase ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Database...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Database
                    </>
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-green-400/20">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="border-green-400/30 text-green-400 hover:bg-green-400/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={creatingCompany || !companyName.trim() || !selectedDbId}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {creatingCompany ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Building2 className="w-4 h-4 mr-2" />
                  Create {type === "parent" ? "Parent" : "Sub"} Company
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
