import { useState, useCallback } from "react";
import { MSSQLConfigService } from "../api/services/mssql-config-service";
import { 
  MSSQLConfigData,
  MSSQLConfigFormRequest,
  MSSQLConfigTaskResponse,
  MSSQLConfigTaskStatusResponse 
} from "@/types/api";

interface UseMSSQLConfigReturn {
  configs: MSSQLConfigData[] | null;
  setConfig: (config: MSSQLConfigFormRequest & { user_id: string }) => Promise<MSSQLConfigTaskResponse | null>;
  updateConfig: (id: number, config: MSSQLConfigFormRequest & { user_id: string }) => Promise<MSSQLConfigTaskResponse | null>;
  setConfigAndWait: (config: MSSQLConfigFormRequest & { user_id: string }, onProgress?: (progress: number, status: string) => void) => Promise<MSSQLConfigTaskStatusResponse | null>;
  updateConfigAndWait: (id: number, config: MSSQLConfigFormRequest & { user_id: string }, onProgress?: (progress: number, status: string) => void) => Promise<MSSQLConfigTaskStatusResponse | null>;
  pollTaskStatus: (taskId: string, onProgress?: (progress: number, status: string) => void) => Promise<MSSQLConfigTaskStatusResponse | null>;
  getConfigs: () => Promise<MSSQLConfigData[] | null>;
  getConfig: (id: number) => Promise<MSSQLConfigData | null>;
  refetch: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  success: boolean;
  taskProgress: number;
  taskStatus: string | null;
  clearError: () => void;
  clearSuccess: () => void;
}

export function useMSSQLConfig(): UseMSSQLConfigReturn {
  const [configs, setConfigs] = useState<MSSQLConfigData[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [taskProgress, setTaskProgress] = useState(0);
  const [taskStatus, setTaskStatus] = useState<string | null>(null);

  const setConfig = async (
    config: MSSQLConfigFormRequest & { user_id: string }
  ): Promise<MSSQLConfigTaskResponse | null> => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setTaskProgress(0);
    setTaskStatus(null);

    try {
      // Validate form config before sending
      const validation = MSSQLConfigService.validateFormConfig(config);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(", "));
      }

      const response = await MSSQLConfigService.setMSSQLConfig(config);
      setSuccess(true);
      return response;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to set MSSQL configuration";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateConfig = async (
    id: number,
    config: MSSQLConfigFormRequest & { user_id: string }
  ): Promise<MSSQLConfigTaskResponse | null> => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setTaskProgress(0);
    setTaskStatus(null);

    try {
      // Validate form config before sending
      const validation = MSSQLConfigService.validateFormConfig(config);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(", "));
      }

      const response = await MSSQLConfigService.updateMSSQLConfig(id, config);
      setSuccess(true);
      return response;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to update MSSQL configuration";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const pollTaskStatus = async (
    taskId: string,
    onProgress?: (progress: number, status: string) => void
  ): Promise<MSSQLConfigTaskStatusResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await MSSQLConfigService.pollTaskStatus(
        taskId,
        (progress, status) => {
          setTaskProgress(progress);
          setTaskStatus(status);
          if (onProgress) {
            onProgress(progress, status);
          }
        }
      );
      
      if (response.data.status === 'success') {
        setSuccess(true);
      } else if (response.data.status === 'failed') {
        setError(response.data.error || 'Task failed');
      }
      
      return response;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to poll task status";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const setConfigAndWait = async (
    config: MSSQLConfigFormRequest & { user_id: string },
    onProgress?: (progress: number, status: string) => void
  ): Promise<MSSQLConfigTaskStatusResponse | null> => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setTaskProgress(0);
    setTaskStatus(null);

    try {
      // Validate form config before sending
      const validation = MSSQLConfigService.validateFormConfig(config);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(", "));
      }

      const response = await MSSQLConfigService.setMSSQLConfigAndWait(
        config,
        (progress, status) => {
          setTaskProgress(progress);
          setTaskStatus(status);
          if (onProgress) {
            onProgress(progress, status);
          }
        }
      );
      
      if (response.data.status === 'success') {
        setSuccess(true);
      } else if (response.data.status === 'failed') {
        setError(response.data.error || 'Task failed');
      }
      
      return response;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to set MSSQL configuration";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateConfigAndWait = async (
    id: number,
    config: MSSQLConfigFormRequest & { user_id: string },
    onProgress?: (progress: number, status: string) => void
  ): Promise<MSSQLConfigTaskStatusResponse | null> => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setTaskProgress(0);
    setTaskStatus(null);

    try {
      // Validate form config before sending
      const validation = MSSQLConfigService.validateFormConfig(config);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(", "));
      }

      const response = await MSSQLConfigService.updateMSSQLConfigAndWait(
        id,
        config,
        (progress, status) => {
          setTaskProgress(progress);
          setTaskStatus(status);
          if (onProgress) {
            onProgress(progress, status);
          }
        }
      );
      
      if (response.data.status === 'success') {
        setSuccess(true);
      } else if (response.data.status === 'failed') {
        setError(response.data.error || 'Task failed');
      }
      
      return response;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to update MSSQL configuration";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getConfigs = useCallback(async (): Promise<MSSQLConfigData[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("Fetching MSSQL configurations...");
      const response = await MSSQLConfigService.getMSSQLConfigs();
      console.log("Raw API response:", response);
      
      // Handle the expected API response structure based on MSSQLConfigsListResponse
      if (!response) {
        throw new Error("API response is null or undefined");
      }
      
      // The API client already extracts the data, so response IS the MSSQLConfigsListResponse
      // Check if response has the expected structure
      let configsData: MSSQLConfigData[];
      
      // With API client interceptor, response now contains just the data portion
      if (response.configs && Array.isArray(response.configs)) {
        configsData = response.configs;
      } else if (Array.isArray(response)) {
        // If response is directly an array of configs
        configsData = response;
      } else if (response.configs && Array.isArray(response.configs)) {
        // If response has configs property directly
        configsData = response.configs;
      } else {
        console.error("Unexpected response structure:", response);
        throw new Error("No configs found in API response - unexpected structure");
      }
      
      if (!Array.isArray(configsData)) {
        throw new Error("Configs data is not an array");
      }
      
      console.log("Extracted configs data:", configsData);
      setConfigs(configsData);
      return configsData;
    } catch (err: any) {
      console.error("Error in getConfigs:", err);
      const errorMessage = err?.message || "Failed to fetch MSSQL configurations";
      setError(errorMessage);
      setConfigs(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refetch = useCallback(async (): Promise<void> => {
    await getConfigs();
  }, [getConfigs]);

  // Remove automatic loading on mount - only fetch when explicitly called

  const getConfig = async (id: number): Promise<MSSQLConfigData | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await MSSQLConfigService.getMSSQLConfig(id);
      // With the API client interceptor, response now contains just the data portion
      return response || null;
    } catch (err: any) {
      const errorMessage = err?.message || `Failed to fetch MSSQL configuration ${id}`;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);
  const clearSuccess = () => setSuccess(false);

  return {
    configs,
    setConfig,
    updateConfig,
    setConfigAndWait,
    updateConfigAndWait,
    pollTaskStatus,
    getConfigs,
    getConfig,
    refetch,
    isLoading,
    error,
    success,
    taskProgress,
    taskStatus,
    clearError,
    clearSuccess,
  };
}

export default useMSSQLConfig;