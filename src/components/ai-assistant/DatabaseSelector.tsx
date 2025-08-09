"use client";

import React, { useState, useEffect } from "react";
import { Database, ChevronDown, Check, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { MSSQLConfigService } from "@/lib/api/services/mssql-config-service";
import { UserCurrentDBService } from "@/lib/api/services/user-current-db-service";
import { toast } from "sonner";

interface DatabaseConfig {
  db_id: number;
  db_name: string;
  db_url: string;
  created_at: string;
  updated_at: string;
}

interface DatabaseSelectorProps {
  userId: string;
  currentDbId?: number;
  onDatabaseChange?: (dbId: number, dbName: string) => void;
  className?: string;
}

export function DatabaseSelector({
  userId,
  currentDbId,
  onDatabaseChange,
  className = "",
}: DatabaseSelectorProps) {
  const [databases, setDatabases] = useState<DatabaseConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [settingDatabase, setSettingDatabase] = useState(false);
  const [selectedDb, setSelectedDb] = useState<DatabaseConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load available databases
  useEffect(() => {
    loadDatabases();
  }, []);

  // Set selected database when currentDbId changes
  useEffect(() => {
    if (currentDbId && databases.length > 0) {
      const db = databases.find(d => d.db_id === currentDbId);
      setSelectedDb(db || null);
    }
  }, [currentDbId, databases]);

  const loadDatabases = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await MSSQLConfigService.getMSSQLConfigs();
      
      // Handle different response formats
      let dbList: DatabaseConfig[] = [];
      if (response.configs && Array.isArray(response.configs)) {
        dbList = response.configs;
      } else if (Array.isArray(response)) {
        dbList = response;
      } else if (response.data && Array.isArray(response.data)) {
        dbList = response.data;
      }
      
      setDatabases(dbList);
      
      // If no current database is selected and we have databases, select the first one
      if (!currentDbId && dbList.length > 0) {
        setSelectedDb(dbList[0]);
      }
    } catch (error) {
      console.error("Failed to load databases:", error);
      setError("Failed to load available databases");
      toast.error("Failed to load available databases");
    } finally {
      setLoading(false);
    }
  };

  const handleDatabaseSelect = async (database: DatabaseConfig) => {
    if (database.db_id === selectedDb?.db_id) return;

    try {
      setSettingDatabase(true);
      
      // Set the current database for the user
      await UserCurrentDBService.setUserCurrentDB(userId, {
        db_id: database.db_id,
      });
      
      setSelectedDb(database);
      onDatabaseChange?.(database.db_id, database.db_name);
      
      toast.success(`Switched to database: ${database.db_name}`);
    } catch (error) {
      console.error("Failed to set database:", error);
      toast.error("Failed to switch database");
    } finally {
      setSettingDatabase(false);
    }
  };

  const formatDatabaseName = (name: string) => {
    return name.length > 20 ? `${name.substring(0, 20)}...` : name;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Loader2 className="w-4 h-4 animate-spin text-green-400" />
        <span className="text-gray-400 text-sm">Loading databases...</span>
      </div>
    );
  }

  if (error || databases.length === 0) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <AlertCircle className="w-4 h-4 text-red-400" />
        <span className="text-red-400 text-sm">
          {error || "No databases available"}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Database className="w-4 h-4 text-green-400" />
      <span className="text-gray-400 text-sm">Database:</span>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="border-green-400/30 text-green-400 hover:bg-green-400/10 h-7 px-3"
            disabled={settingDatabase}
          >
            {settingDatabase ? (
              <Loader2 className="w-3 h-3 animate-spin mr-1" />
            ) : (
              <Database className="w-3 h-3 mr-1" />
            )}
            {selectedDb ? formatDatabaseName(selectedDb.db_name) : "Select Database"}
            <ChevronDown className="w-3 h-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          align="start" 
          className="w-80 bg-gray-900 border-gray-700"
        >
          <DropdownMenuLabel className="text-gray-300">
            Available Databases ({databases.length})
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-gray-700" />
          
          {databases.map((database) => (
            <DropdownMenuItem
              key={database.db_id}
              onClick={() => handleDatabaseSelect(database)}
              className="cursor-pointer hover:bg-gray-800 focus:bg-gray-800 p-3"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Database className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-medium text-sm">
                      {database.db_name}
                    </span>
                    <span className="text-gray-400 text-xs">
                      ID: {database.db_id} • Created: {formatDate(database.created_at)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {selectedDb?.db_id === database.db_id && (
                    <Badge className="bg-green-900/20 text-green-400 border-green-400/30 text-xs">
                      <Check className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  )}
                </div>
              </div>
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator className="bg-gray-700" />
          <DropdownMenuItem
            onClick={loadDatabases}
            className="cursor-pointer hover:bg-gray-800 focus:bg-gray-800 text-gray-400 text-xs"
          >
            <Loader2 className="w-3 h-3 mr-2" />
            Refresh Databases
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {selectedDb && (
        <Badge className="bg-green-900/20 text-green-400 border-green-400/30 text-xs">
          ID: {selectedDb.db_id}
        </Badge>
      )}
    </div>
  );
}