"use client";

import { useMemo } from "react";
import { Loader2, Database } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";


import { useDatabaseSelector } from "@/lib/hooks/use-database-selector";


interface DatabaseSelectorProps {
  /**
   * Currently authenticated / selected user ID
   */
  userId: string;
  /**
   * Currently active database ID (if any)
   */
  currentDbId?: number;
  /**
   * Callback fired when the database is changed
   */
  onDatabaseChange?: (dbId: number, dbName: string) => void;
  /**
   * Optional CSS classes for the wrapper element
   */
  className?: string;
}

export function DatabaseSelector({
  userId,
  currentDbId,
  onDatabaseChange,
  className,
}: DatabaseSelectorProps) {
  // Hook returns the full list of databases and utility methods
  const {
    databases,
    currentDbName,
    loading: dbLoading,
    error: dbError,
    selectDatabase,
    refreshDatabases,
  } = useDatabaseSelector(userId);

  // All databases returned from the server (no access filtering requested)
  const visibleDatabases = useMemo(() => databases, [databases]);

  const isLoading = dbLoading;
  const errorText = dbError;

  

  const handleChange = async (value: string) => {
    const dbId = parseInt(value);
    const db = visibleDatabases.find((d) => d.db_id === dbId);
    if (!db) return;

    const success = await selectDatabase(dbId);
    if (success && onDatabaseChange) {
      onDatabaseChange(dbId, db.db_name);
    }
  };

  return (
    <div className={className}>
      {isLoading ? (
        <div className="flex items-center gap-2 p-2 bg-gray-800/50 rounded-lg">
          <Loader2 className="w-4 h-4 animate-spin text-green-400" />
          <span className="text-gray-400 text-xs">Loading databases...</span>
        </div>
      ) : errorText ? (
        <div className="flex items-center gap-2 p-2 bg-red-900/20 border border-red-400/30 rounded-lg">
          <span className="text-red-300 text-xs">{errorText}</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={refreshDatabases}
            className="text-red-300 hover:bg-red-400/10 text-xs"
          >
            Retry
          </Button>
        </div>
      ) : visibleDatabases.length === 0 ? (
        <div className="p-2 bg-yellow-900/20 border border-yellow-400/30 text-yellow-400 text-xs rounded-lg">
          No databases available for this user.
        </div>
      ) : (
        <Select
          value={currentDbId?.toString() || ""}
          onValueChange={handleChange}
        >
          <SelectTrigger className="bg-gray-800/50 border-green-400/30 text-white justify-between w-full">
            <SelectValue placeholder="Select database" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={refreshDatabases}
              className="ml-auto text-green-400 hover:bg-green-400/10"
            >
              Refresh
            </Button>
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-green-400/30 max-h-60 overflow-y-auto">
            {visibleDatabases.map((db) => (
              <SelectItem key={db.db_id} value={db.db_id.toString()}>
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-green-400" />
                  <span>{db.db_name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

export default DatabaseSelector;
