import { useState, useCallback } from 'react';
import { BusinessRulesService } from '@/lib/api/services/business-rules-service';
import { BusinessRulesValidator, BusinessRuleValidation } from '@/lib/utils/business-rules-validator';

/**
 * Hook for validating database queries against business rules
 */
export function useDatabaseQueryValidation() {
  const [validationResult, setValidationResult] = useState<BusinessRuleValidation | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  /**
   * Validate a database query against business rules
   */
  const validateQuery = useCallback(async (
    query: string,
    userId: string
  ): Promise<BusinessRuleValidation> => {
    setIsValidating(true);
    setValidationError(null);
    setValidationResult(null);

    try {
      // Fetch business rules for the user (which are configured against their database)
      const businessRules = await BusinessRulesService.getBusinessRules(userId);
      
      // Validate the query against the business rules
      const validation = BusinessRulesValidator.validateQuery(query, businessRules);
      
      setValidationResult(validation);
      return validation;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to validate query';
      setValidationError(errorMessage);
      
      // Return a default validation result on error
      const defaultValidation: BusinessRuleValidation = {
        isValid: true, // Allow query execution if validation fails
        errors: [],
        warnings: [],
        suggestions: []
      };
      
      setValidationResult(defaultValidation);
      return defaultValidation;
    } finally {
      setIsValidating(false);
    }
  }, []);

  /**
   * Clear validation results
   */
  const clearValidation = useCallback(() => {
    setValidationResult(null);
    setValidationError(null);
  }, []);

  /**
   * Check if query can be executed
   */
  const canExecuteQuery = useCallback((query: string, userId: string): Promise<boolean> => {
    return validateQuery(query, userId).then(validation => validation.isValid);
  }, [validateQuery]);

  return {
    validationResult,
    isValidating,
    validationError,
    validateQuery,
    clearValidation,
    canExecuteQuery
  };
} 