import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Database, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { UserConfigService } from "@/lib/api/services/user-config-service";

interface TableSelectorProps {
  userId: string;
  tableSpecific: boolean;
  selectedTables: string[];
  onTableSpecificChange: (value: boolean) => void;
  onSelectedTablesChange: (tables: string[]) => void;
  className?: string;
}

interface UserTable {
  table_name: string;
  schema_name: string;
  table_full_name: string;
  creation_timestamp: string;
}

export function TableSelector({
  userId,
  tableSpecific,
  selectedTables,
  onTableSpecificChange,
  onSelectedTablesChange,
  className = "",
}: TableSelectorProps) {
  const [availableTables, setAvailableTables] = useState<UserTable[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Get user tables from the API
  const fetchUserTables = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await UserConfigService.getUserTableNames(userId);
      
      if (response && Array.isArray(response)) {
        // Transform the response to match our UserTable interface
        const tables: UserTable[] = response.map(tableName => ({
          table_name: tableName,
          schema_name: "dbo", // Default schema, could be enhanced later
          table_full_name: `dbo.${tableName}`,
          creation_timestamp: new Date().toISOString() // Default timestamp, could be enhanced later
        }));
        
        setAvailableTables(tables);
      } else {
        setAvailableTables([]);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch tables";
      toast.error(errorMessage);
      setAvailableTables([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (tableSpecific && userId) {
      fetchUserTables();
    }
  }, [tableSpecific, userId]);

  const filteredTables = availableTables.filter(table =>
    table.table_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    table.schema_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTableToggle = (tableName: string, checked: boolean) => {
    if (checked) {
      onSelectedTablesChange([...selectedTables, tableName]);
    } else {
      onSelectedTablesChange(selectedTables.filter(t => t !== tableName));
    }
  };

  const handleSelectAll = () => {
    onSelectedTablesChange(filteredTables.map(t => t.table_name));
  };

  const handleDeselectAll = () => {
    onSelectedTablesChange([]);
  };

  const handleRefresh = () => {
    fetchUserTables();
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Table-Specific Query
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Table Specific Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="table-specific" className="text-sm font-medium">
              Enable Table-Specific Query
            </Label>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Query specific tables instead of all available data
            </p>
          </div>
          <Switch
            id="table-specific"
            checked={tableSpecific}
            onCheckedChange={onTableSpecificChange}
          />
        </div>

        {/* Table Selection */}
        {tableSpecific && (
          <div className="space-y-4">
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

            {/* Select All/None Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={filteredTables.length === 0}
              >
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeselectAll}
                disabled={selectedTables.length === 0}
              >
                Deselect All
              </Button>
              <Badge variant="secondary" className="ml-auto">
                {selectedTables.length} selected
              </Badge>
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
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-2 border rounded-lg p-3">
                {filteredTables.map((table) => (
                  <div
                    key={table.table_full_name}
                    className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <Checkbox
                      id={table.table_full_name}
                      checked={selectedTables.includes(table.table_name)}
                      onCheckedChange={(checked) => 
                        handleTableToggle(table.table_name, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={table.table_full_name}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{table.table_name}</span>
                        <Badge variant="outline" className="text-xs">
                          {table.schema_name}
                        </Badge>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            )}

            {/* Warning when no tables selected */}
            {tableSpecific && selectedTables.length === 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                  ⚠️ No tables selected. Please select at least one table to enable table-specific querying.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 