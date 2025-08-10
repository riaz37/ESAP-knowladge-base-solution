import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import {
  ExcelToDBHealthResponse,
  ExcelToDBPushDataRequest,
  ExcelToDBPushDataResponse,
  ExcelToDBGetAIMappingRequest,
  ExcelToDBGetAIMappingResponse,
} from "@/types/api";

/**
 * Service for Excel to Database operations
 */
export class ExcelToDBService {
  /**
   * Check health status of Excel to Database service
   */
  static async checkHealth(): Promise<ExcelToDBHealthResponse> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.EXCEL_TO_DB_HEALTH);
      return response;
    } catch (error) {
      console.error("Error checking Excel to DB health:", error);
      throw error;
    }
  }

  /**
   * Push Excel data to database using provided column mapping
   */
  static async pushDataToDatabase(
    request: ExcelToDBPushDataRequest
  ): Promise<ExcelToDBPushDataResponse> {
    try {
      const formData = new FormData();
      formData.append("user_id", request.user_id);
      formData.append("table_full_name", request.table_full_name);
      formData.append("column_mapping", JSON.stringify(request.column_mapping));
      formData.append("skip_first_row", request.skip_first_row.toString());
      formData.append("excel_file", request.excel_file);

      const response = await apiClient.post(
        API_ENDPOINTS.EXCEL_TO_DB_PUSH_DATA,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response;
    } catch (error) {
      console.error("Error pushing data to database:", error);
      throw error;
    }
  }

  /**
   * Get AI-suggested column mapping for Excel to database table
   */
  static async getAIMapping(
    request: ExcelToDBGetAIMappingRequest
  ): Promise<ExcelToDBGetAIMappingResponse> {
    try {
      const formData = new FormData();
      formData.append("user_id", request.user_id);
      formData.append("table_full_name", request.table_full_name);
      formData.append("excel_file", request.excel_file);

      const response = await apiClient.post(
        API_ENDPOINTS.EXCEL_TO_DB_GET_AI_MAPPING,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response;
    } catch (error) {
      console.error("Error getting AI mapping:", error);
      throw error;
    }
  }

  /**
   * Validate Excel to Database push data request
   */
  static validatePushDataRequest(request: ExcelToDBPushDataRequest): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!request.user_id || request.user_id.trim() === "") {
      errors.push("User ID is required");
    }

    if (!request.table_full_name || request.table_full_name.trim() === "") {
      errors.push("Table full name is required");
    }

    if (!request.column_mapping || Object.keys(request.column_mapping).length === 0) {
      errors.push("Column mapping is required");
    }

    if (!request.excel_file) {
      errors.push("Excel file is required");
    } else {
      // Validate file type
      const allowedTypes = [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ".xlsx",
        ".xls",
      ];
      const fileType = request.excel_file.type;
      const fileName = request.excel_file.name.toLowerCase();
      
      if (!allowedTypes.includes(fileType) && 
          !fileName.endsWith('.xlsx') && 
          !fileName.endsWith('.xls')) {
        errors.push("File must be an Excel file (.xlsx or .xls)");
      }

      // Validate file size (max 50MB)
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (request.excel_file.size > maxSize) {
        errors.push("File size must be less than 50MB");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate AI mapping request
   */
  static validateAIMappingRequest(request: ExcelToDBGetAIMappingRequest): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!request.user_id || request.user_id.trim() === "") {
      errors.push("User ID is required");
    }

    if (!request.table_full_name || request.table_full_name.trim() === "") {
      errors.push("Table full name is required");
    }

    if (!request.excel_file) {
      errors.push("Excel file is required");
    } else {
      // Validate file type
      const allowedTypes = [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ".xlsx",
        ".xls",
      ];
      const fileType = request.excel_file.type;
      const fileName = request.excel_file.name.toLowerCase();
      
      if (!allowedTypes.includes(fileType) && 
          !fileName.endsWith('.xlsx') && 
          !fileName.endsWith('.xls')) {
        errors.push("File must be an Excel file (.xlsx or .xls)");
      }

      // Validate file size (max 50MB)
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (request.excel_file.size > maxSize) {
        errors.push("File size must be less than 50MB");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export default ExcelToDBService;