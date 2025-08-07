import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import {
  UserConfigCreateRequest,
  UserConfigCreateResponse,
  UserConfigResponse,
  UserConfigsListResponse,
} from "@/types/api";

/**
 * User Configuration Service
 * Handles API calls for user configuration management
 */
export class UserConfigService {
  /**
   * Create a new user configuration
   */
  static async createUserConfig(
    request: UserConfigCreateRequest
  ): Promise<UserConfigCreateResponse> {
    try {
      console.log("Creating user config with request:", request);
      
      const response = await apiClient.post<UserConfigCreateResponse>(
        API_ENDPOINTS.CREATE_USER_CONFIG,
        request
      );

      console.log("User config created successfully:", response);
      return response;
    } catch (error) {
      console.error("Error creating user config:", error);
      throw error;
    }
  }

  /**
   * Get all user configurations
   */
  static async getUserConfigs(): Promise<UserConfigsListResponse> {
    try {
      console.log("Fetching all user configs");
      
      const response = await apiClient.get<UserConfigsListResponse>(
        API_ENDPOINTS.GET_USER_CONFIGS
      );

      console.log("User configs fetched successfully:", response);
      return response;
    } catch (error) {
      console.error("Error fetching user configs:", error);
      throw error;
    }
  }

  /**
   * Get user configuration by user ID
   */
  static async getUserConfig(userId: string): Promise<UserConfigResponse> {
    try {
      console.log("Fetching user config for user:", userId);
      
      const response = await apiClient.get<UserConfigResponse>(
        API_ENDPOINTS.GET_USER_CONFIG(userId)
      );

      console.log("User config fetched successfully:", response);
      return response;
    } catch (error) {
      console.error("Error fetching user config:", error);
      throw error;
    }
  }
}

export default UserConfigService;