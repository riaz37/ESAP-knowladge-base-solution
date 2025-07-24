import { ApiResponse } from "@/types/api";
import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";

/**
 * Service for handling business rules API calls
 */
export const BusinessRulesService = {
  /**
   * Get business rules as text
   */
  async getBusinessRules(): Promise<string> {
    try {
      // Use centralized API client with text response handling
      const response = await apiClient.request<string>(
        API_ENDPOINTS.GET_BUSINESS_RULES,
        {
          headers: {
            accept: "text/plain",
            "Content-Type": "text/plain",
          },
        }
      );

      // Extract the actual text content from the response
      return typeof response.data === "string"
        ? response.data
        : JSON.stringify(response.data);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Download business rules file
   */
  async downloadBusinessRulesFile(): Promise<Blob> {
    try {
      // For blob responses, we still need to use fetch directly
      // as the centralized client is designed for JSON responses
      const response = await fetch(API_ENDPOINTS.GET_BUSINESS_RULES_FILE);

      if (!response.ok) {
        throw new Error("Failed to download business rules file");
      }

      return await response.blob();
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update business rules
   */
  async updateBusinessRules(content: string): Promise<ApiResponse<any>> {
    try {
      // Convert text to Blob and FormData
      const blob = new Blob([content], { type: "text/markdown" });
      const formData = new FormData();
      formData.append("file", blob, "business_rules.md");

      // For FormData uploads, we need to use fetch directly
      // as the centralized client doesn't handle FormData properly
      const response = await fetch(API_ENDPOINTS.UPDATE_BUSINESS_RULES, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to update business rules");
      }

      const data = await response.json();
      return { success: true, data, timestamp: new Date().toISOString() };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Download business rules file and trigger browser download
   */
  async downloadBusinessRulesFileToDevice(): Promise<void> {
    try {
      const blob = await this.downloadBusinessRulesFile();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "business_rules.md";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      throw error;
    }
  },
};

export default BusinessRulesService;
