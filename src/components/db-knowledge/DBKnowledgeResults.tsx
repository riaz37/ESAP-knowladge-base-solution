"use client";
import { AnimatePresence } from "framer-motion";
import LoadingState from "./LoadingState";
import ErrorState from "./ErrorState";
import EmptyState from "./EmptyState";
import SingleRecordView from "./SingleRecordView";
import MultipleRecordsView from "./MultipleRecordsView";

interface DBKnowledgeResultsProps {
  loading: boolean;
  error: string | null;
  dbResponse: any;
}

export default function DBKnowledgeResults({
  loading,
  error,
  dbResponse
}: DBKnowledgeResultsProps) {
  // Enhanced data analysis for better visualization
  function analyzeDataForCharts(data: any[], keys: string[]) {
    if (!data || data.length === 0) return {};

    const numericKeys = keys.filter((key) =>
      data.some((item) => typeof item[key] === "number" && !isNaN(item[key]))
    );

    const stringKeys = keys.filter((key) =>
      data.some((item) => typeof item[key] === "string")
    );

    let chartData: any = {};

    // Generate pie chart for categorical data
    if (stringKeys.length > 0) {
      const key = stringKeys[0];
      const counts = data.reduce((acc, item) => {
        const value = item[key];
        acc[value] = (acc[value] || 0) + 1;
        return acc;
      }, {});

      chartData.pie = Object.entries(counts).map(([name, value]) => ({
        name,
        value,
        fill: `hsl(${Math.random() * 360}, 70%, 50%)`,
      }));
    }

    // Generate bar chart for numeric data
    if (numericKeys.length > 0 && data.length <= 20) {
      const key = numericKeys[0];
      chartData.bar = data.map((item, index) => ({
        name: item[stringKeys[0]] || `Item ${index + 1}`,
        value: item[key] || 0,
      }));
    }

    return chartData;
  }

  function renderDbData(dataArr: any) {
    if (!Array.isArray(dataArr)) return null;

    if (dataArr.length === 0) {
      return <EmptyState />;
    }

    if (dataArr.length === 1) {
      return <SingleRecordView data={dataArr[0]} />;
    }

    // Multiple records - show table and charts
    const allKeys = Array.from(new Set(dataArr.flatMap(Object.keys)));
    const chartData = analyzeDataForCharts(dataArr, allKeys);

    return <MultipleRecordsView data={dataArr} chartData={chartData} />;
  }

  return (
    <div className="px-4 pb-8">
      <AnimatePresence mode="wait">
        {error && <ErrorState error={error} />}
        {loading && <LoadingState />}
      </AnimatePresence>

      {/* Render Results */}
      {dbResponse &&
        dbResponse.payload &&
        renderDbData(dbResponse.payload.data)}
    </div>
  );
}