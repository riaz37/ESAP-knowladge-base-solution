import { useState, useCallback } from "react";
import { DatabaseConfigService } from "@/lib/api/services/database-config-service";
import {
  DatabaseConfig,
  DatabaseConfigData,
  CreateDatabaseConfigRequest,
  UpdateDatabaseConfigRequest,
} from "@/lib/api/services/database-config-service";

interface UseDatabaseConfigReturn {
  // State
  databaseConfigs: DatabaseConfigData[];
  selectedConfig: DatabaseConfigData | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;

  // Actions
  fetchDatabaseConfigs: () => Promise<{ configs: DatabaseConfigData[]; count: number }>;
  fetchDatabaseConfig: (id: number) => Promise<void>;
  createDatabaseConfig: (
    config: DatabaseConfig,
  ) => Promise<DatabaseConfigData | null>;
  updateDatabaseConfig: (
    id: number,
    config: DatabaseConfig,
  ) => Promise<DatabaseConfigData | null>;
  deleteDatabaseConfig: (id: number) => Promise<boolean>;
  clearError: () => void;
  clearSelectedConfig: () => void;
}

export function useDatabaseConfig(): UseDatabaseConfigReturn {
  const [databaseConfigs, setDatabaseConfigs] = useState<DatabaseConfigData[]>(
    [],
  );
  const [selectedConfig, setSelectedConfig] =
    useState<DatabaseConfigData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all database configurations
   */
  const fetchDatabaseConfigs = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await DatabaseConfigService.getDatabaseConfigs();
      
      // Since API client interceptor already extracts .data, response should be the data structure
      if (response && response.configs && Array.isArray(response.configs)) {
        setDatabaseConfigs(response.configs);
        return response; // Return the response for the calling component
      } else if (Array.isArray(response)) {
        // If response is directly an array
        setDatabaseConfigs(response);
        return { configs: response, count: response.length }; // Return structured response
      } else {
        setDatabaseConfigs([]);
        return { configs: [], count: 0 }; // Return empty response
      }
    } catch (err: any) {
      console.error("Error fetching database configs:", err);
      setError(err.message || "Failed to fetch database configurations");
      setDatabaseConfigs([]);
      return { configs: [], count: 0 }; // Return empty response on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch a specific database configuration
   */
  const fetchDatabaseConfig = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await DatabaseConfigService.getDatabaseConfig(id);
      setSelectedConfig(response);
    } catch (err: any) {
      console.error(`Error fetching database config ${id}:`, err);
      setError(err.message || "Failed to fetch database configuration");
      setSelectedConfig(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Create a new database configuration
   */
  const createDatabaseConfig = useCallback(
    async (config: DatabaseConfig): Promise<DatabaseConfigData | null> => {
      // Validate config
      const validation = DatabaseConfigService.validateDatabaseConfig(config);
      if (!validation.isValid) {
        setError(validation.errors.join(", "));
        return null;
      }

      setIsCreating(true);
      setError(null);

      try {
        const request: CreateDatabaseConfigRequest = { db_config: config };
        const response =
          await DatabaseConfigService.createDatabaseConfig(request);

        // Add to local state
        setDatabaseConfigs((prev) => [...prev, response]);

        return response;
      } catch (err: any) {
        console.error("Error creating database config:", err);
        setError(err.message || "Failed to create database configuration");
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    [],
  );

  /**
   * Update an existing database configuration
   */
  const updateDatabaseConfig = useCallback(
    async (
      id: number,
      config: DatabaseConfig,
    ): Promise<DatabaseConfigData | null> => {
      // Validate config
      const validation = DatabaseConfigService.validateDatabaseConfig(config);
      if (!validation.isValid) {
        setError(validation.errors.join(", "));
        return null;
      }

      setIsUpdating(true);
      setError(null);

      try {
        const request: UpdateDatabaseConfigRequest = { db_config: config };
        const response = await DatabaseConfigService.updateDatabaseConfig(
          id,
          request,
        );

        // Update local state
        setDatabaseConfigs((prev) =>
          prev.map((item) =>
            item.db_id === id ? response.updated_config : item,
          ),
        );

        // Update selected config if it's the one being updated
        if (selectedConfig?.db_id === id) {
          setSelectedConfig(response.updated_config);
        }

        return response.updated_config;
      } catch (err: any) {
        console.error(`Error updating database config ${id}:`, err);
        setError(err.message || "Failed to update database configuration");
        return null;
      } finally {
        setIsUpdating(false);
      }
    },
    [selectedConfig],
  );

  /**
   * Delete a database configuration
   */
  const deleteDatabaseConfig = useCallback(
    async (id: number): Promise<boolean> => {
      setIsDeleting(true);
      setError(null);

      try {
        await DatabaseConfigService.deleteDatabaseConfig(id);

        // Remove from local state
        setDatabaseConfigs((prev) => prev.filter((item) => item.db_id !== id));

        // Clear selected config if it's the one being deleted
        if (selectedConfig?.db_id === id) {
          setSelectedConfig(null);
        }

        return true;
      } catch (err: any) {
        console.error(`Error deleting database config ${id}:`, err);
        setError(err.message || "Failed to delete database configuration");
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [selectedConfig],
  );

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Clear selected config
   */
  const clearSelectedConfig = useCallback(() => {
    setSelectedConfig(null);
  }, []);

  return {
    // State
    databaseConfigs,
    selectedConfig,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,

    // Actions
    fetchDatabaseConfigs,
    fetchDatabaseConfig,
    createDatabaseConfig,
    updateDatabaseConfig,
    deleteDatabaseConfig,
    clearError,
    clearSelectedConfig,
  };
}
