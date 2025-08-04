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
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
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
    processingStatus: "pending" | "processing" | "completed" | "failed";
  };
}

export interface QueryRequest {
  query: string;
  filters?: Record<string, any>;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface QueryResponse extends ApiResponse {
  data: {
    results: any[];
    totalResults: number;
    queryTime: number;
    suggestions?: string[];
  };
}
// MSSQL Configuration Types
export interface MSSQLConfigRequest {
  db_url: string;
  db_name: string;
  business_rule?: string;
  table_info?: Record<string, any>;
  db_schema?: Record<string, any>;
  dbPath?: string;
}

export interface MSSQLConfigData {
  db_id: number;
  db_url: string;
  db_name: string;
  business_rule: string;
  table_info: Record<string, any>;
  db_schema: Record<string, any>;
  dbpath: string;
  created_at: string;
  updated_at: string;
}

export interface MSSQLConfigResponse {
  status: string;
  message: string;
  data: MSSQLConfigData;
}

export interface MSSQLConfigsListResponse {
  status: string;
  message: string;
  data: {
    configs: MSSQLConfigData[];
    count: number;
  };
}

// Parent Company Types
export interface ParentCompanyCreateRequest {
  company_name: string;
  description?: string;
  address?: string;
  contact_email?: string;
  db_id: number;
}

export interface ParentCompanyData {
  parent_company_id: number;
  company_name: string;
  description: string;
  address: string;
  contact_email: string;
  db_id: number;
  created_at: string;
  updated_at: string;
}

export interface ParentCompanyResponse {
  status: string;
  message: string;
  data: ParentCompanyData;
}

export interface ParentCompaniesListResponse {
  status: string;
  message: string;
  data: {
    companies: ParentCompanyData[];
    count: number;
  };
}
//Sub Company Types
export interface SubCompanyCreateRequest {
  parent_company_id: number;
  company_name: string;
  description?: string;
  address?: string;
  contact_email?: string;
  db_id: number;
}

export interface SubCompanyData {
  sub_company_id: number;
  parent_company_id: number;
  company_name: string;
  description: string;
  address: string;
  contact_email: string;
  db_id: number;
  created_at: string;
  updated_at: string;
  parent_company_name?: string; // Only available in GET responses
}

export interface SubCompanyResponse {
  status: string;
  message: string;
  data: SubCompanyData;
}

export interface SubCompaniesListResponse {
  status: string;
  message: string;
  data: {
    companies: SubCompanyData[];
    count: number;
  };
}

//User Access Management Types
export interface DatabaseAccess {
  db_id: number;
  access_level: "full" | "read_only" | "limited";
}

export interface SubDatabaseAccess {
  sub_company_id: number;
  databases: DatabaseAccess[];
}

export interface UserAccessCreateRequest {
  user_id: string;
  parent_company_id: number;
  sub_company_ids: number[];
  database_access: {
    parent_databases: DatabaseAccess[];
    sub_databases: SubDatabaseAccess[];
  };
  table_shows: Record<string, string[]>; // db_id -> table names
}

export interface UserAccessData {
  user_id: string;
  parent_company_id: number;
  sub_company_ids: number[];
  database_access: {
    parent_databases: DatabaseAccess[];
    sub_databases: SubDatabaseAccess[];
  };
  table_shows: Record<string, string[]>;
  created_at: string;
  updated_at: string;
  parent_company_name?: string; // Only available in GET responses
}

export interface UserAccessCreateResponse {
  status: string;
  message: string;
  data: {
    user_id: string;
    parent_company_id: number;
    sub_companies_count: number;
    databases_count: number;
  };
}

export interface UserAccessResponse {
  status: string;
  message: string;
  data: {
    user_id: string;
    access_configs: UserAccessData[];
    count: number;
  };
}

export interface UserAccessListResponse {
  status: string;
  message: string;
  data: {
    access_configs: UserAccessData[];
    count: number;
  };
}

// User Configuration Types
export interface DatabaseConfig {
  DB_HOST: string;
  DB_PORT: number;
  DB_NAME: string;
  DB_USER: string;
  DB_PASSWORD: string;
  schema: string;
}

export interface UserConfigCreateRequest {
  user_id: string;
  db_config: DatabaseConfig;
  access_level: number;
  accessible_tables: string[];
}

export interface UserConfigData {
  config_id: number;
  user_id: string;
  db_config: DatabaseConfig;
  access_level: number;
  accessible_tables: string[];
  is_latest: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserConfigCreateResponse {
  status: string;
  message: string;
  data: {
    config_id: number;
    config_reused: boolean;
    database_created: boolean;
    database_name: string;
    table_status: Record<string, any>;
  };
}

export interface UserConfigResponse {
  status: string;
  message: string;
  data: UserConfigData;
}

export interface UserConfigsListResponse {
  status: string;
  message: string;
  data: {
    configs: UserConfigData[];
    count: number;
  };
}

// User Current Database Types
export interface UserCurrentDBRequest {
  db_id: number;
}

export interface UserCurrentDBData {
  user_id: string;
  db_id: number;
  business_rule: string;
  table_info: Record<string, any>;
  db_schema: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface UserCurrentDBResponse {
  status: string;
  message: string;
  data: UserCurrentDBData;
}
