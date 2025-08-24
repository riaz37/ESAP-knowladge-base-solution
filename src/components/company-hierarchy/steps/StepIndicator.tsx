"use client";

import { Building2, Database, Brain, CheckCircle } from "lucide-react";
import { WorkflowStep } from "../types";

interface StepIndicatorProps {
  currentStep: WorkflowStep;
}

const steps = [
  {
    id: "company-info" as WorkflowStep,
    title: "Company Info",
    icon: Building2,
    description: "Basic company details",
  },
  {
    id: "database-config" as WorkflowStep,
    title: "Database",
    icon: Database,
    description: "Database configuration",
  },
  {
    id: "vector-config" as WorkflowStep,
    title: "Vector Config",
    icon: Brain,
    description: "AI/Vector database setup",
  },
  {
    id: "final-creation" as WorkflowStep,
    title: "Create",
    icon: CheckCircle,
    description: "Final review & creation",
  },
];

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const getCurrentStepIndex = () => {
    return steps.findIndex((step) => step.id === currentStep);
  };

  const currentIndex = getCurrentStepIndex();

  return (
    <div className="w-full">
      <div className="flex items-center justify-between w-full gap-2">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isUpcoming = index > currentIndex;

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center w-full">
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isCompleted
                      ? "bg-green-500 border-green-500 text-white"
                      : isCurrent
                      ? "bg-green-500/20 border-green-500 text-green-400"
                      : "bg-gray-800 border-gray-600 text-gray-400"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </div>
                <div className="mt-2 text-center w-full">
                  <div
                    className={`text-xs font-medium transition-colors duration-300 ${
                      isCompleted
                        ? "text-green-400"
                        : isCurrent
                        ? "text-green-400"
                        : "text-gray-400"
                    }`}
                  >
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 px-1">
                    {step.description}
                  </div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 transition-all duration-300 ${
                    isCompleted ? "bg-green-500" : "bg-gray-600"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
