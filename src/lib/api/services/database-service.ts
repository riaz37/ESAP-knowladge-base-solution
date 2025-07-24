import { ApiResponse } from '@/types/api';
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';

/**
 * Service for handling database management API calls
 */
export const DatabaseService = {
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