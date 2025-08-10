import { useState, useEffect, useCallback } from "react";
import UserAccessService from "@/lib/api/services/user-access-service";
import UserCurrentDBService from "@/lib/api/services/user-current-db-service";
import { BusinessRulesService } from "@/lib/api";
import { toast } from "sonner";

interface UserDatabase {
  db_id: number;
  db_name: string;
  access_level: 'full' | 'read_only' | 'limited';
}

interface UserContextData {
  userId: string;
  availableDatabases: UserDatabase[];
  currentDbId?: number;
  currentDbName?: string;
  businessRules?: string;
  hasBusinessRules: boolean;
}

interface UserContextState {
  users: Array<{ id: string; name: string }>;
  currentUserData: UserContextData | null;
  loading: boolean;
  error: string | null;
}

/**
 * Optimized hook that fetches all user-related data in a single efficient call
 * Reduces API calls by combining user access, database info, and business rules
 */
export function useUserContext() {
  const [state, setState] = useState<UserContextState>({
    users: [],
    currentUserData: null,
    loading: true,
    error: null,
  });

  // Cache to avoid refetching the same data
  const [userDataCache, setUserDataCache] = useState<Map<string, UserContextData>>(new Map());

  /**
   * Load all available users (only called once)
   */
  const loadUsers = useCallback(async () => {
    try {
      const response = await UserAccessService.getUserAccessConfigs();
      const users = new Map<string, string>();
      
      response.access_configs.forEach(config => {
        if (config.user_id && !users.has(config.user_id)) {
          users.set(config.user_id, config.user_id);
        }
      });
      
      const userList = Array.from(users.entries()).map(([id, name]) => ({ id, name }));
      
      setState(prev => ({
        ...prev,
        users: userList,
        error: null,
      }));
      
      return userList;
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setState(prev => ({
        ...prev,
        error: "Failed to load users",
      }));
      throw error;
    }
  }, []);

  /**
   * Load complete user context data efficiently
   * Makes parallel API calls and caches results
   */
  const loadUserContext = useCallback(async (userId: string) => {
    // Check cache first
    if (userDataCache.has(userId)) {
      setState(prev => ({
        ...prev,
        currentUserData: userDataCache.get(userId)!,
        loading: false,
        error: null,
      }));
      return userDataCache.get(userId)!;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Make parallel API calls for efficiency
      const [userAccessResponse, currentDbResponse, businessRulesResponse] = await Promise.allSettled([
        UserAccessService.getUserAccess(userId),
        UserCurrentDBService.getUserCurrentDB(userId).catch(() => null), // Handle 404 gracefully
        BusinessRulesService.getBusinessRules(userId).catch(() => ""), // Handle missing rules gracefully
      ]);

      // Process user access data to get available databases
      let availableDatabases: UserDatabase[] = [];
      if (userAccessResponse.status === 'fulfilled' && userAccessResponse.value.database_access) {
        const dbAccess = userAccessResponse.value.database_access;
        
        // Combine parent and sub databases
        const parentDbs = dbAccess.parent_databases?.map(db => ({
          db_id: db.db_id,
          db_name: db.db_name || `Database ${db.db_id}`,
          access_level: db.access_level,
        })) || [];

        const subDbs = dbAccess.sub_databases?.flatMap(subDb => 
          subDb.databases?.map(db => ({
            db_id: db.db_id,
            db_name: db.db_name || `Database ${db.db_id}`,
            access_level: db.access_level,
          })) || []
        ) || [];

        // Remove duplicates based on db_id
        const dbMap = new Map<number, UserDatabase>();
        [...parentDbs, ...subDbs].forEach(db => {
          if (!dbMap.has(db.db_id) || dbMap.get(db.db_id)!.access_level !== 'full') {
            dbMap.set(db.db_id, db);
          }
        });
        
        availableDatabases = Array.from(dbMap.values());
      }

      // Process current database
      let currentDbId: number | undefined;
      let currentDbName: string | undefined;
      if (currentDbResponse.status === 'fulfilled' && currentDbResponse.value) {
        currentDbId = currentDbResponse.value.db_id;
        currentDbName = currentDbResponse.value.db_name || 
          availableDatabases.find(db => db.db_id === currentDbId)?.db_name;
      }

      // Process business rules
      const businessRules = businessRulesResponse.status === 'fulfilled' 
        ? businessRulesResponse.value || ""
        : "";

      const userData: UserContextData = {
        userId,
        availableDatabases,
        currentDbId,
        currentDbName,
        businessRules,
        hasBusinessRules: businessRules.trim().length > 0,
      };

      // Cache the result
      setUserDataCache(prev => new Map(prev).set(userId, userData));

      setState(prev => ({
        ...prev,
        currentUserData: userData,
        loading: false,
        error: null,
      }));

      return userData;
    } catch (error) {
      console.error("Failed to load user context:", error);
      const errorMessage = "Failed to load user data";
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw new Error(errorMessage);
    }
  }, [userDataCache]);

  /**
   * Switch to a different database for the current user
   */
  const switchDatabase = useCallback(async (dbId: number) => {
    if (!state.currentUserData) {
      throw new Error("No user selected");
    }

    const database = state.currentUserData.availableDatabases.find(db => db.db_id === dbId);
    if (!database) {
      throw new Error("Database not found");
    }

    if (dbId === state.currentUserData.currentDbId) {
      return true; // Already selected
    }

    try {
      await UserCurrentDBService.setUserCurrentDB(state.currentUserData.userId, { db_id: dbId });
      
      // Update current user data
      const updatedUserData = {
        ...state.currentUserData,
        currentDbId: dbId,
        currentDbName: database.db_name,
      };

      // Update cache
      setUserDataCache(prev => new Map(prev).set(state.currentUserData!.userId, updatedUserData));
      
      setState(prev => ({
        ...prev,
        currentUserData: updatedUserData,
      }));

      toast.success(`Switched to database: ${database.db_name}`);
      return true;
    } catch (error) {
      console.error("Failed to switch database:", error);
      toast.error("Failed to switch database");
      return false;
    }
  }, [state.currentUserData]);

  /**
   * Refresh user data (clears cache and refetches)
   */
  const refreshUserData = useCallback(async (userId?: string) => {
    const targetUserId = userId || state.currentUserData?.userId;
    if (!targetUserId) return;

    // Clear cache for this user
    setUserDataCache(prev => {
      const newCache = new Map(prev);
      newCache.delete(targetUserId);
      return newCache;
    });

    await loadUserContext(targetUserId);
  }, [state.currentUserData?.userId, loadUserContext]);

  /**
   * Initialize the hook
   */
  useEffect(() => {
    loadUsers().catch(() => {
      // Error already handled in loadUsers
    });
  }, [loadUsers]);

  return {
    // State
    users: state.users,
    currentUserData: state.currentUserData,
    loading: state.loading,
    error: state.error,
    
    // Actions
    loadUserContext,
    switchDatabase,
    refreshUserData,
    
    // Computed values
    hasCurrentUser: !!state.currentUserData,
    hasCurrentDatabase: !!state.currentUserData?.currentDbId,
    availableDatabases: state.currentUserData?.availableDatabases || [],
    businessRulesStatus: state.currentUserData?.hasBusinessRules ? 'loaded' : 'none',
  };
}