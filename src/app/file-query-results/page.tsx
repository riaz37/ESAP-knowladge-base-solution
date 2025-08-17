"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, FileText, Clock, User, Upload, Copy } from "lucide-react";
import { DataVisualization } from "@/components/ai-assistant/DataVisualization";
import { toast } from "sonner";

interface FileQueryResult {
  query: string;
  result: any;
  timestamp: string;
  userId: string;
  fileId: string;
  type: 'file';
}

export default function FileQueryResultsPage() {
  const router = useRouter();
  const [queryResult, setQueryResult] = useState<FileQueryResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get the result from sessionStorage (set by AI Interface)
    const storedResult = sessionStorage.getItem("aiQueryResult");
    
    if (storedResult) {
      try {
        const parsed = JSON.parse(storedResult);
        if (parsed.type === 'file') {
          setQueryResult(parsed);
        } else {
          toast.error("Invalid result type. Expected file query result.");
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-400 mx-auto"></div>
          <p className="text-white mt-4">Loading query results...</p>
        </div>
      </div>
    );
  }

  if (!queryResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={handleBackToAI}
            variant="ghost"
            className="text-green-400 hover:text-green-300 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to AI Interface
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                File Query Results
              </h1>
              <p className="text-gray-300">
                Results from your file query
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
              <FileText className="w-5 h-5 text-green-400" />
              Query Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">User:</span>
                <Badge variant="outline">{queryResult.userId}</Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">File:</span>
                <Badge variant="outline">{queryResult.fileId}</Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">Executed:</span>
                <Badge variant="outline">
                  {new Date(queryResult.timestamp).toLocaleString()}
                </Badge>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
              <p className="text-gray-300 text-sm font-medium mb-2">Query:</p>
              <p className="text-white font-mono text-sm bg-gray-800 p-2 rounded">
                {queryResult.query}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Results Display */}
        <div className="space-y-6">
          {/* Main Answer Display */}
          {queryResult.result && queryResult.result.data && queryResult.result.data.answer && (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-400" />
                  File Query Answer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-700/50 rounded-lg">
                    <p className="text-white text-lg leading-relaxed">
                      {queryResult.result.data.answer}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>Confidence: <Badge variant="outline">{queryResult.result.data.confidence}</Badge></span>
                    <span>Sources Used: <Badge variant="outline">{queryResult.result.data.sourcesUsed}</Badge></span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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
                  {queryResult.result && queryResult.result.data && queryResult.result.data.sources && Array.isArray(queryResult.result.data.sources) && queryResult.result.data.sources.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
                          <FileText className="w-3 h-3 mr-1" />
                          {queryResult.result.data.sources.length} sources found
                        </Badge>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-gray-300">
                          <thead>
                            <tr className="bg-gray-700/50 border-b border-gray-600">
                              <th className="py-2 px-4 text-left">Source</th>
                              <th className="py-2 px-4 text-left">Content</th>
                              <th className="py-2 px-4 text-left">Relevance</th>
                            </tr>
                          </thead>
                          <tbody>
                            {queryResult.result.data.sources.map((source: any, index: number) => (
                              <tr key={index} className="border-b border-gray-600 hover:bg-gray-700/30">
                                <td className="py-2 px-4">
                                  <Badge variant="outline" className="text-xs">
                                    Source {index + 1}
                                  </Badge>
                                </td>
                                <td className="py-2 px-4">
                                  <div className="max-w-md">
                                    <p className="text-sm line-clamp-3">
                                      {typeof source === 'string' ? source : JSON.stringify(source)}
                                    </p>
                                  </div>
                                </td>
                                <td className="py-2 px-4">
                                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-400/30">
                                    {queryResult.result.data.confidence}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No sources available</p>
                      <p className="text-sm">The file query result doesn't contain source data</p>
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
                  <DataVisualization data={queryResult.result} />
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