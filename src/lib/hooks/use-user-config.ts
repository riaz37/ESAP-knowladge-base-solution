import { useState, useCallback } from "react";
import { UserConfigService } from "@/lib/api/services/user-config-service";
import {
  UserConfigCreateRequest,
  UserConfigCreateResponse,
  UserConfigResponse,
  UserConfigsListResponse,
  UserConfigByDbResponse,
  UserConfigUpdateRequest,
  UserConfigUpdateResponse,
  AddUserTableNameRequest,
  UserTableNameActionResponse,
  GetUserTableNamesResponse,
} from "@/types/api";

interface UseUserConfigReturn {
  configs: UserConfigsListResponse | null;
  currentConfig: UserConfigResponse | null;
  configsByDb: UserConfigByDbResponse | null;
  tableNames: GetUserTableNamesResponse | null;
  isLoading: boolean;
  error: string | null;
  createUserConfig: (
    request: UserConfigCreateRequest,
  ) => Promise<UserConfigCreateResponse | null>;
  getUserConfigs: () => Promise<void>;
  getUserConfig: (userId: string) => Promise<void>;
  getUserConfigByDb: (userId: string, dbId: number) => Promise<void>;
  getConfigById: (id: number) => Promise<void>;
  updateUserConfig: (
    id: number,
    request: UserConfigUpdateRequest,
  ) => Promise<UserConfigUpdateResponse | null>;
  addUserTableName: (
    userId: string,
    request: AddUserTableNameRequest,
  ) => Promise<UserTableNameActionResponse | null>;
  getUserTableNames: (userId: string) => Promise<void>;
  deleteUserTableName: (
    userId: string,
    tableName: string,
  ) => Promise<UserTableNameActionResponse | null>;
  clearError: () => void;
}

/**
 * Custom hook for managing user configuration operations
 */
export function useUserConfig(): UseUserConfigReturn {
  const [configs, setConfigs] = useState<UserConfigsListResponse | null>(null);
  const [currentConfig, setCurrentConfig] = useState<UserConfigResponse | null>(
    null,
  );
  const [configsByDb, setConfigsByDb] = useState<UserConfigByDbResponse | null>(
    null,
  );
  const [tableNames, setTableNames] =
    useState<GetUserTableNamesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const createUserConfig = useCallback(
    async (
      request: UserConfigCreateRequest,
    ): Promise<UserConfigCreateResponse | null> => {
      // Validate request
      const validation = UserConfigService.validateCreateRequest(request);
      if (!validation.isValid) {
        setError(validation.errors.join(", "));
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await UserConfigService.createUserConfig(request);
        return response;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
        console.error("Error creating user configuration:", err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const getUserConfigs = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await UserConfigService.getUserConfigs();
      setConfigs(response);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      console.error("Error fetching user configurations:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUserConfig = useCallback(async (userId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await UserConfigService.getUserConfig(userId);
      setCurrentConfig(response);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      console.error("Error fetching user configuration:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUserConfigByDb = useCallback(
    async (userId: string, dbId: number) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await UserConfigService.getUserConfigByDb(
          userId,
          dbId,
        );
        setConfigsByDb(response);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
        console.error("Error fetching user configuration by database:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const getConfigById = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await UserConfigService.getConfigById(id);
      setCurrentConfig(response);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      console.error("Error fetching configuration by ID:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUserConfig = useCallback(
    async (
      id: number,
      request: UserConfigUpdateRequest,
    ): Promise<UserConfigUpdateResponse | null> => {
      // Validate request
      const validation = UserConfigService.validateUpdateRequest(request);
      if (!validation.isValid) {
        setError(validation.errors.join(", "));
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await UserConfigService.updateUserConfig(id, request);
        return response;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
        console.error("Error updating user configuration:", err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const addUserTableName = useCallback(
    async (
      userId: string,
      request: AddUserTableNameRequest,
    ): Promise<UserTableNameActionResponse | null> => {
      // Validate request
      const validation = UserConfigService.validateAddTableNameRequest(request);
      if (!validation.isValid) {
        setError(validation.errors.join(", "));
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await UserConfigService.addUserTableName(
          userId,
          request,
        );
        // Refresh table names after adding
        const refreshResponse =
          await UserConfigService.getUserTableNames(userId);
        setTableNames(refreshResponse);
        return response;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
        console.error("Error adding table name:", err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const getUserTableNames = useCallback(async (userId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await UserConfigService.getUserTableNames(userId);
      setTableNames(response);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      console.error("Error fetching table names:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteUserTableName = useCallback(
    async (
      userId: string,
      tableName: string,
    ): Promise<UserTableNameActionResponse | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await UserConfigService.deleteUserTableName(
          userId,
          tableName,
        );
        // Refresh table names after deleting
        const refreshResponse =
          await UserConfigService.getUserTableNames(userId);
        setTableNames(refreshResponse);
        return response;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
        console.error("Error deleting table name:", err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    configs,
    currentConfig,
    configsByDb,
    tableNames,
    isLoading,
    error,
    createUserConfig,
    getUserConfigs,
    getUserConfig,
    getUserConfigByDb,
    getConfigById,
    updateUserConfig,
    addUserTableName,
    getUserTableNames,
    deleteUserTableName,
    clearError,
  };
}

export default useUserConfig;
