"use client";
import { GraphsRow } from "@/components/graphs";
import FigmaTableDemo from "@/components/table";
import { Dashboard } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { OpeningAnimation } from "@/components/ui/opening-animation";
import { useEffect, useState } from "react";
import { collectionData, sampleChartData } from "./dummy-data/information";

// Import custom hooks
import { useDatabaseOperations, useTour, useUserSettings } from "@/lib/hooks";

export default function DashboardPage() {
  // Local state for UI components
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string>("dashboard");
  const [filters, setFilters] = useState<{ [key: string]: string }>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showCharts, setShowCharts] = useState(true);
  const [showOpeningAnimation, setShowOpeningAnimation] = useState(false);

  const databaseOps = useDatabaseOperations();
  const tour = useTour();
  const userSettings = useUserSettings();

  // Initialize component
  useEffect(() => {
    // Fetch query history with default user ID on first load
    databaseOps.fetchQueryHistory(userSettings.userId);

    const hasSeen =
      typeof window !== "undefined" &&
      localStorage.getItem("welcome-animation-shown");
    if (!hasSeen) {
      setShowOpeningAnimation(true);
    }
  }, []);

  // Fetch history when userId changes
  useEffect(() => {
    if (userSettings.userId) {
      databaseOps.fetchQueryHistory(userSettings.userId);
    }
  }, [userSettings.userId]);

  // Handler functions using hooks
  const handleReloadDb = async () => {
    setFilters({});
    setSearchTerm("");
    setShowFilters(false);
    await databaseOps.reloadDatabase();
  };

  const handleQuerySubmit = async () => {
    if (!query.trim()) return;
    if (selected !== "db") return;

    setFilters({});
    setSearchTerm("");
    setShowFilters(false);

    try {
      await databaseOps.sendDatabaseQuery(query, userSettings.userId);
    } catch (e) {
      // Error handling is done in the hook
    }
    setQuery("");
  };

  const handleTestCharts = () => {
    setFilters({});
    setSearchTerm("");
    setShowFilters(false);

    // Simulate API response with sample data
    setTimeout(() => {
      databaseOps.setDbResponse({
        payload: {
          data: sampleChartData,
        },
      });
    }, 2000);
  };

  const data = collectionData[selected];

  // Helper to render dynamic data
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

    // Apply filters
    let filteredData = dataArr;

    // Apply search term
    if (searchTerm) {
      filteredData = filteredData.filter((obj) =>
        Object.values(obj).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply column filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filteredData = filteredData.filter((obj) =>
          String(obj[key]).toLowerCase().includes(value.toLowerCase())
        );
      }
    });

    // Use filtered data directly - pagination is handled by the table component
    const currentData = filteredData;

    // --- Graph logic ---
    // Enhanced heuristic: Better data type detection and chart selection
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

        // Pie chart: categorical data with few unique values (2-8)
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

        // Bar chart: numeric data or categorical with many values
        if (!chartData.bar && isNumeric && uniqueCount > 1) {
          // Group by X-axis (first key) and sum the metric (key)
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

        // Line chart: time series data or sequential numeric data
        if (!chartData.line && (isDate || (isNumeric && uniqueCount > 5))) {
          let lineData;
          if (isDate) {
            // Group by date and count
            const dateCounts: Record<string, number> = {};
            data.forEach((obj: any) => {
              const date = new Date(obj[key]).toLocaleDateString();
              dateCounts[date] = (dateCounts[date] || 0) + 1;
            });
            lineData = Object.entries(dateCounts)
              .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
              .map(([name, value]) => ({ name, value }));
          } else {
            // Use first 20 items for line chart
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

    const chartData = analyzeDataForCharts(filteredData, allKeys);

    return (
      <div className="mt-4">
        <FigmaTableDemo
          columns={allKeys.map((key) => ({
            key,
            label: key,
          }))}
          allKeys={allKeys}
          data={currentData}
          pageSizeOptions={[7, 10, 20, 30]}
          defaultPageSize={7}
        />

        {/* Graphs below the table */}
        {(chartData.pie || chartData.bar || chartData.line) && (
          <div className="mt-8 charts-section">
            {/* Chart Toggle */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">
                Data Visualization
              </h3>
              <Button
                variant="outline"
                onClick={() => setShowCharts(!showCharts)}
                className="bg-white/50 dark:bg-[#011f17]/50 border-[#e1f4ea] dark:border-[#013828] text-gray-700 dark:text-gray-200 hover:bg-[#f0f9f5] dark:hover:bg-[#012920] transition-all"
              >
                {showCharts ? "Hide Charts" : "Show Charts"}
              </Button>
            </div>

            <GraphsRow
              chartData={chartData}
              loading={databaseOps.loading}
              isDummy={
                !chartData ||
                (!chartData.line && !chartData.bar && !chartData.pie)
              }
            />

            {/* Charts Container */}
            {/* <div
              className={`transition-all duration-300 overflow-hidden ${
                showCharts ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="flex flex-col lg:flex-row gap-6">
            
                {chartData.pie ? (
                  <Graph
                    type="pie"
                    data={chartData.pie.data}
                    dataKey="value"
                    nameKey="name"
                    title={`Distribution by ${chartData.pie.key}`}
                  />
                ) : (
                  <div className="bg-white/20 opacity-50 backdrop-blur-lg border border-white/30 shadow-lg rounded-2xl p-6 flex-1 min-w-[320px] max-w-[500px] flex flex-col items-center justify-center">
                    <div className="text-gray-500 text-sm text-center">
                      No data to show in this chart
                    </div>
                  </div>
                )}
               
                {chartData.bar ? (
                  <Graph
                    type="bar"
                    data={chartData.bar.data}
                    dataKey={chartData.bar.key}
                    nameKey="name"
                    title={`Top 10 by ${chartData.bar.key}`}
                  />
                ) : (
                  <div className="bg-white/20 opacity-50 backdrop-blur-lg border border-white/30 shadow-lg rounded-2xl p-6 flex-1 min-w-[320px] max-w-[500px] flex flex-col items-center justify-center">
                    <div className="text-gray-500 text-sm text-center">
                      No data to show in this chart
                    </div>
                  </div>
                )}
               
                {chartData.line ? (
                  <Graph
                    type="line"
                    data={chartData.line.data}
                    dataKey="value"
                    nameKey="name"
                    title={`Time Series by ${chartData.line.key}`}
                  />
                ) : (
                  <div className="bg-white/20 opacity-50 backdrop-blur-lg border border-white/30 shadow-lg rounded-2xl p-6 flex-1 min-w-[320px] max-w-[500px] flex flex-col items-center justify-center">
                    <div className="text-gray-500 text-sm text-center">
                      No data to show in this chart
                    </div>
                  </div>
                )}
              </div>
            </div> */}
          </div>
        )}
      </div>
    );
  }

  // toggleTheme is already available from the useTheme hook

  const handleOpeningComplete = () => {
    setShowOpeningAnimation(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("welcome-animation-shown", "true");
    }
    // Use tour hook to handle tour logic
    tour.handleOpeningComplete();
  };

  // Remove Sidebar, Navbar, and SPA-style conditional rendering
  // Only render the Dashboard component and related UI
  return (
    <>
      {showOpeningAnimation ? (
        <OpeningAnimation duration={4000} onComplete={handleOpeningComplete}>
          <div />
        </OpeningAnimation>
      ) : (
        <main className="flex-1 flex flex-col p-5 gap-6 animate-[fadeIn_0.5s_ease-out_forwards] ml-3">
          <Dashboard
            data={collectionData["dashboard"]}
            onNavigate={(key) => {
              if (key === "db") window.location.href = "/db-knowledge";
              else if (key === "File system")
                window.location.href = "/file-system";
              else if (key === "HR Knowledge")
                window.location.href = "/hr-knowledge";
              else if (key === "Support Team")
                window.location.href = "/support-team";
              else window.location.href = "/";
            }}
          />
        </main>
      )}
    </>
  );
}

/*
.markdown-body h1 { font-size: 1.5rem; font-weight: bold; margin-top: 1.2em; margin-bottom: 0.5em; }
.markdown-body h2 { font-size: 1.25rem; font-weight: bold; margin-top: 1em; margin-bottom: 0.5em; }
.markdown-body h3 { font-size: 1.1rem; font-weight: bold; margin-top: 0.8em; margin-bottom: 0.4em; }
.markdown-body ul, .markdown-body ol { margin-left: 1.5em; margin-bottom: 1em; }
.markdown-body li { margin-bottom: 0.3em; }
.markdown-body code, .markdown-body pre { background: #f3f3f3; color: #333; border-radius: 4px; padding: 2px 6px; }
*/
