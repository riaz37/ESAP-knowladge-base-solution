import { ApiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import {
  SignupRequest,
  SignupResponse,
  LoginRequest,
  LoginResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  User,
} from '@/types/auth';

/**
 * Authentication service for handling user authentication operations
 */
export class AuthService {
  private static apiClient = new ApiClient();

  /**
   * Register a new user
   */
  static async signup(data: SignupRequest): Promise<User> {
    try {
      const response = await this.apiClient.post<SignupResponse>(
        API_ENDPOINTS.AUTH_SIGNUP,
        data
      );
      
      return AuthService.transformUserResponse(response);
    } catch (error) {
      console.error('Signup failed:', error);
      throw AuthService.handleAuthError(error, 'signup');
    }
  }

  /**
   * Authenticate user and get access token
   */
  static async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await this.apiClient.post<LoginResponse>(
        API_ENDPOINTS.AUTH_LOGIN,
        data
      );
      
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw AuthService.handleAuthError(error, 'login');
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(accessToken: string): Promise<User> {
    try {
      const response = await this.apiClient.get<User>(
        API_ENDPOINTS.AUTH_PROFILE,
        undefined, // No query parameters
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      
      return AuthService.transformUserResponse(response);
    } catch (error) {
      console.error('Get profile failed:', error);
      throw AuthService.handleAuthError(error, 'get_profile');
    }
  }

  /**
   * Change user password
   */
  static async changePassword(
    data: ChangePasswordRequest,
    accessToken: string
  ): Promise<ChangePasswordResponse> {
    try {
      const response = await this.apiClient.post<ChangePasswordResponse>(
        API_ENDPOINTS.AUTH_CHANGE_PASSWORD,
        data,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      
      return response;
    } catch (error) {
      console.error('Change password failed:', error);
      throw AuthService.handleAuthError(error, 'change_password');
    }
  }

  /**
   * Validate JWT token and extract payload
   */
  static parseJWT(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Failed to parse JWT token:', error);
      return null;
    }
  }

  /**
   * Check if JWT token is expired
   */
  static isTokenExpired(token: string): boolean {
    try {
      const payload = this.parseJWT(token);
      if (!payload || !payload.exp) {
        return true;
      }
      
      // Check if token expires in the next 5 minutes
      const currentTime = Math.floor(Date.now() / 1000);
      const bufferTime = 5 * 60; // 5 minutes
      
      return payload.exp < (currentTime + bufferTime);
    } catch (error) {
      console.error('Failed to check token expiration:', error);
      return true;
    }
  }

  /**
   * Extract user ID from JWT token
   */
  static getUserIdFromToken(token: string): string | null {
    try {
      const payload = this.parseJWT(token);
      return payload?.user_id || null;
    } catch (error) {
      console.error('Failed to extract user ID from token:', error);
      return null;
    }
  }

  /**
   * Transform API user response to include userId alias for compatibility
   */
  static transformUserResponse(userData: any): any {
    return {
      ...userData,
      userId: userData.id, // Add userId alias for compatibility with existing codebase
    };
  }

  /**
   * Handle authentication-specific errors
   */
  private static handleAuthError(error: any, operation: string): Error {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          if (operation === 'signup') {
            return new Error(data?.message || 'Invalid signup data');
          }
          if (operation === 'login') {
            return new Error(data?.message || 'Invalid credentials');
          }
          if (operation === 'change_password') {
            return new Error(data?.message || 'Invalid password data');
          }
          return new Error(data?.message || 'Bad request');
          
        case 401:
          if (operation === 'login') {
            return new Error('Invalid username or password');
          }
          return new Error('Authentication required');
          
        case 403:
          return new Error('Access denied');
          
        case 409:
          if (operation === 'signup') {
            return new Error('Username or email already exists');
          }
          return new Error('Conflict with existing resource');
          
        case 422:
          return new Error(data?.message || 'Validation error');
          
        case 500:
          return new Error('Internal server error');
          
        default:
          return new Error(data?.message || 'Authentication failed');
      }
    } else if (error.request) {
      return new Error('Network error - no response received');
    } else {
      return new Error(error.message || 'Authentication failed');
    }
  }
} 