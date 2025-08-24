"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Play, Database, AlertCircle, Loader2, Sparkles } from "lucide-react";

interface DatabaseQueryFormProps {
  onSubmit: (query: string) => void;
  loading: boolean;
  hasDatabase: boolean;
}

export function DatabaseQueryForm({ onSubmit, loading, hasDatabase }: DatabaseQueryFormProps) {
  const [query, setQuery] = useState("");
  const [queryHistory, setQueryHistory] = useState<string[]>([
    "Show me all users from last month",
    "How many orders were placed today?",
    "What are the top 10 products by sales?",
    "Find customers who haven't ordered in 30 days",
    "Show me the revenue breakdown by month",
    "List all employees in the sales department",
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && hasDatabase) {
      onSubmit(query.trim());
    }
  };

  const handleQuerySelect = (selectedQuery: string) => {
    setQuery(selectedQuery);
  };

  const handleClear = () => {
    setQuery("");
  };

  return (
    <Card className="bg-gray-900/50 border-blue-400/30">
      <CardHeader>
        <CardTitle className="text-blue-400 flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Natural Language Query
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask your question in natural language... (e.g., 'Show me all users from last month')"
              className="min-h-[120px] bg-gray-800/50 border-blue-400/30 text-white placeholder:text-gray-400 resize-none"
              disabled={!hasDatabase || loading}
            />
            {!hasDatabase && (
              <div className="flex items-center gap-2 text-yellow-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                Please select a database first
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                type="submit"
                disabled={!query.trim() || !hasDatabase || loading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                {loading ? "Processing..." : "Ask Question"}
              </Button>
              
              {query && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClear}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Clear
                </Button>
              )}
            </div>

            <div className="text-sm text-gray-400">
              {query.length} characters
            </div>
          </div>
        </form>

        {/* Quick Query Templates */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400 font-medium">Example Questions:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {queryHistory.map((template, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer border-blue-400/30 text-blue-400 hover:bg-blue-400/10 hover:border-blue-400/50"
                onClick={() => handleQuerySelect(template)}
              >
                {template.length > 40 ? template.substring(0, 40) + "..." : template}
              </Badge>
            ))}
          </div>
        </div>

        {/* Query Tips */}
        <div className="p-3 bg-blue-900/20 border border-blue-400/30 rounded-lg">
          <div className="text-sm text-blue-300">
            <strong>💡 Natural Language Tips:</strong>
            <ul className="mt-2 space-y-1 text-blue-200">
              <li>• Ask questions like you're talking to a person</li>
              <li>• Use time references: "last week", "this month", "yesterday"</li>
              <li>• Be specific: "top 10 products" instead of "some products"</li>
              <li>• Use business terms: "revenue", "orders", "customers", "employees"</li>
              <li>• The AI will apply business rules automatically</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 