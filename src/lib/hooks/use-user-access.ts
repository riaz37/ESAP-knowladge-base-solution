import { useState } from "react";
import { UserAccessService } from "../api/services/user-access-service";
import {
  UserAccessCreateRequest,
  UserAccessCreateResponse,
  UserAccessData,
} from "@/types/api";

interface UseUserAccessReturn {
  createUserAccess: (
    config: UserAccessCreateRequest
  ) => Promise<UserAccessCreateResponse | null>;
  getUserAccessConfigs: () => Promise<UserAccessData[] | null>;
  getUserAccess: (userId: string) => Promise<UserAccessData[] | null>;
  userAccessConfigs: UserAccessData[]; // Added this to store fetched data
  isLoading: boolean;
  error: string | null;
  success: boolean;
  clearError: () => void;
  clearSuccess: () => void;
}

export function useUserAccess(): UseUserAccessReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [userAccessConfigs, setUserAccessConfigs] = useState<UserAccessData[]>([]); // Added state

  const createUserAccess = async (
    config: UserAccessCreateRequest
  ): Promise<UserAccessCreateResponse | null> => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate access configuration before sending
      const validation = UserAccessService.validateUserAccess(config);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(", "));
      }

      const response = await UserAccessService.createUserAccess(config);
      setSuccess(true);
      return response;
    } catch (err: any) {
      const errorMessage =
        err?.message || "Failed to create user access configuration";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getUserAccessConfigs = async (): Promise<UserAccessData[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await UserAccessService.getUserAccessConfigs();
      
      // Debug logging to understand the actual response structure
      console.log('useUserAccess - Raw response:', response);
      console.log('useUserAccess - Response type:', typeof response);
      console.log('useUserAccess - Response keys:', response ? Object.keys(response) : 'null');
      
      // With the API client interceptor, response now contains just the data portion
      // The response structure is: {access_configs: UserAccessData[], count: number}
      const configs = (response as any).access_configs || null;
      
      console.log('useUserAccess - Extracted configs:', configs);
      console.log('useUserAccess - Configs type:', typeof configs);
      console.log('useUserAccess - Is array:', Array.isArray(configs));
      
      // Store the fetched data in state
      if (configs && Array.isArray(configs)) {
        setUserAccessConfigs(configs);
        console.log('useUserAccess - Set configs in state:', configs);
      } else {
        console.log('useUserAccess - No valid configs found, setting empty array');
        setUserAccessConfigs([]);
      }
      
      return configs;
    } catch (err: any) {
      console.error("Hook: Error in getUserAccessConfigs:", err);
      const errorMessage =
        err?.message || "Failed to fetch user access configurations";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getUserAccess = async (
    userId: string
  ): Promise<UserAccessData[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await UserAccessService.getUserAccess(userId);
      // With the API client interceptor, response now contains just the data portion
      // The response structure is: {user_id: string, access_configs: UserAccessData[], count: number}
      const configs = (response as any).access_configs || null;
      
      // Store the fetched data in state
      if (configs && Array.isArray(configs)) {
        setUserAccessConfigs(configs);
      }
      
      return configs;
    } catch (err: any) {
      const errorMessage =
        err?.message || `Failed to fetch access for user ${userId}`;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);
  const clearSuccess = () => setSuccess(false);

  return {
    createUserAccess,
    getUserAccessConfigs,
    getUserAccess,
    userAccessConfigs, // Added this to return the stored data
    isLoading,
    error,
    success,
    clearError,
    clearSuccess,
  };
}

export default useUserAccess;
