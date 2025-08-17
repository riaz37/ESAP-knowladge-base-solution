import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";

export interface VectorDBConfig {
  id: number;
  host: string;
  port: number;
  database: string;
  schema: string;
  name?: string;
  description?: string;
}

export interface UserTableNamesResponse {
  table_names: string[];
}

/**
 * Service for managing vector database operations
 */
export class VectorDBService {
  /**
   * Get all available vector database configurations
   */
  static async getVectorDBConfigs(): Promise<VectorDBConfig[]> {
    try {
      console.log("Fetching vector DB configs from:", API_ENDPOINTS.GET_VECTOR_DB_CONFIGS);
      const response = await apiClient.get(API_ENDPOINTS.GET_VECTOR_DB_CONFIGS);
      console.log("Raw API response for vector DB configs:", response);
      return response || [];
    } catch (error) {
      console.error("Error fetching vector database configs:", error);
      throw error;
    }
  }

  /**
   * Get available table names for a specific user
   */
  static async getUserTableNames(userId: string): Promise<string[]> {
    try {
      console.log("Fetching table names for user:", userId);
      console.log("API endpoint:", API_ENDPOINTS.GET_USER_TABLE_NAMES(userId));
      const response = await apiClient.get(API_ENDPOINTS.GET_USER_TABLE_NAMES(userId));
      console.log("Raw API response for user table names:", response);
      
      // The API client already extracts the data portion, so response should be the array directly
      if (Array.isArray(response)) {
        return response;
      }
      
      // Fallback: handle the case where response might still be the full object
      if (response && typeof response === 'object' && 'data' in response) {
        return Array.isArray(response.data) ? response.data : [];
      }
      
      // Fallback to the old structure if data field doesn't exist
      return response?.table_names || [];
    } catch (error) {
      console.error(`Error fetching table names for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Create vector database access for a user
   */
  static async createVectorDBAccess(request: {
    user_id: string;
    vector_db_id: number;
    accessible_tables: string[];
    access_level: string;
  }): Promise<any> {
    try {
      // This would use the user-config endpoint to create vector DB access
      const response = await apiClient.post(API_ENDPOINTS.CREATE_USER_CONFIG, {
        user_id: request.user_id,
        access_type: "vector_db",
        vector_db_id: request.vector_db_id,
        accessible_tables: request.accessible_tables,
        access_level: request.access_level,
      });
      return response;
    } catch (error) {
      console.error("Error creating vector DB access:", error);
      throw error;
    }
  }
}

export default VectorDBService; 