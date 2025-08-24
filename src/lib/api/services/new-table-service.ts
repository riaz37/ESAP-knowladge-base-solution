import { API_ENDPOINTS } from "../endpoints";
import { BaseService, ServiceResponse } from "./base";
import {
  NewTableCreateRequest,
  NewTableCreateResponse,
  NewTableGetRequest,
  NewTableGetResponse,
  NewTableUpdateRequest,
  NewTableUpdateResponse,
  NewTableDeleteRequest,
  NewTableDeleteResponse,
} from "@/types/api";

/**
 * Service for managing new table operations
 * All methods use JWT authentication - user ID is extracted from token on backend
 */
export class NewTableService extends BaseService {
  protected readonly serviceName = 'NewTableService';

  /**
   * Create a new table
   * User ID is extracted from JWT token on backend
   */
  async createTable(
    request: Omit<NewTableCreateRequest, 'user_id'>
  ): Promise<ServiceResponse<NewTableCreateResponse>> {
    this.validateRequired(request, ['table_name', 'columns', 'database_id']);
    this.validateTypes(request, {
      table_name: 'string',
      database_id: 'number',
    });

    if (request.table_name.trim().length === 0) {
      throw this.createValidationError('Table name cannot be empty');
    }

    if (!Array.isArray(request.columns) || request.columns.length === 0) {
      throw this.createValidationError('At least one column is required');
    }

    if (request.database_id <= 0) {
      throw this.createValidationError('Database ID must be positive');
    }

    // Validate table name format
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(request.table_name)) {
      throw this.createValidationError('Table name must start with a letter and contain only letters, numbers, and underscores');
    }

    // Validate table name length
    if (request.table_name.length > 64) {
      throw this.createValidationError('Table name cannot be longer than 64 characters');
    }

    // Validate columns
    this.validateColumns(request.columns);

    // Check for reserved table names
    const reservedNames = ['user', 'users', 'admin', 'system', 'table', 'column', 'index', 'view'];
    if (reservedNames.includes(request.table_name.toLowerCase())) {
      throw this.createValidationError('Table name cannot be a reserved keyword');
    }

    const createRequest: NewTableCreateRequest = {
      ...request,
      // user_id is extracted from JWT token on backend
    };

