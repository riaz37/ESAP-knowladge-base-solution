import { useState } from "react";
import { ExcelToDBService } from "../api/services/excel-to-db-service";
import {
  ExcelToDBHealthResponse,
  ExcelToDBPushDataRequest,
  ExcelToDBPushDataResponse,
  ExcelToDBGetAIMappingRequest,
  ExcelToDBGetAIMappingResponse,
} from "@/types/api";

interface UseExcelToDBReturn {
  // Health check
  checkHealth: () => Promise<ExcelToDBHealthResponse | null>;
  
  // Push data operations
  pushDataToDatabase: (
    request: ExcelToDBPushDataRequest
  ) => Promise<ExcelToDBPushDataResponse | null>;
  
  // AI mapping operations
  getAIMapping: (
    request: ExcelToDBGetAIMappingRequest
  ) => Promise<ExcelToDBGetAIMappingResponse | null>;
  
  // State management
  isLoading: boolean;
  error: string | null;
  success: boolean;
  
  // Progress tracking for file operations
  uploadProgress: number;
  
  // Utility functions
  clearError: () => void;
  clearSuccess: () => void;
}

export function useExcelToDB(): UseExcelToDBReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const checkHealth = async (): Promise<ExcelToDBHealthResponse | null> => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await ExcelToDBService.checkHealth();
      setSuccess(true);
      return response;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to check service health";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const pushDataToDatabase = async (
    request: ExcelToDBPushDataRequest
  ): Promise<ExcelToDBPushDataResponse | null> => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setUploadProgress(0);

    try {
      // Validate request before sending
      const validation = ExcelToDBService.validatePushDataRequest(request);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(", "));
      }

      // Simulate upload progress (since we can't track actual progress easily)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await ExcelToDBService.pushDataToDatabase(request);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setSuccess(true);
      
      return response;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to push data to database";
      setError(errorMessage);
      setUploadProgress(0);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getAIMapping = async (
    request: ExcelToDBGetAIMappingRequest
  ): Promise<ExcelToDBGetAIMappingResponse | null> => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setUploadProgress(0);

    try {
      // Validate request before sending
      const validation = ExcelToDBService.validateAIMappingRequest(request);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(", "));
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 15;
        });
      }, 150);

      const response = await ExcelToDBService.getAIMapping(request);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setSuccess(true);
      
      return response;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to get AI mapping suggestions";
      setError(errorMessage);
      setUploadProgress(0);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const clearSuccess = () => {
    setSuccess(false);
    setUploadProgress(0);
  };

  return {
    checkHealth,
    pushDataToDatabase,
    getAIMapping,
    isLoading,
    error,
    success,
    uploadProgress,
    clearError,
    clearSuccess,
  };
}

export default useExcelToDB;