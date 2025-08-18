"use client";

import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { QueryStatusProps } from "../types";

export function QueryStatus({ loading, error }: QueryStatusProps) {
  if (loading) {
    return (
      <div className="px-4 pb-2">
        <Alert className="border-blue-400/30 bg-blue-900/20">
          <Loader2 className="h-3 w-3 animate-spin text-blue-400" />
          <AlertDescription className="text-blue-300 text-xs">
            Processing your query...
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 pb-2">
        <Alert className="border-red-400/30 bg-red-900/20">
          <AlertCircle className="h-3 w-3 text-red-400" />
          <AlertDescription className="text-red-300 text-xs">
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return null;
} 