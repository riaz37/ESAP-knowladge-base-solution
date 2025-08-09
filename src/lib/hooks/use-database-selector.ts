import { useState, useEffect } from "react";
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

/**
 * Hook for managing database selection functionality
 */
export function useDatabaseSelector(userId: string) {
  const [databases, setDatabases] = useState<DatabaseConfig[]>([]);
  const [currentDbId, setCurrentDbId] = useState<number | undefined>();
  const [currentDbName, setCurrentDbName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [settingDatabase, setSettingDatabase] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load available databases on mount
  useEffect(() => {
    loadDatabases();
  }, []);

  // Load current user database on mount
  useEffect(() => {
    if (userId) {
      loadCurrentDatabase();
    }
  }, [userId]);

  // Update selected database when currentDbId changes
  useEffect(() => {
    if (currentDbId && databases.length > 0) {
      const db = databases.find(d => d.db_id === currentDbId);
      if (db) {
        setCurrentDbName(db.db_name);
      }
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
    } catch (error) {
      console.error("Failed to load databases:", error);
      setError("Failed to load available databases");
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentDatabase = async () => {
    try {
      const response = await UserCurrentDBService.getUserCurrentDB(userId);
      if (response.db_id) {
        setCurrentDbId(response.db_id);
      }
    } catch (error) {
      console.error("Failed to load current database:", error);
      // Don't show error toast for this as it's not critical
    }
  };

  const selectDatabase = async (dbId: number) => {
    const database = databases.find(db => db.db_id === dbId);
    if (!database) {
      toast.error("Database not found");
      return false;
    }

    if (dbId === currentDbId) {
      return true; // Already selected
    }

    try {
      setSettingDatabase(true);
      
      // Set the current database for the user
      await UserCurrentDBService.setUserCurrentDB(userId, {
        db_id: dbId,
      });
      
      setCurrentDbId(dbId);
      setCurrentDbName(database.db_name);
      
      toast.success(`Switched to database: ${database.db_name}`);
      return true;
    } catch (error) {
      console.error("Failed to set database:", error);
      toast.error("Failed to switch database");
      return false;
    } finally {
      setSettingDatabase(false);
    }
  };

  const refreshDatabases = async () => {
    await loadDatabases();
    toast.success("Database list refreshed");
  };

  const getCurrentDatabase = () => {
    return databases.find(db => db.db_id === currentDbId) || null;
  };

  return {
    // State
    databases,
    currentDbId,
    currentDbName,
    loading,
    settingDatabase,
    error,
    
    // Actions
    selectDatabase,
    refreshDatabases,
    loadDatabases,
    loadCurrentDatabase,
    
    // Computed
    getCurrentDatabase,
    hasCurrentDatabase: !!currentDbId,
    databaseCount: databases.length,
  };
}

export default useDatabaseSelector;