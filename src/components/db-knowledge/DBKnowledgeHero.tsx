"use client";
import { Database } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import QueryInput from "@/components/query/QueryInput";

interface DBKnowledgeHeroProps {
  query: string;
  setQuery: (query: string) => void;
  handleQuerySubmit: () => Promise<void>;
  loading: boolean;
  theme: string;
  quickActions: any[];
}

export default function DBKnowledgeHero({
  query,
  setQuery,
  handleQuerySubmit,
  loading,
  theme,
  quickActions
}: DBKnowledgeHeroProps) {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5" />
      <div className="relative">
        <Card className="border-0 shadow-none bg-transparent">
          <CardContent className="pt-8 pb-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-primary/80 backdrop-blur-sm flex items-center justify-center shadow-2xl border border-white/20 relative overflow-hidden hover:scale-105 hover:rotate-1 transition-transform duration-200">
                {/* Glass shine effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent" />
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-secondary/50 rounded-2xl blur-lg opacity-50" />
                <Database className="w-8 h-8 text-primary-foreground relative z-10" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent mb-2">
                Database Knowledge Hub
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Query your database using natural language. Get instant
                insights, visualizations, and detailed analysis.
              </p>
            </div>

            <div className="relative">
              <QueryInput
                query={query}
                setQuery={setQuery}
                handleQuerySubmit={handleQuerySubmit}
                loading={loading}
                selected={"db"}
                quickActions={quickActions.map((action) => ({
                  ...action,
                  icon: action.icon.name || "📊", // Convert icon component to string for compatibility
                }))}
                theme={theme}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}