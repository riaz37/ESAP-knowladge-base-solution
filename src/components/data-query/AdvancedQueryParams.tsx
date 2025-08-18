import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { useState } from "react";

interface AdvancedQueryParamsProps {
  useIntentReranker: boolean;
  useChunkReranker: boolean;
  useDualEmbeddings: boolean;
  intentTopK: number;
  chunkTopK: number;
  chunkSource: string;
  maxChunksForAnswer: number;
  answerStyle: string;
  onIntentRerankerChange: (value: boolean) => void;
  onChunkRerankerChange: (value: boolean) => void;
  onDualEmbeddingsChange: (value: boolean) => void;
  onIntentTopKChange: (value: number) => void;
  onChunkTopKChange: (value: number) => void;
  onChunkSourceChange: (value: string) => void;
  onMaxChunksForAnswerChange: (value: number) => void;
  onAnswerStyleChange: (value: string) => void;
  onReset?: () => void;
  className?: string;
}

export function AdvancedQueryParams({
  useIntentReranker,
  useChunkReranker,
  useDualEmbeddings,
  intentTopK,
  chunkTopK,
  chunkSource,
  maxChunksForAnswer,
  answerStyle,
  onIntentRerankerChange,
  onChunkRerankerChange,
  onDualEmbeddingsChange,
  onIntentTopKChange,
  onChunkTopKChange,
  onChunkSourceChange,
  onMaxChunksForAnswerChange,
  onAnswerStyleChange,
  onReset,
  className = "",
}: AdvancedQueryParamsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Advanced Query Parameters
          </div>
          <div className="flex items-center gap-2">
            {onReset && (
              <Button
                variant="outline"
                size="sm"
                onClick={onReset}
                className="h-8 px-2"
                title="Reset to defaults"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Reranking Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="intent-reranker" className="text-sm font-medium">
                  Intent Reranker
                </Label>
                <Switch
                  id="intent-reranker"
                  checked={useIntentReranker}
                  onCheckedChange={onIntentRerankerChange}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Use intent-based reranking for better query understanding
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="chunk-reranker" className="text-sm font-medium">
                  Chunk Reranker
                </Label>
                <Switch
                  id="chunk-reranker"
                  checked={useChunkReranker}
                  onCheckedChange={onChunkRerankerChange}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Use chunk-based reranking for better content relevance
              </p>
            </div>
          </div>

          {/* Embeddings Settings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="dual-embeddings" className="text-sm font-medium">
                Dual Embeddings
              </Label>
              <Switch
                id="dual-embeddings"
                checked={useDualEmbeddings}
                onCheckedChange={onDualEmbeddingsChange}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Use dual embedding approach for enhanced semantic understanding
            </p>
          </div>

          {/* Top-K Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="intent-top-k" className="text-sm font-medium">
                Intent Top-K
              </Label>
              <Input
                id="intent-top-k"
                type="number"
                min="1"
                max="100"
                value={intentTopK}
                onChange={(e) => onIntentTopKChange(parseInt(e.target.value) || 20)}
                className="h-9"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Number of top intent results to consider
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="chunk-top-k" className="text-sm font-medium">
                Chunk Top-K
              </Label>
              <Input
                id="chunk-top-k"
                type="number"
                min="1"
                max="100"
                value={chunkTopK}
                onChange={(e) => onChunkTopKChange(parseInt(e.target.value) || 40)}
                className="h-9"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Number of top chunk results to consider
              </p>
            </div>
          </div>

          {/* Chunk Source and Max Chunks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="chunk-source" className="text-sm font-medium">
                Chunk Source
              </Label>
              <Select value={chunkSource} onValueChange={onChunkSourceChange}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select chunk source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reranked">Reranked</SelectItem>
                  <SelectItem value="original">Original</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Source of chunks for processing
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-chunks" className="text-sm font-medium">
                Max Chunks for Answer
              </Label>
              <Input
                id="max-chunks"
                type="number"
                min="1"
                max="100"
                value={maxChunksForAnswer}
                onChange={(e) => onMaxChunksForAnswerChange(parseInt(e.target.value) || 40)}
                className="h-9"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Maximum chunks to use for answer generation
              </p>
            </div>
          </div>

          {/* Answer Style */}
          <div className="space-y-2">
            <Label htmlFor="answer-style" className="text-sm font-medium">
              Answer Style
            </Label>
            <Select value={answerStyle} onValueChange={onAnswerStyleChange}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select answer style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="detailed">Detailed</SelectItem>
                <SelectItem value="concise">Concise</SelectItem>
                <SelectItem value="summary">Summary</SelectItem>
                <SelectItem value="bullet">Bullet Points</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Style of the generated answer
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
} 