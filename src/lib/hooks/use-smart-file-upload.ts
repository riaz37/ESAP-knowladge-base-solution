import { useState, useCallback } from "react";
import { FileService } from "@/lib/api/services/file-service";
import {
  SmartFileSystemResponse,
  BundleTaskStatusResponse,
  BundleTaskStatusAllResponse,
  FilesSearchRequest,
  FilesSearchResponse,
} from "@/types/api";

interface UseFileOperationsReturn {
  uploadResponse: SmartFileSystemResponse | null;
  bundleStatus: BundleTaskStatusResponse | null;
  allBundleStatuses: BundleTaskStatusAllResponse | null;
  searchResults: FilesSearchResponse | null;
  isLoading: boolean;
  error: string | null;
  uploadSmartFileSystem: (
    files: File[],
    fileDescriptions: string[],
    tableNames: string[],
    userIds: string[],
  ) => Promise<SmartFileSystemResponse | null>;
  getBundleTaskStatus: (bundleId: string) => Promise<void>;
  getAllBundleTaskStatus: () => Promise<void>;
  searchFiles: (
    request: FilesSearchRequest,
  ) => Promise<FilesSearchResponse | null>;
  clearError: () => void;
}

/**
 * Custom hook for managing file operations
 */
export function useFileOperations(): UseFileOperationsReturn {
  const [uploadResponse, setUploadResponse] =
    useState<SmartFileSystemResponse | null>(null);
  const [bundleStatus, setBundleStatus] =
    useState<BundleTaskStatusResponse | null>(null);
  const [allBundleStatuses, setAllBundleStatuses] =
    useState<BundleTaskStatusAllResponse | null>(null);
  const [searchResults, setSearchResults] =
    useState<FilesSearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const uploadSmartFileSystem = useCallback(
    async (
      files: File[],
      fileDescriptions: string[],
      tableNames: string[],
      userIds: string[],
    ): Promise<SmartFileSystemResponse | null> => {
      // Validate request
      const validation = FileService.validateSmartFileSystemRequest(
        files,
        fileDescriptions,
        tableNames,
        userIds,
      );
      if (!validation.isValid) {
        setError(validation.errors.join(", "));
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await FileService.uploadSmartFileSystem(
          files,
          fileDescriptions,
          tableNames,
          userIds,
        );
        setUploadResponse(response);
        return response;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
        console.error("Error uploading files to smart file system:", err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const getBundleTaskStatus = useCallback(async (bundleId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await FileService.getBundleTaskStatus(bundleId);
      setBundleStatus(response);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      console.error("Error fetching bundle task status:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAllBundleTaskStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await FileService.getAllBundleTaskStatus();
      setAllBundleStatuses(response);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      console.error("Error fetching all bundle task statuses:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchFiles = useCallback(
    async (
      request: FilesSearchRequest,
    ): Promise<FilesSearchResponse | null> => {
      // Validate request
      const validation = FileService.validateFilesSearchRequest(request);
      if (!validation.isValid) {
        setError(validation.errors.join(", "));
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await FileService.searchFiles(request);
        setSearchResults(response);
        return response;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
        console.error("Error searching files:", err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    uploadResponse,
    bundleStatus,
    allBundleStatuses,
    searchResults,
    isLoading,
    error,
    uploadSmartFileSystem,
    getBundleTaskStatus,
    getAllBundleTaskStatus,
    searchFiles,
    clearError,
  };
}

export default useFileOperations;
