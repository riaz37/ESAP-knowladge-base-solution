import React from "react";
import { HierarchyBackground } from "./HierarchyBackground";

interface HierarchyContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function HierarchyContainer({ children, className = "" }: HierarchyContainerProps) {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-900 via-green-900/20 to-gray-900 relative overflow-hidden ${className}`}>
      <HierarchyBackground />
      
      {/* Main Content */}
      <div className="relative z-10 pt-[140px] px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}