import { useState } from "react";
import { ParentCompanyService } from "../api/services/parent-company-service";
import {
  ParentCompanyCreateRequest,
  ParentCompanyResponse,
  ParentCompanyData,
} from "@/types/api";

interface UseParentCompaniesReturn {
  createParentCompany: (
    company: ParentCompanyCreateRequest
  ) => Promise<ParentCompanyResponse | null>;
  getParentCompanies: () => Promise<ParentCompanyData[] | null>;
  getParentCompany: (id: number) => Promise<ParentCompanyData | null>;
  isLoading: boolean;
  error: string | null;
  success: boolean;
  clearError: () => void;
  clearSuccess: () => void;
}

export function useParentCompanies(): UseParentCompaniesReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const createParentCompany = async (
    company: ParentCompanyCreateRequest
  ): Promise<ParentCompanyResponse | null> => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate company data before sending
      const validation = ParentCompanyService.validateParentCompany(company);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(", "));
      }

      const response = await ParentCompanyService.createParentCompany(company);
      setSuccess(true);
      return response;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to create parent company";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getParentCompanies = async (): Promise<ParentCompanyData[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await ParentCompanyService.getParentCompanies();
      return response.data.companies;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to fetch parent companies";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getParentCompany = async (
    id: number
  ): Promise<ParentCompanyData | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await ParentCompanyService.getParentCompany(id);
      return response.data;
    } catch (err: any) {
      const errorMessage =
        err?.message || `Failed to fetch parent company ${id}`;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);
  const clearSuccess = () => setSuccess(false);

  return {
    createParentCompany,
    getParentCompanies,
    getParentCompany,
    isLoading,
    error,
    success,
    clearError,
    clearSuccess,
  };
}

export default useParentCompanies;