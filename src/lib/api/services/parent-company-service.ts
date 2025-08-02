import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import {
  ParentCompanyCreateRequest,
  ParentCompanyResponse,
  ParentCompaniesListResponse,
} from "@/types/api";

/**
 * Service for managing parent companies
 */
export class ParentCompanyService {
  /**
   * Create a new parent company
   */
  static async createParentCompany(
    company: ParentCompanyCreateRequest
  ): Promise<ParentCompanyResponse> {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.CREATE_PARENT_COMPANY,
        company
      );
      return response.data;
    } catch (error) {
      console.error("Error creating parent company:", error);
      throw error;
    }
  }

  /**
   * Get all parent companies
   */
  static async getParentCompanies(): Promise<ParentCompaniesListResponse> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.GET_PARENT_COMPANIES);
      return response.data;
    } catch (error) {
      console.error("Error fetching parent companies:", error);
      throw error;
    }
  }

  /**
   * Get a specific parent company by ID
   */
  static async getParentCompany(id: number): Promise<ParentCompanyResponse> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.GET_PARENT_COMPANY(id));
      return response.data;
    } catch (error) {
      console.error(`Error fetching parent company ${id}:`, error);
      throw error;
    }
  }

  /**
   * Validate parent company data before creating
   */
  static validateParentCompany(company: ParentCompanyCreateRequest): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!company.company_name || company.company_name.trim() === "") {
      errors.push("Company name is required");
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

export default ParentCompanyService;