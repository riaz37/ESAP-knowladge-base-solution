"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bot, Sparkles, Database, FileText } from "lucide-react";

export default function AIResultsPage() {
  const [queryResults, setQueryResults] = useState<any[]>([]);

  const handleQueryResult = (result: any) => {
    if (result) {
      setQueryResults((prev) => [result, ...prev.slice(0, 4)]); // Keep last 5 results
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500/30 to-green-600/20 rounded-xl flex items-center justify-center border border-green-500/40">
                <Bot className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  AI Database Assistant
                </h1>
                <p className="text-gray-400">
                  Intelligent database queries with business rules integration
                </p>
              </div>
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
                      <h3 className="text-white font-medium">Business Rules</h3>
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
                      <h3 className="text-white font-medium">Smart Results</h3>
                      <p className="text-gray-400 text-sm">
                        Contextual data insights
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Results */}
          {queryResults.length > 0 && (
            <div className="mt-8">
              <Card className="bg-gray-900/50 border-green-400/30">
                <CardHeader>
                  <CardTitle className="text-green-400">
                    Recent Query Results
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Your latest AI-powered database queries
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {queryResults.map((result, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gray-800/50 border border-green-400/20 rounded-lg"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Bot className="w-4 h-4 text-green-400" />
                          <span className="text-green-400 text-sm font-medium">
                            Query #{queryResults.length - index}
                          </span>
                          <span className="text-gray-500 text-xs">
                            {new Date().toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="bg-gray-900/50 border border-green-400/20 rounded p-3">
                          <pre className="text-white text-xs overflow-auto max-h-32">
                            {JSON.stringify(result, null, 2)}
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
