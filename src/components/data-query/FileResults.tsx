import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { File, Download, Copy, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

export interface FileQueryResult {
  id: string;
  answer?: string;
  confidence?: string;
  sources_used?: number;
  query?: string;
  [key: string]: any; // Allow for additional properties
}

interface FileResultsProps {
  results: FileQueryResult[];
  query: string;
  isLoading?: boolean;
  className?: string;
}

export function FileResults({ results, query, isLoading = false, className = "" }: FileResultsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Pagination calculations
  const totalPages = Math.ceil(results.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentResults = results.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1); // Reset to first page
  };

  // Copy result to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  // Export results
  const exportResults = () => {
    const csvContent = [
      ['Query', 'Answer', 'Confidence', 'Sources Used'],
      ...results.map(result => [
        query,
        result.answer || '',
        result.confidence || '',
        result.sources_used || 0
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `file-query-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Results exported successfully');
  };

  // Get result display content
  const getResultContent = (result: FileQueryResult) => {
    if (result.answer) {
      return result.answer;
    }
    
    // If no answer, try to find other content
    const contentKeys = Object.keys(result).filter(key => 
      key !== 'id' && 
      key !== 'confidence' && 
      key !== 'sources_used' && 
      key !== 'query' &&
      typeof result[key] === 'string' &&
      result[key].length > 0
    );
    
    if (contentKeys.length > 0) {
      return result[contentKeys[0]];
    }
    
    return 'No content available';
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Processing query...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!results || results.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center">
            <File className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No results found for your query. Try rephrasing your question or uploading different files.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <File className="w-5 h-5" />
            Query Results
            <Badge variant="secondary" className="ml-2">
              {results.length} results
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={exportResults}
            disabled={results.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Results List */}
        <div className="space-y-4">
          {currentResults.map((result, index) => (
            <div
              key={result.id || index}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  {/* Result Content */}
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                      {getResultContent(result)}
                    </p>
                  </div>
                  
                  {/* Metadata */}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {result.confidence && (
                      <span>Confidence: {result.confidence}</span>
                    )}
                    {result.sources_used !== undefined && (
                      <span>Sources: {result.sources_used}</span>
                    )}
                    {result.query && (
                      <span>Query: {result.query}</span>
                    )}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(getResultContent(result))}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing {startIndex + 1} to {Math.min(endIndex, results.length)} of {results.length} results
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Items Per Page */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span>Show:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span>per page</span>
        </div>
      </CardContent>
    </Card>
  );
} 