"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TableFlowVisualization } from "./TableFlowVisualization";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Loader2,
  Plus,
  Trash2,
  Save,
  Database,
  FileText,
  Settings,
  Eye,
  Edit3,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Table as TableIcon,
  Search,
} from "lucide-react";
import { useNewTable } from "@/lib/hooks/use-new-table";
import {
  CreateTableRequest,
  TableColumn,
  UserTablesResponse,
} from "@/types/api";
import UserTableList from "./UserTableList";

interface TableManagementSectionProps {
  userId?: string;
  databaseId?: number;
  onTableCreated?: () => void;
}

export function TableManagementSection({
  userId: propUserId,
  databaseId = 1,
  onTableCreated,
}: TableManagementSectionProps) {
  const {
    createTable,
    getUserTables,
    getTablesByDatabase,
    getDataTypes,
    setupTrackingTable,
    updateUserBusinessRule,
    getUserBusinessRule,
    isLoading,
    error,
    success,
    clearError,
    clearSuccess,
  } = useNewTable();

  const [tableName, setTableName] = useState("");
  const [schema, setSchema] = useState("dbo");
  const [columns, setColumns] = useState<TableColumn[]>([
    {
      name: "id",
      data_type: "INT",
      nullable: false,
      is_primary: true,
      is_identity: true,
    },
  ]);
  const [businessRule, setBusinessRule] = useState("");
  const [currentBusinessRule, setCurrentBusinessRule] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const [dataTypes, setDataTypes] = useState<any>(null);
  const [userTables, setUserTables] = useState<
    UserTablesResponse["data"] | null
  >(null);
  const [databaseTables, setDatabaseTables] = useState<any>(null);

  const [showCreateTableDialog, setShowCreateTableDialog] = useState(false);
  const [showBusinessRuleDialog, setShowBusinessRuleDialog] = useState(false);

  const [activeTab, setActiveTab] = useState("create");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadDataTypes();
  }, []);

  const loadDataTypes = async () => {
    const types = await getDataTypes();
    if (types) {
      setDataTypes(types);
    }
  };

  const loadUserTables = async () => {
    if (!propUserId?.trim()) return;

    const tables = await getUserTables(propUserId);
    if (tables) {
      setUserTables(tables);
    }
  };

  const loadDatabaseTables = async () => {
    const tables = await getTablesByDatabase(databaseId);
    if (tables) {
      setDatabaseTables(tables);
    }
  };

  const loadUserBusinessRule = async () => {
    if (!propUserId?.trim()) return;

    const rule = await getUserBusinessRule(propUserId);
    if (rule) {
      setCurrentBusinessRule(rule.business_rule || "");
      setBusinessRule(rule.business_rule || "");
    }
    setSuccessMessage("");
  };

  const handleCreateTable = async () => {
    if (!propUserId?.trim()) {
      return;
    }

    const request: CreateTableRequest = {
      user_id: propUserId,
      table_name: tableName,
      schema: schema,
      columns: columns,
    };

    const result = await createTable(request);
    if (result) {
      setSuccessMessage(`Table "${tableName}" created successfully!`);
      setShowCreateTableDialog(false);
      resetTableForm();
      onTableCreated?.();
      loadUserTables();
    }
  };

  const handleUpdateBusinessRule = async () => {
    if (!propUserId?.trim()) return;

    const result = await updateUserBusinessRule(propUserId, {
      business_rule: businessRule,
    });

    if (result) {
      setSuccessMessage("Business rule updated successfully!");
      setCurrentBusinessRule(businessRule);
      setShowBusinessRuleDialog(false);
    }
  };

  const handleSetupTracking = async () => {
    const result = await setupTrackingTable();
    if (result) {
      setSuccessMessage("Tracking table setup completed successfully!");
      loadUserTables();
    }
  };

  const resetTableForm = () => {
    setTableName("");
    setSchema("dbo");
    setColumns([
      {
        name: "id",
        data_type: "INT",
        nullable: false,
        is_primary: true,
        is_identity: true,
      },
    ]);
  };

  const addColumn = () => {
    setColumns([
      ...columns,
      {
        name: "",
        data_type: "VARCHAR",
        nullable: true,
        is_primary: false,
        is_identity: false,
      },
    ]);
  };

  const updateColumn = (
    index: number,
    field: keyof TableColumn,
    value: any,
  ) => {
    const newColumns = [...columns];
    newColumns[index] = { ...newColumns[index], [field]: value };
    setColumns(newColumns);
  };

  const removeColumn = (index: number) => {
    if (columns.length > 1) {
      setColumns(columns.filter((_, i) => i !== index));
    }
  };

  const getDataTypeOptions = () => {
    if (!dataTypes) return [];

    const allTypes = [
      ...dataTypes.numeric,
      ...dataTypes.string,
      ...dataTypes.date_time,
      ...dataTypes.binary,
      ...dataTypes.other,
    ];

    return allTypes.map((type: string) => (
      <SelectItem key={type} value={type}>
        {type}
      </SelectItem>
    ));
  };

  const transformUserTablesForFlow = () => {
    if (!userTables?.tables) return [];

    return userTables.tables.map((table) => ({
      name: table.table_name,
      full_name: table.full_name,
      columns: table.columns || [],
      relationships: table.relationships || [],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Table Management</h2>
          <p className="text-slate-400 mt-1">
            Create tables, manage business rules, and configure database
            settings
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              clearError();
              clearSuccess();
              setSuccessMessage("");
            }}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Clear Alerts
          </Button>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
          <TabsTrigger
            value="create"
            className="flex items-center gap-2 data-[state=active]:bg-slate-700"
          >
            <Settings className="h-4 w-4" />
            Table Management
          </TabsTrigger>
          <TabsTrigger
            value="visualization"
            className="flex items-center gap-2 data-[state=active]:bg-slate-700"
          >
            <TableIcon className="h-4 w-4" />
            Table Visualization
          </TabsTrigger>
          <TabsTrigger
            value="view-tables"
            className="flex items-center gap-2 data-[state=active]:bg-slate-700"
          >
            <Eye className="h-4 w-4" />
            View Tables
          </TabsTrigger>
        </TabsList>

        {/* Table Management Tab */}
        <TabsContent value="create" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Dialog
              open={showCreateTableDialog}
              onOpenChange={setShowCreateTableDialog}
            >
              <DialogTrigger asChild>
                <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-700/50 cursor-pointer transition-colors">
                  <CardContent className="p-6 text-center">
                    <Plus className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                    <h3 className="font-semibold text-white">Create Table</h3>
                    <p className="text-sm text-slate-400">Design a new table</p>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-slate-800 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    Create New Table
                  </DialogTitle>
                  <DialogDescription className="text-slate-400">
                    Design your table structure with columns and data types
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Table Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tableName" className="text-slate-300">
                        Table Name *
                      </Label>
                      <Input
                        id="tableName"
                        placeholder="Enter table name"
                        value={tableName}
                        onChange={(e) => setTableName(e.target.value)}
                        className="bg-slate-700 border-slate-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="schema" className="text-slate-300">
                        Schema
                      </Label>
                      <Input
                        id="schema"
                        placeholder="Schema (default: dbo)"
                        value={schema}
                        onChange={(e) => setSchema(e.target.value)}
                        className="bg-slate-700 border-slate-600"
                      />
                    </div>
                  </div>

                  {/* Columns Definition */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-slate-300 text-lg">Columns</Label>
                      <Button onClick={addColumn} size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Column
                      </Button>
                    </div>

                    <div className="border border-slate-600 rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader className="bg-slate-700">
                          <TableRow>
                            <TableHead className="text-slate-300">
                              Name
                            </TableHead>
                            <TableHead className="text-slate-300">
                              Data Type
                            </TableHead>
                            <TableHead className="text-slate-300">
                              Nullable
                            </TableHead>
                            <TableHead className="text-slate-300">
                              Primary
                            </TableHead>
                            <TableHead className="text-slate-300">
                              Identity
                            </TableHead>
                            <TableHead className="text-slate-300">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {columns.map((column, index) => (
                            <TableRow key={index} className="bg-slate-800/50">
                              <TableCell>
                                <Input
                                  placeholder="Column name"
                                  value={column.name}
                                  onChange={(e) =>
                                    updateColumn(index, "name", e.target.value)
                                  }
                                  className="bg-slate-700 border-slate-600 h-8"
                                />
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={column.data_type}
                                  onValueChange={(value) =>
                                    updateColumn(index, "data_type", value)
                                  }
                                >
                                  <SelectTrigger className="bg-slate-700 border-slate-600 h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-slate-700 border-slate-600">
                                    {getDataTypeOptions()}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Checkbox
                                  checked={column.nullable}
                                  onCheckedChange={(checked) =>
                                    updateColumn(index, "nullable", checked)
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <Checkbox
                                  checked={column.is_primary}
                                  onCheckedChange={(checked) =>
                                    updateColumn(index, "is_primary", checked)
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <Checkbox
                                  checked={column.is_identity}
                                  onCheckedChange={(checked) =>
                                    updateColumn(index, "is_identity", checked)
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <Button
                                  onClick={() => removeColumn(index)}
                                  size="sm"
                                  variant="ghost"
                                  disabled={columns.length === 1}
                                >
                                  <Trash2 className="h-4 w-4 text-red-400" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2">
                    <Button
                      onClick={() => setShowCreateTableDialog(false)}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateTable}
                      disabled={
                        isLoading || !tableName.trim() || !propUserId?.trim()
                      }
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Create Table
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog
              open={showBusinessRuleDialog}
              onOpenChange={setShowBusinessRuleDialog}
            >
              <DialogTrigger asChild>
                <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-700/50 cursor-pointer transition-colors">
                  <CardContent className="p-6 text-center">
                    <FileText className="h-8 w-8 text-green-400 mx-auto mb-2" />
                    <h3 className="font-semibold text-white">Business Rules</h3>
                    <p className="text-sm text-slate-400">
                      Manage business logic
                    </p>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-slate-800 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    Manage Business Rules
                  </DialogTitle>
                  <DialogDescription className="text-slate-400">
                    Define and update business rules for your database
                    operations
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {currentBusinessRule && (
                    <div className="space-y-2">
                      <Label className="text-slate-300">
                        Current Business Rule
                      </Label>
                      <div className="p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                        <p className="text-slate-200 text-sm">
                          {currentBusinessRule}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="businessRule" className="text-slate-300">
                      Business Rule *
                    </Label>
                    <Textarea
                      id="businessRule"
                      placeholder="Enter your business rule..."
                      value={businessRule}
                      onChange={(e) => setBusinessRule(e.target.value)}
                      rows={6}
                      className="bg-slate-700 border-slate-600"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      onClick={() => setShowBusinessRuleDialog(false)}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUpdateBusinessRule}
                      disabled={
                        isLoading || !businessRule.trim() || !propUserId?.trim()
                      }
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Update Rule
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </TabsContent>

        {/* Table Visualization Tab */}
        <TabsContent value="visualization" className="space-y-6 mt-6">
          {/* Search */}
          {/* Table Flow Visualization */}
        </TabsContent>

        {/* View Tables Tab */}
        <TabsContent value="view-tables" className="space-y-6 mt-6">
          {userTables && userTables.tables && userTables.tables.length > 0 ? (
            <UserTableList
              tables={userTables.tables}
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
            />
          ) : (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="text-center py-12">
                <Database className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  No Tables Found
                </h3>
                <p className="text-slate-400 mb-4">
                  Enter a user ID and load your tables to view them here
                </p>
                <Button
                  onClick={() => {
                    loadUserTables();
                  }}
                  variant="outline"
                  disabled={!propUserId?.trim()}
                >
                  Load Tables
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      {(userTables || currentBusinessRule) && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">
                  {userTables?.tables?.length || 0}
                </p>
                <p className="text-slate-400 text-sm">User Tables</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">
                  {currentBusinessRule ? "1" : "0"}
                </p>
                <p className="text-slate-400 text-sm">Business Rules</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-400">
                  {dataTypes ? Object.values(dataTypes).flat().length : 0}
                </p>
                <p className="text-slate-400 text-sm">Available Data Types</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
