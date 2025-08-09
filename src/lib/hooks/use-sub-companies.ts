import { useState } from "react";
import { SubCompanyService } from "../api/services/sub-company-service";
import {
  SubCompanyCreateRequest,
  SubCompanyResponse,
  SubCompanyData,
} from "@/types/api";

interface UseSubCompaniesReturn {
  createSubCompany: (
    company: SubCompanyCreateRequest
  ) => Promise<SubCompanyResponse | null>;
  getSubCompanies: () => Promise<SubCompanyData[] | null>;
  getSubCompany: (id: number) => Promise<SubCompanyData | null>;
  isLoading: boolean;
  error: string | null;
  success: boolean;
  clearError: () => void;
  clearSuccess: () => void;
}

export function useSubCompanies(): UseSubCompaniesReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const createSubCompany = async (
    company: SubCompanyCreateRequest
  ): Promise<SubCompanyResponse | null> => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate company data before sending
      const validation = SubCompanyService.validateSubCompany(company);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(", "));
      }

      const response = await SubCompanyService.createSubCompany(company);
      setSuccess(true);
      return response;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to create sub company";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getSubCompanies = async (): Promise<SubCompanyData[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await SubCompanyService.getSubCompanies();
      // With the API client interceptor, response now contains just the data portion
      // The response structure is: {companies: SubCompanyData[], count: number}
      console.log("Hook: Sub companies response:", response);
      return (response as any).companies || null;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to fetch sub companies";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getSubCompany = async (id: number): Promise<SubCompanyData | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await SubCompanyService.getSubCompany(id);
      // With the API client interceptor, response now contains just the data portion
      return (response as any) || null;
    } catch (err: any) {
      const errorMessage = err?.message || `Failed to fetch sub company ${id}`;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);
  const clearSuccess = () => setSuccess(false);

  return {
    createSubCompany,
    getSubCompanies,
    getSubCompany,
    isLoading,
    error,
    success,
    clearError,
    clearSuccess,
  };
}

export default useSubCompanies;
