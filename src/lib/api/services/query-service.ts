import { ApiResponse } from "@/types/api";
import { apiClient } from "../client";
import { API_ENDPOINTS, buildEndpointWithQueryParams } from "../endpoints";
import { transformResponse } from "../transformers";

/**
 * Interface for search query parameters
 */
export interface SearchQueryParams {
  query: string;
  useIntentReranker: boolean;
  useChunkReranker: boolean;
  useDualEmbeddings?: boolean;
  intentTopK?: number;
  chunkTopK?: number;
  chunkSource?: string;
  maxChunksForAnswer?: number;
  answerStyle?: string;
}

/**
 * Interface for database query parameters
 */
export interface DbQueryParams {
  question: string;
  userId: string;
}

/**
 * Service for handling query-related API calls
 */
export const QueryService = {
  /**
   * Send a search query to the API
   */
  async search(params: SearchQueryParams): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.SEARCH, {
        query: params.query,
        use_intent_reranker: params.useIntentReranker,
        use_chunk_reranker: params.useChunkReranker,
        use_dual_embeddings: params.useDualEmbeddings ?? true,
        intent_top_k: params.intentTopK ?? 20,
        chunk_top_k: params.chunkTopK ?? 40,
        chunk_source: params.chunkSource ?? "reranked",
        max_chunks_for_answer: params.maxChunksForAnswer ?? 40,
        answer_style: params.answerStyle ?? "detailed",
      });

      return transformResponse(response);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Send a database query to the API
   */
  async query(params: DbQueryParams): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.QUERY, {
        question: params.question,
        user_id: params.userId,
      });
      return transformResponse(response);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Send a database query directly with question and userId
   */
  async sendDatabaseQuery(
    question: string,
    userId: string
  ): Promise<ApiResponse<any>> {
    return this.query({
      question,
      userId,
    });
  },
};

export default QueryService;
