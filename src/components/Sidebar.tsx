"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { CardContainer } from "@/components/glass-ui/CardContainer";
import { PrimaryButton } from "@/components/glass-ui/buttons/PrimaryButton";
import { collections } from "@/app/dummy-data/information";
import { useTheme } from "@/contexts/ThemeContext";
import { useEffect } from "react";
import QueryHistoryIcon from "@/icons/sidebar/QueryHistoryIcon";
import { SecondaryButton } from "@/components/glass-ui/buttons/SecondaryButton";
import { FaDownload, FaPlus } from "react-icons/fa";
import { useUIStore } from "@/store/uiStore";

// Import custom hooks
import { 
  useBusinessRulesModal,
  useDatabaseOperations,
  useUserSettings
} from "@/lib/hooks";

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, resolvedTheme } = useTheme();
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

  // Map collection keys to routes
  const routeMap: Record<string, string> = {
    dashboard: "/",
    db: "/db-knowledge",
    "File system": "/file-system",
    hr: "/hr-knowledge",
    "support Team": "/support-team",
  };

  // Only show history and business rules on /db-knowledge
  const showDbKnowledgeExtras = pathname === "/db-knowledge";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Logo outside the sidebar border */}
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          margin: "0 0 20px 0",
          scale: "1.3",
        }}
      >
        <Image
          src={resolvedTheme === "dark" ? "/logo/ESAP_W.png" : "/logo/ESAP_B_PNG.png"}
          alt="ESAP Logo"
          width={180}
          height={60}
          priority
          style={{ objectFit: "contain", maxWidth: 180, height: "auto" }}
        />
      </div>
      
      <CardContainer>
        <aside className="w-full">
        {/* Tab List */}
        <div
          className="sidebar-tab-list"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            gap: "20px",
            width: "100%",
          }}
        >
          {collections.map((col) => {
            const route = routeMap[col.key] || "/";
            const isActive =
              (route === "/" && pathname === "/") ||
              (route !== "/" &&
                (pathname === route || pathname.startsWith(route + "/")));
            return (
              <Link href={route} key={col.key} legacyBehavior>
                <a style={{ textDecoration: "none" }}>
                  {isActive ? (
                    <PrimaryButton
                      icon={
                        (
                          <col.sidebarIcon fill="#5BE49B" />
                        ) as unknown as string
                      }
                      text={col.name}
                      className="w-full h-12"
                      mode={resolvedTheme === "dark" ? "dark" : "light"}
                      onClick={() => {}}
                    />
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        minHeight: "44px",
                        padding: "4px 8px 4px 12px",
                        alignItems: "center",
                        alignSelf: "stretch",
                        borderRadius: "8px",
                        background:
                          resolvedTheme === "dark"
                            ? "rgba(255,255,255,0.00)"
                            : "rgba(0,0,0,0.00)",
                        cursor: "pointer",
                        fontWeight: 500,
                        fontSize: "15px",
                        color: resolvedTheme === "dark" ? "#fff" : "#222",
                        transition: "background 0.2s, color 0.2s",
                        gap: "10px",
                      }}
                      onMouseEnter={(e) => {
                        if (resolvedTheme !== "dark")
                          (e.currentTarget as HTMLDivElement).style.background =
                            "#f3f4f6";
                      }}
                      onMouseLeave={(e) => {
                        if (resolvedTheme !== "dark")
                          (e.currentTarget as HTMLDivElement).style.background =
                            "rgba(0,0,0,0.00)";
                      }}
                    >
                      <col.sidebarIcon
                        fill={resolvedTheme === "dark" ? "#fff" : "#222"}
                      />
                      {col.name}
                    </div>
                  )}
                </a>
              </Link>
            );
          })}
        </div>
        {showDbKnowledgeExtras && (
          <>
            {/* Query History Card */}
            <div
              className="query-history"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                alignSelf: "stretch",
                borderRadius: "24px",
                border:
                  resolvedTheme === "dark"
                    ? "2px solid rgba(221,255,237,0.18)"
                    : "1.5px solid #e5e7eb",
                background:
                  resolvedTheme === "dark"
                    ? "linear-gradient(180deg, rgba(148,255,212,0.22) -4.62%, rgba(148,255,212,0.09) 52.78%, rgba(148,255,212,0.02) 103.39%)"
                    : "#fff",
                boxShadow:
                  resolvedTheme === "dark"
                    ? "0 4px 24px 0 rgba(0,0,0,0.07)"
                    : "0 2px 12px 0 rgba(0,0,0,0.06)",
                backdropFilter: resolvedTheme === "dark" ? "blur(32px)" : undefined,
                marginTop: "30px",
                width: "100%",
                color: resolvedTheme === "dark" ? undefined : "#222",
                padding: 18,
              }}
            >
              {/* Header: icon, text, clear button */}
              <div className="flex items-center justify-between w-full mb-2">
                <div className="flex items-center gap-2">
                  <QueryHistoryIcon className="w-5 h-5" fill="#fff" />
                  <span
                    className="text-base font-semibold dark:text-white text-black"
                    style={{ letterSpacing: "-0.5px" }}
                  >
                    History
                  </span>
                </div>
                <button
                  onClick={handleClearHistory}
                  disabled={databaseOps.historyLoading}
                  className="relative w-20 inline-flex h-9 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
                >
                  <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                  <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl">
                    Clear
                  </span>
                </button>
              </div>
              {/* Query List */}
              <div className="flex flex-col gap-4 w-full">
                {databaseOps.history.map((item, i) => (
                  <button
                    key={i}
                    className="w-full text-left truncate text-[15px] font-normal rounded-lg px-3 py-2 transition-all"
                    title={item.question}
                    onClick={() => {
                      /* Optionally set query in global state */
                    }}
                    style={{
                      fontWeight: 400,
                      color: resolvedTheme === "dark" ? "#E6F7EF" : "#222",
                      fontSize: "15px",
                      letterSpacing: "-0.2px",
                      boxShadow: "none",
                      background: "transparent",
                    }}
                  >
                    {item.question.length > 32
                      ? item.question.slice(0, 29) + "..."
                      : item.question}
                  </button>
                ))}
              </div>
              {!databaseOps.historyLoading && !databaseOps.historyError && databaseOps.history.length === 0 && (
                <div
                  className="text-xs mt-2 text-center py-2"
                  style={{ color: resolvedTheme === "dark" ? "#B2D9C7" : "#888" }}
                >
                  No history found
                </div>
              )}
            </div>
            {/* Business Rules Button Row */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                gap: "16px",
                marginTop: "30px",
                alignItems: "center",
                justifyContent: "flex-start",
              }}
            >
              <SecondaryButton
                text="Business Rules"
                iconPlacement="right"
                icon={(<FaDownload />) as unknown as string}
                onClick={() => setShowBusinessRulesModal(true)}
                className="w-full h-12"
                style={{ width: "180px", minHeight: "40px" }}
                mode={resolvedTheme === "dark" ? "dark" : "light"}
              />
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "48px",
                  height: "48px",
                  borderRadius: "100%",
                  border: "1px solid #FFF",
                  background:
                    "radial-gradient(72.6% 80.99% at 50% 50%, rgba(0, 0, 0, 0.50) 50.03%, #C8C8C8 100%), rgba(255, 255, 255, 0.10)",
                  boxShadow: "0 0 16px 0 #FFFFFF33",
                  cursor: "pointer",
                  padding: 0,
                  margin: 0,
                  transition: "box-shadow 0.2s",
                }}
                onClick={() => setShowBusinessRulesModal(true)}
              >
                <FaPlus fill="#fff" />
              </button>
            </div>
          </>
        )}
      </aside>
      </CardContainer>
    </div>
  );
}
