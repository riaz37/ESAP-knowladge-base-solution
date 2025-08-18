"use client";

import { User, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BusinessRulesStatus } from "./BusinessRulesStatus";
import type { UserConfigurationStatusProps } from "../types";

export function UserConfigurationStatus({ 
  userId, 
  databaseId, 
  databaseName, 
  businessRules 
}: UserConfigurationStatusProps) {
  if (!userId || !userId.trim()) {
    return (
      <div className="p-4 border-b border-green-500/20">
        <div className="p-3 bg-blue-900/20 border border-blue-500/20 rounded-lg">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-400">User Setup Required</span>
          </div>
          <p className="text-xs text-blue-300 mt-1">
            Please visit the User Configuration page to set up your user ID and database connection
          </p>
          <Button
            size="sm"
            variant="outline"
            className="mt-2 text-xs"
            onClick={() => window.location.href = '/user-configuration'}
          >
            Go to User Configuration
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-b border-green-500/20">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-green-400" />
          <span className="text-sm text-green-400">User: {userId}</span>
        </div>
        {databaseId && databaseName && (
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-400">Database: {databaseName}</span>
          </div>
        )}
        <BusinessRulesStatus businessRules={businessRules} />
      </div>
    </div>
  );
} 