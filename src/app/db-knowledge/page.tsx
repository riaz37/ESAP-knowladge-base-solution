"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QueryInput from "@/components/query/QueryInput";
import { GraphsRow } from "@/components/graphs";
import FigmaTableDemo from "@/components/table";
import Lottie from "lottie-react";
import robotAnimation2 from "../../../public/robot-lottie3.json";
import { useUIStore } from "@/store/uiStore";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTheme } from "@/contexts/ThemeContext";

// Import shadcn components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Database,
  BarChart3,
  Table,
  Sparkles,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  TrendingUp,
  FileText,
  DollarSign,
} from "lucide-react";

// Import custom hooks
import {
  useBusinessRulesModal,
  useDatabaseOperations,
  useUserSettings,
} from "@/lib/hooks";

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
  const { resolvedTheme } = useTheme();

  // Custom hooks
  const databaseOps = useDatabaseOperations();
  const businessRulesModal = useBusinessRulesModal();
  const userSettings = useUserSettings();

  const handleQuerySubmit = async () => {
    if (!query.trim()) return;
    await databaseOps.sendDatabaseQuery(query, userSettings.userId);
  };

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
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="mt-6 border-dashed relative overflow-hidden backdrop-blur-xl bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10 shadow-2xl">
            {/* Glass effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/5 to-transparent dark:from-white/10 dark:via-white/5 dark:to-transparent" />
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 opacity-50" />
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg blur-lg opacity-30" />

            <CardContent className="relative flex flex-col items-center justify-center py-16">
              <motion.div
                className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-sm flex items-center justify-center mb-4 shadow-lg border border-white/20"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <Database className="h-8 w-8 text-primary" />
              </motion.div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">
                No Results Found
              </h3>
              <p className="text-muted-foreground text-center max-w-md">
                Your query didn't return any data. Try adjusting your search
                terms or check the database connection.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      );
    }

    if (dataArr.length === 1) {
      const obj = dataArr[0];
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="mt-6 max-w-4xl overflow-hidden relative backdrop-blur-xl bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10 shadow-2xl">
            {/* Glass effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/5 to-transparent dark:from-white/10 dark:via-white/5 dark:to-transparent" />
            {/* Animated glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-secondary/20 to-primary/30 rounded-lg blur-lg opacity-40 animate-pulse" />

            <CardHeader className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 backdrop-blur-sm border-b border-white/10">
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-sm text-primary shadow-lg border border-white/20"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <CheckCircle className="w-6 h-6" />
                </motion.div>
                <div>
                  <CardTitle className="text-xl text-foreground">
                    Single Record Found
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Detailed information retrieved from database
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(obj).map(([key, value], index) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="group relative p-4 rounded-lg backdrop-blur-sm bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 overflow-hidden"
                  >
                    {/* Subtle glow on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {/* Glass shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-50" />

                    <div className="relative">
                      <Badge
                        variant="secondary"
                        className="mb-2 text-xs font-medium bg-white/20 dark:bg-black/20 backdrop-blur-sm border-white/20"
                      >
                        {key
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </Badge>
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {String(value)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      );
    }

    // Multiple records - show table and charts
    const allKeys = Array.from(new Set(dataArr.flatMap(Object.keys)));
    const currentData = dataArr;
    const chartData = analyzeDataForCharts(currentData, allKeys);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-6 space-y-6"
      >
        <Card className="overflow-hidden relative backdrop-blur-xl bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10 shadow-2xl">
          {/* Glass effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/5 to-transparent dark:from-white/10 dark:via-white/5 dark:to-transparent" />
          {/* Subtle glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-secondary/10 to-primary/20 rounded-lg blur-lg opacity-30" />

          <CardHeader className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 backdrop-blur-sm border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-sm text-primary shadow-lg border border-white/20"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Table className="w-5 h-5" />
                </motion.div>
                <div>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    Query Results
                    <Badge
                      variant="secondary"
                      className="ml-2 bg-white/20 dark:bg-black/20 backdrop-blur-sm border-white/20"
                    >
                      {currentData.length} records
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Data retrieved from database query
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 backdrop-blur-sm bg-white/10 dark:bg-black/10 border-white/20 hover:bg-white/20 dark:hover:bg-black/20"
              >
                <FileText className="w-4 h-4" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent className="relative p-0">
            {/* Glass overlay for table */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent dark:via-black/5 pointer-events-none" />
            <FigmaTableDemo
              columns={allKeys.map((key) => ({ key, label: key }))}
              allKeys={allKeys}
              data={currentData}
              pageSizeOptions={[7, 10, 20, 30]}
              defaultPageSize={7}
            />
          </CardContent>
        </Card>

        {(chartData.pie || chartData.bar) && (
          <Card className="overflow-hidden relative backdrop-blur-xl bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10 shadow-2xl">
            {/* Glass effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/5 to-transparent dark:from-white/10 dark:via-white/5 dark:to-transparent" />
            {/* Animated glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-secondary/30 via-primary/20 to-secondary/30 rounded-lg blur-lg opacity-40 animate-pulse" />

            <CardHeader className="relative bg-gradient-to-r from-secondary/10 via-secondary/5 to-primary/10 backdrop-blur-sm border-b border-white/10">
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-br from-secondary/20 to-primary/20 backdrop-blur-sm text-secondary-foreground shadow-lg border border-white/20"
                  whileHover={{ scale: 1.05, rotate: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <BarChart3 className="w-5 h-5" />
                </motion.div>
                <div>
                  <CardTitle className="text-foreground">
                    Data Visualization
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Interactive charts generated from your query results
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative pt-6">
              {/* Glass overlay for charts */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent dark:via-black/5 pointer-events-none" />
              <GraphsRow
                chartData={chartData}
                loading={databaseOps.loading}
                isDummy={!chartData || (!chartData.bar && !chartData.pie)}
              />
            </CardContent>
          </Card>
        )}
      </motion.div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-20 w-96 h-96 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-40 right-32 w-64 h-64 rounded-full bg-gradient-to-r from-secondary/10 to-primary/10 blur-2xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5,
          }}
        />
      </div>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5" />
        <div className="relative">
          <Card className="border-0 shadow-none bg-transparent">
            <CardContent className="pt-8 pb-6">
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-primary/80 backdrop-blur-sm flex items-center justify-center shadow-2xl border border-white/20 relative overflow-hidden"
                >
                  {/* Glass shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent" />
                  {/* Glow effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-secondary/50 rounded-2xl blur-lg opacity-50" />
                  <Database className="w-8 h-8 text-primary-foreground relative z-10" />
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-3xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent mb-2"
                >
                  Database Knowledge Hub
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="text-muted-foreground max-w-2xl mx-auto"
                >
                  Query your database using natural language. Get instant
                  insights, visualizations, and detailed analysis.
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="relative"
              >
                <QueryInput
                  query={query}
                  setQuery={setQuery}
                  handleQuerySubmit={handleQuerySubmit}
                  loading={databaseOps.loading}
                  selected={"db"}
                  quickActions={quickActions.map((action) => ({
                    ...action,
                    icon: action.icon.name || "📊", // Convert icon component to string for compatibility
                  }))}
                  theme={resolvedTheme || "light"}
                />
              </motion.div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Results Section */}
      <div className="px-4 pb-8">
        <AnimatePresence mode="wait">
          {databaseOps.error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="mt-6 border-destructive/50 bg-destructive/5 relative overflow-hidden backdrop-blur-xl">
                {/* Glass effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent dark:from-red-500/5 dark:via-red-500/2 dark:to-transparent" />
                {/* Error glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-destructive/30 to-destructive/20 rounded-lg blur-lg opacity-40" />

                <CardContent className="relative flex items-center gap-3 pt-6">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                  </motion.div>
                  <div>
                    <p className="text-destructive font-medium">Query Error</p>
                    <p className="text-destructive/80 text-sm">
                      {databaseOps.error}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {databaseOps.loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="mt-6 overflow-hidden relative backdrop-blur-xl bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10 shadow-2xl">
                {/* Glass effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/5 to-transparent dark:from-white/10 dark:via-white/5 dark:to-transparent" />
                {/* Animated rainbow glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/40 via-secondary/30 to-secondary/40 rounded-lg blur-lg opacity-50 animate-pulse" />

                <CardContent className="relative flex flex-col items-center justify-center py-16 gap-6">
                  <div className="relative">
                    <div className="w-64 h-64 relative">
                      {/* Glass container for lottie */}
                      <div className="absolute inset-0 rounded-full backdrop-blur-sm bg-white/5 dark:bg-black/5 border border-white/10" />
                      <Lottie
                        animationData={robotAnimation2}
                        loop={true}
                        autoplay={true}
                      />
                    </div>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-lg"
                    >
                      <Loader2 className="w-4 h-4 text-primary" />
                    </motion.div>
                  </div>

                  <div className="w-full max-w-md space-y-3">
                    <Skeleton className="h-3 w-full bg-white/10 dark:bg-black/10 backdrop-blur-sm" />
                    <Skeleton className="h-3 w-3/4 bg-white/10 dark:bg-black/10 backdrop-blur-sm" />
                    <Skeleton className="h-3 w-1/2 bg-white/10 dark:bg-black/10 backdrop-blur-sm" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Render Results */}
        {databaseOps.dbResponse &&
          databaseOps.dbResponse.payload &&
          renderDbData(databaseOps.dbResponse.payload.data)}
      </div>

      {/* Business Rules Modal with Glass Effects */}
      <Dialog
        open={showBusinessRulesModal}
        onOpenChange={setShowBusinessRulesModal}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden backdrop-blur-xl bg-white/95 dark:bg-black/95 border-white/20 dark:border-white/10 shadow-2xl">
          {/* Glass effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-transparent dark:from-white/10 dark:via-white/5 dark:to-transparent pointer-events-none" />
          {/* Subtle glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg blur-lg opacity-30" />

          <DialogHeader className="relative">
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.2 }}
                className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-sm border border-white/20"
              >
                <FileText className="h-5 w-5" />
              </motion.div>
              Business Rules & Constraints
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Database business rules, constraints, and operational guidelines
            </DialogDescription>
          </DialogHeader>

          <Separator className="bg-white/20 dark:bg-white/10" />

          <div className="flex-1 overflow-auto relative">
            {businessRulesModal.businessRulesLoading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
                />
                <p className="text-muted-foreground">
                  Loading business rules...
                </p>
                <div className="w-full space-y-3">
                  <Skeleton className="h-4 w-full bg-white/10 dark:bg-black/10 backdrop-blur-sm" />
                  <Skeleton className="h-4 w-3/4 bg-white/10 dark:bg-black/10 backdrop-blur-sm" />
                  <Skeleton className="h-4 w-1/2 bg-white/10 dark:bg-black/10 backdrop-blur-sm" />
                </div>
              </div>
            ) : businessRulesModal.businessRulesError ? (
              <Card className="border-destructive/50 bg-destructive/5 relative overflow-hidden backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent" />
                <CardContent className="relative flex items-center gap-3 pt-6">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <div>
                    <p className="text-destructive font-medium">
                      Failed to Load Business Rules
                    </p>
                    <p className="text-destructive/80 text-sm">
                      {businessRulesModal.businessRulesError}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="relative overflow-hidden backdrop-blur-sm bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/5 to-transparent dark:from-white/10 dark:via-white/5 dark:to-transparent" />
                <CardContent className="relative pt-6">
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {businessRulesModal.businessRulesText}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
