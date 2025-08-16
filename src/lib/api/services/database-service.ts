import { ApiResponse } from '@/types/api';
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';

/**
 * Service for handling database management API calls
 */
export const DatabaseService = {
  /**
   * Get all available databases
   */
  async getAllDatabases(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.GET_MSSQL_CONFIGS);
      return response;
    } catch (error) {
      console.error('Error fetching all databases:', error);
      throw error;
    }
  },

  /**
   * Reload the database
   */
  async reloadDatabase(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.RELOAD_DB);
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default DatabaseService;