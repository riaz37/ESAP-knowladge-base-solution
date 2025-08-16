"use client";

import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { UserCurrentDBService } from '@/lib/api/services/user-current-db-service';
import { BusinessRulesService } from '@/lib/api/services/business-rules-service';

interface UserContextData {
  userId: string;
  databaseId: number | null;
  databaseName: string;
  businessRules: string;
  hasBusinessRules: boolean;
  isLoading: boolean;
  error: string | null;
  refreshUserConfig: () => Promise<void>;
  setUserId: (userId: string) => void;
}

const UserContext = createContext<UserContextData | null>(null);

export { UserContext };

export function useUserContext() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserContextProvider');
  }
  return context;
}

export function UserContextProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserIdState] = useState<string>("");
  const [databaseId, setDatabaseId] = useState<number | null>(null);
  const [databaseName, setDatabaseName] = useState<string>("");
  const [businessRules, setBusinessRules] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Load user configuration from localStorage on mount
  useEffect(() => {
    const savedUserId = localStorage.getItem("currentUserId");
    if (savedUserId) {
      setUserIdState(savedUserId);
    }
    setHasInitialized(true);
  }, []);

  // Load user configuration when userId changes (only if we have a valid userId)
  useEffect(() => {
    if (hasInitialized && userId && userId.trim()) {
      loadUserConfiguration();
    } else if (hasInitialized && (!userId || !userId.trim())) {
      // No user configured, set default state
      setDatabaseId(null);
      setDatabaseName("");
      setBusinessRules("");
      setIsLoading(false);
    }
  }, [userId, hasInitialized]);

  const loadUserConfiguration = async () => {
    if (!userId.trim()) {
      // No user configured, set default state
      setDatabaseId(null);
      setDatabaseName("");
      setBusinessRules("");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Load current database configuration
      try {
        const currentDB = await UserCurrentDBService.getUserCurrentDB(userId);
        if (currentDB && currentDB.db_id) {
          setDatabaseId(currentDB.db_id);
          // You might want to fetch the actual database name from your database service
          setDatabaseName(`Database ${currentDB.db_id}`);
        } else {
          setDatabaseId(null);
          setDatabaseName("");
        }
      } catch (error) {
        console.log("No current database configured for user:", userId);
        setDatabaseId(null);
        setDatabaseName("");
      }

      // Load business rules
      try {
        const rules = await BusinessRulesService.getBusinessRules(userId);
        setBusinessRules(rules || "");
      } catch (error) {
        console.log("No business rules configured for user:", userId);
        setBusinessRules("");
      }
    } catch (error) {
      console.error("Failed to load user configuration:", error);
      setError("Failed to load user configuration");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUserConfig = useCallback(async () => {
    await loadUserConfiguration();
  }, [userId]);

  const setUserId = useCallback((newUserId: string) => {
    setUserIdState(newUserId);
    localStorage.setItem("currentUserId", newUserId);
  }, []);

  const hasBusinessRules = businessRules.trim().length > 0;

  const value: UserContextData = {
    userId,
    databaseId,
    databaseName,
    businessRules,
    hasBusinessRules,
    isLoading,
    error,
    refreshUserConfig,
    setUserId
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
} 