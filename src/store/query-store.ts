import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { QueryService } from '@/lib/api/services/query-service';
import { FileService } from '@/lib/api/services/file-service';
import { BusinessRulesService } from '@/lib/api/services/business-rules-service';
import { BusinessRulesValidator } from '@/lib/utils/business-rules-validator';

// Query Types
export interface QueryRequest {
  id: string;
  type: 'file' | 'database';
  query: string;
  userId: string;
  timestamp: Date;
  parameters?: Record<string, any>;
}

export interface QueryResult {
  id: string;
  queryId: string;
  data: any;
  metadata: {
    rowCount: number;
    executionTime: number;
    columns: string[];
  };
  timestamp: Date;
  status: 'success' | 'error' | 'pending';
  error?: string;
}

export interface QueryHistoryItem {
  id: string;
  query: string;
  type: 'file' | 'database';
  userId: string;
  timestamp: Date;
  status: 'success' | 'error' | 'pending';
  executionTime?: number;
  rowCount?: number;
}

export interface FileQueryRequest {
  fileId: string;
  query: string;
  userId: string;
  parameters?: Record<string, any>;
}

export interface DatabaseQueryRequest {
  databaseId: number;
  query: string;
  userId: string;
  parameters?: Record<string, any>;
}

export interface SavedQuery {
  id: string;
  name: string;
  description: string;
  query: string;
  type: 'file' | 'database';
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

// Query Store Interface
interface QueryStore {
  // State
  currentQuery: QueryRequest | null;
  queryResults: QueryResult | null;
  queryLoading: boolean;
  queryError: string | null;
  
  // File Queries
  fileQueries: FileQueryRequest[];
  fileQueryHistory: QueryHistoryItem[];
  
  // Database Queries
  databaseQueries: DatabaseQueryRequest[];
  databaseQueryHistory: QueryHistoryItem[];
  
  // Saved Queries
  savedQueries: SavedQuery[];
  
  // Actions
  setCurrentQuery: (query: QueryRequest | null) => void;
  setQueryResults: (results: QueryResult | null) => void;
  setQueryLoading: (loading: boolean) => void;
  setQueryError: (error: string | null) => void;
  
  // Query Execution
  executeFileQuery: (query: FileQueryRequest) => Promise<void>;
  executeDatabaseQuery: (query: DatabaseQueryRequest) => Promise<void>;
  
