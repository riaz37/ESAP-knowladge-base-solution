"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  FileText,
  Database,
  History,
  Download,
  Copy,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { EnhancedBackground } from "@/components/ui/enhanced-background";
import { useQueryStore } from "@/store/query-store";
import { toast } from "sonner";

export default function QueryHistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [selectedQueries, setSelectedQueries] = useState<string[]>([]);
  
  const {
    fileQueryHistory,
    databaseQueryHistory,
    loadQueryHistory,
    clearHistory,
  } = useQueryStore();

  // Mock user ID - will be replaced with real user context
  const userId = "user123";

  useEffect(() => {
    loadQueryHistory(userId);
  }, [userId, loadQueryHistory]);

  // Combine and sort all query history
  const allQueryHistory = [...fileQueryHistory, ...databaseQueryHistory]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Filter queries based on search and filters
  const filteredQueries = allQueryHistory.filter(query => {
    const matchesSearch = query.query.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || query.status === statusFilter;
    const matchesType = typeFilter === "all" || query.type === typeFilter;
    
    let matchesDate = true;
    if (dateFilter !== "all") {
      const queryDate = new Date(query.timestamp);
      const now = new Date();
      const diffInDays = Math.floor((now.getTime() - queryDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (dateFilter) {
        case "today":
          matchesDate = diffInDays === 0;
          break;
        case "week":
          matchesDate = diffInDays <= 7;
          break;
        case "month":
          matchesDate = diffInDays <= 30;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesType && matchesDate;
  });

  const handleSelectQuery = (queryId: string) => {
    setSelectedQueries(prev => 
      prev.includes(queryId) 
        ? prev.filter(id => id !== queryId)
        : [...prev, queryId]
    );
  };

  const handleSelectAll = () => {
    if (selectedQueries.length === filteredQueries.length) {
      setSelectedQueries([]);
    } else {
      setSelectedQueries(filteredQueries.map(q => q.id));
    }
  };

  const handleClearSelected = async () => {
    if (selectedQueries.length === 0) return;
    
    try {
      // TODO: Implement actual API call to clear selected queries
      // await QueryService.clearSelectedQueries(selectedQueries);
      
      toast.success(`Cleared ${selectedQueries.length} queries`);
      setSelectedQueries([]);
      
      // Reload history
      loadQueryHistory(userId);
    } catch (error) {
      toast.error("Failed to clear selected queries");
    }
  };

  const handleClearAllHistory = async () => {
    try {
      await clearHistory(userId);
      toast.success("All query history cleared");
    } catch (error) {
      toast.error("Failed to clear query history");
    }
  };

  const copyQuery = (queryText: string) => {
    navigator.clipboard.writeText(queryText);
    toast.success("Query copied to clipboard");
  };

  const downloadQueryHistory = () => {
    const dataStr = JSON.stringify(filteredQueries, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `query-history-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Query history downloaded successfully");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'file':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'database':
        return <Database className="h-4 w-4 text-green-600" />;
      default:
        return <Search className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'success':
        return 'default';
      case 'error':
        return 'destructive';
      case 'pending':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  return (
    <EnhancedBackground intensity="medium" className="min-h-screen">
      <div className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Query History
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            View and manage your query execution history across all data sources
          </p>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search queries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              {/* Status Filter */}
              <div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Type Filter */}
              <div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="file">File Queries</SelectItem>
                    <SelectItem value="database">Database Queries</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Date Filter */}
              <div>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectedQueries.length === filteredQueries.length ? 'Deselect All' : 'Select All'}
                </Button>
                
                {selectedQueries.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearSelected}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Selected ({selectedQueries.length})
                  </Button>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadQueryHistory(userId)}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadQueryHistory}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearAllHistory}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Query History List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Query History ({filteredQueries.length} queries)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredQueries.length > 0 ? (
                filteredQueries.map((query) => (
                  <div
                    key={query.id}
                    className={`p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                      selectedQueries.includes(query.id) ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Selection Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedQueries.includes(query.id)}
                        onChange={() => handleSelectQuery(query.id)}
                        className="mt-1"
                      />
                      
                      {/* Query Content */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getTypeIcon(query.type)}
                            <Badge variant="secondary">{query.type}</Badge>
                            {getStatusIcon(query.status)}
                            <Badge variant={getStatusBadgeVariant(query.status)}>
                              {query.status}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="h-4 w-4" />
                            {new Date(query.timestamp).toLocaleString()}
                          </div>
                        </div>
                        
                        <div className="font-mono text-sm bg-gray-100 dark:bg-gray-700 p-3 rounded">
                          {query.query}
                        </div>
                        
                        {/* Query Metadata */}
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          {query.executionTime && (
                            <span>Execution: {query.executionTime.toFixed(2)}s</span>
                          )}
                          {query.rowCount && (
                            <span>Results: {query.rowCount} rows</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyQuery(query.query)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <History className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No queries found</p>
                  <p className="text-sm">
                    {searchTerm || statusFilter !== "all" || typeFilter !== "all" || dateFilter !== "all"
                      ? "Try adjusting your filters or search terms"
                      : "Execute your first query to see history"
                    }
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </EnhancedBackground>
  );
} 