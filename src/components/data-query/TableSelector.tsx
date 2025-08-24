import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Database, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ServiceRegistry } from "@/lib/api";
import { useAuthContext } from "@/components/providers";

interface TableSelectorProps {
  databaseId?: number | null;
  onTableSelect: (tableName: string) => void;
  className?: string;
}

export function TableSelector({
  databaseId,
  onTableSelect,
  className = "",
}: TableSelectorProps) {
  const { user } = useAuthContext();
  const [availableTables, setAvailableTables] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Get user tables from the API using authenticated service
  const fetchUserTables = async () => {
    if (!user?.user_id) {
      setError("Please log in to view tables");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Use endpoint that requires user ID parameter
      const response = await ServiceRegistry.vectorDB.getUserTableNames(user.user_id);
      
      if (response.success && response.data && Array.isArray(response.data)) {
        setAvailableTables(response.data);
      } else {
        setAvailableTables([]);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch tables";
      console.error("Failed to fetch user tables:", error);
      setError(errorMessage);
      setAvailableTables([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.user_id) {
      fetchUserTables();
    }
  }, [user?.user_id, databaseId]);

  const filteredTables = availableTables.filter(tableName =>
    tableName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTableClick = (tableName: string) => {
    onTableSelect(tableName);
    toast.success(`Selected table: ${tableName}`);
  };

  const handleRefresh = () => {
    fetchUserTables();
  };

  if (!user?.user_id) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Database className="h-12 w-12 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500 text-sm">
              Please log in to view available tables
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Available Tables
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
            {/* Search and Actions */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tables..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Tables List */}
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-500">Loading tables...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-500 text-sm">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  className="mt-2"
                >
                  Try Again
                </Button>
              </div>
            ) : filteredTables.length === 0 ? (
              <div className="text-center py-8">
                <Database className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500 text-sm">
                  {searchTerm ? "No tables match your search" : "No tables available"}
                </p>
            {!searchTerm && (
              <p className="text-gray-400 text-xs mt-1">
                Tables will appear here once you have access to a database
              </p>
            )}
              </div>
            ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="secondary" className="text-xs">
                {filteredTables.length} table{filteredTables.length !== 1 ? 's' : ''} found
                        </Badge>
                      </div>
            <div className="max-h-64 overflow-y-auto space-y-1 border rounded-lg p-2">
              {filteredTables.map((tableName) => (
                <Button
                  key={tableName}
                  variant="ghost"
                  className="w-full justify-start text-left h-auto p-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => handleTableClick(tableName)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <Database className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    <span className="font-medium truncate">{tableName}</span>
                  </div>
                </Button>
                ))}
              </div>
          </div>
        )}

        {/* Info message */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-blue-800 dark:text-blue-200 text-sm">
            💡 Click on a table name to add it to your query
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 