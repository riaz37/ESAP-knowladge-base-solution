import React from "react";
import { Database, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DatabaseNodeProps {
  name: string;
  description: string;
  onAddClick?: () => void;
  showBadge?: boolean;
}

export function DatabaseNode({ 
  name, 
  description, 
  onAddClick,
  showBadge = true 
}: DatabaseNodeProps) {
  return (
    <div className="relative group">
      {/* Outer Glow Circle */}
      <div className="absolute inset-0 w-32 h-32 rounded-full bg-green-400/20 blur-xl" />

      {/* Main Circle */}
      <div className="relative w-24 h-24 rounded-full border-2 border-green-400 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        <div className="w-12 h-12 rounded-lg bg-green-400/20 flex items-center justify-center">
          <Database className="w-6 h-6 text-green-400" />
        </div>

        {/* Add Button */}
        <Button
          size="sm"
          onClick={onAddClick}
          className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-green-400 hover:bg-green-300 text-gray-900 rounded-full"
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>

      {/* Label */}
      <div className="mt-4 text-center max-w-xs">
        <h3 className="text-white font-semibold text-lg">{name}</h3>
        <p className="text-gray-400 text-sm mt-1">{description}</p>
        {showBadge && (
          <Badge variant="outline" className="mt-2 border-green-400/50 text-green-400">
            Database
          </Badge>
        )}
      </div>
    </div>
  );
}