"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useQueryStore } from "@/store/query-store";
import {
  useAuthContext,
  useDatabaseContext,
  useBusinessRulesContext,
} from "@/components/providers";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  CheckCircle,
  File,
  Info,
  History,
  BarChart3,
  AlertCircle,
  X,
  Database,
} from "lucide-react";
import {
  FileUpload,
  FileResults,
  FileQueryForm,
  FileQueryStats,
  QueryHistoryPanel,
  TableSelector,
  AdvancedQueryParams,
} from "@/components/data-query";
import { fileService } from "@/lib/api/services/file-service";
import type {
  UploadedFile,
  FileQueryResult,
  QueryOptions,
} from "@/components/data-query";

export default function FileQueryPage() {
  // Query state
  const [query, setQuery] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [queryResults, setQueryResults] = useState<FileQueryResult[]>([]);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [executionTime, setExecutionTime] = useState<number>(0);

  // File upload state
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  // Table selection state
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [useTable, setUseTable] = useState(true); // Track table usage from FileUpload

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Store and context
  const { fileQueryHistory, loadQueryHistory, saveQuery } = useQueryStore();

  const { user, isLoading: userLoading, isAuthenticated } = useAuthContext();
  const { currentDatabaseId, currentDatabaseName } = useDatabaseContext();
  const { businessRules, validateQuery } = useBusinessRulesContext();

  // Load query history on mount
  useEffect(() => {
    if (isAuthenticated && user?.user_id) {
      loadQueryHistory(user.user_id, "file");
    }
  }, [isAuthenticated, user?.user_id, loadQueryHistory]);

  // Handle file upload status changes
  const handleUploadStatusChange = useCallback((files: UploadedFile[]) => {
    setUploadedFiles(files);
  }, []);

  // Handle files uploaded (get file IDs for querying)
  const handleFilesUploaded = useCallback((fileIds: string[]) => {
    console.log("Files uploaded with IDs:", fileIds);
    // These IDs can be used when querying specific files
  }, []);

  // Handle table usage change from FileUpload
  const handleTableUsageChange = useCallback((useTable: boolean) => {
    console.log('FileQueryPage: handleTableUsageChange called with:', useTable);
    setUseTable(useTable);
    // Clear selected table if tables are disabled
    if (!useTable) {
      setSelectedTable(null);
      toast.info("Table selection cleared - tables are disabled");
    }
  }, []);

  // Execute file query
  const handleQuerySubmit = useCallback(
    async (queryText: string, options: QueryOptions) => {
      if (!queryText.trim()) {
        toast.error("Please enter a query");
        return;
      }

      if (!isAuthenticated) {
        toast.error("Please log in to execute queries");
        return;
      }

      // Validate query against business rules if database is selected
      if (currentDatabaseId) {
        const validationResult = validateQuery(queryText, currentDatabaseId);
        if (!validationResult.isValid) {
          toast.error(
            `Query validation failed: ${validationResult.errors.join(", ")}`
          );
          return;
        }
      }

      setIsExecuting(true);
      setQueryError(null);
      setQueryResults([]);
      setExecutionTime(0);
      setQuery(queryText);

      const startTime = Date.now();

      try {
        // Get file IDs from completed uploads
        const completedFileIds = uploadedFiles
          .filter((file) => file.status === "completed")
          .map((file) => file.id);

        // Execute file search
        const response = await fileService.searchFiles({
          query: queryText,
          user_id: user?.user_id,
          use_intent_reranker: options.useIntentReranker,
          use_chunk_reranker: options.useChunkReranker,
          use_dual_embeddings: options.useDualEmbeddings,
          intent_top_k: options.intentTopK,
          chunk_top_k: options.chunkTopK,
          max_chunks_for_answer: options.maxChunksForAnswer,
          answer_style: options.answerStyle,
          table_specific: !!selectedTable, // Make query table-specific if table is selected
          tables: selectedTable ? [selectedTable] : undefined, // Include selected table
          file_ids: completedFileIds.length > 0 ? completedFileIds : undefined,
        });

        if (response.success && response.data) {
          const searchResponse = response.data;
          console.log("File search response:", searchResponse);

          // Extract results from the answer sources or create structured result
          let results: FileQueryResult[] = [];
          if (
            searchResponse.answer &&
            searchResponse.answer.sources &&
            Array.isArray(searchResponse.answer.sources)
          ) {
            results = searchResponse.answer.sources.map((source, index) => ({
              id: `result-${index}`,
              answer: source.content || source.text || null, // Don't fallback to JSON.stringify
              confidence: searchResponse.answer.confidence,
              sources_used: searchResponse.answer.sources_used,
              query: searchResponse.query,
              ...source,
            }));
          } else if (searchResponse.answer) {
            // If no sources, create a result from the answer
            results = [
              {
                id: "result-0",
                answer: searchResponse.answer.answer,
                confidence: searchResponse.answer.confidence,
                sources_used: searchResponse.answer.sources_used,
                query: searchResponse.query,
              },
            ];
          }

          setQueryResults(results);
          setExecutionTime(Date.now() - startTime);

          // Save to history
          if (user?.user_id) {
            saveQuery({
              id: Math.random().toString(36).substr(2, 9),
              type: "file",
              query: queryText,
              userId: user.user_id,
              timestamp: new Date(),
              results: results,
              metadata: {
                resultCount: results.length,
                executionTime: Date.now() - startTime,
                fileIds: completedFileIds,
              },
            });
          }

          toast.success(
            `Query executed successfully! Found ${results.length} results.`
          );
        } else {
          throw new Error(response.error || "Query execution failed");
        }
      } catch (error) {
        console.error("File query execution error:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred";
        setQueryError(errorMessage);
        toast.error(`Query failed: ${errorMessage}`);
      } finally {
        setIsExecuting(false);
      }
    },
    [
      isAuthenticated,
      user?.user_id,
      currentDatabaseId,
      validateQuery,
      uploadedFiles,
      saveQuery,
      selectedTable,
    ]
  );

  // Handle query save
  const handleQuerySave = useCallback(
    (queryText: string) => {
      if (!queryText.trim() || !user?.user_id) {
        toast.error("Cannot save empty query or user not authenticated");
        return;
      }

      try {
        saveQuery({
          id: Date.now().toString(),
          type: "file",
          query: queryText.trim(),
          userId: user.user_id,
          timestamp: new Date(),
        });
        toast.success("Query saved successfully!");
      } catch (error) {
        console.error("Failed to save query:", error);
        toast.error("Failed to save query");
      }
    },
    [user?.user_id, saveQuery]
  );

  // Handle query clear
  const handleQueryClear = useCallback(() => {
    setQuery("");
    setQueryResults([]);
    setQueryError(null);
    setExecutionTime(0);
    setSelectedTable(null); // Also clear selected table
  }, []);

  // Handle loading query from history
  const handleHistorySelect = useCallback((historyItem: any) => {
    setQuery(historyItem.query);
    setQueryResults(historyItem.results || []);
    setExecutionTime(historyItem.metadata?.executionTime || 0);
    // Note: Table selection would need to be stored in history metadata to restore it
    toast.success("Query loaded from history");
  }, []);

  // Loading state
  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  // Authentication required
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
              <AlertCircle className="w-5 h-5" />
              Authentication Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Please log in to use the file query feature.
            </p>
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/auth")}
              className="w-full"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            File Query
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Upload files and query them using natural language
          </p>
        </div>

        {/* Status Badges */}
        <div className="flex items-center gap-3">
          {user?.user_id && (
            <Badge variant="outline" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              User: {user.user_id}
            </Badge>
          )}
          {currentDatabaseId && (
            <Badge variant="outline" className="flex items-center gap-2">
              <File className="w-4 h-4 text-blue-600" />
              DB: {currentDatabaseName || currentDatabaseId}
            </Badge>
          )}
          {businessRules.status === "loaded" && (
            <Badge variant="outline" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Rules Active
            </Badge>
          )}
        </div>
      </div>

      <Separator />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - File Upload and Query */}
        <div className="lg:col-span-2 space-y-6">
          {/* File Upload */}
          <FileUpload
            onFilesUploaded={handleFilesUploaded}
            onUploadStatusChange={handleUploadStatusChange}
            onTableUsageChange={handleTableUsageChange}
            disabled={!isAuthenticated}
          />

          {/* Query Form */}
          <FileQueryForm
            onSubmit={handleQuerySubmit}
            onSave={handleQuerySave}
            onClear={handleQueryClear}
            isLoading={isExecuting}
            disabled={!isAuthenticated}
          />

          {/* Query Results */}
          {queryResults.length > 0 && (
            <FileResults
              results={queryResults}
              query={query}
              isLoading={isExecuting}
            />
          )}

          {/* Query Error */}
          {queryError && (
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  Query Error
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-800 dark:text-red-200">{queryError}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Stats, History, and Info */}
        <div className="space-y-6">
          {/* Table Usage Status */}
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                <Database className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Table Usage: {useTable ? "Enabled" : "Disabled"}
                </span>
                <Badge variant="outline" className="ml-auto text-xs">
                  {useTable ? "With Tables" : "No Tables"}
                </Badge>
              </div>
              <p className="text-blue-700 dark:text-blue-300 text-xs mt-1">
                {useTable
                  ? "Files will be processed with table names for structured queries"
                  : "Files will be processed without table names for general content search"}
              </p>
            </CardContent>
          </Card>

          {/* Table Selector - for specifying which table to query */}
          {useTable && (
            <TableSelector
              databaseId={currentDatabaseId}
              onTableSelect={(tableName) => {
                setSelectedTable(tableName);
                toast.success(`Selected table: ${tableName}`);
              }}
            />
          )}

          {/* Selected Table Indicator */}
          {useTable && selectedTable && (
            <Card className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Querying table: {selectedTable}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTable(null)}
                    className="h-6 w-6 p-0 ml-auto"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Advanced Query Parameters */}
          <AdvancedQueryParams />

          {/* Query Statistics */}
          {query && (
            <FileQueryStats
              query={query}
              resultCount={queryResults.length}
              executionTime={executionTime}
              uploadedFilesCount={uploadedFiles.length}
              completedFilesCount={
                uploadedFiles.filter((f) => f.status === "completed").length
              }
              failedFilesCount={
                uploadedFiles.filter((f) => f.status === "failed").length
              }
            />
          )}

          {/* Query History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Query History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <QueryHistoryPanel
                history={fileQueryHistory}
                onSelect={handleHistorySelect}
                onClear={() => {
                  /* Implement clear history */
                }}
                type="file"
              />
            </CardContent>
          </Card>

          {/* Help Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                How to Use
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                  1. Upload Files
                </h4>
                <p>
                  Upload your documents (PDF, Word, Excel, etc.) to query their
                  content.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                  2. Select Table {useTable ? "(Optional)" : "(Disabled)"}
                </h4>
                <p>
                  {useTable
                    ? "Choose a specific table to focus your query on, or leave unselected to search across all tables."
                    : "Table selection is currently disabled. Files will be processed without table names."}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                  3. Ask Questions
                </h4>
                <p>
                  Use natural language to ask questions about your uploaded
                  files and selected table.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                  4. Get Results
                </h4>
                <p>
                  Receive detailed answers with source references from your
                  documents and table data.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
