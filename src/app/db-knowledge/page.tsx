"use client";
import { useState, useEffect } from "react";
import QueryInput from "@/components/query/QueryInput";
import { Toast } from "@/components/Toast";
import { GraphsRow } from "@/components/graphs";
import FigmaTableDemo from "@/components/table";
import Lottie from "lottie-react";
import robotAnimation2 from "../../../public/robot-lottie3.json";
import { useUIStore } from "@/store/uiStore";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTheme } from "@/contexts/ThemeContext";

// Import custom hooks
import { 
  useBusinessRulesModal,
  useDatabaseOperations,
  useUserSettings
} from "@/lib/hooks";

const quickActions = [
  { icon: "📶", text: "Show me attendance for January 2024" },
  { icon: "✈️", text: "Show me the salary list for January 2024" },
  { icon: "⬆️", text: "Show me the pending task for manager" },
  { icon: "😞", text: "Show me the profit items" },
];

export default function DBKnowledgePage() {
  const [query, setQuery] = useState("");
  const { showBusinessRulesModal, setShowBusinessRulesModal } = useUIStore();
  const { resolvedTheme } = useTheme();
  
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

  const handleQuerySubmit = async () => {
    if (!query.trim()) return;
    
    try {
      await databaseOps.sendDatabaseQuery(query, userSettings.userId);
    } catch (e) {
      // Error handling is done in the hook
    }
    setQuery("");
  };

  function renderDbData(dataArr: any) {
    if (!Array.isArray(dataArr)) return null;
    if (dataArr.length === 0)
      return <div className="text-gray-400">No data found.</div>;
    if (dataArr.length === 1) {
      const obj = dataArr[0];
      return (
        <div className="card-gradient rounded-2xl p-6 mt-4 max-w-2xl">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#e1f4ea]/30 dark:border-[#013828]/30">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#f0f9f5] dark:bg-[#012920] text-[#00bf6f]">
              <svg
                xmlns="https://www.w3.org/2000/svg"
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100">
                Single Record Found
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Detailed information below
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(obj).map(([key, value]) => (
              <div
                key={key}
                className="flex flex-col gap-1 p-3 rounded-xl bg-[#f0f9f5]/30 dark:bg-[#012920]/30 border border-[#e1f4ea]/30 dark:border-[#013828]/30"
              >
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {key}
                </span>
                <span className="text-base text-gray-800 dark:text-gray-100">
                  {String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    // Multiple objects: show as list/table with pagination
    const allKeys = Array.from(
      new Set(dataArr.flatMap((obj: any) => Object.keys(obj)))
    );
    const currentData = dataArr;
    // --- Graph logic ---
    const analyzeDataForCharts = (data: any[], keys: string[]) => {
      const chartData: {
        pie?: { key: string; data: any[] };
        bar?: { key: string; data: any[] };
        line?: { key: string; data: any[] };
      } = {};
      for (const key of keys) {
        const values = data
          .map((obj: any) => obj[key])
          .filter((v) => v !== null && v !== undefined);
        if (values.length === 0) continue;
        const unique = Array.from(new Set(values));
        const isNumeric = values.every(
          (v) => !isNaN(Number(v)) && typeof v !== "boolean"
        );
        const isDate = values.every((v) => !isNaN(Date.parse(v)));
        const uniqueCount = unique.length;
        if (
          !chartData.pie &&
          uniqueCount >= 2 &&
          uniqueCount <= 8 &&
          !isNumeric
        ) {
          const counts: Record<string, number> = {};
          data.forEach((obj: any) => {
            const val = String(obj[key] || "Unknown");
            counts[val] = (counts[val] || 0) + 1;
          });
          chartData.pie = {
            key,
            data: Object.entries(counts)
              .sort(([, a], [, b]) => Number(b) - Number(a))
              .map(([name, value]) => ({ name, value })),
          };
        }
        if (!chartData.bar && isNumeric && uniqueCount > 1) {
          const groupKey = keys[0];
          const grouped = new Map<string, number>();
          data.forEach((obj: any) => {
            const groupVal = obj[groupKey];
            const metricVal = Number(obj[key]) || 0;
            grouped.set(groupVal, (grouped.get(groupVal) || 0) + metricVal);
          });
          const sortedData = Array.from(grouped.entries())
            .map(([name, value]) => ({ name, [key]: value }))
            .sort((a, b) => Number(b[key]) - Number(a[key]))
            .slice(0, 10);
          if (sortedData.length > 0) {
            chartData.bar = { key, data: sortedData };
          }
        }
        if (!chartData.line && (isDate || (isNumeric && uniqueCount > 5))) {
          let lineData;
          if (isDate) {
            const dateCounts: Record<string, number> = {};
            data.forEach((obj: any) => {
              const date = new Date(obj[key]).toLocaleDateString();
              dateCounts[date] = (dateCounts[date] || 0) + 1;
            });
            lineData = Object.entries(dateCounts)
              .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
              .map(([name, value]) => ({ name, value }));
          } else {
            lineData = data.slice(0, 20).map((obj: any, idx) => ({
              name: obj[keys[0]] || `Item ${idx + 1}`,
              value: Number(obj[key]),
            }));
          }
          if (lineData.length > 1) {
            chartData.line = { key, data: lineData };
          }
        }
      }
      return chartData;
    };
    const chartData = analyzeDataForCharts(currentData, allKeys);
    return (
      <div className="mt-4">
        <FigmaTableDemo
          columns={allKeys.map((key) => ({ key, label: key }))}
          allKeys={allKeys}
          data={currentData}
          pageSizeOptions={[7, 10, 20, 30]}
          defaultPageSize={7}
        />
        {(chartData.pie || chartData.bar || chartData.line) && (
          <div className="mt-8 charts-section">
            <GraphsRow
              chartData={chartData}
              loading={databaseOps.loading}
              isDummy={
                !chartData ||
                (!chartData.line && !chartData.bar && !chartData.pie)
              }
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      <QueryInput
        query={query}
        setQuery={setQuery}
        handleQuerySubmit={handleQuerySubmit}
        loading={databaseOps.loading}
        selected={"db"}
        quickActions={quickActions}
        theme={"dark"}
      />
      {databaseOps.error && <div className="text-red-500 mt-2">{databaseOps.error}</div>}
      {databaseOps.loading && (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-6">
          <div className="w-64 h-64">
            <Lottie
              animationData={robotAnimation2}
              loop={true}
              autoplay={true}
            />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Searching for answers...
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Our AI is analyzing your query and searching through the database
            </p>
          </div>
        </div>
      )}
      {!databaseOps.loading &&
        databaseOps.dbResponse &&
        databaseOps.dbResponse.payload &&
        renderDbData(databaseOps.dbResponse.payload.data)}
      <Toast
        isVisible={false}
        message={""}
        type={"success"}
        onClose={() => {}}
      />
      {/* Business Rules Modal (global, centered) */}
      {showBusinessRulesModal && (
        <div
          className="fixed inset-0 z-50 bg-black/40"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            background: "rgba(0,0,0,0.40)",
          }}
        >
          <div
            className="w-863 p-2 px-6 pb-6 flex flex-col justify-center items-center flex-shrink-0 rounded-3xl border-2"
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              borderRadius: "32px",
              border:
                resolvedTheme === "dark"
                  ? "3px solid rgba(0, 191, 111, 0.27)"
                  : "1.5px solid #e1f4ea",
              background:
                resolvedTheme === "dark"
                  ? "linear-gradient(180deg, rgba(0, 191, 111, 0.25) 0%, rgba(0, 191, 111, 0.09) 52.11%, rgba(0, 191, 111, 0.02) 100%)"
                  : "#fff",
              boxShadow:
                resolvedTheme === "dark" ? "none" : "0 2px 12px 0 rgba(0,0,0,0.06)",
              backdropFilter: resolvedTheme === "dark" ? "blur(32px)" : undefined,
              maxWidth: "95vw",
              maxHeight: "95vh",
              overflow: "auto",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div className="flex items-center w-full  p-0 mb-3">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex-1">
                Business Rules
              </h2>
              <button
                className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-2xl px-2 py-1 rounded-full focus:outline-none"
                onClick={() => setShowBusinessRulesModal(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div
              className="flex p-6 items-start gap-6 self-stretch rounded-3xl w-full mt-6 min-h-300"
              style={{
                background:
                  resolvedTheme === "dark" ? "rgba(0, 191, 111, 0.10)" : "#f0f9f5",
                borderRadius: "24px",
              }}
            >
              <div className="w-full">
                {businessRulesModal.businessRulesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <svg
                      className="animate-spin h-8 w-8 text-[#00bf6f]"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </div>
                ) : businessRulesModal.businessRulesError ? (
                  <div className="text-red-500 text-center font-medium">
                    {businessRulesModal.businessRulesError}
                  </div>
                ) : (
                  <div className="markdown-body max-h-[55vh] overflow-auto text-gray-800 dark:text-white text-base leading-7">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {businessRulesModal.businessRulesText}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
