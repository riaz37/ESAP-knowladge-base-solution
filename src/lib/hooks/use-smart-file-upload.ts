import { useState, useCallback, useEffect, useRef } from "react";
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
  isPolling: boolean;
  uploadProgress: number;
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
  startPolling: (bundleId: string, interval?: number) => void;
  stopPolling: () => void;
  clearError: () => void;
  reset: () => void;
}

/**
 * Custom hook for managing file operations with progress tracking and polling
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
  const [isPolling, setIsPolling] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    stopPolling();
    setUploadResponse(null);
    setBundleStatus(null);
    setAllBundleStatuses(null);
    setSearchResults(null);
    setError(null);
    setUploadProgress(0);
  }, []);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    setIsPolling(false);
  }, []);

  const startPolling = useCallback((bundleId: string, interval: number = 2000) => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    setIsPolling(true);
    pollingRef.current = setInterval(async () => {
      try {
        const response = await FileService.getBundleTaskStatus(bundleId);
        setBundleStatus(response);
        
        // Stop polling if processing is complete
        if (response.status === "COMPLETED" || response.status === "FAILED") {
          stopPolling();
        }
      } catch (err) {
        console.error("Error polling bundle status:", err);
        // Don't stop polling on error, just log it
      }
    }, interval);
  }, [stopPolling]);

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
      setUploadProgress(0);

      try {
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return prev;
            }
            return prev + 10;
          });
        }, 200);

        const response = await FileService.uploadSmartFileSystem(
          files,
          fileDescriptions,
          tableNames,
          userIds,
        );
        
        clearInterval(progressInterval);
        setUploadProgress(100);
        setUploadResponse(response);
        
        // Start polling for status updates
        if (response.bundle_id) {
          startPolling(response.bundle_id);
        }
        
        return response;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
        console.error("Error uploading files to smart file system:", err);
        setUploadProgress(0);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [startPolling],
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

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    uploadResponse,
    bundleStatus,
    allBundleStatuses,
    searchResults,
    isLoading,
    error,
    isPolling,
    uploadProgress,
    uploadSmartFileSystem,
    getBundleTaskStatus,
    getAllBundleTaskStatus,
    searchFiles,
    startPolling,
    stopPolling,
    clearError,
    reset,
  };
}

export default useFileOperations;
