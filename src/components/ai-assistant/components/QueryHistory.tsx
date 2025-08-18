"use client";

import { Database, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { QueryHistoryProps, QueryHistoryItem } from "../types";

export function QueryHistory({ 
  history, 
  onSelect, 
  onClear 
}: QueryHistoryProps) {
  if (history.length === 0) return null;

  return (
    <div className="border-t border-green-500/20">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-white text-sm font-medium">
            Recent Queries
          </h4>
          <Button
            onClick={onClear}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white text-xs"
          >
            Clear
          </Button>
        </div>
        <div className="space-y-2">
          {history.map((item, index) => (
            <div
              key={index}
              className="p-2 bg-gray-800/30 rounded-lg border border-gray-700/50 cursor-pointer hover:bg-gray-800/50 transition-colors"
              onClick={() => onSelect(item)}
            >
              <div className="flex items-center justify-between">
                <div className="text-gray-300 text-xs truncate flex-1">
                  {item.query}
                </div>
                <Badge 
                  variant="outline" 
                  className="text-xs ml-2"
                  style={{
                    backgroundColor: item.type === 'database' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                    borderColor: item.type === 'database' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(34, 197, 94, 0.3)',
                    color: item.type === 'database' ? '#60A5FA' : '#4ADE80',
                  }}
                >
                  {item.type === 'database' ? <Database className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                  <span className="ml-1">{item.type}</span>
                </Badge>
              </div>
              <div className="text-gray-500 text-xs mt-1">
                {item.timestamp.toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 