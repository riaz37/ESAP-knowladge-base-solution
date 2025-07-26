"use client";
import { useState } from "react";
import { FileUpload } from "./FileUpload";
import { FileQuery } from "./FileQuery";
import { AnimatedToggle } from "./AnimatedToggle";
import { useResolvedTheme } from "@/store/theme-store";

export interface FileSystemProps {}

export const FileSystem: React.FC<FileSystemProps> = () => {
  const [activeMode, setActiveMode] = useState<"upload" | "query">("upload");
  const theme = useResolvedTheme();

  return (
    <div className="w-full h-full flex flex-col gap-6">
      {/* Header with title left, toggle right */}
      <div className="flex flex-row items-center justify-between w-full mb-2 mt-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 text-left mb-1">
            File System
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-left max-w-xl">
            Upload files to your knowledge base or query from previously
            uploaded files
          </p>
        </div>
        <div className="flex-shrink-0">
          <AnimatedToggle
            activeMode={activeMode}
            onModeChange={setActiveMode}
          />
        </div>
      </div>

      {/* Content based on active mode, full width */}
      <div className="flex-1 w-full">
        {activeMode === "upload" ? (
          <FileUpload />
        ) : (
          <FileQuery />
        )}
      </div>
    </div>
  );
};
