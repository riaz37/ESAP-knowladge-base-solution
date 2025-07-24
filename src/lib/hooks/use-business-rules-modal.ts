import { useState, useEffect, useRef } from 'react';
import { useBusinessRules } from './use-business-rules';

/**
 * Hook for managing business rules modal state and operations
 */
export function useBusinessRulesModal() {
  const [showBusinessRules, setShowBusinessRules] = useState(false);
  const [isEditingRules, setIsEditingRules] = useState(false);
  const [editRulesText, setEditRulesText] = useState("");
  const [editPreview, setEditPreview] = useState(false);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  const {
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
  } = useBusinessRules();

  // Fetch business rules when modal opens
  useEffect(() => {
    if (showBusinessRules) {
      setIsEditingRules(false);
      setEditRulesText("");
      setEditPreview(false);
      fetchBusinessRules();
    }
  }, [showBusinessRules, fetchBusinessRules]);

  const openModal = () => {
    setShowBusinessRules(true);
  };

  const closeModal = () => {
    setShowBusinessRules(false);
    setIsEditingRules(false);
    setEditRulesText("");
    setEditPreview(false);
  };

  const startEdit = () => {
    setEditRulesText(businessRulesText);
    setIsEditingRules(true);
    setEditPreview(false);
    setTimeout(() => {
      editTextareaRef.current?.focus();
    }, 100);
  };

  const cancelEdit = () => {
    setIsEditingRules(false);
    setEditRulesText("");
    setEditPreview(false);
  };

  const submitEdit = async () => {
    const success = await updateBusinessRules(editRulesText);
    if (success) {
      setIsEditingRules(false);
      setEditRulesText("");
      setEditPreview(false);
    }
  };

  const togglePreview = () => {
    setEditPreview(!editPreview);
  };

  const handleDownload = async () => {
    await downloadBusinessRules();
  };

  return {
    // State
    showBusinessRules,
    businessRulesText,
    businessRulesLoading,
    businessRulesError,
    isEditingRules,
    editRulesText,
    editPreview,
    downloadingRules,
    uploadingRules,
    uploadError,
    uploadSuccess,
    editTextareaRef,
    
    // Actions
    openModal,
    closeModal,
    startEdit,
    cancelEdit,
    submitEdit,
    togglePreview,
    handleDownload,
    setEditRulesText,
  };
}