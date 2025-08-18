import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";

export interface MSSQLConfig {
  id: number;
  db_name: string;
  db_url: string;
  business_rule?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MSSQLConfigsResponse {
  configs: MSSQLConfig[];
  count: number;
}

/**
 * Service for managing MSSQL configurations
 */
export class MSSQLConfigService {
  /**
   * Get all MSSQL configurations (databases)
   */
  static async getMSSQLConfigs(): Promise<MSSQLConfig[]> {
    try {
      const response = await apiClient.get<MSSQLConfigsResponse>(
        API_ENDPOINTS.GET_MSSQL_CONFIGS
      );

      // With API client interceptor, response now contains just the data portion
      if (response && response.configs && Array.isArray(response.configs)) {
        return response.configs;
      } else if (Array.isArray(response)) {
        // If response is directly an array
        return response;
      } else {
        return [];
      }
    } catch (error: any) {
      console.error("Error fetching MSSQL configs:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch MSSQL configurations"
      );
    }
  }

  /**
   * Get a specific MSSQL configuration by ID
   */
  static async getMSSQLConfig(id: number): Promise<MSSQLConfig> {
    try {
      const response = await apiClient.get<MSSQLConfig>(
        API_ENDPOINTS.GET_MSSQL_CONFIG(id)
      );

      return response;
    } catch (error: any) {
      console.error(`Error fetching MSSQL config ${id}:`, error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch MSSQL configuration"
      );
    }
  }

  /**
   * Update an MSSQL configuration
   */
  static async updateMSSQLConfig(
    id: number,
    updates: Partial<MSSQLConfig>
  ): Promise<MSSQLConfig> {
    try {
      const formData = new FormData();
      
      if (updates.db_name) formData.append("db_name", updates.db_name);
      if (updates.db_url) formData.append("db_url", updates.db_url);
      if (updates.business_rule !== undefined) formData.append("business_rule", updates.business_rule);

      const response = await apiClient.put(
        API_ENDPOINTS.UPDATE_MSSQL_CONFIG(id),
        formData
      );

      return response;
    } catch (error: any) {
      console.error(`Error updating MSSQL config ${id}:`, error);
      throw new Error(
        error.response?.data?.message || "Failed to update MSSQL configuration"
      );
    }
  }
}

export default MSSQLConfigService;
