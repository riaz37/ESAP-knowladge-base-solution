"use client";

import React, { useCallback } from "react";
import { Alert } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { UserConfiguration } from "@/components/business-rules/UserConfiguration";
import AIConfigurationManager from "@/components/ai-config/AIConfigurationManager";
import BusinessRulesEditor from "@/components/business-rules/BusinessRulesEditor";
import { useBusinessRules } from "@/lib/hooks/use-business-rules";

export function BusinessRulesManager() {
  const { userId, setUserId, businessRulesError, fetchBusinessRules } =
    useBusinessRules();

  const handleRefresh = useCallback(
    (userId: string) => {
      if (userId.trim()) {
        fetchBusinessRules(userId);
      }
    },
    [fetchBusinessRules],
  );

  return (
    <div className="space-y-6 relative">
      {/* User Configuration */}
      <UserConfiguration
        onRefresh={handleRefresh}
        businessRulesLoading={false}
        userId={userId}
        setUserId={setUserId}
      />

      {/* AI Configuration */}
      <AIConfigurationManager userId={userId} />

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
