"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  Database,
  Search,
  RefreshCw,
  Settings,
  FileSpreadsheet,
  Table,
  Eye,
} from "lucide-react";
import { TableFlowVisualization } from "./TableFlowVisualization";
import { ExcelToDBManager } from "./ExcelToDBManager";
import { UserCurrentDBService } from "@/lib/api/services/user-current-db-service";
import { UserCurrentDBTableData } from "@/types/api";
import { DatabaseService } from "@/lib/api/services/database-service";

export function TablesManager() {
  const [tableData, setTableData] = useState<UserCurrentDBTableData | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [settingDB, setSettingDB] = useState(false);
  const [generatingTables, setGeneratingTables] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userId, setUserId] = useState(""); // User ID input
  const [dbId, setDbId] = useState<number>(1); // Default database ID
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("visualization");
  const [selectedTableForViewing, setSelectedTableForViewing] =
    useState<string>("");

  const setCurrentDatabase = async () => {
    if (!userId.trim()) {
      setError("Please enter a user ID");
      return;
    }

    if (!dbId || dbId <= 0) {
      setError("Please enter a valid database ID");
      return;
    }

    setSettingDB(true);
    setError(null);
    setSuccess(null);

    try {
      await UserCurrentDBService.setUserCurrentDB(userId, { db_id: dbId });
      setSuccess(`Successfully set database ID ${dbId} for user ${userId}`);
      // Auto-fetch table data after setting the database
      setTimeout(() => {
        fetchTableData();
      }, 1000);
    } catch (err) {
      console.error("Error setting current database:", err);
      setError(
        "Failed to set current database. Please check the user ID and database ID."
      );
    } finally {
      setSettingDB(false);
    }
  };

  const fetchTableData = async () => {
    if (!userId.trim()) {
      setError("Please enter a user ID");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await UserCurrentDBService.getUserCurrentDB(userId);

      // Check if the response has table_info and try to parse it
      if (response.table_info && typeof response.table_info === "object") {
        let parsedTableInfo = null;

        // If table_info has a 'schema' property with JSON string, parse it
        if (
          "schema" in response.table_info &&
          typeof response.table_info.schema === "string"
        ) {
          try {
            parsedTableInfo = JSON.parse(response.table_info.schema);
          } catch (parseError) {
            console.error(
              "Failed to parse table_info.schema JSON:",
              parseError
            );
          }
        }
        // If table_info already has the expected structure
        else if (
          "tables" in response.table_info &&
          Array.isArray(response.table_info.tables)
        ) {
          parsedTableInfo = response.table_info;
        }

        if (
          parsedTableInfo &&
          parsedTableInfo.tables &&
          Array.isArray(parsedTableInfo.tables)
        ) {
          // Create the properly structured data
          const structuredData: UserCurrentDBTableData = {
            ...response,
            table_info: parsedTableInfo,
          };
          setTableData(structuredData);
        } else {
          console.warn(
            "Table info not in expected format:",
            response.table_info
          );
          setError(
            "Table information is not available or in an unexpected format. Please generate table info first."
          );
          setTableData(null);
        }
      } else {
        console.warn("No table_info found in response:", response);
        setError(
          "Table information is not available. Please generate table info first."
        );
        setTableData(null);
      }

      // Update the dbId state with the current database ID
      setDbId(response.db_id);
    } catch (err) {
      console.error("Error fetching table data:", err);
      setError(
        "Failed to fetch table data. Please check the user ID and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const generateTableInfo = async () => {
    if (!userId.trim()) {
      setError("Please enter a user ID");
      return;
    }

    setGeneratingTables(true);
    setError(null);
    setSuccess(null);

    try {
      // For now, let's just reload the database to refresh table info
      const response = await DatabaseService.reloadDatabase();
      setSuccess(
        `Database reloaded successfully. Please try loading tables again.`
      );

      // Auto-fetch table data after reloading
      setTimeout(() => {
        fetchTableData();
      }, 2000);
    } catch (err) {
      console.error("Error reloading database:", err);
      setError("Failed to reload database. Please try again.");
    } finally {
      setGeneratingTables(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchTableData();
    }
  }, []);

  const filteredTables =
    tableData?.table_info?.tables?.filter(
      (table) =>
        table.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        table.table_name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  // Prepare available tables for Excel to DB
  const availableTables =
    tableData?.table_info?.tables?.map((table) => ({
      table_name: table.table_name,
      full_name: table.full_name,
      columns: (table.columns || []).map((column) => ({
        column_name: column.name,
        data_type: column.type,
        is_nullable: !column.is_required,
      })),
    })) || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Database Tables</h1>
          <p className="text-slate-400 mt-2">
            Manage table relationships and import data
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {success && (
        <Alert className="border-emerald-500/50 bg-emerald-500/10">
          <AlertDescription className="text-emerald-400">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {/* Database Configuration */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Settings className="h-5 w-5" />
            Database Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-400 whitespace-nowrap">
                User ID:
              </label>
              <Input
                placeholder="Enter User ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-400 whitespace-nowrap">
                Database ID:
              </label>
              <Input
                type="number"
                placeholder="Enter DB ID"
                value={dbId}
                onChange={(e) => setDbId(parseInt(e.target.value) || 1)}
                className="w-32"
                min="1"
              />
            </div>
            <Button
              onClick={setCurrentDatabase}
              disabled={settingDB}
              variant="outline"
            >
              {settingDB ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Settings className="h-4 w-4" />
              )}
              Set Database
            </Button>
            <Button onClick={fetchTableData} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Load Tables
            </Button>
            <Button
              onClick={generateTableInfo}
              disabled={generatingTables}
              variant="secondary"
            >
              {generatingTables ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Database className="h-4 w-4" />
              )}
              Reload Database
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Database Info */}
      {tableData && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Database className="h-5 w-5" />
              Database Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-slate-400">Database ID</p>
                <p className="text-white font-medium">{tableData.db_id}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Total Tables</p>
                <p className="text-white font-medium">
                  {tableData.table_info?.metadata?.total_tables || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Processed Tables</p>
                <p className="text-white font-medium">
                  {tableData.table_info?.metadata?.processed_tables || 0}
                </p>
              </div>
            </div>

            {tableData.table_info?.unmatched_business_rules?.length > 0 && (
              <div>
                <p className="text-sm text-slate-400 mb-2">
                  Unmatched Business Rules
                </p>
                <div className="flex flex-wrap gap-2">
                  {tableData.table_info.unmatched_business_rules.map(
                    (rule, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-yellow-900/20 text-yellow-400"
                      >
                        {rule}
                      </Badge>
                    )
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
          <TabsTrigger
            value="visualization"
            className="flex items-center gap-2 data-[state=active]:bg-slate-700"
          >
            <Table className="h-4 w-4" />
            Table Visualization
          </TabsTrigger>
          <TabsTrigger
            value="excel-import"
            className="flex items-center gap-2 data-[state=active]:bg-slate-700"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Excel Import
          </TabsTrigger>
        </TabsList>

        {/* Table Visualization Tab */}
        <TabsContent value="visualization" className="space-y-6 mt-6">
          {/* Search */}
          {tableData && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search tables..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Table Flow Visualization */}
          {tableData && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">
                  Table Relationships
                </CardTitle>
                <p className="text-slate-400 text-sm">
                  Interactive visualization of table relationships and structure
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-[600px] w-full">
                  <TableFlowVisualization rawData={tableData} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Data State */}
          {!loading && !tableData && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="text-center py-12">
                <Database className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  No Table Data
                </h3>
                <p className="text-slate-400 mb-4">
                  Enter a user ID and click Load to fetch table information
                </p>
              </CardContent>
            </Card>
          )}

          {/* No Results State */}
          {tableData && filteredTables.length === 0 && searchTerm && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="text-center py-12">
                <Search className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  No Tables Found
                </h3>
                <p className="text-slate-400">
                  No tables match your search criteria: "{searchTerm}"
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Excel Import Tab */}
        <TabsContent value="excel-import" className="mt-6">
          <ExcelToDBManager
            userId={userId}
            availableTables={availableTables}
            onViewTableData={(tableName) => {
              setSelectedTableForViewing(tableName);
              setActiveTab("table-data");
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
