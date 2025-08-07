"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Bot,
  Sparkles,
  Database,
  FileText,
  ArrowLeft,
  Clock,
  User,
  Download,
  ChevronDown,
  FileSpreadsheet,
} from "lucide-react";
import { QueryResultsDisplay } from "@/components/ai-assistant/QueryResultsDisplay";

export default function AIResultsPage() {
  const [currentQuery, setCurrentQuery] = useState<any>(null);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const router = useRouter();

  // Load query result from sessionStorage on component mount
  useEffect(() => {
    const storedResult = sessionStorage.getItem("aiQueryResult");
    if (storedResult) {
      try {
        const queryData = JSON.parse(storedResult);
        setCurrentQuery(queryData);

        // Clear sessionStorage after reading
        sessionStorage.removeItem("aiQueryResult");
      } catch (error) {
        console.error("Error parsing query result:", error);
      }
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".export-dropdown")) {
        setShowExportDropdown(false);
      }
    };

    if (showExportDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showExportDropdown]);

  const handleBackToDashboard = () => {
    router.push("/");
  };

  // Extract data helper function
  const extractDataForExport = () => {
    if (!currentQuery || !currentQuery.result) {
      return null;
    }

    let dataToExport = currentQuery.result;

    // Handle API response format with payload
    if (
      dataToExport &&
      typeof dataToExport === "object" &&
      "payload" in dataToExport
    ) {
      dataToExport = dataToExport.payload;
    }

    // Handle case where data is nested in a 'data' property
    if (
      dataToExport &&
      typeof dataToExport === "object" &&
      "data" in dataToExport
    ) {
      dataToExport = dataToExport.data;
    }

    // Check if we have valid data to export
    if (!Array.isArray(dataToExport) || dataToExport.length === 0) {
      return null;
    }

    return dataToExport;
  };

  const handleExportToCSV = () => {
    const dataToExport = extractDataForExport();
    if (!dataToExport) {
      return;
    }

    try {
      // Convert data to CSV format
      const headers = Object.keys(dataToExport[0]);
      const csvContent = [
        // Add headers
        headers.join(","),
        // Add data rows
        ...dataToExport.map((row) =>
          headers
            .map((header) => {
              const value = row[header];
              // Handle values that might contain commas or quotes
              if (
                typeof value === "string" &&
                (value.includes(",") || value.includes('"'))
              ) {
                return `"${value.replace(/"/g, '""')}"`;
              }
              return value || "";
            })
            .join(",")
        ),
      ].join("\n");

      // Create and download the file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `query-results-${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setShowExportDropdown(false);
    } catch (error) {
      console.error("CSV export failed:", error);
    }
  };

  const handleExportToExcel = async () => {
    const dataToExport = extractDataForExport();
    if (!dataToExport) {
      return;
    }

    try {
      // Dynamically import xlsx to avoid SSR issues
      const XLSX = await import("xlsx");

      // Create a new workbook
      const workbook = XLSX.utils.book_new();

      // Create the main data worksheet
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);

      // Auto-size columns
      const headers = Object.keys(dataToExport[0]);
      const columnWidths = headers.map((header) => {
        const maxLength = Math.max(
          header.length,
          ...dataToExport.map((row) => String(row[header] || "").length)
        );
        return { wch: Math.min(maxLength + 2, 50) }; // Cap at 50 characters
      });
      worksheet["!cols"] = columnWidths;

      // Style the header row
      const headerRange = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
      for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!worksheet[cellAddress]) continue;

        worksheet[cellAddress].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "22C55E" } }, // Green header
          alignment: { horizontal: "center" },
        };
      }

      // Add the data sheet
      XLSX.utils.book_append_sheet(workbook, worksheet, "Query Results");

      // Create query info sheet
      const queryInfo = [
        { Property: "User", Value: currentQuery.userId },
        { Property: "Query", Value: currentQuery.query },
        {
          Property: "Timestamp",
          Value: new Date(currentQuery.timestamp).toLocaleString(),
        },
        { Property: "Total Records", Value: dataToExport.length },
      ];

      const infoWorksheet = XLSX.utils.json_to_sheet(queryInfo);
      infoWorksheet["!cols"] = [{ wch: 15 }, { wch: 50 }];

      // Style the info sheet headers
      ["A1", "B1"].forEach((cell) => {
        if (infoWorksheet[cell]) {
          infoWorksheet[cell].s = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "3B82F6" } }, // Blue header
            alignment: { horizontal: "center" },
          };
        }
      });

      XLSX.utils.book_append_sheet(workbook, infoWorksheet, "Query Info");

      // Generate and download the file
      const fileName = `query-results-${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      XLSX.writeFile(workbook, fileName);

      setShowExportDropdown(false);
    } catch (error) {
      console.error("Excel export failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Add top padding to account for fixed navbar */}
      <div className="pt-24 pb-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header with Back Button */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500/30 to-green-600/20 rounded-xl flex items-center justify-center border border-green-500/40">
                    <Bot className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">
                      AI Query Results
                    </h1>
                    <p className="text-gray-400">
                      Your AI-powered database query results
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleBackToDashboard}
                  variant="outline"
                  className="border-green-400/30 text-green-400 hover:bg-green-400/10"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </div>

              {/* Feature Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card className="bg-gray-900/50 border-green-400/30">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">
                          Natural Language
                        </h3>
                        <p className="text-gray-400 text-sm">
                          Ask questions in plain English
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900/50 border-green-400/30">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">
                          Business Rules
                        </h3>
                        <p className="text-gray-400 text-sm">
                          Automatic rule compliance
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900/50 border-green-400/30">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <Database className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">
                          Smart Results
                        </h3>
                        <p className="text-gray-400 text-sm">
                          Contextual data insights
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Current Query Result */}
            {currentQuery && (
              <div className="mb-8">
                <Card className="bg-gray-900/50 border-green-400/30">
                  <CardHeader>
                    <CardTitle className="text-green-400 flex items-center gap-2">
                      <Bot className="w-5 h-5" />
                      Latest Query Result
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Your most recent AI-powered database query
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Query Info */}
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-blue-400" />
                          <span className="text-blue-400">User:</span>
                          <span className="text-white">
                            {currentQuery.userId}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-purple-400" />
                          <span className="text-purple-400">Time:</span>
                          <span className="text-white">
                            {new Date(currentQuery.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Query Text */}
                      <div className="p-3 bg-blue-900/20 border border-blue-400/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4 text-blue-400" />
                          <span className="text-blue-400 font-medium">
                            Query:
                          </span>
                        </div>
                        <p className="text-white">{currentQuery.query}</p>
                      </div>

                      {/* Results */}
                      <div className="p-3 bg-green-900/20 border border-green-400/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Database className="w-4 h-4 text-green-400" />
                            <span className="text-green-400 font-medium">
                              Results:
                            </span>
                          </div>
                          <div className="relative export-dropdown">
                            <Button
                              onClick={() =>
                                setShowExportDropdown(!showExportDropdown)
                              }
                              variant="outline"
                              size="sm"
                              className="border-green-400/30 text-green-400 hover:bg-green-400/10 text-xs"
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Export
                              <ChevronDown className="w-3 h-3 ml-1" />
                            </Button>

                            {showExportDropdown && (
                              <div className="absolute right-0 top-full mt-1 w-48 bg-gray-800/95 backdrop-blur-sm border border-green-400/30 rounded-lg shadow-xl z-10">
                                <div className="p-1">
                                  <button
                                    onClick={handleExportToCSV}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white hover:bg-green-400/10 rounded-md transition-colors"
                                  >
                                    <FileText className="w-3 h-3 text-blue-400" />
                                    <div className="text-left">
                                      <div className="font-medium">
                                        Export as CSV
                                      </div>
                                      <div className="text-gray-400 text-xs">
                                        Simple comma-separated format
                                      </div>
                                    </div>
                                  </button>

                                  <button
                                    onClick={handleExportToExcel}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white hover:bg-green-400/10 rounded-md transition-colors"
                                  >
                                    <FileSpreadsheet className="w-3 h-3 text-green-400" />
                                    <div className="text-left">
                                      <div className="font-medium">
                                        Export as Excel
                                      </div>
                                      <div className="text-gray-400 text-xs">
                                        Rich formatting with multiple sheets
                                      </div>
                                    </div>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <QueryResultsDisplay result={currentQuery.result} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Empty State */}
            {!currentQuery && (
              <div className="mt-8">
                <Card className="bg-gray-900/50 border-green-400/30">
                  <CardContent className="pt-12 pb-12 text-center">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Bot className="w-8 h-8 text-green-400" />
                    </div>
                    <h3 className="text-white text-lg font-medium mb-2">
                      No Query Results Yet
                    </h3>
                    <p className="text-gray-400 mb-4">
                      Use the AI assistant to run your first database query
                    </p>
                    <Button
                      onClick={handleBackToDashboard}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Bot className="w-4 h-4 mr-2" />
                      Start Querying
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
