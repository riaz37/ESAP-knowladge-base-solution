"use client";

import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, CheckCircle, Database, Brain } from "lucide-react";
import { MSSQLConfigData, DatabaseConfigData } from "@/types/api";
import { WorkflowStep } from "../types";
import { Label } from "@/components/ui/label";

interface FinalCreationStepProps {
  companyName: string;
  description: string;
  address: string;
  contactEmail: string;
  selectedDbId: number | null;
  selectedUserConfigId: number | null;
  databases: MSSQLConfigData[];
  userConfigs: DatabaseConfigData[];
  creatingCompany: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  setCurrentStep: (step: WorkflowStep) => void;
  type: "parent" | "sub";
}

export function FinalCreationStep({
  companyName,
  description,
  address,
  contactEmail,
  selectedDbId,
  selectedUserConfigId,
  databases,
  userConfigs,
  creatingCompany,
  handleSubmit,
  setCurrentStep,
  type,
}: FinalCreationStepProps) {
  const selectedDatabase = databases.find(db => db.db_id === selectedDbId);
  const selectedUserConfig = userConfigs.find(config => config.db_id === selectedUserConfigId);

  const handlePrevious = () => {
    if (selectedUserConfigId) {
      setCurrentStep("vector-config");
    } else {
      setCurrentStep("database-config");
    }
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-green-400">Review & Create Company</h3>
          <p className="text-sm text-gray-400 mt-1">
            Review your configuration before creating the company
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Information */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-green-400 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Company Information
          </h4>
          <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
            <div>
              <Label className="text-xs text-gray-400 uppercase tracking-wide">Company Name</Label>
              <p className="text-white font-medium">{companyName}</p>
            </div>
            {description && (
              <div>
                <Label className="text-xs text-gray-400 uppercase tracking-wide">Description</Label>
                <p className="text-gray-300">{description}</p>
              </div>
            )}
            {address && (
              <div>
                <Label className="text-xs text-gray-400 uppercase tracking-wide">Address</Label>
                <p className="text-gray-300">{address}</p>
              </div>
            )}
            {contactEmail && (
              <div>
                <Label className="text-xs text-gray-400 uppercase tracking-wide">Contact Email</Label>
                <p className="text-gray-300">{contactEmail}</p>
              </div>
            )}
          </div>
        </div>

        {/* Configuration Summary */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-green-400 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Configuration Summary
          </h4>
          
          {/* Database Configuration */}
          <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-green-400">Database Configuration</span>
            </div>
            {selectedDatabase ? (
              <div className="space-y-2">
                <p className="text-white font-medium">{selectedDatabase.db_name}</p>
                <p className="text-sm text-gray-400">ID: {selectedDatabase.db_id}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No database selected</p>
            )}
          </div>

          {/* Vector Configuration */}
          <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-green-400">Vector Configuration</span>
            </div>
            {selectedUserConfig ? (
              <div className="space-y-2">
                <p className="text-white font-medium">{selectedUserConfig.db_config.DB_NAME || 'Unnamed'}</p>
                <p className="text-sm text-gray-400">Host: {selectedUserConfig.db_config.DB_HOST}:{selectedUserConfig.db_config.DB_PORT}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Optional - Not configured</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="space-y-6 pt-6 border-t border-gray-700">
        {/* Company Type Info */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">
              Creating {type === "parent" ? "Parent" : "Sub"} Company
            </span>
          </div>
          <p className="text-sm text-blue-300 mt-1">
            {type === "parent" 
              ? "This will create a new parent company with its own database configuration."
              : "This will create a sub-company under the selected parent company."
            }
          </p>
        </div>

        {/* Validation Message */}
        {!selectedDbId && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span className="text-sm font-medium text-red-400">
                Configuration Incomplete
              </span>
            </div>
            <p className="text-sm text-red-300 mt-1">
              Please complete the database configuration before creating the company.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between gap-3">
          <Button
            variant="outline"
            onClick={handlePrevious}
            className="border-gray-600 text-gray-300 hover:bg-gray-700 w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <Button
            onClick={handleSubmit}
            disabled={!selectedDbId || creatingCompany}
            className="bg-green-600 hover:bg-green-700 text-white min-w-[140px] w-full sm:w-auto"
          >
            {creatingCompany ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Create Company
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
