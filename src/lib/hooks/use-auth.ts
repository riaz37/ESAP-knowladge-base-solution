import { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthService } from '@/lib/api/services/auth-service';
import {
  User,
  SignupRequest,
  LoginRequest,
  ChangePasswordRequest,
  AuthState,
  AuthTokens,
  AuthError,
} from '@/types/auth';

/**
 * Custom hook for managing authentication state and operations
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated
  const isAuthenticated = useMemo(() => {
    return !!user && !!tokens?.accessToken && !AuthService.isTokenExpired(tokens.accessToken);
  }, [user, tokens]);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedTokens = localStorage.getItem('auth_tokens');
        const storedUser = localStorage.getItem('auth_user');
        
        if (storedTokens && storedUser) {
          const parsedTokens: AuthTokens = JSON.parse(storedTokens);
          const parsedUser: User = JSON.parse(storedUser);
          
          // Check if token is still valid
          if (!AuthService.isTokenExpired(parsedTokens.accessToken)) {
            setTokens(parsedTokens);
            setUser(parsedUser);
          } else {
            // Token expired, clear storage
            clearAuthStorage();
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth from localStorage:', error);
        clearAuthStorage();
      }
    };

    initializeAuth();
  }, []);

  // Save auth data to localStorage
  const saveAuthToStorage = useCallback((userData: User, authTokens: AuthTokens) => {
    try {
      localStorage.setItem('auth_tokens', JSON.stringify(authTokens));
      localStorage.setItem('auth_user', JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to save auth data to localStorage:', error);
    }
  }, []);

  // Clear auth data from localStorage
  const clearAuthStorage = useCallback(() => {
    try {
      localStorage.removeItem('auth_tokens');
      localStorage.removeItem('auth_user');
    } catch (error) {
      console.error('Failed to clear auth data from localStorage:', error);
    }
  }, []);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // User registration
  const signup = useCallback(async (data: SignupRequest): Promise<User> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newUser = await AuthService.signup(data);
      
      // After successful signup, automatically log in
      const loginData: LoginRequest = {
        username: data.username,
        password: data.password,
      };
      
      const loginResponse = await AuthService.login(loginData);
      const userProfile = await AuthService.getProfile(loginResponse.access_token);
      
      const authTokens: AuthTokens = {
        accessToken: loginResponse.access_token,
        tokenType: loginResponse.token_type,
        expiresAt: AuthService.parseJWT(loginResponse.access_token)?.exp,
      };
      
      setUser(userProfile);
      setTokens(authTokens);
      saveAuthToStorage(userProfile, authTokens);
      
      return userProfile;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Signup failed';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [saveAuthToStorage]);

  // User login
  const login = useCallback(async (data: LoginRequest): Promise<User> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const loginResponse = await AuthService.login(data);
      const userProfile = await AuthService.getProfile(loginResponse.access_token);
      
      const authTokens: AuthTokens = {
        accessToken: loginResponse.access_token,
        tokenType: loginResponse.token_type,
        expiresAt: AuthService.parseJWT(loginResponse.access_token)?.exp,
      };
      
      setUser(userProfile);
      setTokens(authTokens);
      saveAuthToStorage(userProfile, authTokens);
      
      return userProfile;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [saveAuthToStorage]);

  // User logout
  const logout = useCallback(() => {
    setUser(null);
    setTokens(null);
    clearAuthStorage();
  }, [clearAuthStorage]);

  // Change password
  const changePassword = useCallback(async (data: ChangePasswordRequest): Promise<void> => {
    if (!tokens?.accessToken) {
      throw new Error('No access token available');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await AuthService.changePassword(data, tokens.accessToken);
      
      // After password change, user needs to login again
      logout();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password change failed';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [tokens?.accessToken, logout]);

  // Refresh user profile
  const refreshUser = useCallback(async (): Promise<void> => {
    if (!tokens?.accessToken) {
      return;
    }
    
    try {
      const userProfile = await AuthService.getProfile(tokens.accessToken);
      setUser(userProfile);
      saveAuthToStorage(userProfile, tokens);
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
      
      // If token is invalid, logout user
      if (error instanceof Error && error.message.includes('Authentication required')) {
        logout();
      }
    }
  }, [tokens?.accessToken, saveAuthToStorage, logout]);

  // Auto-refresh user profile when token is about to expire
  useEffect(() => {
    if (!tokens?.accessToken) return;
    
    const checkTokenExpiry = () => {
      if (AuthService.isTokenExpired(tokens.accessToken)) {
        logout();
      } else {
        // Refresh user profile every 5 minutes
        refreshUser();
      }
    };
    
    const interval = setInterval(checkTokenExpiry, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(interval);
  }, [tokens?.accessToken, logout, refreshUser]);

  // Get current access token
  const getAccessToken = useCallback((): string | null => {
    if (!tokens?.accessToken || AuthService.isTokenExpired(tokens.accessToken)) {
      return null;
    }
    return tokens.accessToken;
  }, [tokens?.accessToken]);

  // Check if user has specific role
  const hasRole = useCallback((role: string): boolean => {
    if (!tokens?.accessToken) return false;
    
    try {
      const payload = AuthService.parseJWT(tokens.accessToken);
      return payload?.roles?.includes(role) || false;
    } catch {
      return false;
    }
  }, [tokens?.accessToken]);

  // Check if user has specific permission
  const hasPermission = useCallback((permission: string): boolean => {
    if (!tokens?.accessToken) return false;
    
    try {
      const payload = AuthService.parseJWT(tokens.accessToken);
      return payload?.permissions?.includes(permission) || false;
    } catch {
      return false;
    }
  }, [tokens?.accessToken]);

  const authState: AuthState = {
    user,
    tokens,
    isAuthenticated,
    isLoading,
    error,
  };

  return {
    ...authState,
    signup,
    login,
    logout,
    changePassword,
    refreshUser,
    clearError,
    getAccessToken,
    hasRole,
    hasPermission,
  };
} 