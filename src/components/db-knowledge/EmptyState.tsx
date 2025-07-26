"use client";
import { Database } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function EmptyState() {
  return (
    <div>
      <Card className="mt-6 border-dashed relative overflow-hidden backdrop-blur-xl bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10 shadow-2xl">
        {/* Glass effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/5 to-transparent dark:from-white/10 dark:via-white/5 dark:to-transparent" />
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 opacity-50" />
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg blur-lg opacity-30" />

        <CardContent className="relative flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-sm flex items-center justify-center mb-4 shadow-lg border border-white/20 hover:scale-105 transition-transform duration-200">
            <Database className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-foreground">
            No Results Found
          </h3>
          <p className="text-muted-foreground text-center max-w-md">
            Your query didn't return any data. Try adjusting your search
            terms or check the database connection.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}