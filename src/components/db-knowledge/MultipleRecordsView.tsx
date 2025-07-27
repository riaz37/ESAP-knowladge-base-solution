"use client";
import { Table, FileText, BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/ui/data-table";

interface MultipleRecordsViewProps {
  data: any[];
  chartData?: {
    pie?: any[];
    bar?: any[];
  };
}

export default function MultipleRecordsView({ data, chartData }: MultipleRecordsViewProps) {
  const allKeys = Array.from(new Set(data.flatMap(Object.keys)));

  return (
    <div className="mt-6 space-y-6">
      <Card className="overflow-hidden relative backdrop-blur-xl bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10 shadow-2xl">
        {/* Glass effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/5 to-transparent dark:from-white/10 dark:via-white/5 dark:to-transparent" />
        {/* Subtle glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-secondary/10 to-primary/20 rounded-lg blur-lg opacity-30" />

        <CardHeader className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 backdrop-blur-sm border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-sm text-primary shadow-lg border border-white/20 hover:scale-105 hover:rotate-1 transition-transform duration-200">
                <Table className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  Query Results
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-white/20 dark:bg-black/20 backdrop-blur-sm border-white/20"
                  >
                    {data.length} records
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
          <DataTable
            columns={allKeys.map((key) => ({ key, label: key }))}
            allKeys={allKeys}
            data={data}
            pageSizeOptions={[7, 10, 20, 30]}
            defaultPageSize={7}
          />
        </CardContent>
      </Card>

      {(chartData?.pie || chartData?.bar) && (
        <Card className="overflow-hidden relative backdrop-blur-xl bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10 shadow-2xl">
          {/* Glass effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/5 to-transparent dark:from-white/10 dark:via-white/5 dark:to-transparent" />
          {/* Animated glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-secondary/30 via-primary/20 to-secondary/30 rounded-lg blur-lg opacity-40 animate-pulse" />

          <CardHeader className="relative bg-gradient-to-r from-secondary/10 via-secondary/5 to-primary/10 backdrop-blur-sm border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-br from-secondary/20 to-primary/20 backdrop-blur-sm text-secondary-foreground shadow-lg border border-white/20 hover:scale-105 hover:-rotate-1 transition-transform duration-200">
                <BarChart3 className="w-5 h-5" />
              </div>
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
        </Card>
      )}
    </div>
  );
}