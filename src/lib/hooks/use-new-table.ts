import { useState, useCallback } from "react";
import { ServiceRegistry } from "../api";

/**
 * Hook for New Table operations using standardized ServiceRegistry
 */
export function useNewTable() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [tableData, setTableData] = useState<any>(null);
  const [supportedTypes, setSupportedTypes] = useState<any>(null);
  const [validationResult, setValidationResult] = useState<any>(null);

  /**
   * Create a new table
   */
  const createTable = useCallback(async (request: {
    table_name: string;
    columns: Array<{
      name: string;
      type: string;
      nullable?: boolean;
      default?: string;
      primary_key?: boolean;
    }>;
    database_id: number;
  }) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await ServiceRegistry.newTable.createTable(request);
      
      if (response.success) {
        setSuccess(true);
        setTableData(response.data);
        return response.data;
      } else {
        throw new Error(response.error || "Failed to create table");
      }
    } catch (e: any) {
      setError(e.message || "Failed to create table");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get table information
   */
  const getTable = useCallback(async (request: {
    table_name: string;
    database_id: number;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await ServiceRegistry.newTable.getTable(request);
      
      if (response.success) {
        setTableData(response.data);
        return response.data;
      } else {
        throw new Error(response.error || "Failed to get table information");
      }
    } catch (e: any) {
      setError(e.message || "Failed to get table information");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update table structure
   */
  const updateTable = useCallback(async (request: {
    table_name: string;
    database_id: number;
    add_columns?: Array<{
      name: string;
      type: string;
      nullable?: boolean;
      default?: string;
      primary_key?: boolean;
    }>;
    drop_columns?: string[];
    modify_columns?: Array<{
      name: string;
      type: string;
      nullable?: boolean;
      default?: string;
    }>;
  }) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await ServiceRegistry.newTable.updateTable(request);
      
      if (response.success) {
        setSuccess(true);
        setTableData(response.data);
        return response.data;
      } else {
        throw new Error(response.error || "Failed to update table");
      }
    } catch (e: any) {
      setError(e.message || "Failed to update table");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete a table
   */
  const deleteTable = useCallback(async (request: {
    table_name: string;
    database_id: number;
  }) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await ServiceRegistry.newTable.deleteTable(request);
      
      if (response.success) {
      setSuccess(true);
        return true;
      } else {
        throw new Error(response.error || "Failed to delete table");
      }
    } catch (e: any) {
      setError(e.message || "Failed to delete table");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get all tables for a database
   */
  const getTablesForDatabase = useCallback(async (databaseId: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await ServiceRegistry.newTable.getTablesForDatabase(databaseId);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error || "Failed to get tables for database");
      }
    } catch (e: any) {
      setError(e.message || "Failed to get tables for database");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Validate table existence
   */
  const validateTableExists = useCallback(async (tableName: string, databaseId: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await ServiceRegistry.newTable.validateTableExists(tableName, databaseId);
      
      if (response.success) {
        setValidationResult(response.data);
        return response.data;
      } else {
        throw new Error(response.error || "Failed to validate table existence");
      }
    } catch (e: any) {
      setError(e.message || "Failed to validate table existence");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Generate table creation SQL
   */
  const generateCreateTableSQL = useCallback((
    tableName: string,
    columns: Array<{
      name: string;
      type: string;
      nullable?: boolean;
      default?: string;
      primary_key?: boolean;
    }>
  ) => {
    try {
      const response = ServiceRegistry.newTable.generateCreateTableSQL(tableName, columns);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error || "Failed to generate SQL");
      }
    } catch (e: any) {
      setError(e.message || "Failed to generate SQL");
      return null;
    }
  }, []);

  /**
   * Get supported column types
   */
  const getSupportedColumnTypes = useCallback(() => {
    const response = ServiceRegistry.newTable.getSupportedColumnTypes();
    
    if (response.success) {
      setSupportedTypes(response.data);
      return response.data;
    }
    
    return null;
  }, []);

  // Clear functions
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearSuccess = useCallback(() => {
    setSuccess(false);
  }, []);

  const clearValidation = useCallback(() => {
    setValidationResult(null);
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setSuccess(false);
    setTableData(null);
    setSupportedTypes(null);
    setValidationResult(null);
  }, []);

  return {
    // State
    loading,
    error,
    success,
    tableData,
    supportedTypes,
    validationResult,

    // Actions
    createTable,
    getTable,
    updateTable,
    deleteTable,
    getTablesForDatabase,
    validateTableExists,
    generateCreateTableSQL,
    getSupportedColumnTypes,

    // Utilities
    clearError,
    clearSuccess,
    clearValidation,
    reset,
  };
}