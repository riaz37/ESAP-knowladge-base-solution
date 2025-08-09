import { useState, useCallback } from "react";
import { UserConfigService } from "@/lib/api/services/user-config-service";
import {
  UserConfigCreateRequest,
  UserConfigData,
  UserConfigCreateResponse,
} from "@/types/api";

interface UseUserConfigReturn {
  // State
  userConfigs: UserConfigData[];
  currentUserConfig: UserConfigData | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  createUserConfig: (request: UserConfigCreateRequest) => Promise<UserConfigCreateResponse>;
  fetchUserConfigs: () => Promise<void>;
  fetchUserConfig: (userId: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

/**
 * Custom hook for user configuration management
 */
export const useUserConfig = (): UseUserConfigReturn => {
  const [userConfigs, setUserConfigs] = useState<UserConfigData[]>([]);
  const [currentUserConfig, setCurrentUserConfig] = useState<UserConfigData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Create a new user configuration
   */
  const createUserConfig = useCallback(
    async (request: UserConfigCreateRequest): Promise<UserConfigCreateResponse> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await UserConfigService.createUserConfig(request);
        
        // Refresh the user configs list after creation
        await fetchUserConfigs();
        
        return response;
      } catch (err: any) {
        const errorMessage = err?.message || "Failed to create user configuration";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Fetch all user configurations
   */
  const fetchUserConfigs = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await UserConfigService.getUserConfigs();
      // With API client interceptor, response now contains just the data portion
      // The response structure is: {configs: UserConfigData[], count: number}
      setUserConfigs((response as any).configs || []);
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to fetch user configurations";
      setError(errorMessage);
      console.error("Error fetching user configs:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch user configuration by user ID
   */
  const fetchUserConfig = useCallback(async (userId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await UserConfigService.getUserConfig(userId);
      // With API client interceptor, response now contains just the data portion
      setCurrentUserConfig(response || null);
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to fetch user configuration";
      setError(errorMessage);
      console.error("Error fetching user config:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  /**
   * Reset all state
   */
  const reset = useCallback((): void => {
    setUserConfigs([]);
    setCurrentUserConfig(null);
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    // State
    userConfigs,
    currentUserConfig,
    isLoading,
    error,
    
    // Actions
    createUserConfig,
    fetchUserConfigs,
    fetchUserConfig,
    clearError,
    reset,
  };
};

export default useUserConfig;