"use client";

import { Building2, Database, Loader2, User, CheckCircle } from "lucide-react";
import { WorkflowStep } from "../CompanyCreationModal";

interface StepIndicatorProps {
  currentStep: WorkflowStep;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
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
        const isCompleted = steps.findIndex((s) => s.key === currentStep) > index;
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
                  isActive && step.key === "database-creation" ? "animate-spin" : ""
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
}