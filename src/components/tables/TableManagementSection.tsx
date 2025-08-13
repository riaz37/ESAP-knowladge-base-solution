"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { useNewTable } from "@/lib/hooks/use-new-table";
import {
  CreateTableRequest,
  TableColumn,
  UserTablesResponse,
} from "@/types/api";

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

  // State for user input
  const [userId, setUserId] = useState(propUserId || "");

  // State for table creation
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

  // State for business rules
  const [businessRule, setBusinessRule] = useState("");
  const [currentBusinessRule, setCurrentBusinessRule] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  // State for data types and tables
  const [dataTypes, setDataTypes] = useState<any>(null);
  const [userTables, setUserTables] = useState<
    UserTablesResponse["data"] | null
  >(null);
  const [databaseTables, setDatabaseTables] = useState<any>(null);

  // Dialog states
  const [showCreateTableDialog, setShowCreateTableDialog] = useState(false);
  const [showBusinessRuleDialog, setShowBusinessRuleDialog] = useState(false);
  const [showTablesDialog, setShowTablesDialog] = useState(false);

  // Load initial data
  useEffect(() => {
    loadDataTypes();
    if (userId) {
      loadUserBusinessRule();
    }
  }, [userId]);

  // Auto-clear success messages after 5 seconds
  useEffect(() => {
    if (successMessage || success) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
        clearSuccess();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [successMessage, success, clearSuccess]);

  const loadDataTypes = async () => {
    const types = await getDataTypes();
    if (types) {
      setDataTypes(types);
    }
  };

  const loadUserTables = async () => {
    if (!userId.trim()) return;

    const tables = await getUserTables(userId);
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
    if (!userId.trim()) return;

    const rule = await getUserBusinessRule(userId);
    if (rule) {
      setCurrentBusinessRule(rule.business_rule || "");
      setBusinessRule(rule.business_rule || "");
    }
    // Clear any success messages when loading
    setSuccessMessage("");
  };

  const handleCreateTable = async () => {
    if (!userId.trim()) {
      return;
    }

    const request: CreateTableRequest = {
      user_id: userId,
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
    if (!userId.trim()) return;

    const result = await updateUserBusinessRule(userId, {
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

      {/* Error and Success Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {(success || successMessage) && (
        <Alert className="border-emerald-500/50 bg-emerald-500/10">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          <AlertDescription className="text-emerald-400">
            {successMessage || "Operation completed successfully!"}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Actions */}
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
              <DialogTitle className="text-white">Create New Table</DialogTitle>
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
                        <TableHead className="text-slate-300">Name</TableHead>
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
                  disabled={isLoading || !tableName.trim() || !userId.trim()}
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
                <p className="text-sm text-slate-400">Manage business logic</p>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">
                Manage Business Rules
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Define and update business rules for your database operations
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
                  disabled={isLoading || !businessRule.trim() || !userId.trim()}
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

        <Dialog open={showTablesDialog} onOpenChange={setShowTablesDialog}>
          <DialogTrigger asChild>
            <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-700/50 cursor-pointer transition-colors">
              <CardContent className="p-6 text-center">
                <Eye className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                <h3 className="font-semibold text-white">View Tables</h3>
                <p className="text-sm text-slate-400">Browse existing tables</p>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Database Tables</DialogTitle>
              <DialogDescription className="text-slate-400">
                View and manage your database tables
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="user-tables" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-700">
                <TabsTrigger
                  value="user-tables"
                  onClick={() => loadUserTables()}
                  className="data-[state=active]:bg-slate-600"
                >
                  User Tables
                </TabsTrigger>
                <TabsTrigger
                  value="db-tables"
                  onClick={() => loadDatabaseTables()}
                  className="data-[state=active]:bg-slate-600"
                >
                  Database Tables
                </TabsTrigger>
              </TabsList>

              <TabsContent value="user-tables" className="space-y-4">
                {userTables &&
                userTables.tables &&
                userTables.tables.length > 0 ? (
                  <div className="space-y-2">
                    {userTables.tables.map((table, index) => (
                      <div
                        key={index}
                        className="p-3 bg-slate-700/50 rounded-lg border border-slate-600"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-white font-medium">
                              {table.table_name}
                            </h4>
                            <p className="text-slate-400 text-sm">
                              {table.full_name}
                            </p>
                          </div>
                          <Badge variant="secondary">
                            {table.columns?.length || 0} columns
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Database className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-400">
                      No tables found for this user
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="db-tables" className="space-y-4">
                {databaseTables && databaseTables.length > 0 ? (
                  <div className="space-y-2">
                    {databaseTables.map((table: any, index: number) => (
                      <div
                        key={index}
                        className="p-3 bg-slate-700/50 rounded-lg border border-slate-600"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-white font-medium">
                              {table.name}
                            </h4>
                            <p className="text-slate-400 text-sm">
                              Database ID: {databaseId}
                            </p>
                          </div>
                          <Badge variant="outline">Database Table</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Database className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-400">
                      No tables found for this database
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>

        <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-700/50 cursor-pointer transition-colors">
          <CardContent
            className="p-6 text-center"
            onClick={handleSetupTracking}
          >
            <Database className="h-8 w-8 text-orange-400 mx-auto mb-2" />
            <h3 className="font-semibold text-white">Setup Tracking</h3>
            <p className="text-sm text-slate-400">Initialize tracking table</p>
          </CardContent>
        </Card>
      </div>

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
