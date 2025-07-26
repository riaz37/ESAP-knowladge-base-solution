"use client";
import { useState } from "react";
import { useUIStore } from "@/store/uiStore";
import { useResolvedTheme } from "@/store/theme-store";
import { BarChart3, Clock, TrendingUp, DollarSign } from "lucide-react";

// Import custom hooks
import {
  useBusinessRulesModal,
  useDatabaseOperations,
  useUserSettings,
} from "@/lib/hooks";

// Import new components
import {
  DBKnowledgeHero,
  DBKnowledgeResults,
  BusinessRulesModal,
} from "@/components/db-knowledge";

const quickActions = [
  {
    icon: BarChart3,
    text: "Show me attendance for January 2024",
    category: "Analytics",
    color:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    description: "View employee attendance records",
    gradient: "from-blue-500/20 to-blue-600/20",
  },
  {
    icon: DollarSign,
    text: "Show me the salary list for January 2024",
    category: "Finance",
    color:
      "bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800",
    description: "Access payroll information",
    gradient: "from-green-500/20 to-green-600/20",
  },
  {
    icon: Clock,
    text: "Show me the pending task for manager",
    category: "Tasks",
    color:
      "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800",
    description: "Review outstanding assignments",
    gradient: "from-orange-500/20 to-orange-600/20",
  },
  {
    icon: TrendingUp,
    text: "Show me the profit items",
    category: "Reports",
    color:
      "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800",
    description: "Analyze revenue data",
    gradient: "from-purple-500/20 to-purple-600/20",
  },
];

export default function DBKnowledgePage() {
  const [query, setQuery] = useState("");
  const { showBusinessRulesModal, setShowBusinessRulesModal } = useUIStore();
  const resolvedTheme = useResolvedTheme();

  // Custom hooks
  const databaseOps = useDatabaseOperations();
  const businessRulesModal = useBusinessRulesModal();
  const userSettings = useUserSettings();

  const handleQuerySubmit = async () => {
    if (!query.trim()) return;
    await databaseOps.sendDatabaseQuery(query, userSettings.userId);
  };

  return (
    <div className="w-full min-h-screen relative">
      {/* Hero Section */}
      <DBKnowledgeHero
        query={query}
        setQuery={setQuery}
        handleQuerySubmit={handleQuerySubmit}
        loading={databaseOps.loading}
        theme={resolvedTheme || "light"}
        quickActions={quickActions}
      />

      {/* Results Section */}
      <DBKnowledgeResults
        loading={databaseOps.loading}
        error={databaseOps.error}
        dbResponse={databaseOps.dbResponse}
      />

      {/* Business Rules Modal */}
      <BusinessRulesModal
        isOpen={showBusinessRulesModal}
        onClose={setShowBusinessRulesModal}
        businessRulesText={businessRulesModal.businessRulesText}
        businessRulesLoading={businessRulesModal.businessRulesLoading}
        businessRulesError={businessRulesModal.businessRulesError}
      />
    </div>
  );
}
