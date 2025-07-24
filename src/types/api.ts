// API-related types and interfaces

export interface ApiResponse<T = any> {
    success: boolean;
    data: T;
    message?: string;
    error?: string;
    timestamp: string;
  }
  
  export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, any>;
    statusCode: number;
  }
  
  export interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }
  
  export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: PaginationInfo;
  }
  
  export interface ApiRequestConfig {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    headers?: Record<string, string>;
    params?: Record<string, any>;
    timeout?: number;
    retries?: number;
    retryCount?: number;
    url?: string;
    body?: any;
  }
  
  export interface UploadProgress {
    loaded: number;
    total: number;
    percentage: number;
  }
  
  export interface FileUploadResponse extends ApiResponse {
    data: {
      fileId: string;
      fileName: string;
      fileSize: number;
      uploadUrl?: string;
      processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
    };
  }
  
  export interface QueryRequest {
    query: string;
    filters?: Record<string, any>;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }
  
  export interface QueryResponse extends ApiResponse {
    data: {
      results: any[];
      totalResults: number;
      queryTime: number;
      suggestions?: string[];
    };
  }