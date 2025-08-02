import { ParentCompanyService } from "./parent-company-service";
import { SubCompanyService } from "./sub-company-service";
import { MSSQLConfigService } from "./mssql-config-service";
import {
  ParentCompanyCreateRequest,
  SubCompanyCreateRequest,
  ParentCompanyData,
  SubCompanyData,
  MSSQLConfigData,
} from "@/types/api";
import { HierarchyNode } from "@/components/database-hierarchy";

export interface CreateCompanyRequest {
  name: string;
  details: string;
  type: "parent" | "sub";
  parentCompanyId?: number;
  dbId?: number;
}

/**
 * Service for managing hierarchy operations
 */
export class HierarchyService {
  /**
   * Create a new company (parent or sub)
   */
  static async createCompany(
    request: CreateCompanyRequest
  ): Promise<ParentCompanyData | SubCompanyData> {
    try {
      if (request.type === "parent") {
        // For parent companies, we need a database ID
        // If not provided, we'll use the first available database
        let dbId = request.dbId;

        if (!dbId) {
          // Get the first available database configuration
          const configsResponse = await MSSQLConfigService.getMSSQLConfigs();
          if (
            configsResponse?.data?.configs &&
            configsResponse.data.configs.length > 0
          ) {
            dbId = configsResponse.data.configs[0].db_id;
          } else {
            throw new Error(
              "No database configurations available. Please create a database configuration first."
            );
          }
        }

        const parentCompanyRequest: ParentCompanyCreateRequest = {
          company_name: request.name,
          description:
            request.details || "Company created through hierarchy interface",
          db_id: dbId!,
          address: "", // Optional field
          contact_email: "", // Optional field
        };

        const response = await ParentCompanyService.createParentCompany(
          parentCompanyRequest
        );
        return response.data;
      } else {
        // For sub companies
        if (!request.parentCompanyId) {
          throw new Error("Parent company ID is required for sub companies");
        }

        // Get the parent company to inherit the database ID
        const parentCompany = await ParentCompanyService.getParentCompany(
          request.parentCompanyId
        );

        const subCompanyRequest: SubCompanyCreateRequest = {
          parent_company_id: request.parentCompanyId,
          company_name: request.name,
          description:
            request.details ||
            "Sub-company created through hierarchy interface",
          db_id: parentCompany.data.db_id, // Inherit from parent
          address: "", // Optional field
          contact_email: "", // Optional field
        };

        const response = await SubCompanyService.createSubCompany(
          subCompanyRequest
        );
        return response.data;
      }
    } catch (error) {
      console.error("Error creating company:", error);
      throw error;
    }
  }

  /**
   * Get all hierarchy data
   */
  static async getHierarchyData(): Promise<HierarchyNode[]> {
    try {
      const [databasesResponse, parentCompanies, subCompanies] =
        await Promise.all([
          MSSQLConfigService.getMSSQLConfigs(),
          ParentCompanyService.getParentCompanies(),
          SubCompanyService.getSubCompanies(),
        ]);

      return this.buildHierarchy(
        databasesResponse?.data?.configs || [],
        parentCompanies?.data?.companies || [],
        subCompanies?.data?.companies || []
      );
    } catch (error) {
      console.error("Error fetching hierarchy data:", error);
      throw error;
    }
  }

  /**
   * Build hierarchy structure from raw data
   */
  private static buildHierarchy(
    databases: MSSQLConfigData[],
    parentCompanies: ParentCompanyData[],
    subCompanies: SubCompanyData[]
  ): HierarchyNode[] {
    return databases.map((db) => {
      const parentComps = parentCompanies.filter((pc) => pc.db_id === db.db_id);

      const children = parentComps.map((parent) => ({
        id: `parent-${parent.parent_company_id}`,
        name: parent.company_name,
        description:
          parent.description ||
          "Automate refund processes with configurable policy enforcement.",
        type: "parent" as const,
        data: parent,
        children: subCompanies
          .filter((sub) => sub.parent_company_id === parent.parent_company_id)
          .map((sub) => ({
            id: `sub-${sub.sub_company_id}`,
            name: sub.company_name,
            description:
              sub.description ||
              "Automate refund processes with configurable policy enforcement.",
            type: "sub" as const,
            data: sub,
          })),
      }));

      return {
        id: `db-${db.db_id}`,
        name: db.db_name,
        description:
          "Database configuration with business rules and schema management.",
        type: "database" as const,
        data: db,
        children,
      };
    });
  }

  /**
   * Validate company creation request
   */
  static validateCreateCompanyRequest(request: CreateCompanyRequest): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!request.name || request.name.trim() === "") {
      errors.push("Company name is required");
    }

    if (request.type === "sub" && !request.parentCompanyId) {
      errors.push("Parent company ID is required for sub companies");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Find parent company by node ID
   */
  static async getParentCompanyByNodeId(
    nodeId: string
  ): Promise<ParentCompanyData | null> {
    try {
      if (!nodeId.startsWith("parent-")) {
        return null;
      }

      const parentId = parseInt(nodeId.replace("parent-", ""));
      const response = await ParentCompanyService.getParentCompany(parentId);
      return response.data;
    } catch (error) {
      console.error("Error getting parent company by node ID:", error);
      return null;
    }
  }
}

export default HierarchyService;
