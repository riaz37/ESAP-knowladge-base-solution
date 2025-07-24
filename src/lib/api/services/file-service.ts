import { ApiResponse, FileUploadResponse } from '@/types/api';
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import { transformFileUploadData, transformResponse } from '../transformers';

/**
 * Service for handling file-related API calls
 */
export const FileService = {
  /**
   * Upload files to the smart file system
   */
  async uploadFiles(files: File[]): Promise<ApiResponse<any>> {
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      
      // Using fetch directly for FormData uploads as it's simpler
      const response = await fetch(API_ENDPOINTS.SMART_FILE_SYSTEM, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload files');
      }
      
      const data = await response.json();
      return transformResponse(data);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get bundle task status
   */
  async getBundleStatus(bundleId: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.BUNDLE_TASK_STATUS(bundleId));
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default FileService;