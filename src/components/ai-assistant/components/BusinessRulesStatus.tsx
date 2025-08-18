"use client";

import { Loader2, Shield } from "lucide-react";
import type { BusinessRulesState } from "../types";

interface BusinessRulesStatusProps {
  businessRules: BusinessRulesState;
}

export function BusinessRulesStatus({ businessRules }: BusinessRulesStatusProps) {
  if (businessRules.status === "loading") {
    return (
      <div className="flex items-center gap-2 p-2 bg-gray-800/50 rounded-lg">
        <Loader2 className="w-3 h-3 animate-spin text-green-400" />
        <span className="text-xs text-gray-300">Loading business rules...</span>
      </div>
    );
  }

  if (businessRules.status === "loaded") {
    return (
      <div className="flex items-center gap-2">
        <Shield className="w-4 h-4 text-green-400" />
        <span className="text-sm text-green-400">Business Rules Active</span>
      </div>
    );
  }

  if (businessRules.status === "none") {
    return (
      <div className="p-2 bg-yellow-900/20 border border-yellow-500/20 rounded-lg">
        <p className="text-yellow-400 text-xs">
          No business rules configured for this database.
        </p>
        <p className="text-yellow-300 text-xs mt-1">
          Configure business rules in the Business Rules section to add security and compliance checks.
        </p>
      </div>
    );
  }

  if (businessRules.status === "error") {
    return (
      <div className="p-2 bg-red-900/20 border border-red-500/20 rounded-lg">
        <p className="text-red-400 text-xs">
          {businessRules.error || "Failed to load business rules"}
        </p>
        <p className="text-red-400 text-xs mt-1">
          This may be due to missing database configuration.
        </p>
      </div>
    );
  }

  return null;
}

export type { BusinessRulesState }; 