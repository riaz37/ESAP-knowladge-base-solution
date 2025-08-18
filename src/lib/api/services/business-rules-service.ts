import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";

export interface MSSQLConfigResponse {
  db_id: number;
  db_name: string;
  db_url: string;
  business_rule?: string;
  created_at?: string;
  updated_at?: string;
}

export class BusinessRulesService {
  static async getBusinessRules(databaseId: number): Promise<string> {
    try {
      if (!databaseId) {
        throw new Error("Database ID is required to fetch business rules");
      }

      const response = await apiClient.get<MSSQLConfigResponse>(
        API_ENDPOINTS.GET_MSSQL_CONFIG(databaseId)
      );

      if (response && response.business_rule !== undefined) {
        return response.business_rule || "";
      }

      throw new Error("Failed to fetch business rules - unexpected response structure");
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error("Business rules configuration not found");
      }
      throw new Error(
        error.response?.data?.message || "Failed to fetch business rules"
      );
    }
  }

  static async updateBusinessRules(content: string, databaseId: number): Promise<void> {
    try {
      if (!databaseId) {
        throw new Error("Database ID is required to update business rules");
      }

      const currentConfigResponse = await apiClient.get<MSSQLConfigResponse>(
        API_ENDPOINTS.GET_MSSQL_CONFIG(databaseId)
      );

      if (!currentConfigResponse || !currentConfigResponse.db_url) {
        throw new Error("Failed to fetch current configuration");
      }

      const formData = new FormData();
      formData.append("db_url", currentConfigResponse.db_url);
      formData.append("db_name", currentConfigResponse.db_name);
      formData.append("business_rule", content);

      await apiClient.put(
        API_ENDPOINTS.UPDATE_MSSQL_CONFIG(databaseId),
        formData
      );
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error("Business rules configuration not found");
      }
      throw new Error(
        error.response?.data?.message || "Failed to update business rules"
      );
    }
  }

  static async downloadBusinessRulesFileToDevice(databaseId: number): Promise<void> {
    try {
      if (!databaseId) {
        throw new Error("Database ID is required to download business rules");
      }

      const businessRules = await this.getBusinessRules(databaseId);

      if (!businessRules.trim()) {
        throw new Error("No business rules to download");
      }

      const blob = new Blob([businessRules], { type: "text/markdown" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `business-rules-${
        new Date().toISOString().split("T")[0]
      }.md`;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      throw new Error("Failed to download business rules file");
    }
  }

  static validateBusinessRules(content: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (content.length > 50000) {
      errors.push("Business rules content is too large (max 50KB)");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export default BusinessRulesService;