  // Query Management
  saveQuery: (query: Omit<SavedQuery, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  loadQueryHistory: (userId: string, type?: 'file' | 'database') => Promise<void>;
  clearQueryResults: () => void;
  
  // History Management
  addToHistory: (item: QueryHistoryItem) => void;
  clearHistory: (userId: string) => void;
  
  // Saved Queries Management
  loadSavedQueries: (userId: string) => Promise<void>;
  deleteSavedQuery: (queryId: string) => Promise<void>;
  updateSavedQuery: (queryId: string, updates: Partial<SavedQuery>) => Promise<void>;
}

export const useQueryStore = create<QueryStore>()(
  devtools(
    (set, get) => ({
      // Initial State
      currentQuery: null,
      queryResults: null,
      queryLoading: false,
      queryError: null,
      fileQueries: [],
      fileQueryHistory: [],
      databaseQueries: [],
      databaseQueryHistory: [],
      savedQueries: [],

      // Basic Setters
      setCurrentQuery: (query) => set({ currentQuery: query }),
      setQueryResults: (results) => set({ queryResults: results }),
      setQueryLoading: (loading) => set({ queryLoading: loading }),
      setQueryError: (error) => set({ queryError: error }),

      // Query Execution - Using REAL APIs
      executeFileQuery: async (queryRequest) => {
        const { setQueryLoading, setQueryError, setQueryResults, addToHistory } = get();
        
        try {
          setQueryLoading(true);
          setQueryError(null);
          
          // Create query request
          const query: QueryRequest = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'file',
            query: queryRequest.query,
            userId: queryRequest.userId,
            timestamp: new Date(),
            parameters: queryRequest.parameters,
          };
          
          // Use REAL FileService.searchFiles API
          const result = await FileService.searchFiles({
            query: queryRequest.query,
            user_id: queryRequest.userId,
            intent_top_k: 20,
            chunk_top_k: 40,
            max_chunks_for_answer: 40,
          });
          
          // Transform API response to our QueryResult format
          const queryResult: QueryResult = {
            id: query.id,
            queryId: query.id,
            data: result.data || [],
            metadata: {
              rowCount: result.data?.length || 0,
              executionTime: 0, // API doesn't provide this
              columns: Object.keys(result.data?.[0] || {}),
            },
            timestamp: new Date(),
            status: 'success',
          };
          
          // Update state with real results
          setQueryResults(queryResult);
          set({ currentQuery: query });
          
          // Add to history
          addToHistory({
            id: query.id,
            query: queryRequest.query,
            type: 'file',
            userId: queryRequest.userId,
            timestamp: new Date(),
            status: 'success',
            rowCount: queryResult.metadata.rowCount,
          });
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          setQueryError(errorMessage);
          
          // Add failed query to history
          const { addToHistory } = get();
          addToHistory({
            id: Math.random().toString(36).substr(2, 9),
            query: queryRequest.query,
            type: 'file',
            userId: queryRequest.userId,
            timestamp: new Date(),
            status: 'error',
          });
        } finally {
          setQueryLoading(false);
        }
      },

      executeDatabaseQuery: async (queryRequest) => {
        const { setQueryLoading, setQueryError, setQueryResults, addToHistory } = get();
        
        try {
          setQueryLoading(true);
          setQueryError(null);
          
          // Validate query against business rules first
          try {
            const businessRules = await BusinessRulesService.getBusinessRules(queryRequest.userId);
            if (businessRules.trim()) {
              const validation = BusinessRulesValidator.validateQuery(
                queryRequest.query,
                businessRules
              );

              if (!validation.isValid) {
                const errorMessage = `Query blocked by business rules: ${validation.errors.join(', ')}`;
                setQueryError(errorMessage);
                
                // Add failed query to history
                addToHistory({
                  id: Math.random().toString(36).substr(2, 9),
                  query: queryRequest.query,
                  type: 'database',
                  userId: queryRequest.userId,
                  timestamp: new Date(),
                  status: 'error',
                });
                return;
              }
            }
          } catch (error) {
            console.warn('Failed to validate against business rules:', error);
            // Continue with query execution even if business rules validation fails
          }
          
          // Create query request
          const query: QueryRequest = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'database',
            query: queryRequest.query,
            userId: queryRequest.userId,
            timestamp: new Date(),
            parameters: queryRequest.parameters,
          };
          
          // Use REAL QueryService.sendDatabaseQuery API
          const result = await QueryService.sendDatabaseQuery(
            queryRequest.query,
            queryRequest.userId
          );
          
          // Transform API response to our QueryResult format
          const queryResult: QueryResult = {
            id: query.id,
            queryId: query.id,
            data: result.data || [],
            metadata: {
              rowCount: result.data?.length || 0,
              executionTime: 0, // API doesn't provide this
              columns: Object.keys(result.data?.[0] || {}),
            },
            timestamp: new Date(),
            status: 'success',
          };
          
          // Update state with real results
          setQueryResults(queryResult);
          set({ currentQuery: query });
          
          // Add to history
          addToHistory({
            id: query.id,
            query: queryRequest.query,
            type: 'database',
            userId: queryRequest.userId,
            timestamp: new Date(),
            status: 'success',
            rowCount: queryResult.metadata.rowCount,
          });
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          setQueryError(errorMessage);
          
          // Add failed query to history
          const { addToHistory } = get();
          addToHistory({
            id: Math.random().toString(36).substr(2, 9),
            query: queryRequest.query,
            type: 'database',
            userId: queryRequest.userId,
            timestamp: new Date(),
            status: 'error',
          });
        } finally {
          setQueryLoading(false);
        }
      },

      // Query Management - Currently no backend APIs for these, so we'll store locally
      saveQuery: async (queryData) => {
        const { savedQueries } = get();
        const newQuery: SavedQuery = {
          ...queryData,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        set({ savedQueries: [...savedQueries, newQuery] });
        
        // TODO: When backend API is available, implement:
        // await QueryService.saveQuery(newQuery);
      },

      loadQueryHistory: async (userId, type) => {
        // Currently no backend API for query history, so we'll use local state
        // TODO: When backend API is available, implement:
        // const history = await QueryService.getQueryHistory(userId, type);
        
        // For now, just ensure we have empty arrays
        if (type === 'file') {
          set({ fileQueryHistory: [] });
        } else if (type === 'database') {
          set({ databaseQueryHistory: [] });
        } else {
          set({ 
            fileQueryHistory: [],
            databaseQueryHistory: [],
          });
        }
      },

      clearQueryResults: () => set({ queryResults: null, queryError: null }),

      // History Management - Local state management
      addToHistory: (item) => {
        const { fileQueryHistory, databaseQueryHistory } = get();
        
        if (item.type === 'file') {
          set({ 
            fileQueryHistory: [item, ...fileQueryHistory.slice(0, 99)] // Keep last 100 items
          });
        } else {
          set({ 
            databaseQueryHistory: [item, ...databaseQueryHistory.slice(0, 99)] // Keep last 100 items
          });
        }
      },

      clearHistory: (userId) => {
        set({ 
          fileQueryHistory: [],
          databaseQueryHistory: [],
        });
      },

      // Saved Queries Management - Local state management
      loadSavedQueries: async (userId) => {
        // Currently no backend API for saved queries, so we'll use local state
        // TODO: When backend API is available, implement:
        // const savedQueries = await QueryService.getSavedQueries(userId);
        
        // For now, just ensure we have empty array
        set({ savedQueries: [] });
      },

      deleteSavedQuery: async (queryId) => {
        try {
          // Currently no backend API for deleting saved queries
          // TODO: When backend API is available, implement:
          // await QueryService.deleteSavedQuery(queryId);
          
          const { savedQueries } = get();
          set({ savedQueries: savedQueries.filter(q => q.id !== queryId) });
        } catch (error) {
          console.error('Failed to delete saved query:', error);
          throw error;
        }
      },

      updateSavedQuery: async (queryId, updates) => {
        try {
          // Currently no backend API for updating saved queries
          // TODO: When backend API is available, implement:
          // await QueryService.updateSavedQuery(queryId, updates);
          
          const { savedQueries } = get();
          set({
            savedQueries: savedQueries.map(q => 
              q.id === queryId 
                ? { ...q, ...updates, updatedAt: new Date() }
                : q
            )
          });
        } catch (error) {
          console.error('Failed to update saved query:', error);
          throw error;
        }
      },
    }),
    {
      name: 'query-store',
    }
  )
); 