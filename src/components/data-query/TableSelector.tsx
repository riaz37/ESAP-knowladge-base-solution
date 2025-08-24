import React, { useState, useEffect } from "react";
// Card components removed - now handled by parent component
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
      toast.error("Failed to load tables", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch tables on mount and when databaseId changes
  useEffect(() => {
    if (user?.user_id) {
      fetchUserTables();
    }
  }, [user?.user_id, databaseId]);

  // Filter tables based on search term
  const filteredTables = availableTables.filter((table) =>
    table.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle refresh
  const handleRefresh = () => {
    fetchUserTables();
  };

  if (!user?.user_id) {
    return (
      <div className={className}>
        <div className="text-center py-8">
          <Database className="h-12 w-12 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-400 text-sm">
            Please log in to view available tables
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-4">
        {/* Search and Actions */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tables..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800/50 border-gray-600/30 text-white placeholder:text-gray-400"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="border-green-400/30 text-green-400 hover:bg-green-400/10"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-6">
            <Loader2 className="h-8 w-8 mx-auto text-green-400 animate-spin mb-2" />
            <p className="text-gray-400 text-sm">Loading tables...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-6">
            <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="mt-2 border-red-400/30 text-red-400 hover:bg-red-400/10"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Tables List */}
        {!isLoading && !error && (
          <>
            {filteredTables.length === 0 ? (
              <div className="text-center py-6">
                <Database className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-400 text-sm">
                  {availableTables.length === 0 
                    ? "No tables found" 
                    : "No tables match your search"
                  }
                </p>
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchTerm("")}
                    className="mt-2 text-green-400 hover:bg-green-400/10"
                  >
                    Clear search
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">
                    {filteredTables.length} table{filteredTables.length !== 1 ? 's' : ''} found
                  </p>
                  <Badge variant="outline" className="border-green-400/30 text-green-400">
                    {filteredTables.length}
                  </Badge>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {filteredTables.map((table) => (
                    <Button
                      key={table}
                      variant="ghost"
                      size="sm"
                      onClick={() => onTableSelect(table)}
                      className="w-full justify-start text-left p-3 h-auto border border-gray-600/30 hover:bg-green-400/10 hover:border-green-400/30"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <Database className="h-4 w-4 text-green-400" />
                        <span className="text-white font-mono text-sm">{table}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Help Text */}
        <div className="text-xs text-gray-400 space-y-1">
          <p>💡 Click on a table name to add it to your query</p>
          <p>🔍 Use the search box to find specific tables</p>
        </div>
      </div>
    </div>
  );
} 