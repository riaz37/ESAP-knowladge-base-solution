//@ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { Building2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMSSQLConfig } from "@/lib/hooks/use-mssql-config";
import { useUserConfig } from "@/lib/hooks/use-user-config";
import { MSSQLConfigData, UserConfigData } from "@/types/api";
import { toast } from "sonner";

// Step components
import { StepIndicator } from "./steps/StepIndicator";
import { CompanyInfoStep } from "./steps/CompanyInfoStep";
import { DatabaseConfigStep } from "./steps/DatabaseConfigStep";
import { DatabaseCreationStep } from "./steps/DatabaseCreationStep";
import { UserConfigStep } from "./steps/UserConfigStep";
import { FinalCreationStep } from "./steps/FinalCreationStep";

// Types
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

export type WorkflowStep =
  | "company-info"
  | "database-config"
  | "database-creation"
  | "user-config"
  | "final-creation";

interface CompanyCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (companyData: CompanyFormData) => Promise<void>;
  type: "parent" | "sub";
  parentCompanyId?: number;
}

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
    setConfigAndWait,
    isLoading: mssqlLoading,
    clearError: clearMSSQLError,
    clearSuccess: clearMSSQLSuccess,
  } = useMSSQLConfig();

  const { 
    userConfigs, 
    fetchUserConfigs, 
    createUserConfig,
    isLoading: userConfigLoading 
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
  const [selectedUserConfigId, setSelectedUserConfigId] = useState<number | null>(null);

  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadDatabases();
      loadUserConfigs();
      setCurrentStep("company-info");
      setCurrentTaskId(null);
    }
  }, [isOpen]);

  const loadDatabases = async () => {
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
  };

  const loadUserConfigs = async () => {
    try {
      await fetchUserConfigs();
    } catch (error) {
      console.error("Error loading user configs:", error);
      toast.error("Failed to load user configurations");
    }
  };

  const handleTaskComplete = async (success: boolean, result?: any) => {
    if (success) {
      toast.success("Database created successfully");
      
      // Reload databases to get the newly created one
      await loadDatabases();
      
      // If we have a result with the new database ID, select it
      if (result?.db_id) {
        setSelectedDbId(result.db_id);
      }
      
      // Automatically move to the next step
      setCurrentStep("user-config");
    } else {
      toast.error("Failed to create database");
      setCurrentStep("database-config");
    }
    setCurrentTaskId(null);
    setDatabaseCreationData(null);
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

        <StepIndicator currentStep={currentStep} />

        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto px-1">
            {currentStep === "company-info" && <CompanyInfoStep {...stepProps} />}
            {currentStep === "database-config" && <DatabaseConfigStep {...stepProps} />}
            {currentStep === "database-creation" && (
              <DatabaseCreationStep
                currentTaskId={currentTaskId}
                onTaskComplete={handleTaskComplete}
              />
            )}
            {currentStep === "user-config" && <UserConfigStep {...stepProps} />}
            {currentStep === "final-creation" && <FinalCreationStep {...stepProps} />}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CompanyCreationModal;