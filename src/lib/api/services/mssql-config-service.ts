import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import {
  MSSQLConfigRequest,
  MSSQLConfigResponse,
  MSSQLConfigsListResponse,
} from "@/types/api";

/**
 * Service for managing MSSQL database configurations
 */
export class MSSQLConfigService {
  /**
   * Create a new MSSQL database configuration
   */
  static async createMSSQLConfig(
    config: MSSQLConfigRequest
  ): Promise<MSSQLConfigResponse> {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.CREATE_MSSQL_CONFIG,
        config
      );
      return response.data;
    } catch (error) {
      console.error("Error creating MSSQL configuration:", error);
      throw error;
    }
  }

  /**
   * Get all MSSQL database configurations
   */
  static async getMSSQLConfigs(): Promise<MSSQLConfigsListResponse> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.GET_MSSQL_CONFIGS);
      return response.data;
    } catch (error) {
      console.error("Error fetching MSSQL configurations:", error);
      throw error;
    }
  }

  /**
   * Get a specific MSSQL database configuration by ID
   */
  static async getMSSQLConfig(id: number): Promise<MSSQLConfigResponse> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.GET_MSSQL_CONFIG(id));
      return response.data;
    } catch (error) {
      console.error(`Error fetching MSSQL configuration ${id}:`, error);
      throw error;
    }
  }

  /**
   * Helper method to build connection string
   */
  static buildConnectionString(params: {
    server: string;
    port?: number;
    database: string;
    username: string;
    password: string;
    driver?: string;
    encrypt?: boolean;
  }): string {
    const {
      server,
      port = 1433,
      database,
      username,
      password,
      driver = "ODBC+Driver+18+for+SQL+Server",
      encrypt = false,
    } = params;

    return `mssql+pyodbc://${username}:${password}@${server}:${port}/${database}?driver=${driver}&Encrypt=${
      encrypt ? "yes" : "no"
    }`;
  }

  /**
   * Validate MSSQL configuration before creating
   */
  static validateConfig(config: MSSQLConfigRequest): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!config.db_url || config.db_url.trim() === "") {
      errors.push("Database URL is required");
    }

    if (!config.db_name || config.db_name.trim() === "") {
      errors.push("Database name is required");
    }

    // Validate connection string format
    if (config.db_url && !config.db_url.startsWith("mssql+pyodbc://")) {
      errors.push("Database URL must be a valid MSSQL connection string");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export default MSSQLConfigService;
