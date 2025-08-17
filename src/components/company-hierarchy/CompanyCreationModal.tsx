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
import { useDatabaseConfig } from "@/lib/hooks/use-database-config";

import { MSSQLConfigData, DatabaseConfigData } from "@/types/api";
import { toast } from "sonner";

// Step components
import { StepIndicator } from "./steps/StepIndicator";
import { CompanyInfoStep } from "./steps/CompanyInfoStep";
import { DatabaseConfigStep } from "./steps/DatabaseConfigStep";
import { DatabaseCreationStep } from "./steps/DatabaseCreationStep";
import { VectorConfigStep } from "./steps/VectorConfigStep";
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
  const {
    getConfigs,
    setConfig,
    isLoading: mssqlLoading,
    clearError: clearMSSQLError,
    clearSuccess: clearMSSQLSuccess,
  } = useMSSQLConfig();

  const {
    fetchDatabaseConfigs,
    createDatabaseConfig,
    isLoading: userConfigLoading,
  } = useDatabaseConfig();

  // Workflow state
  const [currentStep, setCurrentStep] = useState<WorkflowStep>("company-info");
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);

  // Form states
  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [selectedDbId, setSelectedDbId] = useState<number | null>(null);
  const [selectedUserConfigId, setSelectedUserConfigId] = useState<number | null>(null);

  // Data states
  const [databases, setDatabases] = useState<MSSQLConfigData[]>([]);
  const [userConfigs, setUserConfigs] = useState<DatabaseConfigData[]>([]);
  const [creatingCompany, setCreatingCompany] = useState(false);
  const [databaseCreationData, setDatabaseCreationData] = useState<any>(null);

  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
      resetForm();
    }
  }, [isOpen]);

  const loadInitialData = useCallback(async () => {
    try {
      const [dbConfigs, userConfigsResponse] = await Promise.all([
        getConfigs(),
        fetchDatabaseConfigs()
      ]);
      
      setDatabases(Array.isArray(dbConfigs) ? dbConfigs : []);
      
      // Handle DatabaseConfigs response structure: { configs: DatabaseConfigData[], count: number }
      if (userConfigsResponse && userConfigsResponse.configs && Array.isArray(userConfigsResponse.configs)) {
        setUserConfigs(userConfigsResponse.configs);
      } else {
        setUserConfigs([]);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      setDatabases([]);
      setUserConfigs([]);
    }
  }, [getConfigs, fetchDatabaseConfigs]);

  const resetForm = () => {
    setCompanyName("");
    setDescription("");
    setAddress("");
    setContactEmail("");
    setSelectedDbId(null);
    setSelectedUserConfigId(null);
    setCurrentStep("company-info");
    setCurrentTaskId(null);
    setDatabaseCreationData(null);
    clearMSSQLError();
    clearMSSQLSuccess();
  };

  const handleTaskComplete = async (success: boolean, result?: any) => {
    if (success) {
      // Reload databases to get the newly created one
      const configs = await getConfigs();
      if (configs && Array.isArray(configs)) {
        setDatabases(configs);
        
        // Try to find and select the newly created database
        let newDbId = null;
        
        if (result?.db_id) {
          newDbId = result.db_id;
        } else if (result?.database_id) {
          newDbId = result.database_id;
        } else if (databaseCreationData?.dbConfig?.db_name) {
          const newDb = configs.find(
            (db) => db.db_name === databaseCreationData.dbConfig.db_name
          );
          if (newDb) {
            newDbId = newDb.db_id;
          }
        }

        if (newDbId) {
          setSelectedDbId(newDbId);
        }
      }

      // Move to vector config step
      setCurrentStep("vector-config");
      setDatabaseCreationData(null);
    } else {
      setCurrentStep("database-config");
    }
    
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
      toast.error("Failed to create company");
    } finally {
      setCreatingCompany(false);
    }
  };

  const handleClose = () => {
    resetForm();
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
    createDatabaseConfig,
    setDatabaseCreationData,
    setCurrentTaskId,
    creatingCompany,
    handleSubmit,
    type,
    refreshUserConfigs: loadInitialData,
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] w-[95vw] p-0 bg-gray-900 border-gray-700 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <Building2 className="w-6 h-6 text-green-400 flex-shrink-0" />
            <div className="min-w-0">
              <DialogTitle className="text-xl font-semibold text-white truncate">
                Create {type === "parent" ? "Parent" : "Sub"} Company
              </DialogTitle>
              <DialogDescription className="text-gray-400 text-sm">
                Set up your company with database and vector configurations
              </DialogDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-gray-400 hover:text-white hover:bg-gray-800 flex-shrink-0"
          >
          
          </Button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-4 border-b border-gray-700 flex-shrink-0">
          <StepIndicator currentStep={currentStep} />
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-6 pb-8">
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
            {currentStep === "vector-config" && (
              <VectorConfigStep {...stepProps} />
            )}
            {currentStep === "final-creation" && (
              <FinalCreationStep 
                {...stepProps}
                address={address}
                contactEmail={contactEmail}
                selectedUserConfigId={selectedUserConfigId}
                userConfigs={userConfigs}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CompanyCreationModal;
