"use client";

import React from "react";
import { Brain, Database, Users, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface VectorDBAccessEmptyStateProps {
  onGoToUserAccess?: () => void;
}

export function VectorDBAccessEmptyState({
  onGoToUserAccess,
}: VectorDBAccessEmptyStateProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <Brain className="w-20 h-20 text-purple-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-3">
          Vector Database Access Management
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Configure vector database access for users to enable AI operations, semantic search, and intelligent data querying
        </p>
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-700/50 border-slate-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-400" />
              User Selection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 text-sm">
              Choose a user from the Database Access tab to configure their vector database permissions and table access
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-700/50 border-slate-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg flex items-center">
              <Database className="w-5 h-5 mr-2 text-green-400" />
              Vector Database Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 text-sm">
              Select from available vector databases and configure access levels for AI operations and semantic queries
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-700/50 border-slate-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg flex items-center">
              <Brain className="w-5 h-5 mr-2 text-purple-400" />
              AI Operations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 text-sm">
              Enable semantic search, vector embeddings, and intelligent data analysis for selected users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Section */}
      <div className="text-center">
        <div className="bg-slate-700/30 rounded-lg border border-slate-600 p-6 max-w-md mx-auto">
          <h3 className="text-lg font-medium text-white mb-3">
            Ready to Configure Vector Access?
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            Start by selecting a user from the Database Access tab to configure their vector database permissions
          </p>
          {onGoToUserAccess && (
            <Button
              onClick={onGoToUserAccess}
              className="bg-purple-600 hover:bg-purple-700 w-full"
              size="lg"
            >
              <Users className="w-4 h-4 mr-2" />
              Go to Database Access
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>

      {/* Features List */}
      <div className="bg-slate-700/20 rounded-lg border border-slate-600 p-6">
        <h3 className="text-lg font-medium text-white mb-4 text-center">
          Vector Database Access Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center text-gray-300">
              <CheckCircle className="w-4 h-4 text-purple-400 mr-2" />
              User-specific vector database access
            </div>
            <div className="flex items-center text-gray-300">
              <CheckCircle className="w-4 h-4 text-purple-400 mr-2" />
              Configurable access levels (2-10)
            </div>
            <div className="flex items-center text-gray-300">
              <CheckCircle className="w-4 h-4 text-purple-400 mr-2" />
              Table-level permissions for AI operations
            </div>
            <div className="flex items-center text-gray-300">
              <CheckCircle className="w-4 h-4 text-purple-400 mr-2" />
              Vector operation enablement
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center text-gray-300">
              <CheckCircle className="w-4 h-4 text-purple-400 mr-2" />
              AI query capabilities
            </div>
            <div className="flex items-center text-gray-300">
              <CheckCircle className="w-4 h-4 text-purple-400 mr-2" />
              Semantic search access
            </div>
            <div className="flex items-center text-gray-300">
              <CheckCircle className="w-4 h-4 text-purple-400 mr-2" />
              Embedding generation
            </div>
            <div className="flex items-center text-gray-300">
              <CheckCircle className="w-4 h-4 text-purple-400 mr-2" />
              Real-time access management
            </div>
          </div>
        </div>
      </div>

      {/* Key Differences */}
      <div className="bg-slate-700/30 rounded-lg border border-slate-600 p-6">
        <h3 className="text-lg font-medium text-white mb-4 text-center">
          Key Differences: Database Access vs Vector DB Access
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="text-blue-400 font-medium flex items-center">
              <Database className="w-4 h-4 mr-2" />
              Database Access (MSSQL)
            </h4>
            <div className="space-y-2 text-sm text-gray-300">
              <div>• Traditional SQL database operations</div>
              <div>• Table management and data querying</div>
              <div>• Business rule enforcement</div>
              <div>• Company hierarchy associations</div>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="text-purple-400 font-medium flex items-center">
              <Brain className="w-4 h-4 mr-2" />
              Vector DB Access (AI)
            </h4>
            <div className="space-y-2 text-sm text-gray-300">
              <div>• AI-powered semantic search</div>
              <div>• Vector embeddings and similarity</div>
              <div>• Intelligent data analysis</div>
              <div>• Natural language queries</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 