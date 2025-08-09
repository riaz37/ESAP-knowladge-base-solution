import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import {
  MSSQLConfigRequest,
  MSSQLConfigResponse,
  MSSQLConfigsListResponse,
  GenerateTableInfoRequest,
  GenerateTableInfoResponse,
  TaskStatusResponse,
  GenerateMatchedTablesRequest,
  GenerateMatchedTablesResponse,
  MSSQLConfigFormRequest,
} from "@/types/api";

/**
 * Service for managing MSSQL database configurations
 */
export class MSSQLConfigService {
  /**
   * Allowed database file extensions
   */
  static readonly ALLOWED_FILE_TYPES = [
    ".bak",
    ".sql",
    ".mdf",
    ".ldf",
    ".trn",
    ".dmp",
    ".dump",
  ];

  /**
   * Create a new MSSQL database configuration (JSON format)
   */
  static async createMSSQLConfig(
    config: MSSQLConfigRequest
  ): Promise<any> {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.CREATE_MSSQL_CONFIG,
        config
      );
      // With API client interceptor, response already contains the data portion
      return response;
    } catch (error) {
      console.error("Error creating MSSQL configuration:", error);
      throw error;
    }
  }

  /**
   * Create a new MSSQL database configuration with file upload (multipart/form-data)
   */
  static async createMSSQLConfigWithFile(
    config: MSSQLConfigFormRequest
  ): Promise<any> {
    try {
      // Validate file type if file is provided
      if (config.file) {
        const isValidFile = this.validateDatabaseFile(config.file);
        if (!isValidFile.isValid) {
          throw new Error(isValidFile.error);
        }
      }

      const formData = new FormData();
      formData.append("db_url", config.db_url);
      formData.append("db_name", config.db_name);

      if (config.business_rule) {
        formData.append("business_rule", config.business_rule);
      }

      if (config.file) {
        formData.append("file", config.file);
      }

      const response = await apiClient.post(
        API_ENDPOINTS.CREATE_MSSQL_CONFIG,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      // With API client interceptor, response already contains the data portion
      return response;
    } catch (error) {
      console.error("Error creating MSSQL configuration with file:", error);
      throw error;
    }
  }

  /**
   * Get all MSSQL database configurations
   */
  static async getMSSQLConfigs(): Promise<any> {
    try {
      console.log("Making API call to:", API_ENDPOINTS.GET_MSSQL_CONFIGS);
      const response = await apiClient.get(API_ENDPOINTS.GET_MSSQL_CONFIGS);
      console.log("API response received:", response);
      // With API client interceptor, response already contains the data portion
      return response;
    } catch (error) {
      console.error("Error fetching MSSQL configurations:", error);
      console.error("API endpoint:", API_ENDPOINTS.GET_MSSQL_CONFIGS);
      throw error;
    }
  }

  /**
   * Get a specific MSSQL database configuration by ID
   */
  static async getMSSQLConfig(id: number): Promise<MSSQLConfigResponse> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.GET_MSSQL_CONFIG(id));
      // With API client interceptor, response already contains the data portion
      return response;
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
   * Generate table info for a specific MSSQL database configuration
   */
  static async generateTableInfo(
    id: number,
    request: GenerateTableInfoRequest
  ): Promise<GenerateTableInfoResponse> {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.GENERATE_TABLE_INFO(id),
        request
      );
      // With API client interceptor, response already contains the data portion
      return response;
    } catch (error) {
      console.error(`Error generating table info for database ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get task status by task ID
   */
  static async getTaskStatus(taskId: string): Promise<TaskStatusResponse> {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.GET_TASK_STATUS(taskId)
      );
      // With API client interceptor, response already contains the data portion
      return response;
    } catch (error) {
      console.error(`Error fetching task status ${taskId}:`, error);
      throw error;
    }
  }

  /**
   * Generate matched tables for a specific MSSQL database configuration
   */
  static async generateMatchedTables(
    id: number,
    request: GenerateMatchedTablesRequest
  ): Promise<GenerateMatchedTablesResponse> {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.GENERATE_MATCHED_TABLES(id),
        request
      );
      // With API client interceptor, response already contains the data portion
      return response;
    } catch (error) {
      console.error(
        `Error generating matched tables for database ${id}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Validate database file type
   */
  static validateDatabaseFile(file: File): {
    isValid: boolean;
    error?: string;
  } {
    if (!file) {
      return { isValid: false, error: "No file provided" };
    }

    const fileName = file.name.toLowerCase();
    const hasValidExtension = this.ALLOWED_FILE_TYPES.some((ext) =>
      fileName.endsWith(ext.toLowerCase())
    );

    if (!hasValidExtension) {
      return {
        isValid: false,
        error: `Invalid file type. Allowed types: ${this.ALLOWED_FILE_TYPES.join(
          ", "
        )}`,
      };
    }

    // Check file size (optional - you can adjust the limit as needed)
    const maxSizeInMB = 500; // 500MB limit
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

    if (file.size > maxSizeInBytes) {
      return {
        isValid: false,
        error: `File size exceeds ${maxSizeInMB}MB limit`,
      };
    }

    return { isValid: true };
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

  /**
   * Validate MSSQL form configuration before creating
   */
  static validateFormConfig(config: MSSQLConfigFormRequest): {
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

    // Validate file if provided
    if (config.file) {
      const fileValidation = this.validateDatabaseFile(config.file);
      if (!fileValidation.isValid && fileValidation.error) {
        errors.push(fileValidation.error);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export default MSSQLConfigService;
