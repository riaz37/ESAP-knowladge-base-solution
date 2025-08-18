import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import {
  SmartFileSystemRequest,
  SmartFileSystemResponse,
  BundleTaskStatusResponse,
  BundleTaskStatusAllResponse,
  FilesSearchRequest,
  FilesSearchResponse,
} from "@/types/api";

/**
 * Service for managing file operations
 */
export class FileService {
  /**
   * Upload files to smart file system
   */
  static async uploadSmartFileSystem(
    files: File[],
    fileDescriptions: string[],
    tableNames: string[],
    userIds: string[],
  ): Promise<SmartFileSystemResponse> {
    try {
      const formData = new FormData();

      // Add files
      files.forEach((file) => {
        formData.append("files", file);
      });

      // Add file descriptions
      fileDescriptions.forEach((description) => {
        formData.append("file_descriptions", description);
      });

      // Add table names
      tableNames.forEach((tableName) => {
        formData.append("table_names", tableName);
      });

      // Add user IDs
      userIds.forEach((userId) => {
        formData.append("user_ids", userId);
      });

      const response = await apiClient.post(
        API_ENDPOINTS.SMART_FILE_SYSTEM,
        formData,
      );
      return response;
    } catch (error) {
      console.error("Error uploading files to smart file system:", error);
      throw error;
    }
  }

  /**
   * Get bundle task status by bundle ID
   */
  static async getBundleTaskStatus(
    bundleId: string,
  ): Promise<BundleTaskStatusResponse> {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.BUNDLE_TASK_STATUS(bundleId),
      );
      return response;
    } catch (error) {
      console.error(
        `Error fetching bundle task status for ${bundleId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Get all bundle task statuses
   */
  static async getAllBundleTaskStatus(): Promise<BundleTaskStatusAllResponse> {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.BUNDLE_TASK_STATUS_ALL,
      );
      return response;
    } catch (error) {
      console.error("Error fetching all bundle task statuses:", error);
      throw error;
    }
  }

  /**
   * Search files
   */
  static async searchFiles(
    request: FilesSearchRequest,
  ): Promise<FilesSearchResponse> {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.FILES_SEARCH,
        request,
      );
      return response;
    } catch (error) {
      console.error("Error searching files:", error);
      throw error;
    }
  }

  /**
   * Validate smart file system request
   */
  static validateSmartFileSystemRequest(
    files: File[],
    fileDescriptions: string[],
    tableNames: string[],
    userIds: string[],
  ): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!files || files.length === 0) {
      errors.push("At least one file is required");
    }

    if (!fileDescriptions || fileDescriptions.length === 0) {
      errors.push("File descriptions are required");
    }

    if (!tableNames || tableNames.length === 0) {
      errors.push("Table names are required");
    }

    if (!userIds || userIds.length === 0) {
      errors.push("User IDs are required");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate files search request
   */
  static validateFilesSearchRequest(request: FilesSearchRequest): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!request.query || request.query.trim() === "") {
      errors.push("Query is required");
    }

    if (!request.user_id || request.user_id.trim() === "") {
      errors.push("User ID is required");
    }

    if (request.intent_top_k !== undefined && request.intent_top_k <= 0) {
      errors.push("Intent top k must be a positive number");
    }

    if (request.chunk_top_k !== undefined && request.chunk_top_k <= 0) {
      errors.push("Chunk top k must be a positive number");
    }

    if (
      request.max_chunks_for_answer !== undefined &&
      request.max_chunks_for_answer <= 0
    ) {
      errors.push("Max chunks for answer must be a positive number");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export default FileService;
