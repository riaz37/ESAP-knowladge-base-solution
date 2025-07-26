"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

export default function LoadingPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl overflow-hidden relative backdrop-blur-xl bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10 shadow-2xl">
        {/* Glass effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/5 to-transparent dark:from-white/10 dark:via-white/5 dark:to-transparent" />
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg blur-lg opacity-30" />
        
        <CardContent className="relative p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-lg">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
          
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Loading...
          </h2>
          
          <p className="text-muted-foreground mb-8">
            Please wait while we prepare your content
          </p>
          
          <div className="space-y-3 max-w-md mx-auto">
            <Skeleton className="h-4 w-full bg-white/10 dark:bg-black/10 backdrop-blur-sm" />
            <Skeleton className="h-4 w-3/4 bg-white/10 dark:bg-black/10 backdrop-blur-sm" />
            <Skeleton className="h-4 w-1/2 bg-white/10 dark:bg-black/10 backdrop-blur-sm" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}