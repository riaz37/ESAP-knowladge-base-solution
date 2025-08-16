"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Database, Clock, User, Server, Copy, BarChart3 } from "lucide-react";
import { DataVisualization } from "@/components/ai-assistant/DataVisualization";
import { toast } from "sonner";

interface DatabaseQueryResult {
  query: string;
  result: any;
  timestamp: string;
  userId: string;
  dbId: number;
  dbName: string;
  type: 'database';
}

export default function DatabaseQueryResultsPage() {
  const router = useRouter();
  const [queryResult, setQueryResult] = useState<DatabaseQueryResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Calculate pagination
  const getTableData = () => {
    if (!queryResult?.result?.data?.payload?.data || !Array.isArray(queryResult.result.data.payload.data)) {
      return [];
    }
    return queryResult.result.data.payload.data;
  };

  const tableData = getTableData();
  const totalRecords = tableData.length;
  const totalPages = Math.ceil(totalRecords / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentPageData = tableData.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle page size change
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  useEffect(() => {
    // Get the result from sessionStorage (set by AI Interface)
    const storedResult = sessionStorage.getItem("aiQueryResult");
    
    if (storedResult) {
      try {
        const parsed = JSON.parse(storedResult);
        if (parsed.type === 'database') {
          setQueryResult(parsed);
        } else {
          toast.error("Invalid result type. Expected database query result.");
          router.push("/");
        }
      } catch (error) {
        toast.error("Failed to parse query result");
        router.push("/");
      }
    } else {
      toast.error("No query result found");
      router.push("/");
    }
    
    setLoading(false);
  }, [router]);

  const handleBackToAI = () => {
    router.push("/");
  };

  const handleCopyResults = () => {
    if (queryResult?.result) {
      navigator.clipboard.writeText(JSON.stringify(queryResult.result, null, 2));
      toast.success("Results copied to clipboard");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400 mx-auto"></div>
          <p className="text-white mt-4">Loading query results...</p>
        </div>
      </div>
    );
  }

  if (!queryResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl">No query result found</p>
          <Button onClick={handleBackToAI} className="mt-4">
            Back to AI Interface
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={handleBackToAI}
            variant="ghost"
            className="text-blue-400 hover:text-blue-300 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to AI Interface
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Database Query Results
              </h1>
              <p className="text-gray-300">
                Results from your database query
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button onClick={handleCopyResults} variant="outline">
                Copy Results
              </Button>
            </div>
          </div>
        </div>

        {/* Query Metadata */}
        <Card className="mb-6 bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-400" />
              Query Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">User:</span>
                <Badge variant="outline">{queryResult.userId}</Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">Database:</span>
                <Badge variant="outline">{queryResult.dbName || `DB ${queryResult.dbId}`}</Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">Executed:</span>
                <Badge variant="outline">
                  {new Date(queryResult.timestamp).toLocaleString()}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">Type:</span>
                <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  Database Query
                </Badge>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
              <p className="text-gray-300 text-sm font-medium mb-2">Query:</p>
              <p className="text-white font-mono text-sm bg-gray-800 p-2 rounded">
                {queryResult.query}
              </p>
              {queryResult.result && queryResult.result.data && queryResult.result.data.payload && queryResult.result.data.payload.sql && (
                <div className="mt-3">
                  <p className="text-gray-300 text-sm font-medium mb-2">Generated SQL:</p>
                  <p className="text-white font-mono text-sm bg-gray-800 p-2 rounded">
                    {queryResult.result.data.payload.sql}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results Display */}
        <div className="space-y-6">
          <Tabs defaultValue="table" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-800/50">
              <TabsTrigger value="table" className="text-gray-300 data-[state=active]:text-white">
                Table View
              </TabsTrigger>
              <TabsTrigger value="chart" className="text-gray-300 data-[state=active]:text-white">
                Charts
              </TabsTrigger>
              <TabsTrigger value="raw" className="text-gray-300 data-[state=active]:text-white">
                Raw Data
              </TabsTrigger>
            </TabsList>

            <TabsContent value="table" className="mt-6">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Table View</CardTitle>
                </CardHeader>
                <CardContent>
                  {queryResult.result && queryResult.result.success && queryResult.result.data && queryResult.result.data.payload && queryResult.result.data.payload.data && Array.isArray(queryResult.result.data.payload.data) && queryResult.result.data.payload.data.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-400/30">
                            <Database className="w-3 h-3 mr-1" />
                            {totalRecords} records found
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-sm">Show:</span>
                          <select
                            value={pageSize}
                            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                            className="bg-gray-700 border border-gray-600 text-white text-sm rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                          </select>
                          <span className="text-gray-400 text-sm">per page</span>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-gray-300">
                          <thead>
                            <tr className="bg-gray-700/50 border-b border-gray-600">
                              {Object.keys(queryResult.result.data.payload.data[0]).map((header) => (
                                <th key={header} className="py-2 px-4 text-left">
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {currentPageData.map((row: any, index: number) => (
                              <tr key={startIndex + index} className="border-b border-gray-600 hover:bg-gray-700/30">
                                {Object.values(row).map((value: any, colIndex: number) => (
                                  <td key={colIndex} className="py-2 px-4">
                                    {value}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                       {totalPages > 1 && (
                         <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4">
                           <span className="text-gray-400 text-sm">
                             Showing {startIndex + 1} to {Math.min(endIndex, totalRecords)} of {totalRecords} records
                           </span>
                           <div className="flex items-center gap-2">
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => handlePageChange(1)}
                               disabled={currentPage === 1}
                               className="px-2 py-1 text-xs"
                             >
                               First
                             </Button>
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => handlePageChange(currentPage - 1)}
                               disabled={currentPage === 1}
                               className="px-2 py-1 text-xs"
                             >
                               Previous
                             </Button>
                             
                             {/* Page numbers */}
                             <div className="flex items-center gap-1">
                               {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                 let pageNum;
                                 if (totalPages <= 5) {
                                   pageNum = i + 1;
                                 } else if (currentPage <= 3) {
                                   pageNum = i + 1;
                                 } else if (currentPage >= totalPages - 2) {
                                   pageNum = totalPages - 4 + i;
                                 } else {
                                   pageNum = currentPage - 2 + i;
                                 }
                                 
                                 return (
                                   <Button
                                     key={pageNum}
                                     variant={currentPage === pageNum ? "default" : "outline"}
                                     size="sm"
                                     onClick={() => handlePageChange(pageNum)}
                                     className="px-2 py-1 text-xs min-w-[32px]"
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
                               disabled={currentPage === totalPages}
                               className="px-2 py-1 text-xs"
                             >
                               Next
                             </Button>
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => handlePageChange(totalPages)}
                               disabled={currentPage === totalPages}
                               className="px-2 py-1 text-xs"
                             >
                               Last
                             </Button>
                           </div>
                         </div>
                       )}
                    </div>
                  ) : queryResult.result && queryResult.result.success && queryResult.result.data && Array.isArray(queryResult.result.data) && queryResult.result.data.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-400/30">
                            <Database className="w-3 h-3 mr-1" />
                            {queryResult.result.data.length} records found
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-sm">Show:</span>
                          <select
                            value={pageSize}
                            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                            className="bg-gray-700 border border-gray-600 text-white text-sm rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                          </select>
                          <span className="text-gray-400 text-sm">per page</span>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-gray-300">
                          <thead>
                            <tr className="bg-gray-700/50 border-b border-gray-600">
                              {Object.keys(queryResult.result.data[0]).map((header) => (
                                <th key={header} className="py-2 px-4 text-left">
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {queryResult.result.data.slice(startIndex, endIndex).map((row: any, index: number) => (
                              <tr key={startIndex + index} className="border-b border-gray-600 hover:bg-gray-700/30">
                                {Object.values(row).map((value: any, colIndex: number) => (
                                  <td key={colIndex} className="py-2 px-4">
                                    {value}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {Math.ceil(queryResult.result.data.length / pageSize) > 1 && (
                        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4">
                          <span className="text-gray-400 text-sm">
                            Showing {startIndex + 1} to {Math.min(endIndex, queryResult.result.data.length)} of {queryResult.result.data.length} records
                          </span>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePageChange(1)}
                              disabled={currentPage === 1}
                              className="px-2 py-1 text-xs"
                            >
                              First
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage === 1}
                              className="px-2 py-1 text-xs"
                            >
                              Previous
                            </Button>
                            
                            {/* Page numbers */}
                            <div className="flex items-center gap-1">
                              {Array.from({ length: Math.min(5, Math.ceil(queryResult.result.data.length / pageSize)) }, (_, i) => {
                                let pageNum;
                                const totalPages = Math.ceil(queryResult.result.data.length / pageSize);
                                if (totalPages <= 5) {
                                  pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                  pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                  pageNum = totalPages - 4 + i;
                                } else {
                                  pageNum = currentPage - 2 + i;
                                }
                                
                                return (
                                  <Button
                                    key={pageNum}
                                    variant={currentPage === pageNum ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handlePageChange(pageNum)}
                                    className="px-2 py-1 text-xs min-w-[32px]"
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
                              disabled={currentPage === Math.ceil(queryResult.result.data.length / pageSize)}
                              className="px-2 py-1 text-xs"
                            >
                              Next
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePageChange(Math.ceil(queryResult.result.data.length / pageSize))}
                              disabled={currentPage === Math.ceil(queryResult.result.data.length / pageSize)}
                              className="px-2 py-1 text-xs"
                            >
                              Last
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No table data available</p>
                      <p className="text-sm">The query result doesn't contain tabular data</p>
                      {queryResult.result && (
                        <div className="mt-4 p-3 bg-gray-700/50 rounded-lg text-left">
                          <p className="text-xs text-gray-300 mb-2">Raw result structure:</p>
                          <pre className="text-xs text-gray-400 overflow-auto max-h-32">
                            {JSON.stringify(queryResult.result, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="chart" className="mt-6">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Data Visualization</CardTitle>
                </CardHeader>
                <CardContent>
                  {queryResult.result && queryResult.result.success && queryResult.result.data && queryResult.result.data.payload && queryResult.result.data.payload.data && Array.isArray(queryResult.result.data.payload.data) && queryResult.result.data.payload.data.length > 0 ? (
                    <DataVisualization data={queryResult.result.data.payload.data} />
                  ) : queryResult.result && queryResult.result.success && queryResult.result.data && Array.isArray(queryResult.result.data) && queryResult.result.data.length > 0 ? (
                    <DataVisualization data={queryResult.result.data} />
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No chart data available</p>
                      <p className="text-sm">The query result doesn't contain data suitable for visualization</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="raw" className="mt-6">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Raw Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm text-gray-300 bg-gray-900 p-4 rounded-lg overflow-auto max-h-96">
                    {JSON.stringify(queryResult.result, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 