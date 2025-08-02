import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading hierarchy..." }: LoadingStateProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900/20 to-gray-900 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
        <p className="text-green-400 text-lg">{message}</p>
      </div>
    </div>
  );
}