const baseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://176.9.16.194:8902";

const mssqlConfigBaseUrl = "https://176.9.16.194:8200";

/**
 * API endpoint definitions
 */
export const API_ENDPOINTS = {
  // Query endpoints
  SEARCH: `${baseUrl}/search`,
  QUERY: `${baseUrl}/mssql/query`,

  // File system endpoints
  SMART_FILE_SYSTEM: `${baseUrl}/smart_file_system`,
  BUNDLE_TASK_STATUS: (bundleId: string) =>
    `${baseUrl}/bundle_task_status/${bundleId}`,

  // History endpoints
  CONVERSATION_HISTORY: (userId: string) =>
    `${baseUrl}/mssql/conversation-history/${userId}`,
  CLEAR_HISTORY: (userId: string) => `${baseUrl}/mssql/clear-history/${userId}`,

  // Database management endpoints
  RELOAD_DB: `${baseUrl}/mssql/reload-db`,

  // Business rules endpoints
  GET_BUSINESS_RULES: `${baseUrl}/mssql/get_business-rules`,
  GET_BUSINESS_RULES_FILE: `${baseUrl}/mssql/get_business-rules_file`,
  UPDATE_BUSINESS_RULES: `${baseUrl}/mssql/update_business-rules`,

  // MSSQL Configuration endpoints
  CREATE_MSSQL_CONFIG: `${mssqlConfigBaseUrl}/mssql-config/mssql-config`,
  GET_MSSQL_CONFIGS: `${mssqlConfigBaseUrl}/mssql-config/mssql-config`,
  GET_MSSQL_CONFIG: (id: number) => `${mssqlConfigBaseUrl}/mssql-config/mssql-config/${id}`,

  // Parent Companies endpoints
  CREATE_PARENT_COMPANY: `${mssqlConfigBaseUrl}/mssql-config/parent-companies`,
  GET_PARENT_COMPANIES: `${mssqlConfigBaseUrl}/mssql-config/parent-companies`,
  GET_PARENT_COMPANY: (id: number) => `${mssqlConfigBaseUrl}/mssql-config/parent-companies/${id}`,

  // Sub Companies endpoints
  CREATE_SUB_COMPANY: `${mssqlConfigBaseUrl}/mssql-config/sub-companies`,
  GET_SUB_COMPANIES: `${mssqlConfigBaseUrl}/mssql-config/sub-companies`,
  GET_SUB_COMPANY: (id: number) => `${mssqlConfigBaseUrl}/mssql-config/sub-companies/${id}`,

  // User Access endpoints
  CREATE_USER_ACCESS: `${mssqlConfigBaseUrl}/mssql-config/user-access`,
  GET_USER_ACCESS_CONFIGS: `${mssqlConfigBaseUrl}/mssql-config/user-access`,
  GET_USER_ACCESS: (userId: string) => `${mssqlConfigBaseUrl}/mssql-config/user-access/${encodeURIComponent(userId)}`,
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
