"use client";

import { useState, useEffect } from "react";
import { Database, RefreshCw, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserAccessService } from "@/lib/api/services/user-access-service";
import { MSSQLConfigService } from "@/lib/api/services/mssql-config-service";
import { UserCurrentDBService } from "@/lib/api/services/user-current-db-service";
import { toast } from "sonner";

interface DatabaseInfo {
  db_id: number;
  db_name: string;
  db_url: string;
  access_level: "full" | "read_only" | "limited";
}

interface DatabaseSelectorProps {
  userId: string;
  selectedDatabaseId: number | null;
  onDatabaseChange: (dbId: number, dbName: string) => void;
  className?: string;
  disabled?: boolean;
  showAccessLevel?: boolean;
}

export function DatabaseSelector({
  userId,
  selectedDatabaseId,
  onDatabaseChange,
  className = "",
  disabled = false,
  showAccessLevel = true,
}: DatabaseSelectorProps) {
  const [availableDatabases, setAvailableDatabases] = useState<DatabaseInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load databases for the user
  const loadUserDatabases = async () => {
    if (!userId || userId === "default") {
      setAvailableDatabases([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get user access configuration
      const userAccessResponse = await UserAccessService.getUserAccess(userId);

      // Get all available databases
      const allDatabasesResponse = await MSSQLConfigService.getMSSQLConfigs();
      const allDatabases = allDatabasesResponse.configs || allDatabasesResponse || [];

      // Create a map of accessible databases with their access levels
      const accessibleDatabases: DatabaseInfo[] = [];
      const dbAccessMap = new Map<number, "full" | "read_only" | "limited">();

      // Process user access configs to build database access map
      if (userAccessResponse.access_configs && Array.isArray(userAccessResponse.access_configs)) {
        userAccessResponse.access_configs.forEach((config) => {
          // Add parent databases
          config.database_access?.parent_databases?.forEach((db) => {
            dbAccessMap.set(db.db_id, db.access_level);
          });

          // Add sub databases
          config.database_access?.sub_databases?.forEach((subDb) => {
            subDb.databases?.forEach((db) => {
              // If database already exists with 'full' access, don't downgrade
              if (
                !dbAccessMap.has(db.db_id) ||
                dbAccessMap.get(db.db_id) !== "full"
              ) {
                dbAccessMap.set(db.db_id, db.access_level);
              }
            });
          });
        });
      }

      // Filter databases based on access
      if (Array.isArray(allDatabases)) {
        allDatabases.forEach((db) => {
          if (dbAccessMap.has(db.db_id)) {
            accessibleDatabases.push({
              db_id: db.db_id,
              db_name: db.db_name,
              db_url: db.db_url,
              access_level: dbAccessMap.get(db.db_id)!,
            });
          }
        });
      }

      setAvailableDatabases(accessibleDatabases);

      // Auto-select current database if not already selected
      if (!selectedDatabaseId && accessibleDatabases.length > 0) {
        try {
          const currentDbResponse = await UserCurrentDBService.getUserCurrentDB(userId);
          if (currentDbResponse.db_id) {
            const currentDb = accessibleDatabases.find(
              (db) => db.db_id === currentDbResponse.db_id
            );
            if (currentDb) {
              onDatabaseChange(currentDb.db_id, currentDb.db_name);
            }
          }
        } catch (error) {
          // No current database set, that's okay
          console.log("No current database set for user:", userId);
        }
      }
    } catch (error) {
      console.error("Failed to load user databases:", error);
      setError(error instanceof Error ? error.message : "Failed to load databases");
      setAvailableDatabases([]);
    } finally {
      setLoading(false);
    }
  };

  // Load databases when userId changes
  useEffect(() => {
    loadUserDatabases();
  }, [userId]);

  // Handle database selection
  const handleDatabaseChange = async (dbId: string) => {
    const databaseId = parseInt(dbId);
    const database = availableDatabases.find((db) => db.db_id === databaseId);

    if (!database) {
      toast.error("Database not found");
      return;
    }

    if (databaseId === selectedDatabaseId) {
      return; // Already selected
    }

    try {
      // Set the current database for the user
      await UserCurrentDBService.setUserCurrentDB(userId, {
        db_id: databaseId,
      });

      onDatabaseChange(databaseId, database.db_name);
      toast.success(`Switched to database: ${database.db_name}`);
    } catch (error) {
      console.error("Failed to set database:", error);
      toast.error("Failed to switch database");
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className={`flex items-center gap-2 p-2 bg-gray-800/50 rounded-lg ${className}`}>
        <Loader2 className="w-4 h-4 animate-spin text-green-400" />
        <span className="text-gray-400 text-xs">Loading databases...</span>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className={`flex items-center gap-2 p-2 bg-red-900/20 border border-red-400/30 rounded-lg ${className}`}>
        <AlertCircle className="w-4 h-4 text-red-400" />
        <span className="text-red-300 text-xs flex-1">{error}</span>
        <Button
          size="sm"
          variant="ghost"
          onClick={loadUserDatabases}
          className="text-red-300 hover:bg-red-400/10 text-xs"
        >
          <RefreshCw className="w-3 h-3" />
        </Button>
      </div>
    );
  }

  // Render empty state for default user
  if (userId === "default") {
    return (
      <div className={`p-2 bg-yellow-900/20 border border-yellow-400/30 text-yellow-400 text-xs rounded-lg ${className}`}>
        Please select a user first to view available databases.
      </div>
    );
  }

  // Render empty state for no databases
  if (availableDatabases.length === 0) {
    return (
      <div className={`p-2 bg-yellow-900/20 border border-yellow-400/30 text-yellow-400 text-xs rounded-lg ${className}`}>
        No databases available for this user.
      </div>
    );
  }

  // Render database selector
  return (
    <div className={className}>
      <div className="flex gap-2">
        <Select
          value={selectedDatabaseId?.toString() || ""}
          onValueChange={handleDatabaseChange}
          disabled={disabled}
        >
          <SelectTrigger className="bg-gray-800/50 border-green-400/30 text-white flex-1">
            <SelectValue placeholder="Select database" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-green-400/30 max-h-60 overflow-y-auto">
            {availableDatabases.map((db) => (
              <SelectItem key={db.db_id} value={db.db_id.toString()}>
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-green-400" />
                  <span>{db.db_name}</span>
                  {showAccessLevel && (
                    <Badge variant="outline" className="ml-auto text-xs">
                      {db.access_level}
                    </Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={loadUserDatabases}
          className="text-green-400 hover:bg-green-400/10 border border-green-400/30"
          disabled={disabled}
        >
          <RefreshCw className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}