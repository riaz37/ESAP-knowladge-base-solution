"use client";

import { useState, useEffect, useCallback } from "react";
import { Building2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMSSQLConfig } from "@/lib/hooks/use-mssql-config";
import { useUserConfig } from "@/lib/hooks/use-user-config";
import { MSSQLConfigData } from "@/types/api";
import { toast } from "sonner";

// Step components
import { StepIndicator } from "./steps/StepIndicator";
import { CompanyInfoStep } from "./steps/CompanyInfoStep";
import { DatabaseConfigStep } from "./steps/DatabaseConfigStep";
import { DatabaseCreationStep } from "./steps/DatabaseCreationStep";
import { UserConfigStep } from "./steps/UserConfigStep";
import { FinalCreationStep } from "./steps/FinalCreationStep";

// Types
import {
  CompanyFormData,
  DatabaseFormData,
  WorkflowStep,
  CompanyCreationModalProps,
} from "./types";

export function CompanyCreationModal({
  isOpen,
  onClose,
  onSubmit,
  type,
  parentCompanyId,
}: CompanyCreationModalProps) {
  // Hooks
  const {
    getConfigs,
    setConfig,
    isLoading: mssqlLoading,
    clearError: clearMSSQLError,
    clearSuccess: clearMSSQLSuccess,
  } = useMSSQLConfig();

  const {
    userConfigs,
    fetchUserConfigs,
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
  const [databaseCreationData, setDatabaseCreationData] = useState<any>(null);

  // User Configuration states
  const [selectedUserConfigId, setSelectedUserConfigId] = useState<
    number | null
  >(null);

  // Memoized data loading functions
  const loadDatabases = useCallback(async () => {
    try {
      const configs = await getConfigs();
      if (configs && Array.isArray(configs)) {
        setDatabases(configs);
      } else {
        setDatabases([]);
      }
    } catch (error) {
      console.error("Error loading databases:", error);
      toast.error("Failed to load databases");
      setDatabases([]);
    }
  }, [getConfigs]);

  const loadUserConfigs = useCallback(async () => {
    try {
      await fetchUserConfigs();
    } catch (error) {
      console.error("Error loading user configs:", error);
      toast.error("Failed to load user configurations");
    }
  }, [fetchUserConfigs]);

  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadDatabases();
      loadUserConfigs();
      setCurrentStep("company-info");
      setCurrentTaskId(null);
    }
  }, [isOpen, loadDatabases, loadUserConfigs]);

  const handleTaskComplete = async (success: boolean, result?: any) => {
    if (success) {
      toast.success("Database created successfully");

      // Reload databases to get the newly created one
      await loadDatabases();

      // Try to find and select the newly created database
      let newDbId = null;

      // First, try to get the database ID from the result
      if (result?.db_id) {
        newDbId = result.db_id;
      } else if (result?.database_id) {
        newDbId = result.database_id;
      } else if (databaseCreationData?.dbConfig?.db_name) {
        // If no ID in result, try to find by name from the creation data
        const configs = await getConfigs();
        if (configs && Array.isArray(configs)) {
          const newDb = configs.find(
            (db) => db.db_name === databaseCreationData.dbConfig.db_name
          );
          if (newDb) {
            newDbId = newDb.db_id;
          }
        }
      }

      // Select the newly created database
      if (newDbId) {
        setSelectedDbId(newDbId);
      }

      // Automatically move to the next step
      setCurrentStep("user-config");
    } else {
      toast.error("Failed to create database");
      setCurrentStep("database-config");
    }

    // Clear the task ID
    setCurrentTaskId(null);
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
    // Reset all states
    setCompanyName("");
    setDescription("");
    setAddress("");
    setContactEmail("");
    setSelectedDbId(null);
    setSelectedUserConfigId(null);
    setCurrentStep("company-info");
    setCurrentTaskId(null);

    // Clear any errors
    clearMSSQLError();
    clearMSSQLSuccess();

    onClose();
  };

  const stepProps = {
    currentStep,
    setCurrentStep,
    companyName,
    setCompanyName,
    description,
    setDescription,
    address,
    setAddress,
    contactEmail,
    setContactEmail,
    selectedDbId,
    setSelectedDbId,
    selectedUserConfigId,
    setSelectedUserConfigId,
    databases,
    userConfigs,
    mssqlLoading,
    userConfigLoading,
    setConfig,
    createUserConfig,
    loadDatabases,
    loadUserConfigs,
    creatingCompany,
    handleSubmit,
    type,
    setDatabaseCreationData,
    setCurrentTaskId,
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl w-[95vw] h-[95vh] bg-gray-900/95 backdrop-blur-md border border-green-400/30 text-white p-0 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-green-400/20 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-white">
                Create {type === "parent" ? "Parent" : "Sub"} Company
              </DialogTitle>
              <DialogDescription className="text-gray-400 text-sm mt-1">
                {type === "parent"
                  ? "Create a new parent company and associate it with a database"
                  : "Create a new sub-company under the selected parent company"}
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-4 bg-gray-800/30 flex-shrink-0">
          <StepIndicator currentStep={currentStep} />
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-0">
          <div className="h-full overflow-y-auto">
            <div className="p-6 min-h-full">
              {currentStep === "company-info" && (
                <CompanyInfoStep {...stepProps} />
              )}
              {currentStep === "database-config" && (
                <DatabaseConfigStep {...stepProps} />
              )}
              {currentStep === "database-creation" && (
                <DatabaseCreationStep
                  currentTaskId={currentTaskId}
                  onTaskComplete={handleTaskComplete}
                />
              )}
              {currentStep === "user-config" && (
                <UserConfigStep {...stepProps} />
              )}
              {currentStep === "final-creation" && (
                <FinalCreationStep {...stepProps} />
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CompanyCreationModal;
