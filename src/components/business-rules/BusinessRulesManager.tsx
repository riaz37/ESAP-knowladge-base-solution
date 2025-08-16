"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import BusinessRulesEditor from "@/components/business-rules/BusinessRulesEditor";
import { useBusinessRules } from "@/lib/hooks/use-business-rules";

export function BusinessRulesManager() {
  const {
    businessRulesError,
    fetchBusinessRules,
    businessRulesText,
    businessRulesLoading,
  } = useBusinessRules();

  // Default user ID - you can replace this with actual user context later
  const [userId, setUserId] = useState<string>("default-user");

  const handleRefresh = useCallback(
    (userId: string) => {
      if (userId.trim()) {
        fetchBusinessRules(userId);
      }
    },
    [fetchBusinessRules]
  );

  // Load business rules when component mounts
  useEffect(() => {
    if (userId.trim()) {
      fetchBusinessRules(userId);
    }
  }, [userId, fetchBusinessRules]);

  return (
    <div className="space-y-6 relative">
      {/* Business Rules Editor */}
      <BusinessRulesEditor userId={userId} />

      {/* Status Alerts */}
      {businessRulesError && (
        <Alert className="border-red-400/30 bg-red-900/20">
          <AlertCircle className="h-4 w-4 text-red-400" />
          {businessRulesError}
        </Alert>
      )}
    </div>
  );
}
