"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  FileText,
  Database,
  History,
  Bookmark,
  TrendingUp,
  Clock,
  Zap,
  Loader2,
} from "lucide-react";
import { EnhancedBackground } from "@/components/ui/enhanced-background";
import { useQueryStore } from "@/store/query-store";
import { useRouter } from "next/navigation";
import {
  QueryStatsCards,
  QueryQuickActions,
  QueryTabs,
} from "@/components/data-query";

export default function DataQueryDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const router = useRouter();
  
  const {
    fileQueryHistory,
    databaseQueryHistory,
    savedQueries,
    loadQueryHistory,
    loadSavedQueries,
  } = useQueryStore();

  // Mock user ID - will be replaced with real user context
  const userId = "user123";

  useEffect(() => {
    // Load real data from APIs
    loadQueryHistory(userId);
    loadSavedQueries(userId);
  }, [userId, loadQueryHistory, loadSavedQueries]);

  // Calculate real statistics from actual data
  const queryStats = [
    {
      title: "Total Queries",
      value: fileQueryHistory.length + databaseQueryHistory.length,
      description: "All time queries",
      icon: Search,
    },
    {
      title: "File Queries",
      value: fileQueryHistory.length,
      description: "Document queries",
      icon: FileText,
    },
    {
      title: "Database Queries",
      value: databaseQueryHistory.length,
      description: "SQL queries",
      icon: Database,
    },
    {
      title: "Success Rate",
      value: fileQueryHistory.length + databaseQueryHistory.length > 0 
        ? `${Math.round(([...fileQueryHistory, ...databaseQueryHistory].filter(q => q.status === 'success').length / (fileQueryHistory.length + databaseQueryHistory.length)) * 100)}%`
        : "0%",
      description: "Successful queries",
      icon: TrendingUp,
    },
    {
      title: "Saved Queries",
      value: savedQueries.length,
      description: "Reusable templates",
      icon: Bookmark,
    },
  ];

  const quickActions = [
    {
      title: "File Query",
      description: "Query uploaded files and documents",
      icon: FileText,
      href: "/data-query/file-query",
      color: "bg-blue-500",
      onClick: () => router.push("/data-query/file-query"),
    },
    {
      title: "Database Query",
      description: "Direct database querying",
      icon: Database,
      href: "/data-query/database-query",
      color: "bg-green-500",
      onClick: () => router.push("/data-query/database-query"),
    },
    {
      title: "Query Builder",
      description: "Visual query construction",
      icon: Search,
      href: "/data-query/query-builder",
      color: "bg-purple-500",
      onClick: () => router.push("/data-query/query-builder"),
    },
    {
      title: "Saved Queries",
      description: "Access reusable query templates",
      icon: Bookmark,
      href: "/data-query/saved-queries",
      color: "bg-orange-500",
      onClick: () => router.push("/data-query/saved-queries"),
    },
  ];

  // Get recent queries from actual history
  const recentQueries = [...fileQueryHistory, ...databaseQueryHistory]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  const tabs = [
    {
      value: "overview",
      label: "Overview",
      content: (
        <div className="space-y-6">
          {/* Statistics Cards */}
          <QueryStatsCards stats={queryStats} columns={5} />
          
          {/* Quick Access */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Quick Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <QueryQuickActions actions={quickActions} columns={4} />
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      value: "quick-actions",
      label: "Quick Actions",
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Start a New Query</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <QueryQuickActions actions={quickActions} columns={2} variant="list" />
          </CardContent>
        </Card>
      ),
    },
    {
      value: "recent",
      label: "Recent Queries",
      content: (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Queries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentQueries.length > 0 ? (
                recentQueries.map((queryItem) => (
                  <div key={queryItem.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                        <Search className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="font-medium">Query #{queryItem.id}</div>
                        <div className="text-sm text-muted-foreground">
                          {queryItem.query.length > 50 
                            ? `${queryItem.query.substring(0, 50)}...` 
                            : queryItem.query
                          }
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{queryItem.type}</Badge>
                      <Badge 
                        variant={queryItem.status === 'success' ? 'default' : 'destructive'}
                      >
                        {queryItem.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(queryItem.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No queries executed yet</p>
                  <p className="text-sm">Start by executing your first query</p>
                  <div className="mt-4">
                    <Button onClick={() => router.push('/data-query/file-query')}>
                      Try File Query
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ),
    },
    {
      value: "analytics",
      label: "Analytics",
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Query Performance Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            {fileQueryHistory.length + databaseQueryHistory.length > 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Query performance analytics coming soon...</p>
                <p className="text-sm">This will include query execution times, success rates, and optimization suggestions based on your actual query data.</p>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No query data available yet</p>
                <p className="text-sm">Execute some queries to see performance analytics and insights.</p>
                <div className="mt-4">
                  <Button onClick={() => router.push('/data-query/file-query')}>
                    Start Querying
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ),
    },
  ];

  return (
    <EnhancedBackground intensity="medium" className="min-h-screen">
      <div className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Data Query Hub
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Centralized interface for querying files, databases, and building custom queries
          </p>
        </div>

        {/* Main Content */}
        <QueryTabs 
          tabs={tabs} 
          defaultValue={activeTab} 
          onValueChange={setActiveTab}
        />
      </div>
    </EnhancedBackground>
  );
} 