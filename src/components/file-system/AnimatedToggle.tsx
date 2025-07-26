"use client";
import { useState } from "react";
import { useResolvedTheme } from "@/store/theme-store";

interface AnimatedToggleProps {
  activeMode: "upload" | "query";
  onModeChange: (mode: "upload" | "query") => void;
}

export const AnimatedToggle: React.FC<AnimatedToggleProps> = ({
  activeMode,
  onModeChange,
}) => {
  const theme = useResolvedTheme();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleModeChange = (mode: "upload" | "query") => {
    if (mode === activeMode || isAnimating) return;

    setIsAnimating(true);
    setTimeout(() => {
      onModeChange(mode);
      setIsAnimating(false);
    }, 150);
  };

  return (
    <div className="relative">
      {/* Background container */}
      <div
        className={`relative flex items-center rounded-full p-1 transition-all duration-300 ${
          theme === "dark"
            ? "bg-gray-800/50 border border-gray-700/50"
            : "bg-gray-100/80 border border-gray-200/80"
        }`}
        style={{
          width: "320px",
          height: "56px",
        }}
      >
        {/* Animated background slider */}
        <div
          className={`absolute top-1 bottom-1 rounded-full transition-all duration-300 ease-out ${
            theme === "dark"
              ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30"
              : "bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200"
          }`}
          style={{
            width: "156px",
            left: activeMode === "upload" ? "4px" : "160px",
            boxShadow:
              theme === "dark"
                ? "0 4px 12px rgba(0, 255, 0, 0.1)"
                : "0 2px 8px rgba(0, 0, 0, 0.1)",
          }}
        />

        {/* Upload button */}
        <button
          onClick={() => handleModeChange("upload")}
          disabled={isAnimating}
          className={`relative z-10 flex items-center justify-center gap-2 rounded-full transition-all duration-300 ${
            activeMode === "upload"
              ? theme === "dark"
                ? "text-green-400 font-medium"
                : "text-green-700 font-medium"
              : theme === "dark"
              ? "text-gray-400 hover:text-gray-300"
              : "text-gray-600 hover:text-gray-700"
          }`}
          style={{
            width: "156px",
            height: "48px",
          }}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <span className="text-sm font-medium">Upload Files</span>
        </button>

        {/* Query button */}
        <button
          onClick={() => handleModeChange("query")}
          disabled={isAnimating}
          className={`relative z-10 flex items-center justify-center gap-2 rounded-full transition-all duration-300 ${
            activeMode === "query"
              ? theme === "dark"
                ? "text-green-400 font-medium"
                : "text-green-700 font-medium"
              : theme === "dark"
              ? "text-gray-400 hover:text-gray-300"
              : "text-gray-600 hover:text-gray-700"
          }`}
          style={{
            width: "156px",
            height: "48px",
          }}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <span className="text-sm font-medium">Query Files</span>
        </button>
      </div>
    </div>
  );
};
