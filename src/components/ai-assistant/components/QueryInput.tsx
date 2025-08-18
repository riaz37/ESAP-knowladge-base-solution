"use client";

import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { QueryInputProps } from "../types";

export function QueryInput({ 
  query, 
  setQuery, 
  onSubmit, 
  placeholder, 
  disabled = false,
  loading = false 
}: QueryInputProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="flex gap-2 items-start">
      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder={placeholder}
        className="flex-1 min-h-[120px] max-h-[300px] resize-y bg-gray-800/50 border border-green-400/30 text-white placeholder:text-gray-500 text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={disabled || loading}
        rows={5}
      />
      <Button
        onClick={onSubmit}
        disabled={disabled || loading || !query.trim()}
        size="sm"
        className="bg-green-600 hover:bg-green-700 text-white px-4 h-10 mt-1"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
} 