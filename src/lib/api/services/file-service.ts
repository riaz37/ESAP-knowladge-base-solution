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
        // Add headers to handle CORS and SSL issues
        headers: {
          'Accept': 'application/json',
        },
        // For development: ignore SSL certificate issues
        ...(process.env.NODE_ENV === 'development' && {
          // Note: This won't work in browser, but helps identify the issue
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Upload response data:', data);
      return transformResponse(data);
    } catch (error: any) {
      // Better error handling
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server. This might be due to CORS or SSL certificate issues.');
      }
      throw error;
    }
  },

  /**
   * Get bundle task status
   */
  async getBundleStatus(bundleId: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.BUNDLE_TASK_STATUS(bundleId));
      
      // Add debugging to see what we're getting
      console.log('Bundle status response:', response);
      
      // Check if response is already in the expected ApiResponse format
      if (response && 'data' in response && 'success' in response) {
        return response;
      }
      
      // If response is the raw data, wrap it in ApiResponse format
      if (response && typeof response === 'object') {
        return {
          success: true,
          data: response,
          timestamp: new Date().toISOString()
        };
      }
      
      // Fallback for no response
      console.warn('No response received, creating default response');
      return {
        success: false,
        data: { status: 'pending', detail: 'No response from server' },
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Bundle status error:', error);
      
      // Always return a structured response instead of throwing
      // This prevents the polling from breaking
      return {
        success: false,
        data: { 
          status: 'pending', 
          detail: error.message || 'Bundle status check failed',
          error: true
        },
        timestamp: new Date().toISOString()
      };
    }
  },
};

export default FileService;