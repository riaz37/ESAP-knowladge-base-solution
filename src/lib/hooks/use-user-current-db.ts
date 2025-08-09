import { useState, useCallback } from "react";
import { UserCurrentDBService } from "@/lib/api/services/user-current-db-service";
import {
  UserCurrentDBRequest,
  UserCurrentDBResponse,
  UserCurrentDBData,
} from "@/types/api";

interface UseUserCurrentDBReturn {
  currentDB: UserCurrentDBData | null;
  isLoading: boolean;
  error: string | null;
  setCurrentDB: (userId: string, request: UserCurrentDBRequest) => Promise<void>;
  getCurrentDB: (userId: string) => Promise<void>;
  clearError: () => void;
}

/**
 * Custom hook for managing user current database operations
 */
export function useUserCurrentDB(): UseUserCurrentDBReturn {
  const [currentDB, setCurrentDBState] = useState<UserCurrentDBData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const setCurrentDB = useCallback(
    async (userId: string, request: UserCurrentDBRequest) => {
      // Validate request
      const validation = UserCurrentDBService.validateRequest(request);
      if (!validation.isValid) {
        setError(validation.errors.join(", "));
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await UserCurrentDBService.setUserCurrentDB(userId, request);
        // With API client interceptor, response now contains just the data portion
        // Cast to UserCurrentDBData since the interceptor extracts the data
        setCurrentDBState((response as any) || null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
        console.error("Error setting current database:", err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const getCurrentDB = useCallback(async (userId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await UserCurrentDBService.getUserCurrentDB(userId);
      // With API client interceptor, response now contains just the data portion
      // Cast to UserCurrentDBData since the interceptor extracts the data
      setCurrentDBState((response as any) || null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      console.error("Error fetching current database:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    currentDB,
    isLoading,
    error,
    setCurrentDB,
    getCurrentDB,
    clearError,
  };
}

export default useUserCurrentDB;