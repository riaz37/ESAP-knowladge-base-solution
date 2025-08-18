"use client";

import { Button } from "@/components/ui/button";
import type { QuickSuggestionsProps } from "../types";

export function QuickSuggestions({ 
  suggestions, 
  onSelect, 
  disabled = false 
}: QuickSuggestionsProps) {
  return (
    <div className="lg:col-span-1 space-y-2">
      <p className="text-gray-400 text-xs">Quick suggestions:</p>
      <div className="flex flex-wrap gap-1">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onSelect(suggestion)}
            className="border-green-400/30 text-green-400 hover:bg-green-400/10 text-xs h-7 px-2"
            disabled={disabled}
          >
            {suggestion.length > 20
              ? `${suggestion.substring(0, 20)}...`
              : suggestion}
          </Button>
        ))}
      </div>
    </div>
  );
} 