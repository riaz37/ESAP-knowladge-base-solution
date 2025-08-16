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
} from "lucide-react";
import { EnhancedBackground } from "@/components/ui/enhanced-background";
import { useQueryStore } from "@/store/query-store";
import { toast } from "sonner";
import {
  QueryHistoryPanel,
  QueryInputForm,
  QueryTips,
} from "@/components/data-query";

export default function DatabaseQueryPage() {
  const [query, setQuery] = useState("");
  const [selectedDatabase, setSelectedDatabase] = useState<string>("");
  const [isExecuting, setIsExecuting] = useState(false);
  
  const {
    executeDatabaseQuery,
    databaseQueryHistory,
    queryResults,
    queryLoading,
    queryError,
    loadQueryHistory,
    saveQuery,
  } = useQueryStore();

  // Mock user ID - will be replaced with real user context
  const userId = "user123";

  // TODO: Replace with real database list from API
  // For now, we'll show a placeholder until the API is implemented
  const availableDatabases = [
    { id: "1", name: "Production Database", description: "Main production database" },
    { id: "2", name: "Development Database", description: "Development and testing database" },
    { id: "3", name: "Analytics Database", description: "Data warehouse and analytics" },
  ];



  const queryTips = [
    "Always use LIMIT for large SELECT queries",
    "Test complex queries on development database first",
    "Use parameterized queries to prevent SQL injection",
    "Monitor execution time for performance",
    "Save frequently used queries for reuse"
  ];

  useEffect(() => {
    loadQueryHistory(userId, 'database');
    if (availableDatabases.length > 0) {
      setSelectedDatabase(availableDatabases[0].id);
    }
  }, [userId, loadQueryHistory]);

  const handleQuerySubmit = async () => {
    if (!selectedDatabase) {
      toast.error("Please select a database first");
      return;
    }

    if (!query.trim()) {
      toast.error("Please enter a query");
      return;
    }

    setIsExecuting(true);
    
    try {
      await executeDatabaseQuery({
        databaseId: parseInt(selectedDatabase),
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
        type: 'database',
        userId,
        tags: ['database', 'saved'],
      });
      
      toast.success("Query saved successfully!");
    } catch (error) {
      toast.error("Failed to save query");
    }
  };



  return (
    <EnhancedBackground intensity="medium" className="min-h-screen">
      <div className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Database Query Interface
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Execute SQL queries directly on your databases with real-time results
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Query Interface */}
          <div className="lg:col-span-2 space-y-6">
            {/* Database Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="database-select">Select Database</Label>
                  <Select value={selectedDatabase} onValueChange={setSelectedDatabase}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a database" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDatabases.map((db) => (
                        <SelectItem key={db.id} value={db.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{db.name}</span>
                            <span className="text-xs text-gray-500">{db.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedDatabase && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    <span className="text-sm text-blue-800 dark:text-blue-200">
                      Connected to: {availableDatabases.find(db => db.id === selectedDatabase)?.name}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Query Input Form */}
            <QueryInputForm
              title="SQL Query Input"
              icon={<Search className="h-5 w-5" />}
              placeholder="e.g., SELECT * FROM users WHERE status = 'active' LIMIT 100"
              value={query}
              onChange={setQuery}
              onSubmit={handleQuerySubmit}
              onClear={handleQueryClear}
              onSave={handleSaveQuery}
              isLoading={isExecuting}
              isDisabled={!selectedDatabase}
              rows={6}
              showSaveButton={true}
              submitButtonText="Execute Query"
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
                {queryLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
                  </div>
                ) : queryResults && queryResults.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          {queryResults[0] && Object.keys(queryResults[0]).map((key) => (
                            <th key={key} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {queryResults.map((row, index) => (
                          <tr key={index}>
                            {Object.values(row).map((value, colIndex) => (
                              <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                {value}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No results to display.
                  </div>
                )}
              </CardContent>
            </Card>

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
            {/* Common Queries */}
            {/* Query History */}
            <QueryHistoryPanel
              history={databaseQueryHistory}
              queryType="database"
              maxItems={10}
            />

            {/* Query Tips */}
            <QueryTips
              tips={queryTips}
              title="Query Tips"
              icon={<BookOpen className="h-5 w-5" />}
            />
          </div>
        </div>
      </div>
    </EnhancedBackground>
  );
} 