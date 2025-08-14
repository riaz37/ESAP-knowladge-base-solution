const baseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://176.9.16.194:8200";

/**
 * API endpoint definitions
 */
export const API_ENDPOINTS = {
  // Query endpoints
  SEARCH: `${baseUrl}/search`,
  QUERY: `${baseUrl}/mssql/query`,

  // File system endpoints
  SMART_FILE_SYSTEM: `${baseUrl}/files/smart_file_system`,
  BUNDLE_TASK_STATUS: (bundleId: string) =>
    `${baseUrl}/files/bundle_task_status/${bundleId}`,

  // History endpoints
  CONVERSATION_HISTORY: (userId: string) =>
    `${baseUrl}/mssql/conversation-history/${userId}`,
  CLEAR_HISTORY: (userId: string) => `${baseUrl}/mssql/clear-history/${userId}`,

  // Database management endpoints
  RELOAD_DB: `${baseUrl}/mssql/reload-db`,

  // MSSQL Configuration endpoints
  SET_MSSQL_CONFIG: `${baseUrl}/mssql-config/mssql-config/set-config`,
  GET_MSSQL_CONFIGS: `${baseUrl}/mssql-config/mssql-config`,
  GET_MSSQL_CONFIG: (id: number) =>
    `${baseUrl}/mssql-config/mssql-config/${id}`,
  UPDATE_MSSQL_CONFIG: (id: number) =>
    `${baseUrl}/mssql-config/mssql-config/update-config/${id}`,

  // Parent Companies endpoints
  CREATE_PARENT_COMPANY: `${baseUrl}/mssql-config/parent-companies`,
  GET_PARENT_COMPANIES: `${baseUrl}/mssql-config/parent-companies`,
  GET_PARENT_COMPANY: (id: number) =>
    `${baseUrl}/mssql-config/parent-companies/${id}`,

  // Sub Companies endpoints
  CREATE_SUB_COMPANY: `${baseUrl}/mssql-config/sub-companies`,
  GET_SUB_COMPANIES: `${baseUrl}/mssql-config/sub-companies`,
  GET_SUB_COMPANY: (id: number) =>
    `${baseUrl}/mssql-config/sub-companies/${id}`,

  // User Access endpoints
  CREATE_USER_ACCESS: `${baseUrl}/mssql-config/user-access`,
  GET_USER_ACCESS_CONFIGS: `${baseUrl}/mssql-config/user-access`,
  GET_USER_ACCESS: (userId: string) =>
    `${baseUrl}/mssql-config/user-access/${encodeURIComponent(userId)}`,

  // Database Configuration endpoints
  CREATE_DATABASE_CONFIG: `${baseUrl}/database-config`,
  GET_DATABASE_CONFIGS: `${baseUrl}/database-config`,
  GET_DATABASE_CONFIG: (id: number) => `${baseUrl}/database-config/${id}`,
  UPDATE_DATABASE_CONFIG: (id: number) => `${baseUrl}/database-config/${id}`,
  DELETE_DATABASE_CONFIG: (id: number) => `${baseUrl}/database-config/${id}`,

  // User Configuration endpoints
  CREATE_USER_CONFIG: `${baseUrl}/user-config`,
  GET_USER_CONFIGS: `${baseUrl}/user-config`,
  GET_USER_CONFIG: (userId: string) =>
    `${baseUrl}/user-config/${encodeURIComponent(userId)}`,
  GET_USER_CONFIG_BY_DB: (userId: string, dbId: number) =>
    `${baseUrl}/user-config/${encodeURIComponent(userId)}/${dbId}`,
  GET_CONFIG_BY_ID: (id: number) => `${baseUrl}/config/${id}`,
  UPDATE_USER_CONFIG: (id: number) => `${baseUrl}/user-config/${id}`,

  // User Table Names endpoints
  ADD_USER_TABLE_NAME: (userId: string) =>
    `${baseUrl}/user/${encodeURIComponent(userId)}/table-names`,
  GET_USER_TABLE_NAMES: (userId: string) =>
    `${baseUrl}/user/${encodeURIComponent(userId)}/table-names`,
  DELETE_USER_TABLE_NAME: (userId: string, tableName: string) =>
    `${baseUrl}/user/${encodeURIComponent(userId)}/table-names/${encodeURIComponent(tableName)}`,

  // User Current Database endpoints
  SET_USER_CURRENT_DB: (userId: string) =>
    `${baseUrl}/mssql-config/user-current-db/${encodeURIComponent(userId)}`,
  GET_USER_CURRENT_DB: (userId: string) =>
    `${baseUrl}/mssql-config/user-current-db/${encodeURIComponent(userId)}`,

  // MSSQL Config Advanced Operations
  GENERATE_TABLE_INFO: (id: number) =>
    `${baseUrl}/mssql-config/mssql-config/${id}/generate-table-info`,
  GET_TASK_STATUS: (taskId: string) =>
    `${baseUrl}/mssql-config/mssql-config/tasks/${taskId}`,
  GENERATE_MATCHED_TABLES: (id: number) =>
    `${baseUrl}/mssql-config/mssql-config/${id}/generate-matched-tables`,

  // Excel to Database endpoints
  EXCEL_TO_DB_HEALTH: `${baseUrl}/excel-to-db/excel-to-db/health`,
  EXCEL_TO_DB_PUSH_DATA: `${baseUrl}/excel-to-db/excel-to-db/push-data`,
  EXCEL_TO_DB_GET_AI_MAPPING: `${baseUrl}/excel-to-db/excel-to-db/get-ai-mapping`,

  // New Table Management endpoints
  CREATE_TABLE: `${baseUrl}/new-table/create`,
  GET_DATA_TYPES: `${baseUrl}/new-table/data-types`,
  GET_USER_TABLES: (userId: string) =>
    `${baseUrl}/new-table/user-tables/${encodeURIComponent(userId)}`,
  GET_TABLES_BY_DB: (dbId: number) =>
    `${baseUrl}/new-table/user-tables-by-db/${dbId}`,
  SETUP_TRACKING_TABLE: `${baseUrl}/new-table/setup-tracking-table`,
  UPDATE_USER_BUSINESS_RULE: (userId: string) =>
    `${baseUrl}/new-table/user-business-rule/${encodeURIComponent(userId)}`,
  GET_USER_BUSINESS_RULE: (userId: string) =>
    `${baseUrl}/new-table/user-business-rule/${encodeURIComponent(userId)}`,
};

/**
 * Helper function to build endpoint URL with query parameters
 */
export function buildEndpointWithQueryParams(
  endpoint: string,
  params: Record<string, any>,
): string {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, String(value));
    }
  });

  const queryString = queryParams.toString();

  if (!queryString) {
    return endpoint;
  }

  return `${endpoint}?${queryString}`;
}

/**
 * Helper function to build endpoint URL with path parameters
 */
export function buildEndpointWithPathParams(
  endpointTemplate: string,
  params: Record<string, string | number>,
): string {
  let endpoint = endpointTemplate;

  Object.entries(params).forEach(([key, value]) => {
    endpoint = endpoint.replace(`:${key}`, String(value));
  });

  return endpoint;
}
