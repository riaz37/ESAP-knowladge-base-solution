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
    <div className="relative overflow-hidden" 
         style={{
           background: theme === 'light' 
             ? 'linear-gradient(135deg, #ffffff 0%, #f0f9f5 50%, #e6f7ff 100%)'
             : undefined
         }}>
      
      {/* Enhanced background for light mode */}
      {theme === 'light' && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/40 via-transparent to-blue-50/30" />
          <div className="absolute inset-0 bg-gradient-to-tl from-green-50/30 via-transparent to-emerald-50/40" />
          
          {/* Subtle floating elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-emerald-400/15 rounded-full animate-pulse"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                  animation: `float ${6 + Math.random() * 4}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 3}s`,
                  boxShadow: '0 0 6px rgba(16, 185, 129, 0.2)',
                }}
              />
            ))}
          </div>
        </>
      )}
      
      <div className="relative">
        <Card className={`border-0 shadow-none ${
          theme === 'light' ? 'bg-white/60 backdrop-blur-sm' : 'bg-transparent'
        }`}>
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
