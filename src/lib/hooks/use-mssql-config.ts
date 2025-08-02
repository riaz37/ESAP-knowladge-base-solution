import { useState, useEffect } from "react";
import { MSSQLConfigService } from "../api/services/mssql-config-service";
import { 
  MSSQLConfigRequest, 
  MSSQLConfigResponse, 
  MSSQLConfigsListResponse,
  MSSQLConfigData 
} from "@/types/api";

interface UseMSSQLConfigReturn {
  configs: MSSQLConfigData[] | null;
  createConfig: (config: MSSQLConfigRequest) => Promise<MSSQLConfigResponse | null>;
  getConfigs: () => Promise<MSSQLConfigData[] | null>;
  getConfig: (id: number) => Promise<MSSQLConfigData | null>;
  refetch: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  success: boolean;
  clearError: () => void;
  clearSuccess: () => void;
}

export function useMSSQLConfig(): UseMSSQLConfigReturn {
  const [configs, setConfigs] = useState<MSSQLConfigData[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const createConfig = async (
    config: MSSQLConfigRequest
  ): Promise<MSSQLConfigResponse | null> => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate config before sending
      const validation = MSSQLConfigService.validateConfig(config);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(", "));
      }

      const response = await MSSQLConfigService.createMSSQLConfig(config);
      setSuccess(true);
      return response;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to create MSSQL configuration";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getConfigs = async (): Promise<MSSQLConfigData[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await MSSQLConfigService.getMSSQLConfigs();
      const configsData = response.data.configs;
      setConfigs(configsData);
      return configsData;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to fetch MSSQL configurations";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = async (): Promise<void> => {
    await getConfigs();
  };

  // Load configs on mount
  useEffect(() => {
    getConfigs();
  }, []);

  const getConfig = async (id: number): Promise<MSSQLConfigData | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await MSSQLConfigService.getMSSQLConfig(id);
      return response.data;
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
    createConfig,
    getConfigs,
    getConfig,
    refetch,
    isLoading,
    error,
    success,
    clearError,
    clearSuccess,
  };
}

export default useMSSQLConfig;