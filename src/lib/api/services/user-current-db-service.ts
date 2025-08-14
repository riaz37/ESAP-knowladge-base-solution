import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import {
  UserCurrentDBRequest,
  UserCurrentDBResponse,
} from "@/types/api";

/**
 * Service for managing user current database configuration
 */
export class UserCurrentDBService {
  /**
   * Set the current database for a user
   */
  static async setUserCurrentDB(
    userId: string,
    request: UserCurrentDBRequest
  ): Promise<UserCurrentDBResponse> {
    try {
      const response = await apiClient.put(
        API_ENDPOINTS.SET_USER_CURRENT_DB(userId),
        request
      );
      return response;
    } catch (error) {
      console.error(`Error setting current database for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get the current database configuration for a user
   */
  static async getUserCurrentDB(userId: string): Promise<UserCurrentDBResponse> {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.GET_USER_CURRENT_DB(userId)
      );
      return response;
    } catch (error) {
      console.error(`Error fetching current database for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Validate user current database request
   */
  static validateRequest(request: UserCurrentDBRequest): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!request.db_id || request.db_id <= 0) {
      errors.push("Database ID is required and must be a positive number");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export default UserCurrentDBService;
