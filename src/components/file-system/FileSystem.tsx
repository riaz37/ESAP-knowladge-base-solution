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
    <div className="w-full h-full flex flex-col gap-6 relative"
         style={{
           background: theme === 'light' 
             ? 'linear-gradient(135deg, #ffffff 0%, #f0f9f5 50%, #e6f7ff 100%)'
             : undefined
         }}>
      
      {/* Enhanced background for light mode */}
      {theme === 'light' && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/20 via-transparent to-blue-50/15 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-tl from-green-50/25 via-transparent to-emerald-50/20 pointer-events-none" />
          
          {/* Subtle floating elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-emerald-400/15 rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `float ${6 + Math.random() * 4}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 3}s`,
                  boxShadow: '0 0 6px rgba(16, 185, 129, 0.2)',
                }}
              />
            ))}
          </div>
        </>
      )}
      
      {/* Header with title left, toggle right */}
      <div className="flex flex-row items-center justify-between w-full mb-2 mt-2 relative z-10">
        <div>
          <h1 className={`text-3xl font-bold text-left mb-1 ${
            theme === 'light' ? 'text-gray-800' : 'text-gray-100'
          }`}>
            File System
          </h1>
          <p className={`text-left max-w-xl ${
            theme === 'light' ? 'text-gray-600' : 'text-gray-400'
          }`}>
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
      <div className="flex-1 w-full relative z-10">
        {activeMode === "upload" ? (
          <FileUpload />
        ) : (
          <FileQuery />
        )}
      </div>
    </div>
  );
};