    return this.post<NewTableCreateResponse>(
      API_ENDPOINTS.NEW_TABLE_CREATE,
      createRequest
    );
  }

  /**
   * Get table information
   * User ID is extracted from JWT token on backend
   */
  async getTable(
    request: Omit<NewTableGetRequest, 'user_id'>
  ): Promise<ServiceResponse<NewTableGetResponse>> {
    this.validateRequired(request, ['table_name', 'database_id']);
    this.validateTypes(request, {
      table_name: 'string',
      database_id: 'number',
    });

    if (request.table_name.trim().length === 0) {
      throw this.createValidationError('Table name cannot be empty');
    }

    if (request.database_id <= 0) {
      throw this.createValidationError('Database ID must be positive');
    }

    const getRequest: NewTableGetRequest = {
      ...request,
      // user_id is extracted from JWT token on backend
    };

    return this.post<NewTableGetResponse>(
      API_ENDPOINTS.NEW_TABLE_GET,
      getRequest
    );
  }

  /**
   * Update table structure
   * User ID is extracted from JWT token on backend
   */
  async updateTable(
    request: Omit<NewTableUpdateRequest, 'user_id'>
  ): Promise<ServiceResponse<NewTableUpdateResponse>> {
    this.validateRequired(request, ['table_name', 'database_id']);
    this.validateTypes(request, {
      table_name: 'string',
      database_id: 'number',
    });

    if (request.table_name.trim().length === 0) {
      throw this.createValidationError('Table name cannot be empty');
    }

    if (request.database_id <= 0) {
      throw this.createValidationError('Database ID must be positive');
    }

    // Validate optional fields if provided
    if (request.add_columns && Array.isArray(request.add_columns)) {
      this.validateColumns(request.add_columns);
    }

    if (request.drop_columns && Array.isArray(request.drop_columns)) {
      if (request.drop_columns.length === 0) {
        throw this.createValidationError('Drop columns array cannot be empty if provided');
      }
      
      request.drop_columns.forEach((columnName, index) => {
        if (!columnName || typeof columnName !== 'string' || columnName.trim().length === 0) {
          throw this.createValidationError(`Drop column name at index ${index} is invalid`);
        }
      });
    }

    if (request.modify_columns && Array.isArray(request.modify_columns)) {
      this.validateColumns(request.modify_columns);
    }

    const updateRequest: NewTableUpdateRequest = {
      ...request,
      // user_id is extracted from JWT token on backend
    };

    return this.post<NewTableUpdateResponse>(
      API_ENDPOINTS.NEW_TABLE_UPDATE,
      updateRequest
    );
  }

  /**
   * Delete a table
   * User ID is extracted from JWT token on backend
   */
  async deleteTable(
    request: Omit<NewTableDeleteRequest, 'user_id'>
  ): Promise<ServiceResponse<NewTableDeleteResponse>> {
    this.validateRequired(request, ['table_name', 'database_id']);
    this.validateTypes(request, {
      table_name: 'string',
      database_id: 'number',
    });

    if (request.table_name.trim().length === 0) {
      throw this.createValidationError('Table name cannot be empty');
    }

    if (request.database_id <= 0) {
      throw this.createValidationError('Database ID must be positive');
    }

    const deleteRequest: NewTableDeleteRequest = {
      ...request,
      // user_id is extracted from JWT token on backend
    };

    return this.post<NewTableDeleteResponse>(
      API_ENDPOINTS.NEW_TABLE_DELETE,
      deleteRequest
    );
  }

  /**
   * Get all tables for a database
   * User ID is extracted from JWT token on backend
   */
  async getTablesForDatabase(databaseId: number): Promise<ServiceResponse<{
    tables: Array<{
      name: string;
      columns: number;
      rows?: number;
      created_at?: string;
      updated_at?: string;
    }>;
    count: number;
  }>> {
    this.validateRequired({ databaseId }, ['databaseId']);
    this.validateTypes({ databaseId }, { databaseId: 'number' });

    if (databaseId <= 0) {
      throw this.createValidationError('Database ID must be positive');
    }

    // This would require a specific endpoint for listing tables
    // For now, return a placeholder response
    return {
      data: {
        tables: [],
        count: 0,
      },
      success: true,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Validate table existence
   */
  async validateTableExists(
    tableName: string,
    databaseId: number
  ): Promise<ServiceResponse<{
    exists: boolean;
    tableInfo?: {
      columns: Array<{
        name: string;
        type: string;
        nullable: boolean;
        default?: string;
      }>;
      rowCount?: number;
      indexes?: string[];
    };
  }>> {
    try {
      const response = await this.getTable({ table_name: tableName, database_id: databaseId });
      
      if (response.success && response.data) {
        return {
          data: {
            exists: true,
            tableInfo: {
              columns: response.data.columns || [],
              rowCount: response.data.row_count,
              indexes: response.data.indexes,
            },
          },
          success: true,
          timestamp: new Date().toISOString(),
        };
      }
      
      return {
        data: { exists: false },
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        data: { exists: false },
        success: true,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Generate table creation SQL
   */
  generateCreateTableSQL(
    tableName: string,
    columns: Array<{
      name: string;
      type: string;
      nullable?: boolean;
      default?: string;
      primary_key?: boolean;
    }>
  ): ServiceResponse<{
    sql: string;
    warnings: string[];
  }> {
    const warnings: string[] = [];

    // Validate inputs
    if (!tableName || tableName.trim().length === 0) {
      throw this.createValidationError('Table name is required');
    }

    if (!Array.isArray(columns) || columns.length === 0) {
      throw this.createValidationError('At least one column is required');
    }

    // Validate table name
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(tableName)) {
      throw this.createValidationError('Invalid table name format');
    }

    // Validate columns
    this.validateColumns(columns);

    // Generate SQL
    const columnDefinitions = columns.map(column => {
      let definition = `${column.name} ${column.type}`;
      
      if (!column.nullable) {
        definition += ' NOT NULL';
      }
      
      if (column.default !== undefined) {
        definition += ` DEFAULT ${column.default}`;
      }
      
      if (column.primary_key) {
        definition += ' PRIMARY KEY';
      }
      
      return definition;
    });

    const sql = `CREATE TABLE ${tableName} (\n  ${columnDefinitions.join(',\n  ')}\n);`;

    // Add warnings
    if (columns.length > 50) {
      warnings.push('Table has many columns, consider normalizing the design');
    }

    const primaryKeyColumns = columns.filter(col => col.primary_key);
    if (primaryKeyColumns.length === 0) {
      warnings.push('No primary key defined, consider adding one');
    }

    if (primaryKeyColumns.length > 1) {
      warnings.push('Multiple primary keys defined, only one is allowed per table');
    }

    return {
      data: {
        sql,
        warnings,
      },
      success: true,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Validate columns structure
   */
  private validateColumns(columns: Array<{
    name: string;
    type: string;
    nullable?: boolean;
    default?: string;
    primary_key?: boolean;
  }>): void {
    const errors: string[] = [];
    const columnNames = new Set<string>();

    columns.forEach((column, index) => {
      // Validate column name
      if (!column.name || typeof column.name !== 'string' || column.name.trim().length === 0) {
        errors.push(`Column at index ${index}: name is required`);
      } else {
        // Check for duplicate column names
        const normalizedName = column.name.toLowerCase();
        if (columnNames.has(normalizedName)) {
          errors.push(`Duplicate column name: ${column.name}`);
        }
        columnNames.add(normalizedName);

        // Validate column name format
        if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(column.name)) {
          errors.push(`Column "${column.name}": name must start with a letter and contain only letters, numbers, and underscores`);
        }

        // Validate column name length
        if (column.name.length > 64) {
          errors.push(`Column "${column.name}": name cannot be longer than 64 characters`);
        }

        // Check for reserved column names
        const reservedNames = ['id', 'created_at', 'updated_at', 'deleted_at'];
        if (reservedNames.includes(column.name.toLowerCase())) {
          errors.push(`Column "${column.name}": name is reserved`);
        }
      }

      // Validate column type
      if (!column.type || typeof column.type !== 'string' || column.type.trim().length === 0) {
        errors.push(`Column "${column.name}": type is required`);
      } else {
        // Validate supported column types
        const supportedTypes = [
          'INT', 'INTEGER', 'BIGINT', 'SMALLINT', 'TINYINT',
          'VARCHAR', 'CHAR', 'TEXT', 'LONGTEXT',
          'DECIMAL', 'FLOAT', 'DOUBLE',
          'DATE', 'DATETIME', 'TIMESTAMP', 'TIME',
          'BOOLEAN', 'BOOL',
          'JSON', 'BLOB'
        ];

        const baseType = column.type.split('(')[0].toUpperCase();
        if (!supportedTypes.includes(baseType)) {
          errors.push(`Column "${column.name}": unsupported type "${column.type}"`);
        }
      }

      // Validate boolean fields
      if (column.nullable !== undefined && typeof column.nullable !== 'boolean') {
        errors.push(`Column "${column.name}": nullable must be a boolean`);
      }

      if (column.primary_key !== undefined && typeof column.primary_key !== 'boolean') {
        errors.push(`Column "${column.name}": primary_key must be a boolean`);
      }

      // Validate default value
      if (column.default !== undefined && typeof column.default !== 'string') {
        errors.push(`Column "${column.name}": default value must be a string`);
      }
    });

    if (errors.length > 0) {
      throw this.createValidationError(`Column validation failed: ${errors.join(', ')}`);
    }
  }

  /**
   * Get supported column types
   */
  getSupportedColumnTypes(): ServiceResponse<{
    types: Array<{
      name: string;
      description: string;
      examples: string[];
      requiresLength?: boolean;
    }>;
    recommendations: string[];
  }> {
    return {
      data: {
        types: [
          {
            name: 'INT',
            description: 'Integer number',
            examples: ['INT', 'INT(11)'],
          },
          {
            name: 'VARCHAR',
            description: 'Variable-length string',
            examples: ['VARCHAR(255)', 'VARCHAR(50)'],
            requiresLength: true,
          },
          {
            name: 'TEXT',
            description: 'Long text field',
            examples: ['TEXT', 'LONGTEXT'],
          },
          {
            name: 'DECIMAL',
            description: 'Precise decimal number',
            examples: ['DECIMAL(10,2)', 'DECIMAL(8,4)'],
            requiresLength: true,
          },
          {
            name: 'DATE',
            description: 'Date value',
            examples: ['DATE'],
          },
          {
            name: 'DATETIME',
            description: 'Date and time value',
            examples: ['DATETIME'],
          },
          {
            name: 'BOOLEAN',
            description: 'True/false value',
            examples: ['BOOLEAN', 'BOOL'],
          },
          {
            name: 'JSON',
            description: 'JSON data',
            examples: ['JSON'],
          },
        ],
        recommendations: [
          'Use VARCHAR for short strings, TEXT for long content',
          'Always specify length for VARCHAR columns',
          'Use DECIMAL for monetary values, not FLOAT',
          'Consider adding a primary key column',
          'Use appropriate data types to save storage space',
        ],
      },
      success: true,
      timestamp: new Date().toISOString(),
    };
  }
}

// Export singleton instance
export const newTableService = new NewTableService();

// Export for backward compatibility
export default newTableService;