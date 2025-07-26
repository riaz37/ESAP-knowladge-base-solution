"use client";
import { CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SingleRecordViewProps {
  data: Record<string, any>;
}

export default function SingleRecordView({ data }: SingleRecordViewProps) {
  return (
    <div>
      <Card className="mt-6 max-w-4xl overflow-hidden relative backdrop-blur-xl bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10 shadow-2xl">
        {/* Glass effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/5 to-transparent dark:from-white/10 dark:via-white/5 dark:to-transparent" />
        {/* Animated glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-secondary/20 to-primary/30 rounded-lg blur-lg opacity-40 animate-pulse" />

        <CardHeader className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 backdrop-blur-sm border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-sm text-primary shadow-lg border border-white/20 hover:scale-105 hover:rotate-1 transition-transform duration-200">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-xl text-foreground">
                Single Record Found
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Detailed information retrieved from database
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(data).map(([key, value]) => (
              <div
                key={key}
                className="group relative p-4 rounded-lg backdrop-blur-sm bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 hover:shadow-lg hover:shadow-primary/10 hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
              >
                {/* Subtle glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {/* Glass shine effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-50" />

                <div className="relative">
                  <Badge
                    variant="secondary"
                    className="mb-2 text-xs font-medium bg-white/20 dark:bg-black/20 backdrop-blur-sm border-white/20"
                  >
                    {key
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Badge>
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {String(value)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}