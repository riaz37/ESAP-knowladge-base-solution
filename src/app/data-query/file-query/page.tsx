"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search,
  FileText,
  Upload,
  History,
  Download,
  Copy,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { EnhancedBackground } from "@/components/ui/enhanced-background";
import { useQueryStore } from "@/store/query-store";
import { toast } from "sonner";
import {
  QueryHistoryPanel,
  QueryInputForm,
  QueryTips,
} from "@/components/data-query";

export default function FileQueryPage() {
  const [query, setQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  
  const {
    executeFileQuery,
    fileQueryHistory,
    queryResults,
    queryLoading,
    queryError,
    loadQueryHistory,
  } = useQueryStore();

  // Mock user ID - will be replaced with real user context
  const userId = "user123";

  useEffect(() => {
    loadQueryHistory(userId, 'file');
  }, [userId, loadQueryHistory]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      toast.success(`File "${file.name}" selected for querying`);
    }
  };

  const handleQuerySubmit = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    if (!query.trim()) {
      toast.error("Please enter a query");
      return;
    }

    setIsExecuting(true);
    
    try {
      await executeFileQuery({
        fileId: selectedFile.name, // Using filename as ID for demo
        query: query.trim(),
        userId,
      });
      
      toast.success("Query executed successfully!");
      
    } catch (error) {
      toast.error("Query execution failed");
    } finally {
      setIsExecuting(false);
    }
  };

  const handleQueryClear = () => {
    setQuery("");
    setSelectedFile(null);
  };



  return (
    <EnhancedBackground intensity="medium" className="min-h-screen">
      <div className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            File Query Interface
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Query uploaded files and documents using natural language or structured queries
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Query Interface */}
          <div className="lg:col-span-2 space-y-6">
            {/* File Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  File Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        {selectedFile ? selectedFile.name : "Click to select a file"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Supports PDF, DOC, TXT, and other document formats
                      </p>
                    </div>
                  </Label>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.rtf,.odt"
                    onChange={handleFileUpload}
                  />
                </div>
                
                {selectedFile && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-green-800 dark:text-green-200">
                      File selected: {selectedFile.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Query Input Form */}
            <QueryInputForm
              title="Query Input"
              icon={<Search className="h-5 w-5" />}
              placeholder="e.g., Extract all text content from the document"
              value={query}
              onChange={setQuery}
              onSubmit={handleQuerySubmit}
              onClear={handleQueryClear}
              isLoading={isExecuting}
              isDisabled={!selectedFile}
              submitButtonText="Execute Query"
              clearButtonText="Clear"
            />

            {/* Query Results */}
            {queryResults && queryResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Query Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {queryResults.map((result, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          Result {index + 1}
                        </h3>
                        <p className="text-gray-800 dark:text-gray-200">{result.text}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          Confidence: {result.confidence.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Error Display */}
            {queryError && (
              <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                    <XCircle className="h-5 w-5" />
                    <span className="font-medium">Query Error:</span>
                    <span>{queryError}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Examples & History */}
          <div className="space-y-6">
            {/* Example Queries */}
            <QueryTips />
            {/* Query History */}
            <QueryHistoryPanel
              history={fileQueryHistory}
              queryType="file"
              maxItems={10}
            />
          </div>
        </div>
      </div>
    </EnhancedBackground>
  );
} 