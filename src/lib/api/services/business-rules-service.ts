//@ts-nocheck
import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import { MSSQLConfigResponse } from "@/types/api";
import { UserCurrentDBService } from "./user-current-db-service";

/**
 * Service for managing business rules through MSSQL configuration
 */
export class BusinessRulesService {
  /**
   * Get business rules for a user by fetching from MSSQL config
   */
  static async getBusinessRules(userId?: string): Promise<string> {
    try {
      if (!userId) {
        throw new Error("User ID is required to fetch business rules");
      }

      // Get the user's current database
      const userCurrentDB = await UserCurrentDBService.getUserCurrentDB(userId);
      const dbId = userCurrentDB.db_id; // With API client interceptor, no .data needed
      const response = await apiClient.get<MSSQLConfigResponse>(
        API_ENDPOINTS.GET_MSSQL_CONFIG(dbId)
      );

      console.log("Business Rules Service - Full response:", response);

      // With API client interceptor, response now contains just the data portion
      if (response && response.business_rule !== undefined) {
        console.log(
          "Business Rules Service - Found business rule:",
          response.business_rule
        );
        return response.business_rule || "";
      }

      console.error(
        "Business Rules Service - Unexpected response structure:",
        response
      );
      throw new Error(
        "Failed to fetch business rules - unexpected response structure"
      );
    } catch (error: any) {
      console.error("Error fetching business rules:", error);
      if (error.response?.status === 404) {
        throw new Error("Business rules configuration not found");
      }
      throw new Error(
        error.response?.data?.message || "Failed to fetch business rules"
      );
    }
  }

  /**
   * Update business rules by updating the MSSQL config
   */
  static async updateBusinessRules(
    content: string,
    userId?: string
  ): Promise<void> {
    try {
      if (!userId) {
        throw new Error("User ID is required to update business rules");
      }

      // Get the user's current database
      const userCurrentDB = await UserCurrentDBService.getUserCurrentDB(userId);
      const dbId = userCurrentDB.db_id; // With API client interceptor, no .data needed

      // First, get the current config to preserve other fields
      const currentConfigResponse = await apiClient.get<MSSQLConfigResponse>(
        API_ENDPOINTS.GET_MSSQL_CONFIG(dbId)
      );

      console.log("Update Business Rules - Current config response:", currentConfigResponse);

      // With API client interceptor, response now contains just the data portion
      if (!currentConfigResponse || !currentConfigResponse.db_url) {
        throw new Error("Failed to fetch current configuration");
      }

      const currentConfig = currentConfigResponse;

      // Create form data for the update
      const formData = new FormData();
      formData.append("db_url", currentConfig.db_url);
      formData.append("db_name", currentConfig.db_name);
      formData.append("business_rule", content);

      console.log("Update Business Rules - Sending form data:", {
        db_url: currentConfig.db_url,
        db_name: currentConfig.db_name,
        business_rule: content
      });

      // Update the configuration
      const response = await apiClient.put(
        API_ENDPOINTS.UPDATE_MSSQL_CONFIG(dbId),
        formData
      );

      console.log("Update Business Rules - Update response:", response);

      // With API client interceptor, response now contains just the data portion
      // No need to check status since interceptor handles that
      console.log("Business rules updated successfully");
    } catch (error: any) {
      console.error("Error updating business rules:", error);
      if (error.response?.status === 404) {
        throw new Error("Business rules configuration not found");
      }
      throw new Error(
        error.response?.data?.message || "Failed to update business rules"
      );
    }
  }

  /**
   * Download business rules as a file
   */
  static async downloadBusinessRulesFileToDevice(userId?: string): Promise<void> {
    try {
      if (!userId) {
        throw new Error("User ID is required to download business rules");
      }

      const businessRules = await this.getBusinessRules(userId);

      if (!businessRules.trim()) {
        throw new Error("No business rules to download");
      }

      // Create a blob with the business rules content
      const blob = new Blob([businessRules], { type: "text/markdown" });
      const url = window.URL.createObjectURL(blob);

      // Create a temporary download link
      const link = document.createElement("a");
      link.href = url;
      link.download = `business-rules-${
        new Date().toISOString().split("T")[0]
      }.md`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("Error downloading business rules file:", error);
      throw new Error("Failed to download business rules file");
    }
  }

  /**
   * Get the database ID for a user
   */
  static async getDatabaseIdForUser(userId: string): Promise<number> {
    try {
      const userCurrentDB = await UserCurrentDBService.getUserCurrentDB(userId);
      // With API client interceptor, no .data needed
      return userCurrentDB.db_id;
    } catch (error) {
      console.error("Error fetching user's current database:", error);
      throw new Error("Failed to get database ID for user");
    }
  }

  /**
   * Validate business rules content
   */
  static validateBusinessRules(content: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Basic validation - you can extend this as needed
    if (content.length > 50000) {
      // 50KB limit
      errors.push("Business rules content is too large (max 50KB)");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export default BusinessRulesService;
