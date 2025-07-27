"use client";
import { XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorStateProps {
  error: string;
}

export default function ErrorState({ error }: ErrorStateProps) {
  return (
    <div>
      <Card className="mt-6 border-destructive/50 bg-destructive/5 relative overflow-hidden backdrop-blur-xl">
        {/* Glass effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent dark:from-red-500/5 dark:via-red-500/2 dark:to-transparent" />
        {/* Error glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-destructive/30 to-destructive/20 rounded-lg blur-lg opacity-40" />

        <CardContent className="relative flex items-center gap-3 pt-6">
          <div className="animate-pulse">
            <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
          </div>
          <div>
            <p className="text-destructive font-medium">Query Error</p>
            <p className="text-destructive/80 text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
