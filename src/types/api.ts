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

export interface MSSQLConfigFormRequest {
  db_url: string;
  db_name: string;
  business_rule?: string;
  file?: File;
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

// Full API response structure (what the API actually returns)
export interface MSSQLConfigApiResponse {
  status: string;
  message: string;
  data: MSSQLConfigData;
}

export interface MSSQLConfigsListApiResponse {
  status: string;
  message: string;
  data: {
    configs: MSSQLConfigData[];
    count: number;
  };
}

// Service response types (what services return after API client interceptor)
export type MSSQLConfigResponse = MSSQLConfigData;
export type MSSQLConfigsListResponse = {
  configs: MSSQLConfigData[];
  count: number;
};

// Task-based API Types (New API Structure)
export interface MSSQLConfigTaskResponse {
  status: string;
  message: string;
  data: {
    task_id: string;
    status: string;
    db_id?: number;
  };
}

export interface MSSQLConfigTaskStatus {
  task_id: string;
  user_id: string;
  db_id: number;
  status: 'pending' | 'running' | 'success' | 'failed';
  progress: number;
  result: any;
  error: string | null;
  created_at: string;
  updated_at: string;
}

export interface MSSQLConfigTaskStatusResponse {
  status: string;
  message: string;
  data: MSSQLConfigTaskStatus;
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

// Full API response structure (what the API actually returns)
export interface ParentCompanyApiResponse {
  status: string;
  message: string;
  data: ParentCompanyData;
}

export interface ParentCompaniesListApiResponse {
  status: string;
  message: string;
  data: {
    companies: ParentCompanyData[];
    count: number;
  };
}

// Service response types (what services return after API client interceptor)
export type ParentCompanyResponse = ParentCompanyData;
export type ParentCompaniesListResponse = {
  companies: ParentCompanyData[];
  count: number;
};
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

// Full API response structure (what the API actually returns)
export interface SubCompanyApiResponse {
  status: string;
  message: string;
  data: SubCompanyData;
}

export interface SubCompaniesListApiResponse {
  status: string;
  message: string;
  data: {
    companies: SubCompanyData[];
    count: number;
  };
}

// Service response types (what services return after API client interceptor)
export type SubCompanyResponse = SubCompanyData;
export type SubCompaniesListResponse = {
  companies: SubCompanyData[];
  count: number;
};

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

// Full API response structure (what the API actually returns)
export interface UserAccessCreateApiResponse {
  status: string;
  message: string;
  data: {
    user_id: string;
    parent_company_id: number;
    sub_companies_count: number;
    databases_count: number;
  };
}

export interface UserAccessApiResponse {
  status: string;
  message: string;
  data: {
    user_id: string;
    access_configs: UserAccessData[];
    count: number;
  };
}

export interface UserAccessListApiResponse {
  status: string;
  message: string;
  data: {
    access_configs: UserAccessData[];
    count: number;
  };
}

// Service response types (what services return after API client interceptor)
export type UserAccessCreateResponse = {
  user_id: string;
  parent_company_id: number;
  sub_companies_count: number;
  databases_count: number;
};

export type UserAccessResponse = {
  user_id: string;
  access_configs: UserAccessData[];
  count: number;
};

export type UserAccessListResponse = {
  access_configs: UserAccessData[];
  count: number;
};

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

// Full API response structure (what the API actually returns)
export interface UserConfigCreateApiResponse {
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

export interface UserConfigApiResponse {
  status: string;
  message: string;
  data: UserConfigData;
}

export interface UserConfigsListApiResponse {
  status: string;
  message: string;
  data: {
    configs: UserConfigData[];
    count: number;
  };
}

// Service response types (what services return after API client interceptor)
export type UserConfigCreateResponse = {
  config_id: number;
  config_reused: boolean;
  database_created: boolean;
  database_name: string;
  table_status: Record<string, any>;
};

export type UserConfigResponse = UserConfigData;

export type UserConfigsListResponse = {
  configs: UserConfigData[];
  count: number;
};

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

// Full API response structure (what the API actually returns)
export interface UserCurrentDBApiResponse {
  status: string;
  message: string;
  data: UserCurrentDBData;
}

// Service response types (what services return after API client interceptor)
export type UserCurrentDBResponse = UserCurrentDBData;

// Table Info Generation Types
export interface GenerateTableInfoRequest {
  user_id: string;
}

export interface TaskData {
  task_id: string;
  status: "pending" | "running" | "completed" | "failed";
  db_id: number;
  user_id: string;
}

// Full API response structure (what the API actually returns)
export interface GenerateTableInfoApiResponse {
  status: string;
  message: string;
  data: TaskData;
}

// Service response types (what services return after API client interceptor)
export type GenerateTableInfoResponse = TaskData;

export interface TaskStatusData {
  task_id: string;
  user_id: string;
  db_id: number;
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  result: any;
  error: string | null;
  created_at: string;
  updated_at: string;
}

// Full API response structure (what the API actually returns)
export interface TaskStatusApiResponse {
  status: string;
  message: string;
  data: TaskStatusData;
}

// Service response types (what services return after API client interceptor)
export type TaskStatusResponse = TaskStatusData;

// Matched Tables Generation Types
export interface GenerateMatchedTablesRequest {
  user_id: string;
}

export interface MatchedTablesMetadata {
  user_id: string;
  db_id: number;
  db_name: string;
  generated_at: string;
  total_business_rules_tables: number;
  total_schema_tables: number;
  total_matches: number;
}

export interface MatchedTablesData {
  status: string;
  message: string;
  metadata: MatchedTablesMetadata;
  matched_tables: any[];
  matched_tables_details: any[];
  business_rules_tables: any[];
  schema_tables: any[];
  unmatched_business_rules: any[];
  unmatched_schema: any[];
}

// Full API response structure (what the API actually returns)
export interface GenerateMatchedTablesApiResponse {
  status: string;
  message: string;
  data: {
    db_id: number;
    user_id: string;
    matched_tables_data: MatchedTablesData;
    updated_config: MSSQLConfigData;
  };
}

// Service response types (what services return after API client interceptor)
export type GenerateMatchedTablesResponse = {
  db_id: number;
  user_id: string;
  matched_tables_data: MatchedTablesData;
  updated_config: MSSQLConfigData;
};

// Table Info Types for React Flow Visualization
export interface TableColumn {
  name: string;
  type: string;
  is_primary: boolean;
  is_foreign: boolean;
  is_required: boolean;
  max_length?: number;
  references?: {
    table: string;
    column: string;
    constraint: string;
  };
}

export interface TableRelationship {
  type: string;
  via_column: string;
  via_related: string;
  related_table: string;
}

export interface TableInfo {
  schema: string;
  table_name: string;
  full_name: string;
  primary_keys: string[];
  columns: TableColumn[];
  relationships: TableRelationship[];
  sample_data: Record<string, any>[];
  row_count_sample: number;
}

export interface TableMetadata {
  extraction_date: string;
  total_tables: number;
  processed_tables: number;
  failed_tables: number;
  sample_row_count: number;
  database_url: string;
}

export interface UserCurrentDBTableData {
  user_id: string;
  db_id: number;
  business_rule: string;
  table_info: {
    metadata: TableMetadata;
    tables: TableInfo[];
    unmatched_business_rules: string[];
  };
  created_at: string;
  updated_at: string;
}

// Excel to Database Types
export interface ExcelToDBHealthResponse {
  status: string;
  message: string;
  timestamp: string;
}

export interface ExcelToDBPushDataRequest {
  user_id: string;
  table_full_name: string;
  column_mapping: Record<string, string>; // Excel column name -> Database column name
  skip_first_row: boolean;
  excel_file: File;
}

export interface ExcelToDBPushDataResponse {
  status: string;
  message: string;
  data: {
    rows_processed: number;
    rows_inserted: number;
    table_name: string;
    operation_time: number;
  };
}

export interface ExcelToDBGetAIMappingRequest {
  user_id: string;
  table_full_name: string;
  excel_file: File;
}

export interface ColumnMappingSuggestion {
  excel_column: string;
  suggested_db_column: string;
  confidence: number;
  data_type_match: boolean;
}

// New API response format
export interface MappingDetail {
  table_column: string;
  excel_column: string;
  is_identity: boolean;
  is_mapped: boolean;
  mapping_status: "MAPPED" | "IDENTITY" | "UNMAPPED";
}

export interface ExcelToDBGetAIMappingResponse {
  status: string;
  message: string;
  data: {
    all_table_columns: string[];
    identity_columns: string[];
    all_excel_columns: string[];
    mapping_details: MappingDetail[];
  };
}

// Legacy type for backward compatibility (if needed)
export interface LegacyExcelToDBGetAIMappingResponse {
  status: string;
  message: string;
  data: {
    table_name: string;
    excel_columns: string[];
    database_columns: string[];
    suggested_mapping: ColumnMappingSuggestion[];
    metadata: {
      excel_rows_analyzed: number;
      database_table_exists: boolean;
      mapping_confidence: number;
    };
  };
}
