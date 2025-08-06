"use client";

import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  AreaChart as AreaChartIcon,
  Zap as ScatterIcon,
  Settings,
  TrendingUp,
  Calendar,
  Hash,
} from "lucide-react";

interface DataVisualizationProps {
  data: any[];
}

type ChartType = "bar" | "line" | "pie" | "area" | "scatter";

interface ChartConfig {
  type: ChartType;
  xAxis: string;
  yAxis: string;
  groupBy?: string;
  aggregation: "sum" | "count" | "avg" | "max" | "min";
}

const CHART_COLORS = [
  "#22C55E", // Green
  "#3B82F6", // Blue
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Violet
  "#06B6D4", // Cyan
  "#F97316", // Orange
  "#EC4899", // Pink
  "#84CC16", // Lime
  "#6366F1", // Indigo
];

export function DataVisualization({ data }: DataVisualizationProps) {
  const [chartConfig, setChartConfig] = useState<ChartConfig>({
    type: "bar",
    xAxis: "",
    yAxis: "",
    aggregation: "count",
  });

  // Extract column information from data
  const columns = useMemo(() => {
    if (!data || data.length === 0) return [];

    const firstRow = data[0];
    return Object.keys(firstRow).map((key) => {
      const sampleValue = firstRow[key];
      const isNumeric =
        typeof sampleValue === "number" ||
        (typeof sampleValue === "string" && !isNaN(Number(sampleValue)));
      const isDate =
        typeof sampleValue === "string" &&
        !isNaN(Date.parse(sampleValue)) &&
        sampleValue.match(/^\d{4}-\d{2}-\d{2}/);

      return {
        key,
        label: formatColumnLabel(key),
        type: isDate ? "date" : isNumeric ? "numeric" : "categorical",
        icon: isDate ? Calendar : isNumeric ? Hash : BarChart3,
      };
    });
  }, [data]);

  // Auto-select initial axes if not set
  useMemo(() => {
    if (columns.length > 0 && !chartConfig.xAxis) {
      const categoricalCol = columns.find((col) => col.type === "categorical");
      const dateCol = columns.find((col) => col.type === "date");
      const numericCol = columns.find((col) => col.type === "numeric");

      setChartConfig((prev) => ({
        ...prev,
        xAxis: dateCol?.key || categoricalCol?.key || columns[0].key,
        yAxis: numericCol?.key || columns[1]?.key || columns[0].key,
      }));
    }
  }, [columns, chartConfig.xAxis]);

  // Process data based on chart configuration
  const processedData = useMemo(() => {
    if (!data || !chartConfig.xAxis || !chartConfig.yAxis) return [];

    const grouped = data.reduce((acc, item) => {
      const xValue = item[chartConfig.xAxis];
      const yValue = item[chartConfig.yAxis];

      if (!acc[xValue]) {
        acc[xValue] = [];
      }
      acc[xValue].push(Number(yValue) || 0);
      return acc;
    }, {} as Record<string, number[]>);

    return Object.entries(grouped)
      .map(([key, values]) => {
        let aggregatedValue: number;

        switch (chartConfig.aggregation) {
          case "sum":
            aggregatedValue = values.reduce(
              (sum: number, val: number) => sum + val,
              0
            );
            break;
          case "avg":
            aggregatedValue =
              values.reduce((sum: number, val: number) => sum + val, 0) /
              values.length;
            break;
          case "max":
            aggregatedValue = Math.max(...values);
            break;
          case "min":
            aggregatedValue = Math.min(...values);
            break;
          case "count":
          default:
            aggregatedValue = values.length;
            break;
        }

        return {
          name: key,
          value: aggregatedValue,
          [chartConfig.yAxis]: aggregatedValue,
        };
      })
      .sort((a, b) => {
        // Sort by name if it looks like a date, otherwise by value
        if (a.name.match(/^\d{4}-\d{2}-\d{2}/)) {
          return new Date(a.name).getTime() - new Date(b.name).getTime();
        }
        return b.value - a.value;
      });
  }, [data, chartConfig]);

  function formatColumnLabel(key: string): string {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .replace(/_/g, " ")
      .trim();
  }

  const chartTypes = [
    {
      type: "bar" as ChartType,
      label: "Bar Chart",
      icon: BarChart3,
      description: "Compare categories",
    },
    {
      type: "line" as ChartType,
      label: "Line Chart",
      icon: LineChartIcon,
      description: "Show trends over time",
    },
    {
      type: "area" as ChartType,
      label: "Area Chart",
      icon: AreaChartIcon,
      description: "Filled trend visualization",
    },
    {
      type: "pie" as ChartType,
      label: "Pie Chart",
      icon: PieChartIcon,
      description: "Show proportions",
    },
    {
      type: "scatter" as ChartType,
      label: "Scatter Plot",
      icon: ScatterIcon,
      description: "Show correlations",
    },
  ];

  const aggregationOptions = [
    { value: "count", label: "Count", description: "Number of records" },
    { value: "sum", label: "Sum", description: "Total value" },
    { value: "avg", label: "Average", description: "Mean value" },
    { value: "max", label: "Maximum", description: "Highest value" },
    { value: "min", label: "Minimum", description: "Lowest value" },
  ];

  const renderChart = () => {
    if (!processedData.length) {
      return (
        <div className="h-64 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No data to visualize</p>
            <p className="text-sm">
              Select different parameters to generate a chart
            </p>
          </div>
        </div>
      );
    }

    const commonProps = {
      data: processedData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 },
    };

    switch (chartConfig.type) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="name"
                stroke="#9CA3AF"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #22C55E",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Legend />
              <Bar
                dataKey="value"
                fill="#22C55E"
                name={`${formatColumnLabel(chartConfig.yAxis)} (${
                  chartConfig.aggregation
                })`}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case "line":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="name"
                stroke="#9CA3AF"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #3B82F6",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                name={`${formatColumnLabel(chartConfig.yAxis)} (${
                  chartConfig.aggregation
                })`}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case "area":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="name"
                stroke="#9CA3AF"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #8B5CF6",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#8B5CF6"
                fill="#8B5CF6"
                fillOpacity={0.3}
                strokeWidth={2}
                name={`${formatColumnLabel(chartConfig.yAxis)} (${
                  chartConfig.aggregation
                })`}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case "pie":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={processedData.slice(0, 10)} // Limit to top 10 for readability
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {processedData.slice(0, 10).map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #F59E0B",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case "scatter":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="name"
                stroke="#9CA3AF"
                fontSize={12}
                type="category"
              />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #EC4899",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Legend />
              <Scatter
                dataKey="value"
                fill="#EC4899"
                name={`${formatColumnLabel(chartConfig.yAxis)} (${
                  chartConfig.aggregation
                })`}
              />
            </ScatterChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  if (!data || data.length === 0) {
    return (
      <Card className="bg-gray-800/50 border-gray-600/30">
        <CardContent className="pt-8 pb-8 text-center">
          <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-white font-medium mb-2">No Data Available</h3>
          <p className="text-gray-400 text-sm">
            Run a query to see data visualizations
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Chart Configuration Panel */}
      <Card className="bg-gray-800/50 border-green-400/30">
        <CardHeader>
          <CardTitle className="text-green-400 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Chart Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Chart Type Selection */}
          <div>
            <label className="text-white text-sm font-medium mb-2 block">
              Chart Type
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {chartTypes.map((chart) => (
                <Button
                  key={chart.type}
                  onClick={() =>
                    setChartConfig((prev) => ({ ...prev, type: chart.type }))
                  }
                  variant={
                    chartConfig.type === chart.type ? "default" : "outline"
                  }
                  size="sm"
                  className={`flex flex-col items-center gap-1 h-auto py-3 ${
                    chartConfig.type === chart.type
                      ? "bg-green-600 hover:bg-green-700 text-white border-green-400"
                      : "border-gray-600 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  <chart.icon className="w-4 h-4" />
                  <span className="text-xs">{chart.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Axis Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-white text-sm font-medium mb-2 block">
                X-Axis
              </label>
              <Select
                value={chartConfig.xAxis}
                onValueChange={(value) =>
                  setChartConfig((prev) => ({ ...prev, xAxis: value }))
                }
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select X-axis" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {columns.map((col) => (
                    <SelectItem
                      key={col.key}
                      value={col.key}
                      className="text-white hover:bg-gray-700"
                    >
                      <div className="flex items-center gap-2">
                        <col.icon className="w-3 h-3" />
                        {col.label}
                        <Badge variant="outline" className="text-xs">
                          {col.type}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-white text-sm font-medium mb-2 block">
                Y-Axis
              </label>
              <Select
                value={chartConfig.yAxis}
                onValueChange={(value) =>
                  setChartConfig((prev) => ({ ...prev, yAxis: value }))
                }
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select Y-axis" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {columns.map((col) => (
                    <SelectItem
                      key={col.key}
                      value={col.key}
                      className="text-white hover:bg-gray-700"
                    >
                      <div className="flex items-center gap-2">
                        <col.icon className="w-3 h-3" />
                        {col.label}
                        <Badge variant="outline" className="text-xs">
                          {col.type}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-white text-sm font-medium mb-2 block">
                Aggregation
              </label>
              <Select
                value={chartConfig.aggregation}
                onValueChange={(value: any) =>
                  setChartConfig((prev) => ({ ...prev, aggregation: value }))
                }
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {aggregationOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="text-white hover:bg-gray-700"
                    >
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-gray-400">
                          {option.description}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Chart Info */}
          <div className="flex items-center gap-4 text-sm">
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-400/30">
              {processedData.length} data points
            </Badge>
            <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
              {chartTypes.find((c) => c.type === chartConfig.type)?.description}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Chart Display */}
      <Card className="bg-gray-800/50 border-green-400/30">
        <CardHeader>
          <CardTitle className="text-green-400 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            {chartTypes.find((c) => c.type === chartConfig.type)?.label} -{" "}
            {formatColumnLabel(chartConfig.yAxis)} by{" "}
            {formatColumnLabel(chartConfig.xAxis)}
          </CardTitle>
        </CardHeader>
        <CardContent>{renderChart()}</CardContent>
      </Card>
    </div>
  );
}
