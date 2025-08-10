import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import {
  MSSQLConfigResponse,
  MSSQLConfigsListResponse,
  GenerateTableInfoRequest,
  GenerateTableInfoResponse,
  GenerateMatchedTablesRequest,
  GenerateMatchedTablesResponse,
  MSSQLConfigFormRequest,
  MSSQLConfigTaskResponse,
  MSSQLConfigTaskStatusResponse,
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
   * Set MSSQL database configuration (new task-based API)
   */
  static async setMSSQLConfig(
    config: MSSQLConfigFormRequest & { user_id: string }
  ): Promise<MSSQLConfigTaskResponse> {
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
      formData.append("user_id", config.user_id);

      if (config.business_rule) {
        formData.append("business_rule", config.business_rule);
      } else {
        formData.append("business_rule", "");
      }

      if (config.file) {
        formData.append("file", config.file);
      } else {
        formData.append("file", "");
      }

      const response = await apiClient.post(
        API_ENDPOINTS.SET_MSSQL_CONFIG,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response;
    } catch (error) {
      console.error("Error setting MSSQL configuration:", error);
      throw error;
    }
  }

  /**
   * Update MSSQL database configuration (new task-based API)
   */
  static async updateMSSQLConfig(
    id: number,
    config: MSSQLConfigFormRequest & { user_id: string }
  ): Promise<MSSQLConfigTaskResponse> {
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
      formData.append("user_id", config.user_id);

      if (config.business_rule) {
        formData.append("business_rule", config.business_rule);
      } else {
        formData.append("business_rule", "");
      }

      if (config.file) {
        formData.append("file", config.file);
      } else {
        formData.append("file", "");
      }

      const response = await apiClient.put(
        API_ENDPOINTS.UPDATE_MSSQL_CONFIG(id),
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response;
    } catch (error) {
      console.error("Error updating MSSQL configuration:", error);
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
   * Get task status by task ID (new API structure)
   */
  static async getTaskStatus(taskId: string): Promise<MSSQLConfigTaskStatusResponse> {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.GET_TASK_STATUS(taskId)
      );
      return response;
    } catch (error) {
      console.error(`Error fetching task status ${taskId}:`, error);
      throw error;
    }
  }

  /**
   * Poll task status until completion
   */
  static async pollTaskStatus(
    taskId: string,
    onProgress?: (progress: number, status: string) => void,
    maxAttempts: number = 60,
    intervalMs: number = 2000
  ): Promise<MSSQLConfigTaskStatusResponse> {
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        const response = await this.getTaskStatus(taskId);
        const taskData = response.data;
        
        if (onProgress) {
          onProgress(taskData.progress, taskData.status);
        }
        
        if (taskData.status === 'success' || taskData.status === 'failed') {
          return response;
        }
        
        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, intervalMs));
        attempts++;
      } catch (error) {
        console.error(`Error polling task status ${taskId}:`, error);
        attempts++;
        if (attempts >= maxAttempts) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
    }
    
    throw new Error(`Task ${taskId} did not complete within ${maxAttempts} attempts`);
  }

  /**
   * Set MSSQL config and wait for completion
   */
  static async setMSSQLConfigAndWait(
    config: MSSQLConfigFormRequest & { user_id: string },
    onProgress?: (progress: number, status: string) => void
  ): Promise<MSSQLConfigTaskStatusResponse> {
    const taskResponse = await this.setMSSQLConfig(config);
    const taskId = taskResponse.data.task_id;
    return await this.pollTaskStatus(taskId, onProgress);
  }

  /**
   * Update MSSQL config and wait for completion
   */
  static async updateMSSQLConfigAndWait(
    id: number,
    config: MSSQLConfigFormRequest & { user_id: string },
    onProgress?: (progress: number, status: string) => void
  ): Promise<MSSQLConfigTaskStatusResponse> {
    const taskResponse = await this.updateMSSQLConfig(id, config);
    const taskId = taskResponse.data.task_id;
    return await this.pollTaskStatus(taskId, onProgress);
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
