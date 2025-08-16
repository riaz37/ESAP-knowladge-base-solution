import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, Clock, CheckCircle, XCircle } from "lucide-react";
import { QueryHistoryItem } from "@/store/query-store";

interface QueryHistoryPanelProps {
  history: QueryHistoryItem[];
  queryType: 'file' | 'database';
  maxItems?: number;
  emptyMessage?: string;
  onQuerySelect?: (query: string) => void;
}

export function QueryHistoryPanel({ 
  history, 
  queryType, 
  maxItems = 10, 
  emptyMessage,
  onQuerySelect 
}: QueryHistoryPanelProps) {
  const getIcon = () => {
    return queryType === 'file' ? <FileText className="h-5 w-5" /> : <Database className="h-5 w-5" />;
  };

  const getEmptyMessage = () => {
    if (emptyMessage) return emptyMessage;
    return queryType === 'file' 
      ? "No file query history yet" 
      : "No database query history yet";
  };

  const getEmptySubMessage = () => {
    return queryType === 'file'
      ? "Execute your first file query to see history"
      : "Execute your first database query to see history";
  };

  const getStatusIcon = (status: string) => {
    return status === 'success' ? (
      <CheckCircle className="h-3 w-3 text-green-600" />
    ) : (
      <XCircle className="h-3 w-3 text-red-600" />
    );
  };

  const handleQueryClick = (query: string) => {
    if (onQuerySelect) {
      onQuerySelect(query);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Recent {queryType === 'file' ? 'File' : 'Database'} Queries
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-auto">
          {history.length > 0 ? (
            history.slice(0, maxItems).map((item) => (
              <div
                key={item.id}
                className={`p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                  onQuerySelect ? 'cursor-pointer' : ''
                }`}
                onClick={() => onQuerySelect && handleQueryClick(item.query)}
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge
                    variant={item.status === 'success' ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {item.status}
                  </Badge>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-sm font-mono text-gray-700 dark:text-gray-300 truncate">
                  {item.query}
                </div>
                {item.executionTime && (
                  <div className="text-xs text-gray-500 mt-1">
                    {item.executionTime.toFixed(2)}s • {item.rowCount} rows
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">
              <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{getEmptyMessage()}</p>
              <p className="text-xs">{getEmptySubMessage()}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Import for the icon
import { FileText, Database } from "lucide-react"; 