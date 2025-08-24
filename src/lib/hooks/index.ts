// Custom React Hooks - All using standardized ServiceRegistry

// Core functionality hooks
export { useAuth } from "./use-auth";
export { useDatabaseOperations } from "./use-database-operations";
export { useBusinessRules } from "./use-business-rules";

// Service-specific hooks
export { useExcelToDB } from "./use-excel-to-db";
export { useFileQuery } from "./use-file-query";
export { useNewTable } from "./use-new-table";
export { useUserAccess } from "./use-user-access";
export { useVectorDB } from "./use-vector-db";

// File operations
export { useFileOperations, useSmartFileUpload } from "./use-smart-file-upload";

// Data and hierarchy hooks
export { useHierarchyData } from "./use-hierarchy-data";
export { useParentCompanies } from "./use-parent-companies";
export { useSubCompanies } from "./use-sub-companies";

// Validation hooks
export { useDatabaseQueryValidation } from "./use-database-query-validation";

// UI and utility hooks
export { useToast } from "./use-toast";
export { useUserSettings } from "./use-user-settings";
export { useThemeTransition } from "./useThemeTransition";

// Context hooks
// export { useUserContext } from "./use-user-context"; // Keep if needed for specific context usage
