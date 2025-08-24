import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, FileText, CheckCircle, AlertCircle, BarChart3 } from 'lucide-react';

interface FileQueryStatsProps {
  query: string;
  resultCount: number;
  executionTime?: number;
  uploadedFilesCount: number;
  completedFilesCount: number;
  failedFilesCount: number;
  className?: string;
}

export function FileQueryStats({
  query,
  resultCount,
  executionTime,
  uploadedFilesCount,
  completedFilesCount,
  failedFilesCount,
  className = ""
}: FileQueryStatsProps) {
  const successRate = uploadedFilesCount > 0 ? (completedFilesCount / uploadedFilesCount) * 100 : 0;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Query Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Query Length */}
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {query.length}
            </div>
            <div className="text-xs text-gray-500">Characters</div>
          </div>

          {/* Results Count */}
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {resultCount}
            </div>
            <div className="text-xs text-gray-500">Results</div>
          </div>

          {/* Execution Time */}
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {executionTime ? `${executionTime}ms` : 'N/A'}
            </div>
            <div className="text-xs text-gray-500">Execution Time</div>
          </div>

          {/* Success Rate */}
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {successRate.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">Success Rate</div>
          </div>
        </div>

        {/* File Status Summary */}
        {uploadedFilesCount > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium mb-2">File Processing Status</h4>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Total: {uploadedFilesCount}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Completed: {completedFilesCount}
                </span>
              </div>
              
              {failedFilesCount > 0 && (
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Failed: {failedFilesCount}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Query Preview */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium mb-2">Query Preview</h4>
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
              {query}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 