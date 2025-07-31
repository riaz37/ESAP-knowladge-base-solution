const baseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://176.9.16.194:8902";

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
