import { ApiResponse } from "@/types/api";
import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import { transformResponse } from "../transformers";

/**
 * Service for handling conversation history-related API calls
 */
export const HistoryService = {
  /**
   * Fetch conversation history for a user
   */
  async getConversationHistory(
    userId: string
  ): Promise<ApiResponse<any[] | { payload: any[] }>> {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.CONVERSATION_HISTORY(userId)
      );
      return Array.isArray(response.data)
        ? response
        : transformResponse(
            Array.isArray((response.data as any)?.payload)
              ? (response.data as any).payload
              : []
          );
    } catch (error) {
      throw error;
    }
  },

  /**
   * Clear conversation history for a user
   */
  async clearHistory(userId: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.CLEAR_HISTORY(userId)
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Fetch conversation history and extract the payload array
   * This is a convenience method that returns just the history array
   */
  async fetchQueryHistory(userId: string): Promise<any[]> {
    try {
      const response = await this.getConversationHistory(userId);
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.payload)) {
        return response.data.payload;
      }
      return [];
    } catch (error) {
      throw error;
    }
  },
};

export default HistoryService;
