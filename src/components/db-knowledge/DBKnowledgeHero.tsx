"use client";
import { Database } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import QueryInput from "./QueryInput";

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
  quickActions,
}: DBKnowledgeHeroProps) {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5" />
      <div className="relative">
        <Card className="border-0 shadow-none bg-transparent">
          <CardContent className="pt-8 pb-6">
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
