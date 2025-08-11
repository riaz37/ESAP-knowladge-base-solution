import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";
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

/**
 * Service for New Table Management operations
 */
export class NewTableService {
  /**
   * Create a new table
   */
  static async createTable(request: CreateTableRequest): Promise<CreateTableResponse> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.CREATE_TABLE, request);
      return response;
    } catch (error) {
      console.error("Error creating table:", error);
      throw error;
    }
  }

  /**
   * Get supported SQL Server data types
   */
  static async getDataTypes(): Promise<DataTypesResponse> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.GET_DATA_TYPES);
      return response;
    } catch (error) {
      console.error("Error getting data types:", error);
      throw error;
    }
  }

  /**
   * Get tables created by a specific user
   */
  static async getUserTables(userId: string): Promise<UserTablesResponse> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.GET_USER_TABLES(userId));
      return response;
    } catch (error) {
      console.error("Error getting user tables:", error);
      throw error;
    }
  }

  /**
   * Get all tables in a specific database
   */
  static async getTablesByDatabase(dbId: number): Promise<TablesByDbResponse> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.GET_TABLES_BY_DB(dbId));
      return response;
    } catch (error) {
      console.error("Error getting tables by database:", error);
      throw error;
    }
  }

  /**
   * Setup tracking table for user created tables
   */
  static async setupTrackingTable(): Promise<SetupTrackingTableResponse> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.SETUP_TRACKING_TABLE);
      return response;
    } catch (error) {
      console.error("Error setting up tracking table:", error);
      throw error;
    }
  }

  /**
   * Update user's business rule
   */
  static async updateUserBusinessRule(
    userId: string,
    request: UpdateBusinessRuleRequest
  ): Promise<BusinessRuleResponse> {
    try {
      const response = await apiClient.put(
        API_ENDPOINTS.UPDATE_USER_BUSINESS_RULE(userId),
        request
      );
      return response;
    } catch (error) {
      console.error("Error updating user business rule:", error);
      throw error;
    }
  }

  /**
   * Get user's business rule
   */
  static async getUserBusinessRule(userId: string): Promise<BusinessRuleResponse> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.GET_USER_BUSINESS_RULE(userId));
      return response;
    } catch (error) {
      console.error("Error getting user business rule:", error);
      throw error;
    }
  }

  /**
   * Validate create table request
   */
  static validateCreateTableRequest(request: CreateTableRequest): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!request.user_id || request.user_id.trim() === "") {
      errors.push("User ID is required");
    }

    if (!request.table_name || request.table_name.trim() === "") {
      errors.push("Table name is required");
    }

    if (!request.schema || request.schema.trim() === "") {
      errors.push("Schema is required");
    }

    if (!request.columns || request.columns.length === 0) {
      errors.push("At least one column is required");
    } else {
      // Validate each column
      request.columns.forEach((column, index) => {
        if (!column.name || column.name.trim() === "") {
          errors.push(`Column ${index + 1}: Name is required`);
        }
        if (!column.data_type || column.data_type.trim() === "") {
          errors.push(`Column ${index + 1}: Data type is required`);
        }
      });

      // Check for duplicate column names
      const columnNames = request.columns.map(col => col.name.toLowerCase());
      const duplicates = columnNames.filter((name, index) => columnNames.indexOf(name) !== index);
      if (duplicates.length > 0) {
        errors.push(`Duplicate column names found: ${duplicates.join(", ")}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate business rule request
   */
  static validateBusinessRuleRequest(request: UpdateBusinessRuleRequest): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!request.business_rule || request.business_rule.trim() === "") {
      errors.push("Business rule is required");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export default NewTableService;