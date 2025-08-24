import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FileText, Play, Save, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface FileQueryFormProps {
  onSubmit: (query: string, options: QueryOptions) => Promise<void>;
  onSave?: (query: string) => void;
  onClear?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export interface QueryOptions {
  useIntentReranker: boolean;
  useChunkReranker: boolean;
  useDualEmbeddings: boolean;
  intentTopK: number;
  chunkTopK: number;
  maxChunksForAnswer: number;
  answerStyle: 'concise' | 'detailed';
  tableSpecific: boolean;
}

const defaultOptions: QueryOptions = {
  useIntentReranker: false,
  useChunkReranker: false,
  useDualEmbeddings: true,
  intentTopK: 20,
  chunkTopK: 40,
  maxChunksForAnswer: 40,
  answerStyle: 'detailed',
  tableSpecific: false,
};

const querySuggestions = [
  "What is the main topic of this document?",
  "Summarize the key points",
  "Extract all dates mentioned",
  "Find all monetary amounts",
  "What are the main conclusions?",
  "List all people mentioned",
  "What are the key recommendations?",
  "Extract contact information",
];

export function FileQueryForm({
  onSubmit,
  onSave,
  onClear,
  isLoading = false,
  disabled = false,
  className = ""
}: FileQueryFormProps) {
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<QueryOptions>(defaultOptions);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      toast.error('Please enter a query');
      return;
    }

    try {
      await onSubmit(query.trim(), options);
    } catch (error) {
      console.error('Query submission error:', error);
    }
  };

  const handleSave = () => {
    if (onSave && query.trim()) {
      onSave(query.trim());
    }
  };

  const handleClear = () => {
    setQuery('');
    if (onClear) {
      onClear();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          File Query
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Query Input */}
          <div className="space-y-2">
            <Label htmlFor="query-input">Enter your query in natural language</Label>
            <Textarea
              id="query-input"
              placeholder="Ask a question about your files..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={4}
              className="resize-none font-mono text-sm"
              disabled={disabled || isLoading}
            />
          </div>

          {/* Query Suggestions */}
          <div className="space-y-2">
            <Label className="text-sm text-gray-600 dark:text-gray-400">
              Quick suggestions:
            </Label>
            <div className="flex flex-wrap gap-2">
              {querySuggestions.map((suggestion, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  {suggestion}
                </Badge>
              ))}
            </div>
          </div>

          {/* Advanced Options Toggle */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="p-0 h-auto text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced Options
          </Button>

          {/* Advanced Options */}
          {showAdvanced && (
            <div className="grid grid-cols-2 gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Reranking</Label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={options.useIntentReranker}
                      onChange={(e) => setOptions(prev => ({ ...prev, useIntentReranker: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm">Use Intent Reranker</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={options.useChunkReranker}
                      onChange={(e) => setOptions(prev => ({ ...prev, useChunkReranker: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm">Use Chunk Reranker</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={options.useDualEmbeddings}
                      onChange={(e) => setOptions(prev => ({ ...prev, useDualEmbeddings: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm">Use Dual Embeddings</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Parameters</Label>
                <div className="space-y-2">
                  <div>
                    <Label className="text-xs">Intent Top K</Label>
                    <input
                      type="number"
                      value={options.intentTopK}
                      onChange={(e) => setOptions(prev => ({ ...prev, intentTopK: Number(e.target.value) }))}
                      className="w-full px-2 py-1 text-sm border rounded"
                      min="1"
                      max="100"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Chunk Top K</Label>
                    <input
                      type="number"
                      value={options.chunkTopK}
                      onChange={(e) => setOptions(prev => ({ ...prev, chunkTopK: Number(e.target.value) }))}
                      className="w-full px-2 py-1 text-sm border rounded"
                      min="1"
                      max="100"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Max Chunks</Label>
                    <input
                      type="number"
                      value={options.maxChunksForAnswer}
                      onChange={(e) => setOptions(prev => ({ ...prev, maxChunksForAnswer: Number(e.target.value) }))}
                      className="w-full px-2 py-1 text-sm border rounded"
                      min="1"
                      max="100"
                    />
                  </div>
                </div>
              </div>

              <div className="col-span-2 space-y-2">
                <Label className="text-sm font-medium">Answer Style</Label>
                <div className="flex gap-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="answerStyle"
                      value="concise"
                      checked={options.answerStyle === 'concise'}
                      onChange={(e) => setOptions(prev => ({ ...prev, answerStyle: e.target.value as 'concise' | 'detailed' }))}
                      className="rounded"
                    />
                    <span className="text-sm">Concise</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="answerStyle"
                      value="detailed"
                      checked={options.answerStyle === 'detailed'}
                      onChange={(e) => setOptions(prev => ({ ...prev, answerStyle: e.target.value as 'concise' | 'detailed' }))}
                      className="rounded"
                    />
                    <span className="text-sm">Detailed</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={disabled || isLoading || !query.trim()}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Execute Query
                </>
              )}
            </Button>
            
            {onSave && (
              <Button
                type="button"
                variant="outline"
                onClick={handleSave}
                disabled={!query.trim()}
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            )}
            
            <Button
              type="button"
              variant="outline"
              onClick={handleClear}
              disabled={!query.trim()}
            >
              Clear
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 