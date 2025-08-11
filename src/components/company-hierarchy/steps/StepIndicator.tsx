"use client";

import { Building2, Database, Loader2, User, CheckCircle } from "lucide-react";
import { WorkflowStep } from "../CompanyCreationModal";

interface StepIndicatorProps {
  currentStep: WorkflowStep;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps = [
    { key: "company-info", label: "Company Info", shortLabel: "Info", icon: Building2 },
    { key: "database-config", label: "Database", shortLabel: "Database", icon: Database },
    { key: "database-creation", label: "Processing", shortLabel: "Processing", icon: Loader2 },
    { key: "user-config", label: "User Config", shortLabel: "Users", icon: User },
    { key: "final-creation", label: "Complete", shortLabel: "Complete", icon: CheckCircle },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="w-full overflow-hidden">
      {/* Compact View for all screen sizes */}
      <div className="flex items-center justify-center">
        {steps.map((step, index) => {
          const isActive = currentStep === step.key;
          const isCompleted = currentStepIndex > index;
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex items-center">
              <div
                className={`flex items-center gap-2 px-2 py-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-green-500/20 text-green-400 border border-green-400/30"
                    : isCompleted
                    ? "bg-green-500/10 text-green-300"
                    : "bg-gray-800/50 text-gray-500"
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isActive
                    ? "bg-green-500/30"
                    : isCompleted
                    ? "bg-green-500/20"
                    : "bg-gray-700/50"
                }`}>
                  <Icon
                    className={`w-3 h-3 ${
                      isActive && step.key === "database-creation" ? "animate-spin" : ""
                    }`}
                  />
                </div>
                <span className="text-xs font-medium hidden sm:inline">{step.shortLabel}</span>
              </div>
              {index < steps.length - 1 && (
                <div className="flex items-center mx-1">
                  <div
                    className={`w-6 h-0.5 transition-colors duration-200 ${
                      isCompleted ? "bg-green-400" : "bg-gray-600"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      
      {/* Progress info for mobile */}
      <div className="sm:hidden mt-3 text-center">
        <div className="text-xs text-gray-400 mb-2">
          Step {currentStepIndex + 1} of {steps.length}: {steps[currentStepIndex]?.label}
        </div>
        <div className="w-full bg-gray-700 rounded-full h-1">
          <div
            className="bg-green-400 h-1 rounded-full transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}