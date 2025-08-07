import { useState, useCallback } from "react";
import { MSSQLConfigService } from "@/lib/api/services/mssql-config-service";
import {
  GenerateTableInfoRequest,
  GenerateTableInfoResponse,
  TaskStatusResponse,
  GenerateMatchedTablesRequest,
  GenerateMatchedTablesResponse,
} from "@/types/api";

/**
 * Hook for managing MSSQL table operations (generate table info, matched tables, task status)
 */
export function useMSSQLTableOperations() {
  const [isGeneratingTableInfo, setIsGeneratingTableInfo] = useState(false);
  const [isGeneratingMatchedTables, setIsGeneratingMatchedTables] = useState(false);
  const [isFetchingTaskStatus, setIsFetchingTaskStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Generate table info for a database
   */
  const generateTableInfo = useCallback(
    async (
      dbId: number,
      userId: string
    ): Promise<GenerateTableInfoResponse | null> => {
      setIsGeneratingTableInfo(true);
      setError(null);

      try {
        const request: GenerateTableInfoRequest = { user_id: userId };
        const response = await MSSQLConfigService.generateTableInfo(dbId, request);
        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to generate table info";
        setError(errorMessage);
        console.error("Error generating table info:", err);
        return null;
      } finally {
        setIsGeneratingTableInfo(false);
      }
    },
    []
  );

  /**
   * Get task status by task ID
   */
  const getTaskStatus = useCallback(
    async (taskId: string): Promise<TaskStatusResponse | null> => {
      setIsFetchingTaskStatus(true);
      setError(null);

      try {
        const response = await MSSQLConfigService.getTaskStatus(taskId);
        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch task status";
        setError(errorMessage);
        console.error("Error fetching task status:", err);
        return null;
      } finally {
        setIsFetchingTaskStatus(false);
      }
    },
    []
  );

  /**
   * Generate matched tables for a database
   */
  const generateMatchedTables = useCallback(
    async (
      dbId: number,
      userId: string
    ): Promise<GenerateMatchedTablesResponse | null> => {
      setIsGeneratingMatchedTables(true);
      setError(null);

      try {
        const request: GenerateMatchedTablesRequest = { user_id: userId };
        const response = await MSSQLConfigService.generateMatchedTables(dbId, request);
        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to generate matched tables";
        setError(errorMessage);
        console.error("Error generating matched tables:", err);
        return null;
      } finally {
        setIsGeneratingMatchedTables(false);
      }
    },
    []
  );

  /**
   * Poll task status until completion
   */
  const pollTaskStatus = useCallback(
    async (
      taskId: string,
      onUpdate?: (status: TaskStatusResponse) => void,
      pollInterval: number = 2000,
      maxAttempts: number = 30
    ): Promise<TaskStatusResponse | null> => {
      let attempts = 0;

      const poll = async (): Promise<TaskStatusResponse | null> => {
        if (attempts >= maxAttempts) {
          setError("Task polling timeout - maximum attempts reached");
          return null;
        }

        attempts++;
        const statusResponse = await getTaskStatus(taskId);

        if (!statusResponse) {
          return null;
        }

        onUpdate?.(statusResponse);

        const { status } = statusResponse.data;

        if (status === "completed" || status === "failed") {
          return statusResponse;
        }

        // Continue polling
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        return poll();
      };

      return poll();
    },
    [getTaskStatus]
  );

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    isGeneratingTableInfo,
    isGeneratingMatchedTables,
    isFetchingTaskStatus,
    error,

    // Actions
    generateTableInfo,
    getTaskStatus,
    generateMatchedTables,
    pollTaskStatus,
    clearError,
  };
}

export default useMSSQLTableOperations;