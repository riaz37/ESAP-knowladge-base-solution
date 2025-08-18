import { useState, useCallback } from "react";
import { BusinessRulesService } from "../api";

export function useBusinessRules() {
  const [businessRulesText, setBusinessRulesText] = useState<string>("");
  const [businessRulesLoading, setBusinessRulesLoading] = useState(false);
  const [businessRulesError, setBusinessRulesError] = useState<string | null>(null);
  const [downloadingRules, setDownloadingRules] = useState(false);
  const [uploadingRules, setUploadingRules] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const fetchBusinessRules = useCallback(async (databaseId: number) => {
    if (!databaseId) {
      setBusinessRulesError("Database ID is required");
      return;
    }

    setBusinessRulesLoading(true);
    setBusinessRulesError(null);

    try {
      const text = await BusinessRulesService.getBusinessRules(databaseId);
      setBusinessRulesText(text || "");
    } catch (e: any) {
      setBusinessRulesError(e.message || "Failed to fetch business rules");
      setBusinessRulesText("");
    } finally {
      setBusinessRulesLoading(false);
    }
  }, []);

  const downloadBusinessRules = useCallback(async (databaseId: number) => {
    if (!databaseId) {
      setBusinessRulesError("Database ID is required");
      return;
    }

    setDownloadingRules(true);

    try {
      await BusinessRulesService.downloadBusinessRulesFileToDevice(databaseId);
    } catch (e: any) {
      setBusinessRulesError(e.message || "Failed to download business rules file");
    } finally {
      setDownloadingRules(false);
    }
  }, []);

  const updateBusinessRules = useCallback(async (content: string, databaseId: number) => {
    if (!databaseId) {
      setBusinessRulesError("Database ID is required");
      return false;
    }

    setUploadingRules(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      await BusinessRulesService.updateBusinessRules(content, databaseId);

      setUploadSuccess(true);

      try {
        const text = await BusinessRulesService.getBusinessRules(databaseId);
        setBusinessRulesText(text || "");
      } catch (fetchError) {
        // Silently handle fetch error after update
      }

      setTimeout(() => setUploadSuccess(false), 3000);
      return true;
    } catch (e: any) {
      setUploadError(e.message || "Failed to update business rules");
      return false;
    } finally {
      setUploadingRules(false);
    }
  }, []);

  return {
    businessRulesText,
    businessRulesLoading,
    businessRulesError,
    downloadingRules,
    uploadingRules,
    uploadError,
    uploadSuccess,
    fetchBusinessRules,
    downloadBusinessRules,
    updateBusinessRules,
  };
}
