import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import {
  UserAccessCreateRequest,
  UserAccessCreateResponse,
  UserAccessResponse,
  UserAccessListResponse,
} from "@/types/api";

/**
 * Service for managing user access to databases and companies
 */
export class UserAccessService {
  /**
   * Create or update user access configuration
   */
  static async createUserAccess(
    accessConfig: UserAccessCreateRequest
  ): Promise<UserAccessCreateResponse> {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.CREATE_USER_ACCESS,
        accessConfig
      );
      return response.data;
    } catch (error) {
      console.error("Error creating user access:", error);
      throw error;
    }
  }

  /**
   * Get all user access configurations
   */
  static async getUserAccessConfigs(): Promise<UserAccessListResponse> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.GET_USER_ACCESS_CONFIGS);
      return response.data;
    } catch (error) {
      console.error("Error fetching user access configurations:", error);
      throw error;
    }
  }

  /**
   * Get access configurations for a specific user
   */
  static async getUserAccess(userId: string): Promise<UserAccessResponse> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.GET_USER_ACCESS(userId));
      return response.data;
    } catch (error) {
      console.error(`Error fetching user access for ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Validate user access configuration before creating
   */
  static validateUserAccess(config: UserAccessCreateRequest): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Validate user_id (should be email format)
    if (!config.user_id || config.user_id.trim() === "") {
      errors.push("User ID is required");
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(config.user_id)) {
        errors.push("User ID should be a valid email address");
      }
    }

    // Validate parent company ID
    if (!config.parent_company_id || config.parent_company_id <= 0) {
      errors.push("Valid parent company ID is required");
    }

    // Validate sub company IDs
    if (!Array.isArray(config.sub_company_ids)) {
      errors.push("Sub company IDs must be an array");
    } else if (config.sub_company_ids.some(id => id <= 0)) {
      errors.push("All sub company IDs must be valid positive numbers");
    }

    // Validate database access structure
    if (!config.database_access) {
      errors.push("Database access configuration is required");
    } else {
      // Validate parent databases
      if (!Array.isArray(config.database_access.parent_databases)) {
        errors.push("Parent databases must be an array");
      } else {
        config.database_access.parent_databases.forEach((db, index) => {
          if (!db.db_id || db.db_id <= 0) {
            errors.push(`Parent database ${index + 1}: Invalid database ID`);
          }
          if (!['full', 'read_only', 'limited'].includes(db.access_level)) {
            errors.push(`Parent database ${index + 1}: Invalid access level`);
          }
        });
      }

      // Validate sub databases
      if (!Array.isArray(config.database_access.sub_databases)) {
        errors.push("Sub databases must be an array");
      } else {
        config.database_access.sub_databases.forEach((subDb, index) => {
          if (!subDb.sub_company_id || subDb.sub_company_id <= 0) {
            errors.push(`Sub database ${index + 1}: Invalid sub company ID`);
          }
          if (!Array.isArray(subDb.databases)) {
            errors.push(`Sub database ${index + 1}: Databases must be an array`);
          } else {
            subDb.databases.forEach((db, dbIndex) => {
              if (!db.db_id || db.db_id <= 0) {
                errors.push(`Sub database ${index + 1}, database ${dbIndex + 1}: Invalid database ID`);
              }
              if (!['full', 'read_only', 'limited'].includes(db.access_level)) {
                errors.push(`Sub database ${index + 1}, database ${dbIndex + 1}: Invalid access level`);
              }
            });
          }
        });
      }
    }

    // Validate table_shows structure
    if (!config.table_shows || typeof config.table_shows !== 'object') {
      errors.push("Table shows configuration is required and must be an object");
    } else {
      Object.entries(config.table_shows).forEach(([dbId, tables]) => {
        if (isNaN(Number(dbId))) {
          errors.push(`Table shows: Database ID '${dbId}' must be a number`);
        }
        if (!Array.isArray(tables)) {
          errors.push(`Table shows: Tables for database ${dbId} must be an array`);
        } else if (tables.some(table => typeof table !== 'string' || table.trim() === '')) {
          errors.push(`Table shows: All table names for database ${dbId} must be non-empty strings`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Helper method to create a basic access configuration template
   */
  static createAccessTemplate(
    userId: string,
    parentCompanyId: number,
    subCompanyIds: number[] = []
  ): Partial<UserAccessCreateRequest> {
    return {
      user_id: userId,
      parent_company_id: parentCompanyId,
      sub_company_ids: subCompanyIds,
      database_access: {
        parent_databases: [],
        sub_databases: [],
      },
      table_shows: {},
    };
  }
}

export default UserAccessService;