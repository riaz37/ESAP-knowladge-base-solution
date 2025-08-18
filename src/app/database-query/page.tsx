"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Database,
  Play,
  History,
  Download,
  Copy,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Save,
  BookOpen,
  AlertCircle,
} from "lucide-react";

import { useQueryStore } from "@/store/query-store";
import { useUserContext } from "@/components/providers/UserContextProvider";
import { toast } from "sonner";
import { QueryHistoryPanel, QueryInputForm } from "@/components/data-query";
import { QueryService } from "@/lib/api/services/query-service";

export default function DatabaseQueryPage() {
  const [query, setQuery] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [queryResults, setQueryResults] = useState<any[] | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [queryMetadata, setQueryMetadata] = useState<{
    sqlQuery?: string;
    queryHistory?: any[];
    resultCount?: number;
  } | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const {
    databaseQueryHistory,
    loadQueryHistory,
    saveQuery,
  } = useQueryStore();

  // Get user context
  const { userId, databaseId, databaseName, isLoading: userLoading, error: userError } = useUserContext();

  const queryTips = [
    "Ask specific questions like 'What were the top 10 sales last month?'",
    "Use natural language like 'Show me all active users with their last login date'",
    "Be specific about time periods: 'revenue for Q1 2024' or 'sales from last week'",
    "Include context like 'employees in the marketing department' or 'products with low stock'",
    "Ask for comparisons: 'compare this month's performance to last month'",
  ];

  useEffect(() => {
    if (userId) {
    loadQueryHistory(userId, "database");
    }
  }, [userId, loadQueryHistory]);

  const handleQuerySubmit = async () => {
    if (!userId) {
      toast.error("Please select a user first");
      return;
    }

    if (!databaseId) {
      toast.error("No database configured for this user. Please configure a database first.");
      return;
    }

    if (!query.trim()) {
      toast.error("Please enter a query");
      return;
    }

    setIsExecuting(true);
    setQueryError(null);
    setQueryResults(null);
    setQueryMetadata(null); // Clear previous metadata

    try {
      // Execute the database query using the QueryService
      const result = await QueryService.sendDatabaseQuery(query.trim(), userId);
      
      console.log('Raw query result:', result);
      
      // Handle the response - extract data from the nested structure
      if (result && result.data) {
        // The response is an array with the first object containing sql, data, and history
        const queryResponse = Array.isArray(result.data) ? result.data[0] : result.data;
        
        if (queryResponse) {
          const { sql, data: queryData, history } = queryResponse;
          
          console.log('Query response:', { sql, data: queryData, history });
          
          // Set the query results (the actual data from the database)
          if (queryData && Array.isArray(queryData) && queryData.length > 0) {
            setQueryResults(queryData);
            toast.success("Query executed successfully!");
          } else {
            setQueryResults([]);
            toast.info("Query executed but no results returned");
          }
          
          // Store additional metadata for display
          setQueryMetadata({
            sqlQuery: sql,
            queryHistory: history,
            resultCount: queryData ? queryData.length : 0
          });
        } else {
          setQueryResults([]);
          setQueryMetadata(null);
          toast.info("Query executed but response structure is unexpected");
        }
      } else {
        setQueryResults([]);
        setQueryMetadata(null);
        toast.info("Query executed but no response data received");
      }
    } catch (error: any) {
      console.error("Database query error:", error);
      const errorMessage = error.message || "Query execution failed";
      setQueryError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleQueryClear = () => {
    setQuery("");
    setQueryResults(null);
    setQueryError(null);
    setQueryMetadata(null); // Clear metadata on clear
  };

  const handleSaveQuery = async () => {
    if (!query.trim()) {
      toast.error("Please enter a query to save");
      return;
    }

    try {
      await saveQuery({
        name: `Query ${Date.now()}`,
        description: "Saved database query",
        query: query.trim(),
        type: "database",
        userId: userId || "",
        tags: ["database", "saved"],
      });

      toast.success("Query saved successfully!");
    } catch (error) {
      toast.error("Failed to save query");
    }
  };

  // Pagination calculations
  const totalPages = queryResults ? Math.ceil(queryResults.length / itemsPerPage) : 0;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentResults = queryResults ? queryResults.slice(startIndex, endIndex) : [];

  // Handle "Show All" option
  const effectiveItemsPerPage = itemsPerPage === -1 ? queryResults?.length || 0 : itemsPerPage;
  const effectiveTotalPages = itemsPerPage === -1 ? 1 : totalPages;
  const effectiveCurrentResults = itemsPerPage === -1 ? queryResults : currentResults;

  // Reset to first page when query results change
  useEffect(() => {
    setCurrentPage(1);
  }, [queryResults]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  // Show loading state while user context is loading
  if (userLoading) {
    return (
      <div className="w-full min-h-screen relative bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
        <div className="container mx-auto px-6 py-8" style={{ paddingTop: "120px" }}>
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
            <span className="ml-3 text-lg">Loading user configuration...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if user context failed to load
  if (userError) {
    return (
      <div className="w-full min-h-screen relative bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
        <div className="container mx-auto px-6 py-8" style={{ paddingTop: "120px" }}>
          <div className="text-center py-20">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-600 mb-2">Configuration Error</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{userError}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen relative bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
      <div
        className="container mx-auto px-6 py-8"
        style={{ paddingTop: "120px" }}
      >
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Natural Language Database Query
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Ask questions about your data in plain English and get intelligent
            answers from your database
          </p>
        </div>

        {/* User and Database Status */}
        <div className="mb-6">
            <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <div>
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">User ID:</span>
                    <span className="ml-2 text-sm text-blue-700 dark:text-blue-300">{userId || "Not configured"}</span>
                          </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Database className="h-5 w-5 text-green-600" />
                  <div>
                    <span className="text-sm font-medium text-green-800 dark:text-green-200">Database:</span>
                    <span className="ml-2 text-sm text-green-700 dark:text-green-300">
                      {databaseName || "Not configured"}
                    </span>
                  </div>
                </div>
              </div>
              </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Query Interface */}
          <div className="lg:col-span-2 space-y-6">
            {/* Query Input Form */}
            <QueryInputForm
              title="Natural Language Query"
              icon={<Search className="h-5 w-5" />}
              placeholder="e.g., What were the top 10 sales last month? or Show me all active users with their last login date"
              value={query}
              onChange={setQuery}
              onSubmit={handleQuerySubmit}
              onClear={handleQueryClear}
              onSave={handleSaveQuery}
              isLoading={isExecuting}
              isDisabled={!userId || !databaseId}
              rows={6}
              showSaveButton={true}
              submitButtonText="Ask Question"
              clearButtonText="Clear"
            />

            {/* Query Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Query Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isExecuting ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
                    <span className="ml-3">Executing query...</span>
                  </div>
                ) : queryResults && queryResults.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Badge variant="secondary">
                        {queryResults.length} result{queryResults.length !== 1 ? 's' : ''}
                        {effectiveTotalPages > 1 && ` • Page ${currentPage} of ${effectiveTotalPages}`}
                        {itemsPerPage === -1 && ' • Showing all results'}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <Select value={itemsPerPage.toString()} onValueChange={(value) => handleItemsPerPageChange(parseInt(value))}>
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                            <SelectItem value="-1">All</SelectItem>
                          </SelectContent>
                        </Select>
                        <span className="text-xs text-gray-500">per page</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(JSON.stringify(queryResults, null, 2));
                            toast.success("Results copied to clipboard");
                          }}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Results
                        </Button>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            {effectiveCurrentResults[0] &&
                              Object.keys(effectiveCurrentResults[0]).map((key) => (
                                <th
                                  key={key}
                                  scope="col"
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                                >
                                  {key}
                                </th>
                              ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                          {effectiveCurrentResults.map((row, index) => (
                            <tr key={itemsPerPage === -1 ? index : startIndex + index}>
                              {Object.values(row).map((value, colIndex) => (
                                <td
                                  key={colIndex}
                                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300"
                                >
                                  {value !== null && value !== undefined ? String(value) : 'NULL'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Controls */}
                    {effectiveTotalPages > 1 && (
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <span>
                            Showing {startIndex + 1} to {Math.min(endIndex, queryResults.length)} of {queryResults.length} results
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                          >
                            Previous
                          </Button>
                          
                          {/* Page Numbers */}
                          <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, effectiveTotalPages) }, (_, i) => {
                              let pageNum;
                              if (effectiveTotalPages <= 5) {
                                pageNum = i + 1;
                              } else if (currentPage <= 3) {
                                pageNum = i + 1;
                              } else if (currentPage >= effectiveTotalPages - 2) {
                                pageNum = effectiveTotalPages - 4 + i;
                              } else {
                                pageNum = currentPage - 2 + i;
                              }
                              
                              return (
                                <Button
                                  key={pageNum}
                                  variant={currentPage === pageNum ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handlePageChange(pageNum)}
                                  className="w-8 h-8 p-0"
                                >
                                  {pageNum}
                                </Button>
                              );
                            })}
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === effectiveTotalPages}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : queryError ? (
                  <div className="text-center py-8">
                    <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600 dark:text-red-400 font-medium">Query Error</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{queryError}</p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    {!userId || !databaseId ? (
                      <div>
                        <Database className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <p className="font-medium">No database configured</p>
                        <p className="text-sm">Please configure a database for this user to execute queries</p>
                      </div>
                    ) : (
                      <div>
                        <Search className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <p className="text-sm">Execute a query to see results here</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Query Metadata - SQL Query and History */}
                {queryMetadata && (
                  <div className="mt-6 space-y-4">
                    {/* SQL Query Display */}
                    {queryMetadata.sqlQuery && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Generated SQL Query
                        </h4>
                        <div className="bg-white dark:bg-gray-900 p-3 rounded border font-mono text-xs overflow-x-auto">
                          <code className="text-gray-800 dark:text-gray-200">
                            {queryMetadata.sqlQuery}
                          </code>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Examples & History */}
          <div className="space-y-6">
            {/* Query Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Query Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {queryTips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{tip}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Query History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Query History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Current Query History from API */}
                  {queryMetadata && queryMetadata.queryHistory && queryMetadata.queryHistory.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Current Query History
                      </h4>
                      <div className="space-y-2">
                        {queryMetadata.queryHistory.slice(0, 5).map((item, index) => (
                          <div key={index} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                              {item.question}
                            </div>
                            <div className="text-xs text-blue-600 dark:text-blue-400 mb-2">
                              {item.results_summary}
                            </div>
                            <div className="text-xs text-blue-500 dark:text-blue-300">
                              {new Date(item.timestamp).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stored Query History */}
                  {databaseQueryHistory && databaseQueryHistory.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Stored Query History
                      </h4>
                      <div className="space-y-2">
                        {databaseQueryHistory.slice(0, 5).map((item, index) => (
                          <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                              {item.query}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                              Status: {item.status} • {item.executionTime ? `${item.executionTime}ms` : 'No timing data'}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-500">
                              {new Date(item.timestamp).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No History Message */}
                  {(!queryMetadata?.queryHistory || queryMetadata.queryHistory.length === 0) && 
                   (!databaseQueryHistory || databaseQueryHistory.length === 0) && (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                      <History className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">No query history available</p>
                      <p className="text-xs">Execute a query to see history here</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
