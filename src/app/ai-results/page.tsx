"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Bot,
  Sparkles,
  Database,
  FileText,
  ArrowLeft,
  Clock,
  User,
} from "lucide-react";
import { QueryResultsDisplay } from "@/components/ai-assistant/QueryResultsDisplay";

export default function AIResultsPage() {
  const [currentQuery, setCurrentQuery] = useState<any>(null);
  const router = useRouter();

  // Load query result from sessionStorage on component mount
  useEffect(() => {
    const storedResult = sessionStorage.getItem("aiQueryResult");
    if (storedResult) {
      try {
        const queryData = JSON.parse(storedResult);
        setCurrentQuery(queryData);

        // Clear sessionStorage after reading
        sessionStorage.removeItem("aiQueryResult");
      } catch (error) {
        console.error("Error parsing query result:", error);
      }
    }
  }, []);

  const handleBackToDashboard = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Add top padding to account for fixed navbar */}
      <div className="pt-24 pb-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header with Back Button */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500/30 to-green-600/20 rounded-xl flex items-center justify-center border border-green-500/40">
                    <Bot className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">
                      AI Query Results
                    </h1>
                    <p className="text-gray-400">
                      Your AI-powered database query results
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleBackToDashboard}
                  variant="outline"
                  className="border-green-400/30 text-green-400 hover:bg-green-400/10"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </div>

              {/* Feature Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card className="bg-gray-900/50 border-green-400/30">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">
                          Natural Language
                        </h3>
                        <p className="text-gray-400 text-sm">
                          Ask questions in plain English
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900/50 border-green-400/30">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">
                          Business Rules
                        </h3>
                        <p className="text-gray-400 text-sm">
                          Automatic rule compliance
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900/50 border-green-400/30">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <Database className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">
                          Smart Results
                        </h3>
                        <p className="text-gray-400 text-sm">
                          Contextual data insights
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Current Query Result */}
            {currentQuery && (
              <div className="mb-8">
                <Card className="bg-gray-900/50 border-green-400/30">
                  <CardHeader>
                    <CardTitle className="text-green-400 flex items-center gap-2">
                      <Bot className="w-5 h-5" />
                      Latest Query Result
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Your most recent AI-powered database query
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Query Info */}
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-blue-400" />
                          <span className="text-blue-400">User:</span>
                          <span className="text-white">
                            {currentQuery.userId}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-purple-400" />
                          <span className="text-purple-400">Time:</span>
                          <span className="text-white">
                            {new Date(currentQuery.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Query Text */}
                      <div className="p-3 bg-blue-900/20 border border-blue-400/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4 text-blue-400" />
                          <span className="text-blue-400 font-medium">
                            Query:
                          </span>
                        </div>
                        <p className="text-white">{currentQuery.query}</p>
                      </div>

                      {/* Results */}
                      <div className="p-3 bg-green-900/20 border border-green-400/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Database className="w-4 h-4 text-green-400" />
                          <span className="text-green-400 font-medium">
                            Results:
                          </span>
                        </div>
                        <QueryResultsDisplay result={currentQuery.result} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Empty State */}
            {!currentQuery && (
              <div className="mt-8">
                <Card className="bg-gray-900/50 border-green-400/30">
                  <CardContent className="pt-12 pb-12 text-center">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Bot className="w-8 h-8 text-green-400" />
                    </div>
                    <h3 className="text-white text-lg font-medium mb-2">
                      No Query Results Yet
                    </h3>
                    <p className="text-gray-400 mb-4">
                      Use the AI assistant to run your first database query
                    </p>
                    <Button
                      onClick={handleBackToDashboard}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Bot className="w-4 h-4 mr-2" />
                      Start Querying
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
