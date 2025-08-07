"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import DataTable, { TableColumn } from "@/components/ui/data-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Hash,
  Calendar,
  DollarSign,
  FileText,
  BarChart3,
  Table as TableIcon,
} from "lucide-react";
import { DataVisualization } from "./DataVisualization";

interface QueryResultsDisplayProps {
  result: any;
}

export function QueryResultsDisplay({ result }: QueryResultsDisplayProps) {
  const [viewMode, setViewMode] = useState<"table" | "chart">("table");
  // Extract the actual data from API response format
  const actualData = useMemo(() => {
    console.log("Raw result:", result);

    // Handle API response format with statusCode and payload
    if (result && typeof result === "object" && "payload" in result) {
      console.log("Found payload:", result.payload);
      const payload = result.payload;

      // Check if payload has a data property (which contains the actual records)
      if (payload && typeof payload === "object" && "data" in payload) {
        console.log("Found data in payload.data:", payload.data);
        return payload.data;
      }

      return payload;
    }

    // Handle case where result is an object with data properties
    if (result && typeof result === "object") {
      // Look for common data property names
      const dataKeys = ["data", "Data", "results", "rows", "items"];
      for (const key of dataKeys) {
        if (key in result && result[key]) {
          console.log(`Found data in ${key}:`, result[key]);
          return result[key];
        }
      }
    }

    console.log("Using result as-is:", result);
    return result;
  }, [result]);

  // Determine the type of result and how to display it
  const resultType = useMemo(() => {
    if (actualData === null || actualData === undefined) return "empty";
    if (Array.isArray(actualData)) {
      if (actualData.length === 0) return "empty-array";
      if (typeof actualData[0] === "object" && actualData[0] !== null)
        return "table";
      return "list";
    }
    if (typeof actualData === "object") return "object";
    return "primitive";
  }, [actualData]);

  // Generate table columns from array of objects
  const tableData = useMemo(() => {
    if (resultType !== "table") return { columns: [], data: [] };

    const data = actualData as Record<string, any>[];
    if (data.length === 0) return { columns: [], data: [] };

    // Get all unique keys from all objects
    const allKeys = Array.from(
      new Set(data.flatMap((obj) => Object.keys(obj)))
    );

    // Create columns with smart labeling and sorting
    const columns: TableColumn[] = allKeys.map((key) => ({
      key,
      label: formatColumnLabel(key),
      sortable: true,
    }));

    return { columns, data };
  }, [actualData, resultType]);

  // Format column labels to be more readable
  function formatColumnLabel(key: string): string {
    return key
      .replace(/([A-Z])/g, " $1") // Add space before capital letters
      .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
      .replace(/_/g, " ") // Replace underscores with spaces
      .trim();
  }

  // Format individual values for display
  function formatValue(value: any): React.ReactNode {
    if (value === null || value === undefined) {
      return <span className="text-gray-500 italic">null</span>;
    }

    if (typeof value === "boolean") {
      return value ? (
        <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
          <CheckCircle className="w-3 h-3 mr-1" />
          True
        </Badge>
      ) : (
        <Badge className="bg-red-500/20 text-red-400 border-red-400/30">
          <XCircle className="w-3 h-3 mr-1" />
          False
        </Badge>
      );
    }

    if (typeof value === "number") {
      // Format currency if it looks like money
      if (value > 1000 && (value % 1 === 0 || value.toString().includes("."))) {
        return (
          <div className="flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-green-400" />
            <span className="text-green-400 font-mono">
              {value.toLocaleString()}
            </span>
          </div>
        );
      }
      return (
        <span className="font-mono text-blue-400">
          {value.toLocaleString()}
        </span>
      );
    }

    if (typeof value === "string") {
      // Format dates
      if (isDateString(value)) {
        return (
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-purple-400" />
            <span className="text-purple-400">
              {new Date(value).toLocaleDateString()}
            </span>
          </div>
        );
      }

      // Format IDs
      if (value.toLowerCase().includes("id") || /^\d+$/.test(value)) {
        return (
          <div className="flex items-center gap-1">
            <Hash className="w-3 h-3 text-blue-400" />
            <span className="font-mono text-blue-400">{value}</span>
          </div>
        );
      }

      return <span className="text-white">{value}</span>;
    }

    return <span className="text-white">{String(value)}</span>;
  }

  // Check if string is a date
  function isDateString(str: string): boolean {
    if (typeof str !== "string") return false;
    const date = new Date(str);
    return !isNaN(date.getTime()) && str.match(/^\d{4}-\d{2}-\d{2}/) !== null;
  }

  // Render based on result type
  switch (resultType) {
    case "empty":
    case "empty-array":
      return (
        <Card className="bg-gray-800/50 border-gray-600/30">
          <CardContent className="pt-8 pb-8 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
            <h3 className="text-white font-medium mb-2">No Results Found</h3>
            <p className="text-gray-400 text-sm">
              Your query didn't return any data. Try adjusting your search
              criteria.
            </p>
          </CardContent>
        </Card>
      );

    case "table":
      return (
        <div className="space-y-4">
          {/* Header with view toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
                <FileText className="w-3 h-3 mr-1" />
                {tableData.data.length} records found
              </Badge>
            </div>
            
            {/* View Toggle Buttons */}
            <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-1">
              <Button
                onClick={() => setViewMode("table")}
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                className={`h-8 px-3 text-xs ${
                  viewMode === "table"
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-700"
                }`}
              >
                <TableIcon className="w-3 h-3 mr-1" />
                Table
              </Button>
              <Button
                onClick={() => setViewMode("chart")}
                variant={viewMode === "chart" ? "default" : "ghost"}
                size="sm"
                className={`h-8 px-3 text-xs ${
                  viewMode === "chart"
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-700"
                }`}
              >
                <BarChart3 className="w-3 h-3 mr-1" />
                Charts
              </Button>
            </div>
          </div>

          {/* Content based on view mode */}
          {viewMode === "table" ? (
            <DataTable
              columns={tableData.columns}
              data={tableData.data}
              defaultPageSize={10}
              pageSizeOptions={[5, 10, 20, 50]}
            />
          ) : (
            <DataVisualization data={actualData as any[]} />
          )}
        </div>
      );

    case "list":
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-400/30">
              <Hash className="w-3 h-3 mr-1" />
              {(actualData as any[]).length} items
            </Badge>
          </div>
          <Card className="bg-gray-800/50 border-gray-600/30">
            <CardContent className="p-4">
              <div className="grid gap-2">
                {(actualData as any[]).map((item: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2 bg-gray-700/30 rounded-lg"
                  >
                    <span className="text-gray-400 text-sm font-mono">
                      {index + 1}
                    </span>
                    <div className="flex-1">{formatValue(item)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      );

    case "object":
      return (
        <Card className="bg-gray-800/50 border-gray-600/30">
          <CardContent className="p-4">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-600/30">
                  <TableHead className="text-green-400">Property</TableHead>
                  <TableHead className="text-green-400">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(actualData).map(([key, value]) => (
                  <TableRow key={key} className="border-gray-600/30">
                    <TableCell className="font-medium text-blue-400">
                      {formatColumnLabel(key)}
                    </TableCell>
                    <TableCell>{formatValue(value)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      );

    case "primitive":
      return (
        <Card className="bg-gray-800/50 border-gray-600/30">
          <CardContent className="p-6 text-center">
            <div className="text-2xl mb-2">{formatValue(actualData)}</div>
            <p className="text-gray-400 text-sm">Single value result</p>
          </CardContent>
        </Card>
      );

    default:
      // Fallback to formatted JSON
      return (
        <Card className="bg-gray-800/50 border-gray-600/30">
          <CardContent className="p-4">
            <div className="bg-gray-900/50 border border-green-400/20 rounded p-3 max-h-96 overflow-auto">
              <pre className="text-white text-sm">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      );
  }
}
