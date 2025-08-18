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
  Plus,
  Trash2,
} from "lucide-react";

import { useQueryStore } from "@/store/query-store";
import { useFileOperations } from "@/lib/hooks/use-smart-file-upload";
import { useUserContext } from "@/lib/hooks/use-user-context";
import { toast } from "sonner";
import {
  QueryHistoryPanel,
  QueryInputForm,
  QueryTips,
  FileUploadProgress,
} from "@/components/data-query";
import { TableSelector } from "@/components/data-query/TableSelector";
import { AdvancedQueryParams } from "@/components/data-query/AdvancedQueryParams";

interface FileUploadData {
  file: File;
  description: string;
  tableName: string;
}

export default function FileQueryPage() {
  const [query, setQuery] = useState("");
  const [fileUploads, setFileUploads] = useState<FileUploadData[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [tableSpecific, setTableSpecific] = useState(false);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [useIntentReranker, setUseIntentReranker] = useState(false);
  const [useChunkReranker, setUseChunkReranker] = useState(false);
  const [useDualEmbeddings, setUseDualEmbeddings] = useState(true);
  const [intentTopK, setIntentTopK] = useState(20);
  const [chunkTopK, setChunkTopK] = useState(40);
  const [chunkSource, setChunkSource] = useState("reranked");
  const [maxChunksForAnswer, setMaxChunksForAnswer] = useState(40);
  const [answerStyle, setAnswerStyle] = useState("detailed");
  
  const {
    executeFileQuery,
    fileQueryHistory,
    queryResults,
    queryLoading,
    queryError,
    loadQueryHistory,
  } = useQueryStore();

  const {
    uploadResponse,
    bundleStatus,
    isLoading: isUploading,
    error: uploadError,
    isPolling,
    uploadProgress,
    uploadSmartFileSystem,
    getBundleTaskStatus,
    clearError: clearUploadError,
    reset: resetUpload,
  } = useFileOperations();

  // Get userId from user context
  const { userId } = useUserContext();

  useEffect(() => {
    loadQueryHistory(userId, 'file');
  }, [userId, loadQueryHistory]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Add new file with default values
      const newFileUpload: FileUploadData = {
        file,
        description: `Document: ${file.name}`,
        tableName: `table_${Date.now()}`,
      };
      setFileUploads(prev => [...prev, newFileUpload]);
      toast.success(`File "${file.name}" added for upload`);
    }
  };

  const removeFileUpload = (index: number) => {
    setFileUploads(prev => prev.filter((_, i) => i !== index));
  };

  const updateFileUpload = (index: number, field: keyof FileUploadData, value: string) => {
    setFileUploads(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const handleSmartUpload = async () => {
    if (fileUploads.length === 0) {
      toast.error("Please add at least one file");
      return;
    }

    // Validate all file uploads have required fields
    const invalidUploads = fileUploads.filter(
      upload => !upload.description.trim() || !upload.tableName.trim()
    );
    
    if (invalidUploads.length > 0) {
      toast.error("Please fill in all file descriptions and table names");
      return;
    }

    try {
      const files = fileUploads.map(upload => upload.file);
      const descriptions = fileUploads.map(upload => upload.description.trim());
      const tableNames = fileUploads.map(upload => upload.tableName.trim());
      const userIds = fileUploads.map(() => userId);

      const response = await uploadSmartFileSystem(files, descriptions, tableNames, userIds);
      
      if (response) {
        toast.success("Files uploaded successfully! Processing has begun.");
      }
    } catch (error) {
      toast.error("Failed to upload files");
    }
  };

  const handleQuerySubmit = async () => {
    if (!query.trim()) {
      toast.error("Please enter a query");
      return;
    }

    // Validate table selection when table-specific is enabled
    if (tableSpecific && selectedTables.length === 0) {
      toast.error("Please select at least one table for table-specific querying");
      return;
    }

    // Show confirmation for table-specific queries
    if (tableSpecific) {
      toast.success(`Querying ${selectedTables.length} selected table(s): ${selectedTables.join(", ")}`);
    }

    setIsExecuting(true);
    
    try {
      // Query existing knowledge base or uploaded files
      await executeFileQuery({
        fileId: bundleStatus?.status === "COMPLETED" ? "processed_files" : "existing_knowledge",
        query: query.trim(),
        userId,
        parameters: {
          table_specific: tableSpecific,
          tables: tableSpecific ? selectedTables : undefined,
          use_intent_reranker: useIntentReranker,
          use_chunk_reranker: useChunkReranker,
          use_dual_embeddings: useDualEmbeddings,
          intent_top_k: intentTopK,
          chunk_top_k: chunkTopK,
          chunk_source: chunkSource,
          max_chunks_for_answer: maxChunksForAnswer,
          answer_style: answerStyle
        }
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
  };

  const handleResetAdvancedParams = () => {
    setUseIntentReranker(false);
    setUseChunkReranker(false);
    setUseDualEmbeddings(true);
    setIntentTopK(20);
    setChunkTopK(40);
    setChunkSource("reranked");
    setMaxChunksForAnswer(40);
    setAnswerStyle("detailed");
  };

  const handleResetAll = () => {
    setTableSpecific(false);
    setSelectedTables([]);
    handleResetAdvancedParams();
  };

  const handleRefreshStatus = () => {
    if (uploadResponse?.bundle_id) {
      getBundleTaskStatus(uploadResponse.bundle_id);
    }
  };

  const handleResetUpload = () => {
    resetUpload();
    setFileUploads([]);
  };

  return (
    <div className="w-full min-h-screen relative bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
       <div className="container mx-auto px-6 py-8" style={{ paddingTop: "120px" }}>
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Smart File Query Interface
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Query existing knowledge or upload files for intelligent processing using natural language
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleResetAll}
              className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Reset All Settings
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - File Upload & Query Interface */}
          <div className="lg:col-span-2 space-y-6">
            {/* Smart File Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Smart File Upload
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* File Upload List */}
                <div className="space-y-3">
                  {fileUploads.map((fileUpload, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {fileUpload.file.name}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {(fileUpload.file.size / 1024 / 1024).toFixed(2)} MB
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFileUpload(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor={`description-${index}`} className="text-sm text-gray-600 dark:text-gray-400">
                            File Description
                          </Label>
                          <Input
                            id={`description-${index}`}
                            value={fileUpload.description}
                            onChange={(e) => updateFileUpload(index, 'description', e.target.value)}
                            placeholder="Describe the file content..."
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`table-${index}`} className="text-sm text-gray-600 dark:text-gray-400">
                            Table Name
                          </Label>
                          <Input
                            id={`table-${index}`}
                            value={fileUpload.tableName}
                            onChange={(e) => updateFileUpload(index, 'tableName', e.target.value)}
                            placeholder="e.g., invoices, contracts..."
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add File Button */}
                <div className="flex items-center gap-4">
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                      <Plus className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Add File
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Supports PDF, DOC, TXT, and other document formats
                      </p>
                    </div>
                  </Label>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.rtf,.odt,.md"
                    onChange={handleFileUpload}
                  />
                </div>

                {/* Upload Button */}
                {fileUploads.length > 0 && (
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSmartUpload}
                      disabled={isUploading}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload & Process Files
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upload Progress */}
            <FileUploadProgress
              uploadResponse={uploadResponse}
              bundleStatus={bundleStatus}
              isLoading={isUploading}
              error={uploadError}
              onRefreshStatus={handleRefreshStatus}
              onReset={handleResetUpload}
            />

            {/* Query Input Form */}
            <QueryInputForm
              title="Query Knowledge Base"
              icon={<Search className="h-5 w-5" />}
              placeholder="e.g., What are the key terms in the knowledge base? Ask about existing knowledge or uploaded documents."
              value={query}
              onChange={setQuery}
              onSubmit={handleQuerySubmit}
              onClear={handleQueryClear}
              isLoading={isExecuting}
              isDisabled={false}
              submitButtonText="Execute Query"
              clearButtonText="Clear"
            />

            {/* Table Selector */}
            <TableSelector
              userId={userId}
              tableSpecific={tableSpecific}
              selectedTables={selectedTables}
              onTableSpecificChange={setTableSpecific}
              onSelectedTablesChange={setSelectedTables}
            />

            {/* Advanced Query Parameters */}
            <AdvancedQueryParams
              useIntentReranker={useIntentReranker}
              useChunkReranker={useChunkReranker}
              useDualEmbeddings={useDualEmbeddings}
              intentTopK={intentTopK}
              chunkTopK={chunkTopK}
              chunkSource={chunkSource}
              maxChunksForAnswer={maxChunksForAnswer}
              answerStyle={answerStyle}
              onIntentRerankerChange={setUseIntentReranker}
              onChunkRerankerChange={setUseChunkReranker}
              onDualEmbeddingsChange={setUseDualEmbeddings}
              onIntentTopKChange={setIntentTopK}
              onChunkTopKChange={setChunkTopK}
              onChunkSourceChange={setChunkSource}
              onMaxChunksForAnswerChange={setMaxChunksForAnswer}
              onAnswerStyleChange={setAnswerStyle}
              onReset={handleResetAdvancedParams}
            />

            {/* Query Results */}
            {queryResults && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Query Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Main Answer */}
                    {queryResults.data && queryResults.data.answer && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            Answer
                          </h3>
                        </div>
                        <div className="prose prose-gray dark:prose-invert max-w-none">
                          <div 
                            className="text-gray-800 dark:text-gray-200 text-base leading-relaxed"
                            dangerouslySetInnerHTML={{ 
                              __html: queryResults.data.answer
                                .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-white">$1</strong>')
                                .replace(/\*(.*?)\*/g, '<em class="italic text-gray-700 dark:text-gray-300">$1</em>')
                                .replace(/\n/g, '<br>')
                            }}
                          />
                        </div>
                        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-blue-200 dark:border-blue-700">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Confidence:</span>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700">
                              {queryResults.data.confidence}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Sources:</span>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700">
                              {queryResults.data.sourcesUsed}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Sources */}
                    {queryResults.data && queryResults.data.sources && queryResults.data.sources.length > 0 && (
                      <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            Sources Used ({queryResults.data.sourcesUsed || queryResults.data.sources.length})
                          </h3>
                          <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">
                            Showing sources referenced in the answer
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          {queryResults.data.sources.map((source: any, index: number) => {
                            // Parse source if it's a JSON string
                            let parsedSource = source;
                            if (typeof source === 'string' && source.startsWith('{')) {
                              try {
                                parsedSource = JSON.parse(source);
                              } catch (e) {
                                // Keep as string if parsing fails
                              }
                            }
                            
                            return (
                              <div 
                                key={index} 
                                className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    {/* File Icon */}
                                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                      <span className="text-lg">
                                        {parsedSource.file_name?.includes('.pdf') ? '📄' : 
                                         parsedSource.file_name?.includes('.doc') ? '📝' : 
                                         parsedSource.file_name?.includes('.txt') ? '📄' : '📁'}
                                      </span>
                                    </div>
                                    
                                    {/* File Info */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                          #{index + 1}
                                        </span>
                                        <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                          {parsedSource.file_name || 'Unknown File'}
                                        </span>
                                      </div>
                                      {parsedSource.file_path && (
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs text-gray-500 dark:text-gray-400">Path:</span>
                                          <a 
                                            href={parsedSource.file_path} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline truncate max-w-xs"
                                            title={parsedSource.file_path}
                                          >
                                            {parsedSource.file_path}
                                          </a>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Actions */}
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    {parsedSource.file_path && (
                                      <a 
                                        href={parsedSource.file_path} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                        title="Open File"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                      </a>
                                    )}
                                    <button 
                                      className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                      title="Copy File Path"
                                      onClick={() => {
                                        if (parsedSource.file_path) {
                                          navigator.clipboard.writeText(parsedSource.file_path);
                                          toast.success('File path copied to clipboard');
                                        }
                                      }}
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center justify-between">
                            <span>Sources Referenced: {queryResults.data.sourcesUsed || queryResults.data.sources.length}</span>
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>Ready</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Metadata */}
                    {queryResults.metadata && (
                      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-6 rounded-xl border border-emerald-200 dark:border-emerald-800">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            Query Details
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-emerald-200 dark:border-emerald-700">
                            <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-300">ID</span>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Query ID</span>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{queryResults.id}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-emerald-200 dark:border-emerald-700">
                            <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-300">✓</span>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</span>
                              <Badge variant={queryResults.status === 'success' ? 'default' : 'destructive'} className="mt-1">
                                {queryResults.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-emerald-200 dark:border-emerald-700">
                            <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-300">📊</span>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Row Count</span>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{queryResults.metadata.rowCount}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-emerald-200 dark:border-emerald-700">
                            <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-300">🕒</span>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Executed</span>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {new Date(queryResults.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
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

          {/* Right Column - Query History Only */}
          <div className="space-y-6">
            {/* Query History */}
            <QueryHistoryPanel
              history={fileQueryHistory}
              queryType="file"
              maxItems={10}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 