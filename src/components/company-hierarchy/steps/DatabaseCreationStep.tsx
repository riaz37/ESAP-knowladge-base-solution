"use client";

import { TaskProgress } from "@/components/ui/task-progress";

interface DatabaseCreationStepProps {
  currentTaskId: string | null;
  onTaskComplete: (success: boolean, result?: any) => void;
}

export function DatabaseCreationStep({
  currentTaskId,
  onTaskComplete,
}: DatabaseCreationStepProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-green-400">Creating Database</h3>
      <TaskProgress
        taskId={currentTaskId}
        onTaskComplete={onTaskComplete}
        title="Database Configuration"
        description="Setting up your database configuration and processing any uploaded files..."
        showCancelButton={false}
      />
    </div>
  );
}