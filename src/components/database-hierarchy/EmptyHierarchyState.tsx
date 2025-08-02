import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyHierarchyStateProps {
  onCreateFirst: () => void;
}

export function EmptyHierarchyState({ onCreateFirst }: EmptyHierarchyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
      {/* Large Plus Button */}
      <div className="relative group cursor-pointer" onClick={onCreateFirst}>
        {/* Multiple Glow Layers for Enhanced Effect */}
        <div className="absolute inset-0 w-32 h-32 rounded-full bg-green-400/20 blur-xl group-hover:bg-green-400/30 transition-all duration-300" />
        <div className="absolute inset-0 w-28 h-28 rounded-full bg-green-400/10 blur-lg group-hover:bg-green-400/20 transition-all duration-300" />
        
        {/* Main Circle */}
        <div className="relative w-24 h-24 rounded-full bg-gray-900/90 border-2 border-green-400 hover:bg-gray-800/95 hover:scale-110 transition-all duration-300 flex items-center justify-center group-hover:border-green-300 group-hover:shadow-lg group-hover:shadow-green-400/20">
          <Plus className="w-8 h-8 text-green-400 group-hover:text-green-300 transition-colors duration-300" />
        </div>

        {/* Pulse Animation */}
        <div className="absolute inset-0 w-24 h-24 rounded-full border-2 border-green-400/50 animate-ping" />
      </div>

      {/* Connection Line */}
      <div className="w-px h-12 bg-gradient-to-b from-green-400 via-green-400/60 to-transparent relative">
        <div className="absolute top-3 w-2 h-2 bg-green-400 rounded-full -translate-x-0.5 animate-pulse" />
        <div className="absolute bottom-3 w-1.5 h-1.5 bg-green-400/60 rounded-full -translate-x-0.5" />
      </div>

      {/* Text */}
      <div className="text-center space-y-3">
        <h3 className="text-2xl font-bold text-white">
          Start Building Your Hierarchy
        </h3>
        <p className="text-gray-400 max-w-lg text-lg leading-relaxed">
          Create your first parent company to begin organizing your database structure and manage your business hierarchy
        </p>
        <div className="pt-2">
          <p className="text-green-400/80 text-sm font-medium">
            Click the + button above to get started
          </p>
        </div>
      </div>
    </div>
  );
}