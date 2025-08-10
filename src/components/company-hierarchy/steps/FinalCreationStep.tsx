"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { MSSQLConfigData, UserConfigData } from "@/types/api";
import { WorkflowStep } from "../CompanyCreationModal";

interface FinalCreationStepProps {
  companyName: string;
  description: string;
  selectedDbId: number | null;
  selectedUserConfigId: number | null;
  databases: MSSQLConfigData[];
  userConfigs: UserConfigData[];
  creatingCompany: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  setCurrentStep: (step: WorkflowStep) => void;
  type: "parent" | "sub";
}

export function FinalCreationStep({
  companyName,
  description,
  selectedDbId,
  selectedUserConfigId,
  databases,
  userConfigs,
  creatingCompany,
  handleSubmit,
  setCurrentStep,
  type,
}: FinalCreationStepProps) {
  const selectedDatabase = databases.find((db) => db.db_id === selectedDbId);
  const selectedUserConfig = userConfigs.find(
    (config) => config.config_id === selectedUserConfigId
  );

  const handlePrevious = () => {
    setCurrentStep("user-config");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-green-400">
          Ready to Create Company
        </h3>
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
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
            <span className="text-gray-400">Type:</span>
            <span className="text-white ml-2 capitalize">{type} Company</span>
          </div>
          <div>
            <span className="text-gray-400">Database:</span>
            <span className="text-white ml-2">
              {selectedDatabase?.db_name || "Not selected"}
            </span>
          </div>
          <div>
            <span className="text-gray-400">User Configuration:</span>
            <span className="text-white ml-2">
              {selectedUserConfig
                ? `${selectedUserConfig.user_id} (Level ${selectedUserConfig.access_level})`
                : "Not configured"}
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

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          disabled={creatingCompany}
          className="border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          Back
        </Button>
        <Button
          type="submit"
          disabled={creatingCompany}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {creatingCompany ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating {type === "parent" ? "Parent" : "Sub"} Company...
            </>
          ) : (
            `Create ${type === "parent" ? "Parent" : "Sub"} Company`
          )}
        </Button>
      </div>
    </form>
  );
}