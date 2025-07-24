import { useState } from 'react';
import { BusinessRulesService } from '../api';

/**
 * Hook for managing business rules operations
 */
export function useBusinessRules() {
  const [businessRulesText, setBusinessRulesText] = useState<string>('');
  const [businessRulesLoading, setBusinessRulesLoading] = useState(false);
  const [businessRulesError, setBusinessRulesError] = useState<string | null>(null);
  const [downloadingRules, setDownloadingRules] = useState(false);
  const [uploadingRules, setUploadingRules] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  /**
   * Fetch business rules text
   */
  const fetchBusinessRules = async () => {
    setBusinessRulesLoading(true);
    setBusinessRulesError(null);
    setBusinessRulesText('');
    
    try {
      const text = await BusinessRulesService.getBusinessRules();
      setBusinessRulesText(text);
    } catch (e: any) {
      setBusinessRulesError(e.message || 'Unknown error');
    } finally {
      setBusinessRulesLoading(false);
    }
  };

  /**
   * Download business rules file
   */
  const downloadBusinessRules = async () => {
    setDownloadingRules(true);
    
    try {
      await BusinessRulesService.downloadBusinessRulesFileToDevice();
    } catch (e: any) {
      setBusinessRulesError(e.message || 'Failed to download business rules file');
    } finally {
      setDownloadingRules(false);
    }
  };

  /**
   * Update business rules
   */
  const updateBusinessRules = async (content: string) => {
    setUploadingRules(true);
    setUploadError(null);
    setUploadSuccess(false);
    
    try {
      await BusinessRulesService.updateBusinessRules(content);
      setUploadSuccess(true);
      await fetchBusinessRules(); // Reload rules after update
      
      // Reset upload success after 2 seconds
      setTimeout(() => setUploadSuccess(false), 2000);
      return true;
    } catch (e: any) {
      setUploadError(e.message || 'Failed to update business rules');
      return false;
    } finally {
      setUploadingRules(false);
    }
  };

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