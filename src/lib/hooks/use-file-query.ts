import { useState } from "react";
import { QueryService, SearchQueryParams } from "../api";

/**
 * Hook for making file queries
 */
export function useFileQuery() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<any>(null);
  const [rawResponse, setRawResponse] = useState<any>(null);

  /**
   * Send a query to the API
   */
  const sendQuery = async (params: SearchQueryParams) => {
    setLoading(true);
    setError(null);
    setResponse(null);
    setRawResponse(null);

    try {
      const result = await QueryService.search(params);
      setRawResponse(result);
      setResponse(result.data.answer);
    } catch (err: any) {
      setError(err.message || "Failed to process query");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    response,
    rawResponse,
    sendQuery,
    setResponse,
  };
}
