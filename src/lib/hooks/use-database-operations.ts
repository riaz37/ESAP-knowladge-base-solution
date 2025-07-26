import { useState } from 'react';
import { DatabaseService, QueryService, HistoryService } from '../api';
import { DbQueryParams } from '../api/services/query-service';
import { useToast } from './use-toast';

/**
 * Hook for managing database operations
 */
export function useDatabaseOperations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dbResponse, setDbResponse] = useState<any>(null);
  const [reloadLoading, setReloadLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const { success, error: showError } = useToast();

  /**
   * Fetch query history for a user
   */
  const fetchQueryHistory = async (userId: string) => {
    setHistoryLoading(true);
    setHistoryError(null);
    
    try {
      const historyData = await HistoryService.fetchQueryHistory(userId);
      setHistory(historyData);
    } catch (e: any) {
      setHistoryError(e.message || 'Unknown error');
    } finally {
      setHistoryLoading(false);
    }
  };

  /**
   * Clear query history for a user
   */
  const clearHistory = async (userId: string) => {
    setHistoryLoading(true);
    setHistoryError(null);
    
    try {
      await HistoryService.clearHistory(userId);
      setHistory([]);
    } catch (e: any) {
      setHistoryError(e.message || 'Unknown error');
    } finally {
      setHistoryLoading(false);
    }
  };

  /**
   * Reload the database
   */
  const reloadDatabase = async () => {
    setReloadLoading(true);
    setLoading(true); // Also set main loading state to show animation

    try {
      // Clear current state
      setHistory([]);
      setHistoryLoading(false);
      setHistoryError(null);
      setDbResponse(null);

      const response = await DatabaseService.reloadDatabase();

      // Show success toast
      success('Database reloaded successfully!');

      return response;
    } catch (error: any) {
      console.error('Reload DB error:', error);
      showError(error.message || 'Failed to reload database. Please try again.');
      throw error;
    } finally {
      setReloadLoading(false);
      setLoading(false); // Clear main loading state
    }
  };

  /**
   * Send a database query
   */
  const sendDatabaseQuery = async (question: string, userId: string) => {
    if (!question.trim()) return;
    
    setLoading(true);
    setError(null);
    setDbResponse(null);
    
    try {
      const response = await QueryService.sendDatabaseQuery(question, userId);
      setDbResponse(response.data);
      
      // Re-fetch history after successful query if userId is set and not 'default'
      if (userId && userId !== 'default') {
        await fetchQueryHistory(userId);
      }
      
      return response.data;
    } catch (e: any) {
      setError(e.message || 'Unknown error');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    dbResponse,
    reloadLoading,
    history,
    historyLoading,
    historyError,
    fetchQueryHistory,
    clearHistory,
    reloadDatabase,
    sendDatabaseQuery,
    setDbResponse,
  };
}