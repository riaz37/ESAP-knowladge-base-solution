import { useState, useEffect } from "react";
import { useMSSQLConfig, useParentCompanies, useSubCompanies } from "@/lib/hooks";
import { MSSQLConfigData, ParentCompanyData, SubCompanyData } from "@/types/api";
import { HierarchyNode } from "@/components/database-hierarchy";

interface UseHierarchyDataReturn {
  hierarchyData: HierarchyNode[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useHierarchyData(): UseHierarchyDataReturn {
  const [hierarchyData, setHierarchyData] = useState<HierarchyNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { getConfigs } = useMSSQLConfig();
  const { getParentCompanies } = useParentCompanies();
  const { getSubCompanies } = useSubCompanies();

  const buildHierarchy = (
    databases: MSSQLConfigData[],
    parentCompanies: ParentCompanyData[],
    subCompanies: SubCompanyData[]
  ): HierarchyNode[] => {
    // If no databases exist, return empty array to show EmptyHierarchyState
    if (!databases || databases.length === 0) {
      return [];
    }

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
  };

  const loadHierarchyData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // For development, let's use mock data if API fails
      try {
        const [databases, parentCompanies, subCompanies] = await Promise.all([
          getConfigs(),
          getParentCompanies(),
          getSubCompanies(),
        ]);

        // Handle the case where data might be null or empty arrays
        const safeDatabase = databases || [];
        const safeParentCompanies = parentCompanies || [];
        const safeSubCompanies = subCompanies || [];

        const hierarchy = buildHierarchy(safeDatabase, safeParentCompanies, safeSubCompanies);
        setHierarchyData(hierarchy);
      } catch (apiError) {
        // If API fails, show empty state for now
        console.warn("API not available, showing empty state:", apiError);
        setHierarchyData([]);
      }
    } catch (err: any) {
      // For development, let's not show errors for empty data
      // Instead, just set empty hierarchy data
      console.warn("Could not load hierarchy data, showing empty state:", err);
      setHierarchyData([]);
      
      // Only set error for actual API failures, not empty data
      if (err?.message && !err.message.includes("Failed to load hierarchy data")) {
        const errorMessage = err?.message || "Error loading hierarchy data";
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHierarchyData();
  }, []);

  return {
    hierarchyData,
    isLoading,
    error,
    refetch: loadHierarchyData,
  };
}