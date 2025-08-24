/**
 * Storage utility functions for ESAP application
 */

// Storage keys for ESAP application
export const STORAGE_KEYS = {
  // Database context
  CURRENT_DATABASE: 'esap_current_database',
  AVAILABLE_DATABASES: 'esap_available_databases',
  USER_DATABASES: 'esap_user_databases',
  MSSQL_DATABASES: 'esap_mssql_databases',
  
  // Business rules context
  BUSINESS_RULES: 'esap_business_rules',
  
  // Auth (if needed)
  AUTH_TOKENS: 'auth_tokens',
  AUTH_USER: 'auth_user',
} as const;

/**
 * Clear all ESAP-related storage for a specific user
 */
export function clearESAPStorage(userId?: string): void {
  try {
    if (userId) {
      // Clear user-specific storage
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(`${key}_${userId}`);
      });
    } else {
      // Clear all ESAP storage (for logout)
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('esap_')) {
          localStorage.removeItem(key);
        }
      });
    }
    console.log('ESAP storage cleared successfully');
  } catch (error) {
    console.error('Failed to clear ESAP storage:', error);
  }
}

/**
 * Clear all ESAP storage (used during logout)
 */
export function clearAllESAPStorage(): void {
  clearESAPStorage();
}

/**
 * Get storage key for a specific user
 */
export function getUserStorageKey(key: string, userId: string): string {
  return `${key}_${userId}`;
}

/**
 * Save data to user-specific storage
 */
export function saveToUserStorage<T>(key: string, userId: string, data: T): void {
  try {
    localStorage.setItem(getUserStorageKey(key, userId), JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to save ${key} to storage:`, error);
  }
}

/**
 * Load data from user-specific storage
 */
export function loadFromUserStorage<T>(key: string, userId: string): T | null {
  try {
    const stored = localStorage.getItem(getUserStorageKey(key, userId));
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error(`Failed to load ${key} from storage:`, error);
    return null;
  }
} 