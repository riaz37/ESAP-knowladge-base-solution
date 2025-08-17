import { useState, useEffect } from "react";
import VectorDBService, { VectorDBConfig } from "@/lib/api/services/vector-db-service";

export function useVectorDB() {
  const [vectorDBConfigs, setVectorDBConfigs] = useState<VectorDBConfig[]>([]);
  const [userTableNames, setUserTableNames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getVectorDBConfigs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await VectorDBService.getVectorDBConfigs();
      
      // Handle different response structures
      let configs: VectorDBConfig[] = [];
      
      if (Array.isArray(response)) {
        configs = response;
      } else if (response && typeof response === 'object') {
        // If response has a data property that's an array
        if (Array.isArray(response.data)) {
          configs = response.data;
        } else if (Array.isArray(response.configs)) {
          configs = response.configs;
        } else if (Array.isArray(response.vector_dbs)) {
          configs = response.vector_dbs;
        } else if (Array.isArray(response.user_configs)) {
          configs = response.user_configs;
        } else {
          // If response is an object but no array found, try to extract any array
          const keys = Object.keys(response);
          for (const key of keys) {
            if (Array.isArray(response[key])) {
              configs = response[key];
              break;
            }
          }
        }
      }
      
      // Ensure we always have an array
      setVectorDBConfigs(Array.isArray(configs) ? configs : []);
      
      console.log("Vector DB configs response:", response);
      console.log("Extracted configs:", configs);
      
    } catch (err: any) {
      console.error("Error fetching vector database configs:", err);
      setError(err?.message || "Failed to fetch vector database configs");
      setVectorDBConfigs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getUserTableNames = async (userId: string) => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await VectorDBService.getUserTableNames(userId);
      
      console.log("User table names response from service:", response);
      
      // The service should now return the array directly, but let's handle both cases
      let tableNames: string[] = [];
      
      if (Array.isArray(response)) {
        tableNames = response;
      } else if (response && typeof response === 'object') {
        if (Array.isArray(response.table_names)) {
          tableNames = response.table_names;
        } else if (Array.isArray(response.data)) {
          tableNames = response.data;
        } else if (Array.isArray(response.tables)) {
          tableNames = response.tables;
        } else {
          // Try to find any array in the response
          const keys = Object.keys(response);
          for (const key of keys) {
            if (Array.isArray(response[key])) {
              tableNames = response[key];
              break;
            }
          }
        }
      }
      
      // Ensure we always have an array
      setUserTableNames(Array.isArray(tableNames) ? tableNames : []);
      
      console.log("User table names response:", response);
      console.log("Extracted table names:", tableNames);
      console.log("Final table names set:", Array.isArray(tableNames) ? tableNames : []);
      
    } catch (err: any) {
      console.error(`Error fetching table names for user ${userId}:`, err);
      setError(err?.message || "Failed to fetch user table names");
      setUserTableNames([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createVectorDBAccess = async (request: {
    user_id: string;
    vector_db_id: number;
    accessible_tables: string[];
    access_level: string;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await VectorDBService.createVectorDBAccess(request);
      return result;
    } catch (err: any) {
      console.error("Error creating vector DB access:", err);
      setError(err?.message || "Failed to create vector DB access");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    vectorDBConfigs,
    userTableNames,
    setUserTableNames,
    isLoading,
    error,
    getVectorDBConfigs,
    getUserTableNames,
    createVectorDBAccess,
    clearError,
  };
} 