"use client";

import { Database, FileText } from "lucide-react";
import { TabsContent } from "@/components/ui/tabs";
import { QueryInput } from "./QueryInput";
import { QuickSuggestions } from "./QuickSuggestions";
import type { QueryTabProps, DatabaseQueryTabProps } from "../types";

export function DatabaseQueryTab({ 
  query, 
  setQuery, 
  onSubmit, 
  loading, 
  suggestions 
}: DatabaseQueryTabProps) {
  return (
    <TabsContent value="database" className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          <QueryInput
            query={query}
            setQuery={setQuery}
            onSubmit={onSubmit}
            placeholder="Ask about your database... (Press Enter to submit, Shift+Enter for new line)"
            loading={loading}
          />
        </div>
        <QuickSuggestions
          suggestions={suggestions}
          onSelect={setQuery}
          disabled={loading}
        />
      </div>
    </TabsContent>
  );
}

export function FileQueryTab({ 
  query, 
  setQuery, 
  onSubmit, 
  suggestions 
}: QueryTabProps) {
  return (
    <TabsContent value="file" className="space-y-4">
      <div className="p-3 bg-blue-900/20 border border-blue-500/20 rounded-lg mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-blue-400">Simplified File Query Interface</span>
        </div>
        <p className="text-xs text-blue-300 mt-1">
          This is a simplified interface for file queries. File selection and upload functionality has been removed.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          <QueryInput
            query={query}
            setQuery={setQuery}
            onSubmit={onSubmit}
            placeholder="Ask about your file... (Press Enter to submit, Shift+Enter for new line)"
          />
        </div>
        <QuickSuggestions
          suggestions={suggestions}
          onSelect={setQuery}
        />
      </div>
    </TabsContent>
  );
} 