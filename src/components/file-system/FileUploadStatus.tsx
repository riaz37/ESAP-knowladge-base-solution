import React from "react";

interface FileUploadStatusProps {
  status: "pending" | "running" | "completed" | null;
  bundleStatus: any;
  initialResponse: any;
  uploading: boolean;
  error: string | null;
  theme?: string;
}

const statusColor = (status: string, theme: string) => {
  if (status === "completed" || status === "COMPLETED")
    return theme === "dark"
      ? "bg-green-500 text-white"
      : "bg-green-600 text-white";
  if (status === "running" || status === "PROCESSING" || status === "RUNNING")
    return theme === "dark"
      ? "bg-yellow-400 text-black animate-pulse"
      : "bg-yellow-500 text-black animate-pulse";
  if (status === "pending" || status === "PENDING")
    return theme === "dark"
      ? "bg-gray-500 text-white"
      : "bg-gray-400 text-white";
  if (status === "error" || status === "failed" || status === "FAILED")
    return theme === "dark" ? "bg-red-500 text-white" : "bg-red-600 text-white";
  return "bg-gray-400 text-white";
};

const glassBg =
  "backdrop-blur-2xl bg-white/30 dark:bg-transparent border border-white/20 dark:border-[#013828]/40 shadow-lg";

export const FileUploadStatus: React.FC<FileUploadStatusProps> = ({
  status,
  bundleStatus,
  initialResponse,
  uploading,
  error,
  theme = "dark",
}) => {
  if (error) {
    return <div className="text-red-500 font-semibold mt-4">{error}</div>;
  }
  if (!uploading && !bundleStatus && !initialResponse) return null;

  // Progress bar with safety checks
  const progress = bundleStatus?.progress_percentage ?? 0;
  const bundleState =
    bundleStatus?.status || bundleStatus?.state || status || "pending";
  const totalFiles =
    bundleStatus?.total_files || initialResponse?.total_files || 0;
  const completedFiles = bundleStatus?.completed_files || 0;
  const failedFiles = bundleStatus?.failed_files || 0;
  const remainingFiles =
    bundleStatus?.remaining_files || totalFiles - completedFiles;

  // Safely handle tasks array
  let tasks = [];
  if (
    bundleStatus?.individual_tasks &&
    Array.isArray(bundleStatus.individual_tasks)
  ) {
    tasks = bundleStatus.individual_tasks;
  } else if (
    initialResponse?.task_ids &&
    Array.isArray(initialResponse.task_ids)
  ) {
    tasks = initialResponse.task_ids;
  }

  return (
    <div
      className={`rounded-2xl p-6 mt-6 w-full ${glassBg}`}
      style={{ minHeight: 120 }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-lg font-bold">Upload Status</div>
        <div
          className={`font-semibold uppercase px-3 py-1 rounded-lg ${statusColor(
            bundleState,
            theme
          )}`}
        >
          {bundleState}
        </div>
      </div>
      <div className="mb-2 text-sm">
        <span className="mr-4">
          Total files: <b>{totalFiles}</b>
        </span>
        <span className="mr-4">
          Completed: <b>{completedFiles}</b>
        </span>
        <span className="mr-4">
          Failed: <b>{failedFiles}</b>
        </span>
        <span>
          Remaining: <b>{remainingFiles}</b>
        </span>
      </div>
      <div className="w-full h-3 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
        <div
          className="h-3 bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="text-sm font-semibold mb-2">File Tasks</div>
      <div className="space-y-4">
        {tasks
          .filter((task) => task && typeof task === "object")
          .map((task: any, idx: number) => {
            let step = 1;
            let totalSteps = 1;
            let stepText = task?.progress || "";
            const match = /Step (\d+)[/|\\](\d+)/i.exec(stepText);
            if (match) {
              step = parseInt(match[1], 10);
              totalSteps = parseInt(match[2], 10);
            }
            const isPending = (task?.status || "").toLowerCase() === "pending";
            const isRunning =
              (task?.status || "").toLowerCase() === "running" ||
              (task?.status || "").toLowerCase() === "processing";
            const isCompleted =
              (task?.status || "").toLowerCase() === "completed";
            return (
              <div
                key={task?.task_id || idx}
                className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border border-white/20 dark:border-[#013828]/40 shadow-lg bg-white/40 dark:bg-[#232435]/60 backdrop-blur-xl transition-all duration-300 ${
                  isCompleted
                    ? "bg-green-100 dark:bg-green-900/40 border-green-400/40"
                    : ""
                }`}
                style={{ marginBottom: 18 }}
              >
                {/* Left: File name and status */}
                <div className="flex flex-row items-center gap-3 flex-1 min-w-0">
                  <span className="truncate font-semibold text-base text-gray-900 dark:text-white flex-1 min-w-0">
                    {task?.filename || "Unknown file"}
                  </span>
                  <span
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold ${statusColor(
                      task?.status || "unknown",
                      theme
                    )}`}
                    style={{ minWidth: 70, justifyContent: "center" }}
                  >
                    {isCompleted && (
                      <svg
                        className="w-4 h-4 mr-1 text-white inline-block"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                    {isPending && (
                      <span className="w-2 h-2 mr-1 bg-gray-400 rounded-full animate-pulse inline-block"></span>
                    )}
                    {isRunning && (
                      <span className="w-2 h-2 mr-1 bg-yellow-400 rounded-full animate-pulse inline-block"></span>
                    )}
                    {(task?.status || "UNKNOWN").toUpperCase()}
                  </span>
                </div>
                {/* Right: Step/progress bar and step text */}
                <div className="flex flex-col gap-1 md:w-1/2 w-full">
                  {(stepText || totalSteps > 1) && (
                    <div className="flex flex-col md:flex-row md:items-center gap-2 w-full">
                      {stepText && (
                        <span className="text-xs font-mono text-blue-600 dark:text-blue-300 animate-pulse font-semibold mb-1 md:mb-0">
                          {stepText}
                        </span>
                      )}
                      {totalSteps > 1 && (
                        <div className="flex items-center gap-2 w-full">
                          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
                            <div
                              className={`h-2 bg-gradient-to-r from-blue-400 to-green-400 transition-all duration-700 ${
                                isRunning ? "animate-pulse" : ""
                              }`}
                              style={{ width: `${(step / totalSteps) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-300 ml-2">
                            {step}/{totalSteps}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  {task?.error_message && (
                    <span className="text-xs text-red-400 mt-1">
                      {task.error_message}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
      </div>
      {status === "completed" && (
        <div className="mt-4 text-green-500 font-bold text-center">
          All files processed successfully!
        </div>
      )}
    </div>
  );
};
