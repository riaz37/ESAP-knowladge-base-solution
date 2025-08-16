"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { MSSQLConfigData } from "@/types/api";
import { WorkflowStep } from "../types";

interface FinalCreationStepProps {
  companyName: string;
  description: string;
  selectedDbId: number | null;
  databases: MSSQLConfigData[];
  creatingCompany: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  setCurrentStep: (step: WorkflowStep) => void;
  type: "parent" | "sub";
}

export function FinalCreationStep({
  companyName,
  description,
  selectedDbId,
  databases,
  creatingCompany,
  handleSubmit,
  setCurrentStep,
  type,
}: FinalCreationStepProps) {
  const selectedDatabase = databases?.find((db) => db.db_id === selectedDbId);

  const handlePrevious = () => {
    setCurrentStep("database-config");
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
          className="border-gray-600 text-gray-300 hover:bg-gray-700 cursor-pointer transition-colors"
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
          className="border-gray-600 text-gray-300 hover:bg-gray-700 cursor-pointer transition-colors"
        >
          Back
        </Button>
        <Button
          type="submit"
          disabled={creatingCompany}
          className="bg-green-600 hover:bg-green-700 text-white cursor-pointer transition-colors active:scale-95"
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
