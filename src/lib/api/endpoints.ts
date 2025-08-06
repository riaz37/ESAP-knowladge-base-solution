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
  CREATE_MSSQL_CONFIG: `${baseUrl}/mssql-config/mssql-config`,
  GET_MSSQL_CONFIGS: `${baseUrl}/mssql-config/mssql-config`,
  GET_MSSQL_CONFIG: (id: number) =>
    `${baseUrl}/mssql-config/mssql-config/${id}`,
  UPDATE_MSSQL_CONFIG: (id: number) =>
    `${baseUrl}/mssql-config/mssql-config/${id}`,

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

  // User Configuration endpoints
  CREATE_USER_CONFIG: `${baseUrl}/user-config`,
  GET_USER_CONFIGS: `${baseUrl}/user-config`,
  GET_USER_CONFIG: (userId: string) =>
    `${baseUrl}/user-config/${encodeURIComponent(userId)}`,

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
};

/**
 * Helper function to build endpoint URL with query parameters
 */
export function buildEndpointWithQueryParams(
  endpoint: string,
  params: Record<string, any>
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
  params: Record<string, string | number>
): string {
  let endpoint = endpointTemplate;

  Object.entries(params).forEach(([key, value]) => {
    endpoint = endpoint.replace(`:${key}`, String(value));
  });

  return endpoint;
}
