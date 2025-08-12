import { useState } from "react";
import { NewTableService } from "../api/services/new-table-service";
import {
  CreateTableRequest,
  CreateTableResponse,
  DataTypesResponse,
  UserTablesResponse,
  TablesByDbResponse,
  SetupTrackingTableResponse,
  UpdateBusinessRuleRequest,
  BusinessRuleResponse,
} from "@/types/api";

interface UseNewTableReturn {
  // Table operations
  createTable: (request: CreateTableRequest) => Promise<CreateTableResponse["data"] | null>;
  getUserTables: (userId: string) => Promise<UserTablesResponse["data"] | null>;
  getTablesByDatabase: (dbId: number) => Promise<TablesByDbResponse["data"] | null>;
  
  // Data types
  getDataTypes: () => Promise<DataTypesResponse["data"] | null>;
  
  // Setup operations
  setupTrackingTable: () => Promise<SetupTrackingTableResponse["data"] | null>;
  
  // Business rules
  updateUserBusinessRule: (
    userId: string,
    request: UpdateBusinessRuleRequest
  ) => Promise<BusinessRuleResponse["data"] | null>;
  getUserBusinessRule: (userId: string) => Promise<BusinessRuleResponse["data"] | null>;
  
  // State management
  isLoading: boolean;
  error: string | null;
  success: boolean;
  
  // Utility functions
  clearError: () => void;
  clearSuccess: () => void;
}

export function useNewTable(): UseNewTableReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const createTable = async (
    request: CreateTableRequest
  ): Promise<CreateTableResponse["data"] | null> => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate request before sending
      const validation = NewTableService.validateCreateTableRequest(request);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(", "));
      }

      const response = await NewTableService.createTable(request);
      setSuccess(true);
      return response;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to create table";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getUserTables = async (userId: string): Promise<UserTablesResponse["data"] | null> => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (!userId || userId.trim() === "") {
        throw new Error("User ID is required");
      }

      const response = await NewTableService.getUserTables(userId);
      setSuccess(true);
      return response;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to get user tables";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getTablesByDatabase = async (dbId: number): Promise<TablesByDbResponse["data"] | null> => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (!dbId || dbId <= 0) {
        throw new Error("Valid database ID is required");
      }

      const response = await NewTableService.getTablesByDatabase(dbId);
      setSuccess(true);
      return response;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to get tables by database";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getDataTypes = async (): Promise<DataTypesResponse["data"] | null> => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await NewTableService.getDataTypes();
      setSuccess(true);
      return response;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to get data types";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const setupTrackingTable = async (): Promise<SetupTrackingTableResponse["data"] | null> => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await NewTableService.setupTrackingTable();
      setSuccess(true);
      return response;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to setup tracking table";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserBusinessRule = async (
    userId: string,
    request: UpdateBusinessRuleRequest
  ): Promise<BusinessRuleResponse["data"] | null> => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (!userId || userId.trim() === "") {
        throw new Error("User ID is required");
      }

      // Validate request before sending
      const validation = NewTableService.validateBusinessRuleRequest(request);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(", "));
      }

      const response = await NewTableService.updateUserBusinessRule(userId, request);
      setSuccess(true);
      return response;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to update business rule";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getUserBusinessRule = async (userId: string): Promise<BusinessRuleResponse["data"] | null> => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (!userId || userId.trim() === "") {
        throw new Error("User ID is required");
      }

      const response = await NewTableService.getUserBusinessRule(userId);
      setSuccess(true);
      return response;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to get business rule";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const clearSuccess = () => {
    setSuccess(false);
  };

  return {
    createTable,
    getUserTables,
    getTablesByDatabase,
    getDataTypes,
    setupTrackingTable,
    updateUserBusinessRule,
    getUserBusinessRule,
    isLoading,
    error,
    success,
    clearError,
    clearSuccess,
  };
}

export default useNewTable;