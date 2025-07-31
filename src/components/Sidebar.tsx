"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/store/theme-store";
import { useEffect } from "react";
import QueryHistoryIcon from "@/icons/sidebar/QueryHistoryIcon";
import { FaDownload, FaPlus } from "react-icons/fa";
import { useUIStore } from "@/store/uiStore";
import { cn } from "@/lib/utils";
import { getSidebarRoutes, isRouteActive, SPECIAL_ROUTES } from "@/lib/utils/navigation";

// Import custom hooks
import {
  useBusinessRulesModal,
  useDatabaseOperations,
  useUserSettings,
} from "@/lib/hooks";

export default function Sidebar() {
  const pathname = usePathname();
  const theme = useTheme();
  const { showBusinessRulesModal, setShowBusinessRulesModal } = useUIStore();

  // Custom hooks
  const businessRulesModal = useBusinessRulesModal();
  const databaseOps = useDatabaseOperations();
  const userSettings = useUserSettings();

  // Initialize component
  useEffect(() => {
    databaseOps.fetchQueryHistory(userSettings.userId);
  }, [userSettings.userId]);

  // Handle business rules modal
  useEffect(() => {
    if (showBusinessRulesModal) {
      businessRulesModal.openModal();
    }
  }, [showBusinessRulesModal]);

  const handleClearHistory = async () => {
    await databaseOps.clearHistory(userSettings.userId);
  };

  // Get sidebar routes from the consolidated routing system
  const sidebarRoutes = getSidebarRoutes();

  // Only show history and business rules on /db-knowledge
  const showDbKnowledgeExtras = pathname === SPECIAL_ROUTES.DB_KNOWLEDGE;

  return (
    <div className="flex flex-col items-center w-80">
      <Card className="backdrop-blur-md bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10 w-full min-h-[600px]">
        <CardContent className="p-6 h-full">
          <aside className="w-full h-full flex flex-col">
            {/* Tab List */}
            <nav className="flex flex-col gap-2 w-full">
              {sidebarRoutes.map((route) => {
                const isActive = isRouteActive(pathname, route.path);
                return (
                  <Link href={route.path} key={route.key} className="w-full cursor-pointer">
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={cn(
                        "w-full h-12 justify-start gap-3 text-left font-medium cursor-pointer",
                        isActive
                          ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white"
                      )}
                    >
                      {route.sidebarIcon && (
                        <route.sidebarIcon
                          fill={
                            isActive
                              ? "#ffffff"
                              : theme === "dark"
                              ? "#ffffff"
                              : "#222222"
                          }
                          className="w-5 h-5"
                        />
                      )}
                      {route.name}
                    </Button>
                  </Link>
                );
              })}
            </nav>

            {showDbKnowledgeExtras && (
              <>
                <Separator className="my-6" />

                {/* Query History Card */}
                <Card className="bg-gradient-to-b from-emerald-50/20 to-emerald-50/5 dark:from-emerald-900/20 dark:to-emerald-900/5 border-emerald-200/30 dark:border-emerald-700/30">
                  <CardContent className="p-4">
                    {/* Header: icon, text, clear button */}
                    <div className="flex items-center justify-between w-full mb-4">
                      <div className="flex items-center gap-2">
                        <QueryHistoryIcon
                          className="w-5 h-5"
                          fill={
                            theme === "dark" ? "#ffffff" : "#000000"
                          }
                        />
                        <span className="text-base font-semibold tracking-tight text-gray-900 dark:text-white">
                          History
                        </span>
                      </div>
                      <Button
                        onClick={handleClearHistory}
                        disabled={databaseOps.historyLoading}
                        size="sm"
                        variant="outline"
                        className="h-8 px-3 text-xs cursor-pointer"
                      >
                        Clear
                      </Button>
                    </div>

                    {/* Query List */}
                    <div className="flex flex-col gap-1 w-full">
                      {databaseOps.history.map((item, i) => (
                        <Button
                          key={i}
                          variant="ghost"
                          className="w-full justify-start h-auto p-2 text-left font-normal text-sm hover:bg-emerald-50 dark:hover:bg-emerald-900/20 cursor-pointer text-gray-900 dark:text-white"
                          title={item.question}
                          onClick={() => {
                            /* Optionally set query in global state */
                          }}
                        >
                          <span className="truncate">
                            {item.question.length > 32
                              ? item.question.slice(0, 29) + "..."
                              : item.question}
                          </span>
                        </Button>
                      ))}
                    </div>

                    {!databaseOps.historyLoading &&
                      !databaseOps.historyError &&
                      databaseOps.history.length === 0 && (
                        <div className="text-xs text-center py-2 text-muted-foreground">
                          No history found
                        </div>
                      )}
                  </CardContent>
                </Card>

                {/* Business Rules Button Row */}
                <div className="flex gap-4 mt-6">
                  <Button
                    onClick={() => setShowBusinessRulesModal(true)}
                    variant="outline"
                    className="flex-1 h-12 cursor-pointer"
                  >
                    <FaDownload className="w-4 h-4 mr-2" />
                    Business Rules
                  </Button>
                  <Button
                    onClick={() => setShowBusinessRulesModal(true)}
                    size="icon"
                    className="h-12 w-12 rounded-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 cursor-pointer"
                  >
                    <FaPlus className="w-4 h-4" />
                  </Button>
                </div>
              </>
            )}
          </aside>
        </CardContent>
      </Card>
    </div>
  );
}
