"use client";

import React, { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import BusinessRulesEditor from "@/components/business-rules/BusinessRulesEditor";
import { DatabaseSelector } from "@/components/business-rules/DatabaseSelector";
import { useBusinessRules } from "@/lib/hooks/use-business-rules";

export function BusinessRulesManager() {
  const [selectedDatabaseId, setSelectedDatabaseId] = useState<number | null>(null);
  const [selectedDatabaseName, setSelectedDatabaseName] = useState<string>("");

  const { businessRulesError } = useBusinessRules();

  const handleDatabaseSelect = (databaseId: number, databaseName: string) => {
    setSelectedDatabaseId(databaseId);
    setSelectedDatabaseName(databaseName);
  };

  return (
    <div className="space-y-6 relative">
      <DatabaseSelector
        onDatabaseSelect={handleDatabaseSelect}
        selectedDatabaseId={selectedDatabaseId}
      />

      <BusinessRulesEditor
        databaseId={selectedDatabaseId}
        databaseName={selectedDatabaseName}
      />

      {businessRulesError && (
        <Alert className="border-red-400/30 bg-red-900/20">
          <AlertCircle className="h-4 w-4 text-red-400" />
          {businessRulesError}
        </Alert>
      )}
    </div>
  );
}
