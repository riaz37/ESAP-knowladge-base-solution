//@ts-nocheck
"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  Database,
  Plus,
  Loader2,
  X,
  CheckCircle,
  User,
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

import { TaskProgress } from "@/components/ui/task-progress";
import { useMSSQLConfig } from "@/lib/hooks/use-mssql-config";
import { useUserConfig } from "@/lib/hooks/use-user-config";
import {
  MSSQLConfigData,
  UserConfigData,
  UserConfigCreateRequest,
} from "@/types/api";
import { toast } from "sonner";

interface ImprovedCompanyCreationModalProps {
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
  user_id: string;
}

// Workflow steps
type WorkflowStep =
  | "company-info"
  | "database-config"
  | "database-creation"
  | "user-config"
  | "final-creation";

export function ImprovedCompanyCreationModal({
  isOpen,
  onClose,
  onSubmit,
  type,
  parentCompanyId,
}: ImprovedCompanyCreationModalProps) {
  // Use hooks for consistent API calls
  const {
    getConfigs,
    setConfigAndWait,
    taskProgress,
    taskStatus,
    isLoading: mssqlLoading,
    error: mssqlError,
    success: mssqlSuccess,
    clearError: clearMSSQLError,
    clearSuccess: clearMSSQLSuccess,
  } = useMSSQLConfig();

  const {
    getUserConfigs,
    createUserConfig,
    isLoading: userConfigLoading,
  } = useUserConfig();

  // Workflow state
  const [currentStep, setCurrentStep] = useState<WorkflowStep>("company-info");
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);

  // Form states
  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [selectedDbId, setSelectedDbId] = useState<number | null>(null);

  // Database states
  const [databases, setDatabases] = useState<MSSQLConfigData[]>([]);
  const [creatingCompany, setCreatingCompany] = useState(false);

  // New database form states
  const [newDbUrl, setNewDbUrl] = useState("");
  const [newDbName, setNewDbName] = useState("");
  const [newDbBusinessRule, setNewDbBusinessRule] = useState("");
  const [newDbUserId, setNewDbUserId] = useState("admin"); // Default user ID
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
      // Reset workflow to first step
      setCurrentStep("company-info");
      setCurrentTaskId(null);
    }
  }, [isOpen]);

  const loadDatabases = async () => {
    try {
      const configs = await getConfigs();
      console.log("Database loading response:", configs);

      if (configs && Array.isArray(configs)) {
        setDatabases(configs);
      } else {
        console.error("Invalid response structure:", configs);
        setDatabases([]);
      }
    } catch (error) {
      console.error("Error loading databases:", error);
      toast.error("Failed to load databases");
      setDatabases([]);
    }
  };

  const loadUserConfigs = async () => {
    setLoadingUserConfigs(true);
    try {
      const response = await getUserConfigs();
      console.log("User configs loading response:", response);

      // The response structure is {configs: UserConfigData[], count: number}
      if (response && response.configs && Array.isArray(response.configs)) {
        setUserConfigs(response.configs);
      } else {
        console.error("Invalid user config response structure:", response);
        setUserConfigs([]);
      }
    } catch (error) {
      console.error("Error loading user configs:", error);
      toast.error("Failed to load user configurations");
      setUserConfigs([]);
    } finally {
      setLoadingUserConfigs(false);
    }
  };

  const handleCreateDatabase = async () => {
    if (!newDbUrl.trim() || !newDbName.trim() || !newDbUserId.trim()) {
      toast.error("Database URL, name, and user ID are required");
      return;
    }

    try {
      console.log("Creating database with data:", {
        db_url: newDbUrl,
        db_name: newDbName,
        business_rule: newDbBusinessRule || "",
        user_id: newDbUserId,
        file: selectedFile,
      });

      // Move to database creation step
      setCurrentStep("database-creation");

      // Use the new task-based API
      const response = await setConfigAndWait(
        {
          db_url: newDbUrl,
          db_name: newDbName,
          business_rule: newDbBusinessRule || "",
          user_id: newDbUserId,
          file: selectedFile || undefined,
        },
        (progress, status) => {
          console.log(`Database creation progress: ${progress}% - ${status}`);
        }
      );

      if (response && response.data.status === "success") {
        // Reload databases to get the updated list
        await loadDatabases();

        // Find the newly created database
        const newDb = databases.find((db) => db.db_name === newDbName);
        if (newDb) {
          setSelectedDbId(newDb.db_id);
        }

        // Clear form and move to user config step
        setNewDbUrl("");
        setNewDbName("");
        setNewDbBusinessRule("");
        setNewDbUserId("admin");
        setSelectedFile(null);
        setActiveTab("existing");
        setCurrentStep("user-config");

        toast.success("Database created successfully");
      } else {
        throw new Error(response?.data.error || "Database creation failed");
      }
    } catch (error) {
      console.error("Error creating database:", error);
      toast.error("Failed to create database");
      setCurrentStep("database-config"); // Go back to config step
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

      const response = await createUserConfig(userConfigRequest);
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

  const handleNextStep = () => {
    if (currentStep === "company-info") {
      if (!companyName.trim()) {
        toast.error("Company name is required");
        return;
      }
      setCurrentStep("database-config");
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === "database-config") {
      setCurrentStep("company-info");
    } else if (currentStep === "user-config") {
      setCurrentStep("database-config");
    } else if (currentStep === "final-creation") {
      setCurrentStep("user-config");
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

  const handleTaskComplete = (success: boolean, result?: any) => {
    if (success) {
      setCurrentStep("user-config");
      // Reload databases
      loadDatabases();
    } else {
      setCurrentStep("database-config");
    }
    setCurrentTaskId(null);
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
    setNewDbUserId("admin");
    setSelectedFile(null);
    setActiveTab("existing");
    setCurrentStep("company-info");
    setCurrentTaskId(null);

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

    // Clear any errors
    clearMSSQLError();
    clearMSSQLSuccess();

    onClose();
  };

  const renderStepIndicator = () => {
    const steps = [
      { key: "company-info", label: "Company Info", icon: Building2 },
      { key: "database-config", label: "Database", icon: Database },
      { key: "database-creation", label: "Processing", icon: Loader2 },
      { key: "user-config", label: "User Config", icon: User },
      { key: "final-creation", label: "Complete", icon: CheckCircle },
    ];

    return (
      <div className="flex items-center justify-center mb-6">
        {steps.map((step, index) => {
          const isActive = currentStep === step.key;
          const isCompleted =
            steps.findIndex((s) => s.key === currentStep) > index;
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex items-center">
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  isActive
                    ? "bg-green-500/20 text-green-400"
                    : isCompleted
                    ? "bg-green-500/10 text-green-300"
                    : "bg-gray-800/50 text-gray-500"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive && step.key === "database-creation"
                      ? "animate-spin"
                      : ""
                  }`}
                />
                <span className="text-sm font-medium">{step.label}</span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-8 h-0.5 mx-2 ${
                    isCompleted ? "bg-green-400" : "bg-gray-600"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[98vw] max-w-none h-[95vh] bg-gray-900/95 backdrop-blur-md border border-green-400/30 text-white flex flex-col">
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

        {renderStepIndicator()}

        {/* Step Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto px-1">
            {/* Company Information Step */}
            {currentStep === "company-info" && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-green-400">
                  Company Information
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
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

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-gray-300">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brief description of the company"
                      className="bg-gray-800/50 border-green-400/30 text-white placeholder:text-gray-500 min-h-[60px] resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleNextStep}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Next: Configure Database
                  </Button>
                </div>
              </div>
            )}

            {/* Database Configuration Step */}
            {currentStep === "database-config" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-green-400">
                    Database Configuration
                  </h3>
                  <Button
                    variant="outline"
                    onClick={handlePreviousStep}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
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
                    <div className="space-y-2">
                      <Label className="text-gray-300">Select Database *</Label>
                      {mssqlLoading ? (
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
                        <Label
                          htmlFor="newDbBusinessRule"
                          className="text-gray-300"
                        >
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
                        <Label className="text-gray-300">
                          Database File (Optional)
                        </Label>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Database className="w-4 h-4" />
                            <span>
                              Supported: .bak, .sql, .mdf, .ldf, .trn, .dmp,
                              .dump
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
                        !newDbUrl.trim() ||
                        !newDbName.trim() ||
                        !newDbUserId.trim()
                      }
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Database
                    </Button>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {/* Database Creation Progress Step */}
            {currentStep === "database-creation" && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-green-400">
                  Creating Database
                </h3>
                <TaskProgress
                  taskId={currentTaskId}
                  onTaskComplete={handleTaskComplete}
                  title="Database Configuration"
                  description="Setting up your database configuration and processing any uploaded files..."
                  showCancelButton={false}
                />
              </div>
            )}

            {/* User Configuration Step */}
            {currentStep === "user-config" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-green-400">
                    User Configuration
                  </h3>
                  <Button
                    variant="outline"
                    onClick={handlePreviousStep}
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
                                    {config.user_id} (Level{" "}
                                    {config.access_level})
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      {userConfigs.length === 0 && !loadingUserConfigs && (
                        <p className="text-sm text-gray-400">
                          No user configurations found. Create one to get
                          started.
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
                        <Label
                          htmlFor="newUserConfigUserId"
                          className="text-gray-300"
                        >
                          User ID *
                        </Label>
                        <Input
                          id="newUserConfigUserId"
                          value={newUserConfigUserId}
                          onChange={(e) =>
                            setNewUserConfigUserId(e.target.value)
                          }
                          placeholder="user123"
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
                            <SelectItem value="0">0 - Read Only</SelectItem>
                            <SelectItem value="1">
                              1 - Limited Access
                            </SelectItem>
                            <SelectItem value="2">
                              2 - Standard Access
                            </SelectItem>
                            <SelectItem value="3">3 - Full Access</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

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
                          onChange={(e) =>
                            setNewUserConfigDbHost(e.target.value)
                          }
                          placeholder="localhost"
                          className="bg-gray-800/50 border-green-400/30 text-white placeholder:text-gray-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
                          onChange={(e) =>
                            setNewUserConfigDbName(e.target.value)
                          }
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
                          onChange={(e) =>
                            setNewUserConfigDbUser(e.target.value)
                          }
                          placeholder="sa"
                          className="bg-gray-800/50 border-green-400/30 text-white placeholder:text-gray-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                          placeholder="Enter password"
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
                      User configuration is optional. You can configure it
                      later.
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
            )}

            {/* Final Creation Step */}
            {currentStep === "final-creation" && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-green-400">
                    Ready to Create Company
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePreviousStep}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Back
                  </Button>
                </div>

                {/* Summary */}
                <div className="bg-gray-800/30 rounded-lg p-4 space-y-3">
                  <h4 className="font-medium text-white">Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Company Name:</span>
                      <span className="text-white ml-2">{companyName}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Database:</span>
                      <span className="text-white ml-2">
                        {databases.find((db) => db.db_id === selectedDbId)
                          ?.db_name || "Not selected"}
                      </span>
                    </div>
                    {description && (
                      <div className="md:col-span-2">
                        <span className="text-gray-400">Description:</span>
                        <span className="text-white ml-2">{description}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={creatingCompany || !selectedDbId}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  {creatingCompany ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating {type === "parent" ? "Parent" : "Sub"} Company...
                    </>
                  ) : (
                    <>
                      <Building2 className="w-4 h-4 mr-2" />
                      Create {type === "parent" ? "Parent" : "Sub"} Company
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
