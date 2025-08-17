import { useState, useCallback } from "react";
import { useUserAccess } from "@/lib/hooks/use-user-access";
import { useUserConfig } from "@/lib/hooks/use-user-config";
import { useDatabaseConfig } from "@/lib/hooks/use-database-config";
import { UserAccessData } from "@/types/api";

export function useUsersManager() {
  // Core state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState("database");
  const [selectedUserForVectorDB, setSelectedUserForVectorDB] = useState<string>("");
  
  // Modal states
  const [isUserAccessModalOpen, setIsUserAccessModalOpen] = useState(false);
  const [selectedUserForAccess, setSelectedUserForAccess] = useState<string>("");

  // Hooks
  const { 
    userAccessConfigs, 
    isLoading: userAccessLoading, 
    getUserAccessConfigs 
  } = useUserAccess();
  
  const { 
    configs: userConfigs, 
    isLoading: userConfigLoading, 
    getUserConfigs 
  } = useUserConfig();
  
  const { 
    databaseConfigs, 
    isLoading: databaseLoading, 
    fetchDatabaseConfigs 
  } = useDatabaseConfig();

  // Computed values with safe defaults
  const isLoading = userAccessLoading || userConfigLoading || databaseLoading;
  
  // Safe access to arrays with default empty arrays
  const safeUserAccessConfigs = userAccessConfigs || [];
  const safeUserConfigs = userConfigs || { configs: [], count: 0 };
  const safeDatabaseConfigs = databaseConfigs || [];

  // Actions
  const loadUserAccessConfigs = useCallback(async () => {
    try {
      await getUserAccessConfigs();
    } catch (error) {
      console.error("Error loading user access configs:", error);
    }
  }, [getUserAccessConfigs]);

  const loadUserConfigs = useCallback(async () => {
    try {
      await getUserConfigs();
    } catch (error) {
      console.error("Error loading user configs:", error);
    }
  }, [getUserConfigs]);

  const loadDatabaseConfigs = useCallback(async () => {
    try {
      await fetchDatabaseConfigs();
    } catch (error) {
      console.error("Error loading database configs:", error);
    }
  }, [fetchDatabaseConfigs]);

  const handleCreateAccess = useCallback((setModalOpen: (open: boolean) => void) => {
    setSelectedUserForAccess("");
    setModalOpen(true);
  }, []);

  const handleEditAccess = useCallback((userEmail: string, setModalOpen: (open: boolean) => void) => {
    setSelectedUserForAccess(userEmail);
    setModalOpen(true);
  }, []);

  const handleAccessSuccess = useCallback(() => {
    loadUserAccessConfigs();
  }, [loadUserAccessConfigs]);

  const handleManageVectorDBAccess = useCallback((userId: string) => {
    setSelectedUserForVectorDB(userId);
    setActiveTab("vector-db");
  }, []);

  const handleCloseVectorDBAccess = useCallback(() => {
    setSelectedUserForVectorDB("");
  }, []);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedUsers(safeUserAccessConfigs.map((config) => config.user_id));
    } else {
      setSelectedUsers([]);
    }
  }, [safeUserAccessConfigs]);

  const handleSelectUser = useCallback((userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers((prev) => [...prev, userId]);
    } else {
      setSelectedUsers((prev) => prev.filter((id) => id !== userId));
    }
  }, []);

  const extractNameFromEmail = useCallback((email: string): string => {
    const localPart = email.split("@")[0];
    return localPart
      .split(/[._-]/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ");
  }, []);

  const getAccessSummary = useCallback((config: UserAccessData): string => {
    const parentDbCount = config.database_access?.parent_databases?.length || 0;
    const subDbCount =
      config.database_access?.sub_databases?.reduce(
        (total, subDb) => total + (subDb.databases?.length || 0),
        0
      ) || 0;
    const totalDbs = parentDbCount + subDbCount;
    return `${totalDbs} database${totalDbs !== 1 ? "s" : ""}, ${
      config.sub_company_ids?.length || 0
    } sub-companies`;
  }, []);

  // Pagination with safe defaults
  const totalPages = Math.ceil(safeUserAccessConfigs.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedConfigs = safeUserAccessConfigs.slice(startIndex, startIndex + rowsPerPage);

  const isAllSelected = paginatedConfigs.length > 0 && selectedUsers.length === paginatedConfigs.length;
  const isIndeterminate = selectedUsers.length > 0 && selectedUsers.length < paginatedConfigs.length;

  return {
    // State
    searchTerm,
    selectedUsers,
    currentPage,
    rowsPerPage,
    activeTab,
    selectedUserForVectorDB,
    isLoading,
    userAccessConfigs: safeUserAccessConfigs,
    userConfigs: safeUserConfigs,
    databaseConfigs: safeDatabaseConfigs,
    
    // Computed values
    totalPages,
    paginatedConfigs,
    isAllSelected,
    isIndeterminate,
    
    // Actions
    setSearchTerm,
    setCurrentPage,
    setRowsPerPage,
    setActiveTab,
    loadUserAccessConfigs,
    loadUserConfigs,
    loadDatabaseConfigs,
    handleCreateAccess,
    handleEditAccess,
    handleAccessSuccess,
    handleManageVectorDBAccess,
    handleCloseVectorDBAccess,
    handleSelectAll,
    handleSelectUser,
    extractNameFromEmail,
    getAccessSummary,
  };
} 