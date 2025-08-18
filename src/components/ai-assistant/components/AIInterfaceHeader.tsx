"use client";

import { Bot, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AIInterfaceHeaderProps {
  onClose: () => void;
}

export function AIInterfaceHeader({ onClose }: AIInterfaceHeaderProps) {
  return (
    <div className="p-4 border-b border-green-500/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
            <Bot className="w-4 h-4 text-green-400" />
          </div>
          <div>
            <h3 className="text-white font-medium">
              AI Assistant
            </h3>
            <p className="text-gray-400 text-xs">
              Query databases and files with natural language
            </p>
          </div>
        </div>
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-white hover:bg-gray-700/50"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
} 