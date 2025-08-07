import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import {
  SubCompanyCreateRequest,
  SubCompanyResponse,
  SubCompaniesListResponse,
} from "@/types/api";

/**
 * Service for managing sub companies
 */
export class SubCompanyService {
  /**
   * Create a new sub company
   */
  static async createSubCompany(
    company: SubCompanyCreateRequest
  ): Promise<SubCompanyResponse> {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.CREATE_SUB_COMPANY,
        company
      );
      return response.data;
    } catch (error) {
      console.error("Error creating sub company:", error);
      throw error;
    }
  }

  /**
   * Get all sub companies
   */
  static async getSubCompanies(): Promise<SubCompaniesListResponse> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.GET_SUB_COMPANIES);
      return response.data;
    } catch (error) {
      console.error("Error fetching sub companies:", error);
      throw error;
    }
  }

  /**
   * Get a specific sub company by ID
   */
  static async getSubCompany(id: number): Promise<SubCompanyResponse> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.GET_SUB_COMPANY(id));
      return response.data;
    } catch (error) {
      console.error(`Error fetching sub company ${id}:`, error);
      throw error;
    }
  }

  /**
   * Validate sub company data before creating
   */
  static validateSubCompany(company: SubCompanyCreateRequest): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!company.company_name || company.company_name.trim() === "") {
      errors.push("Company name is required");
    }

    if (!company.parent_company_id || company.parent_company_id <= 0) {
      errors.push("Valid parent company ID is required");
    }

    if (!company.db_id || company.db_id <= 0) {
      errors.push("Valid database ID is required");
    }

    // Validate email format if provided
    if (company.contact_email && company.contact_email.trim() !== "") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(company.contact_email)) {
        errors.push("Invalid email format");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export default SubCompanyService;