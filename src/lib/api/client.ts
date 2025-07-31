import { ApiRequestConfig, ApiResponse, ApiError } from "@/types/api";
import { NetworkError } from "@/types/error";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

/**
 * Default request configuration
 */
const DEFAULT_CONFIG: ApiRequestConfig = {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 30000, // 30 seconds
  retries: 0,
};

/**
 * Creates an enhanced error object from API error response
 */
export const createApiError = (
  error: any,
  url: string,
  method: string,
  retryCount = 0
): NetworkError & { retryCount: number } => {
  // Handle different error types
  if (error.response) {
    // Server responded with error status
    const apiError: ApiError = error.response.data?.error || {
      code: `HTTP_${error.response.status}`,
      message: error.response.statusText || "Server error",
      statusCode: error.response.status,
    };

    return {
      code: apiError.code,
      message: apiError.message,
      details: apiError.details,
      statusCode: apiError.statusCode,
      timestamp: new Date(),
      url,
      method,
      stack: error.stack,
      retryCount,
    } as NetworkError & { retryCount: number };
  } else if (error.request) {
    // Request was made but no response received
    return {
      code: "NETWORK_ERROR",
      message: "No response received from server",
      timestamp: new Date(),
      url,
      method,
      offline: !navigator.onLine,
      timeout: error.code === "ECONNABORTED",
      stack: error.stack,
      retryCount,
    } as NetworkError & { retryCount: number };
  } else {
    // Error setting up the request
    return {
      code: "REQUEST_SETUP_ERROR",
      message: error.message || "Error setting up the request",
      timestamp: new Date(),
      url,
      method,
      stack: error.stack,
      retryCount,
    } as NetworkError & { retryCount: number };
  }
};

/**
 * Base API client for making HTTP requests
 */
export class ApiClient {
  private baseUrl: string;
  private defaultConfig: ApiRequestConfig;
  private requestInterceptors: Array<
    (config: ApiRequestConfig) => ApiRequestConfig
  > = [];
  private responseInterceptors: Array<(response: any) => any> = [];
  private errorInterceptors: Array<
    (error: NetworkError) => Promise<any> | NetworkError
  > = [];

  constructor(
    baseUrlParam: string = baseUrl,
    config: Partial<ApiRequestConfig> = {}
  ) {
    this.baseUrl = baseUrlParam;
    this.defaultConfig = { ...DEFAULT_CONFIG, ...config };

    // Add default error interceptor for retry logic
    this.addErrorInterceptor(this.retryInterceptor.bind(this));
  }

  /**
   * Add request interceptor
   */
  addRequestInterceptor(
    interceptor: (config: ApiRequestConfig) => ApiRequestConfig
  ): void {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * Add response interceptor
   */
  addResponseInterceptor(interceptor: (response: any) => any): void {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * Add error interceptor
   */
  addErrorInterceptor(
    interceptor: (error: NetworkError) => Promise<any> | NetworkError
  ): void {
    this.errorInterceptors.push(interceptor);
  }

  /**
   * Default retry interceptor
   */
  private async retryInterceptor(error: NetworkError): Promise<any> {
    const config = (error as any).config as ApiRequestConfig;

    // If retries are configured and we haven't exceeded the limit
    if (
      config?.retries &&
      config.retryCount !== undefined &&
      config.retryCount < config.retries
    ) {
      // Increment retry count
      config.retryCount++;

      // Exponential backoff
      const delay = Math.pow(2, config.retryCount) * 1000;

      // Wait and retry
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Retry the request
      return this.request(config.url as string, config);
    }

    // If we can't retry, throw the error
    throw error;
  }

  /**
   * Process request config through interceptors
   */
  private processRequestConfig(config: ApiRequestConfig): ApiRequestConfig {
    return this.requestInterceptors.reduce(
      (processedConfig, interceptor) => interceptor(processedConfig),
      config
    );
  }

  /**
   * Process response through interceptors
   */
  private processResponse(response: any): any {
    return this.responseInterceptors.reduce(
      (processedResponse, interceptor) => interceptor(processedResponse),
      response
    );
  }

  /**
   * Process error through interceptors
   */
  private async processError(error: NetworkError): Promise<any> {
    let processedError = error;

    for (const interceptor of this.errorInterceptors) {
      try {
        const result = interceptor(processedError);
        if (result instanceof Promise) {
          return await result;
        } else {
          processedError = result;
        }
      } catch (e) {
        processedError = e as NetworkError;
      }
    }

    throw processedError;
  }

  /**
   * Make an HTTP request
   */
  async request<T = any>(
    endpoint: string,
    config: Partial<ApiRequestConfig> = {}
  ): Promise<ApiResponse<T>> {
    // Merge configs
    const mergedConfig: ApiRequestConfig = {
      ...this.defaultConfig,
      ...config,
      headers: {
        ...this.defaultConfig.headers,
        ...config.headers,
      },
      // Initialize retry count if retries are enabled
      retryCount: 0,
    };

    // Process config through interceptors
    const processedConfig = this.processRequestConfig(mergedConfig);

    // Build URL
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${this.baseUrl}${
          endpoint.startsWith("/") ? endpoint : `/${endpoint}`
        }`;

    // Build query params
    const queryParams = processedConfig.params
      ? `?${new URLSearchParams(
          processedConfig.params as Record<string, string>
        ).toString()}`
      : "";

    // Build request options
    const requestOptions: RequestInit = {
      method: processedConfig.method,
      headers: processedConfig.headers as HeadersInit,
      signal: processedConfig.timeout
        ? AbortSignal.timeout(processedConfig.timeout)
        : undefined,
    };

    // Add body for non-GET requests
    if (processedConfig.method !== "GET" && processedConfig.body) {
      requestOptions.body = JSON.stringify(processedConfig.body);
    }

    try {
      // Make the request
      const response = await fetch(`${url}${queryParams}`, requestOptions);

      // Parse response
      const data = await response.json();

      // Check if response is successful
      if (!response.ok) {
        throw createApiError(
          {
            response: {
              data,
              status: response.status,
              statusText: response.statusText,
            },
          },
          url,
          processedConfig.method || "GET"
        );
      }

      // Process response through interceptors
      return this.processResponse(data);
    } catch (error) {
      // Create API error
      const apiError = createApiError(
        error,
        url,
        processedConfig.method || "GET",
        processedConfig.retryCount
      );

      // Store config in error for retry logic
      (apiError as any).config = {
        ...processedConfig,
        url: endpoint,
      };

      // Process error through interceptors
      return this.processError(apiError);
    }
  }

  /**
   * Make a GET request
   */
  async get<T = any>(
    endpoint: string,
    params?: Record<string, any>,
    config: Partial<ApiRequestConfig> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: "GET",
      params,
    });
  }

  /**
   * Make a POST request
   */
  async post<T = any>(
    endpoint: string,
    body?: any,
    config: Partial<ApiRequestConfig> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: "POST",
      body,
    });
  }

  /**
   * Make a PUT request
   */
  async put<T = any>(
    endpoint: string,
    body?: any,
    config: Partial<ApiRequestConfig> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PUT",
      body,
    });
  }

  /**
   * Make a PATCH request
   */
  async patch<T = any>(
    endpoint: string,
    body?: any,
    config: Partial<ApiRequestConfig> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PATCH",
      body,
    });
  }

  /**
   * Make a DELETE request
   */
  async delete<T = any>(
    endpoint: string,
    config: Partial<ApiRequestConfig> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: "DELETE",
    });
  }
}

// Create and export default API client instance
export const apiClient = new ApiClient(baseUrl);

// Export default instance
export default apiClient;