import { useState, useCallback } from "react";
import { BusinessRulesService } from "../api";

/**
 * Hook for managing business rules operations
 */
export function useBusinessRules() {
  const [userId, setUserId] = useState<string>("");
  const [businessRulesText, setBusinessRulesText] = useState<string>("");
  const [businessRulesLoading, setBusinessRulesLoading] = useState(false);
  const [businessRulesError, setBusinessRulesError] = useState<string | null>(
    null,
  );
  const [downloadingRules, setDownloadingRules] = useState(false);
  const [uploadingRules, setUploadingRules] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  /**
   * Fetch business rules text
   */
  const fetchBusinessRules = useCallback(
    async (userIdOverride?: string) => {
      setBusinessRulesLoading(true);
      setBusinessRulesError(null);

      const effectiveUserId = userIdOverride || userId; // Use provided userId or the hook's internal state

      try {
        const text =
          await BusinessRulesService.getBusinessRules(effectiveUserId);
        setBusinessRulesText(text || ""); // Ensure we always set a string
        console.log("Business rules fetched successfully:", text);
      } catch (e: any) {
        console.error("Error in fetchBusinessRules hook:", e);
        setBusinessRulesError(e.message || "Failed to fetch business rules");
        setBusinessRulesText(""); // Reset on error
      } finally {
        setBusinessRulesLoading(false);
      }
    },
    [userId],
  );

  /**
   * Download business rules file
   */
  const downloadBusinessRules = useCallback(async () => {
    setDownloadingRules(true);

    try {
      await BusinessRulesService.downloadBusinessRulesFileToDevice();
    } catch (e: any) {
      setBusinessRulesError(
        e.message || "Failed to download business rules file",
      );
    } finally {
      setDownloadingRules(false);
    }
  }, []);

  /**
   * Update business rules
   */
  const updateBusinessRules = useCallback(
    async (content: string, userIdOverride?: string) => {
      setUploadingRules(true);
      setUploadError(null);
      setUploadSuccess(false);

      const effectiveUserId = userIdOverride || userId;

      try {
        console.log(
          "Updating business rules for user:",
          effectiveUserId,
          "Content length:",
          content.length,
        );
        await BusinessRulesService.updateBusinessRules(
          content,
          effectiveUserId,
        );
        console.log("Business rules updated successfully");

        setUploadSuccess(true);

        // Reload rules after update - call the service directly to avoid dependency issues
        try {
          const text =
            await BusinessRulesService.getBusinessRules(effectiveUserId);
          setBusinessRulesText(text || "");
        } catch (fetchError) {
          console.warn(
            "Failed to reload business rules after update:",
            fetchError,
          );
        }

        // Reset upload success after 3 seconds
        setTimeout(() => setUploadSuccess(false), 3000);
        return true;
      } catch (e: any) {
        console.error("Error in updateBusinessRules hook:", e);
        setUploadError(e.message || "Failed to update business rules");
        return false;
      } finally {
        setUploadingRules(false);
      }
    },
    [userId],
  );

  return {
    userId,
    setUserId,
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
