"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, Plus, AlertCircle, CheckCircle, Database } from "lucide-react";
import { useUserAccess } from "@/lib/hooks/use-user-access";
import { useParentCompanies } from "@/lib/hooks/use-parent-companies";
import { useSubCompanies } from "@/lib/hooks/use-sub-companies";
import { UserAccessCreateRequest } from "@/types/api";

interface UserAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  onSuccess?: () => void;
}

export function UserAccessModal({
  isOpen,
  onClose,
  userId = "",
  onSuccess,
}: UserAccessModalProps) {
  const {
    createUserAccess,
    isLoading,
    error,
    success,
    clearError,
    clearSuccess,
  } = useUserAccess();
  const { getParentCompanies } = useParentCompanies();
  const { getSubCompanies } = useSubCompanies();

  const [formData, setFormData] = useState<{
    user_id: string;
    parent_company_id: number;
    sub_company_ids: number[];
    parent_database_access_level: string;
    sub_database_access_levels: Record<number, string>;
    table_shows: Record<string, string[]>;
  }>({
    user_id: userId,
    parent_company_id: 0,
    sub_company_ids: [],
    parent_database_access_level: "read_only",
    sub_database_access_levels: {},
    table_shows: {},
  });

  const [parentCompanies, setParentCompanies] = useState<any[]>([]);
  const [subCompanies, setSubCompanies] = useState<any[]>([]);
  const [newTableName, setNewTableName] = useState("");
  const [selectedDbForTable, setSelectedDbForTable] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadCompanies();
      setFormData((prev) => ({ ...prev, user_id: userId }));
    }
  }, [isOpen, userId]);

  useEffect(() => {
    if (success) {
      setTimeout(() => {
        clearSuccess();
        onSuccess?.();
        onClose();
      }, 2000);
    }
  }, [success, clearSuccess, onSuccess, onClose]);

  const loadCompanies = async () => {
    try {
      console.log("Loading companies...");
      const [parentResponse, subResponse] = await Promise.all([
        getParentCompanies(),
        getSubCompanies(),
      ]);

      console.log("Parent companies response:", parentResponse);
      console.log("Sub companies response:", subResponse);

      if (parentResponse) {
        setParentCompanies(parentResponse);
      }
      if (subResponse) {
        setSubCompanies(subResponse);
      }
    } catch (error) {
      console.error("Error loading companies:", error);
    }
  };

  const handleSubCompanyAdd = (subCompanyId: number) => {
    if (!formData.sub_company_ids.includes(subCompanyId)) {
      setFormData((prev) => ({
        ...prev,
        sub_company_ids: [...prev.sub_company_ids, subCompanyId],
        sub_database_access_levels: {
          ...prev.sub_database_access_levels,
          [subCompanyId]: "read_only",
        },
      }));
    }
  };

  const handleSubCompanyRemove = (subCompanyId: number) => {
    setFormData((prev) => {
      const newSubCompanyIds = prev.sub_company_ids.filter(
        (id) => id !== subCompanyId
      );
      const newAccessLevels = { ...prev.sub_database_access_levels };
      delete newAccessLevels[subCompanyId];

      return {
        ...prev,
        sub_company_ids: newSubCompanyIds,
        sub_database_access_levels: newAccessLevels,
      };
    });
  };

  const updateSubCompanyAccessLevel = (
    subCompanyId: number,
    accessLevel: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      sub_database_access_levels: {
        ...prev.sub_database_access_levels,
        [subCompanyId]: accessLevel,
      },
    }));
  };

  const addTableToDatabase = () => {
    if (!selectedDbForTable || !newTableName.trim()) return;

    setFormData((prev) => ({
      ...prev,
      table_shows: {
        ...prev.table_shows,
        [selectedDbForTable]: [
          ...(prev.table_shows[selectedDbForTable] || []),
          newTableName.trim(),
        ],
      },
    }));

    setNewTableName("");
  };

  const removeTableFromDatabase = (dbId: string, tableName: string) => {
    setFormData((prev) => ({
      ...prev,
      table_shows: {
        ...prev.table_shows,
        [dbId]:
          prev.table_shows[dbId]?.filter((name) => name !== tableName) || [],
      },
    }));
  };

  const getSelectedParentCompany = () => {
    return parentCompanies.find(
      (company) => company.parent_company_id === formData.parent_company_id
    );
  };

  const getSelectedSubCompanies = () => {
    return formData.sub_company_ids
      .map((id) =>
        subCompanies.find((company) => company.sub_company_id === id)
      )
      .filter(Boolean);
  };

  const getAllDatabaseIds = () => {
    const dbIds = new Set<string>();

    // Add parent company database
    const parentCompany = getSelectedParentCompany();
    if (parentCompany?.db_id) {
      dbIds.add(parentCompany.db_id.toString());
    }

    // Add sub company databases
    getSelectedSubCompanies().forEach((subCompany) => {
      if (subCompany?.db_id) {
        dbIds.add(subCompany.db_id.toString());
      }
    });

    return Array.from(dbIds);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const parentCompany = getSelectedParentCompany();
    const selectedSubCompanies = getSelectedSubCompanies();

    const requestData: UserAccessCreateRequest = {
      user_id: formData.user_id,
      parent_company_id: formData.parent_company_id,
      sub_company_ids: formData.sub_company_ids,
      database_access: {
        parent_databases: parentCompany?.db_id
          ? [
              {
                db_id: parentCompany.db_id,
                access_level: formData.parent_database_access_level as any,
              },
            ]
          : [],
        sub_databases: selectedSubCompanies.map((subCompany) => ({
          sub_company_id: subCompany.sub_company_id,
          databases: subCompany.db_id
            ? [
                {
                  db_id: subCompany.db_id,
                  access_level: (formData.sub_database_access_levels[
                    subCompany.sub_company_id
                  ] || "read_only") as any,
                },
              ]
            : [],
        })),
      },
      table_shows: formData.table_shows,
    };

    console.log("Submitting user access request:", requestData);
    await createUserAccess(requestData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-800 border-emerald-500/30">
        <DialogHeader>
          <DialogTitle className="text-white">Manage User Access</DialogTitle>
          <DialogDescription className="text-gray-400">
            Configure database access permissions and table visibility for users
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User ID */}
          <div className="space-y-2">
            <Label htmlFor="user_id" className="text-gray-300">
              User ID
            </Label>
            <Input
              id="user_id"
              type="text"
              value={formData.user_id}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, user_id: e.target.value }))
              }
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="Enter user ID"
              required
            />
          </div>

          {/* Parent Company */}
          <div className="space-y-4">
            <Label className="text-gray-300">Parent Company</Label>
            <Select
              value={formData.parent_company_id.toString()}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  parent_company_id: Number(value),
                }))
              }
            >
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Select parent company" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                {parentCompanies.map((company) => (
                  <SelectItem
                    key={company.parent_company_id}
                    value={company.parent_company_id.toString()}
                    className="text-white"
                  >
                    {company.company_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Parent Company Database Access */}
            {getSelectedParentCompany() && (
              <div className="p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <Label className="text-gray-300">
                    Parent Database Access
                  </Label>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label className="text-xs text-gray-400">Database ID</Label>
                    <Input
                      type="number"
                      value={getSelectedParentCompany()?.db_id || ""}
                      className="bg-slate-600 border-slate-500 text-white"
                      readOnly
                    />
                    <p className="text-xs text-emerald-400 mt-1">
                      Auto-populated from{" "}
                      {getSelectedParentCompany()?.company_name}
                    </p>
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs text-gray-400">
                      Access Level
                    </Label>
                    <Select
                      value={formData.parent_database_access_level}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          parent_database_access_level: value,
                        }))
                      }
                    >
                      <SelectTrigger className="bg-slate-600 border-slate-500 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="full" className="text-white">
                          Full Access
                        </SelectItem>
                        <SelectItem value="read_only" className="text-white">
                          Read Only
                        </SelectItem>
                        <SelectItem value="limited" className="text-white">
                          Limited
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sub Companies */}
          <div className="space-y-4">
            <Label className="text-gray-300">Sub Companies</Label>
            <Select
              onValueChange={(value) => handleSubCompanyAdd(Number(value))}
            >
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Add sub company" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                {subCompanies
                  .filter(
                    (company) =>
                      !formData.sub_company_ids.includes(company.sub_company_id)
                  )
                  .map((company) => (
                    <SelectItem
                      key={company.sub_company_id}
                      value={company.sub_company_id.toString()}
                      className="text-white"
                    >
                      {company.company_name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            {/* Selected Sub Companies */}
            <div className="space-y-3">
              {getSelectedSubCompanies().map((subCompany) => (
                <div
                  key={subCompany.sub_company_id}
                  className="p-4 bg-slate-700/30 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-blue-400" />
                      <span className="text-white font-medium">
                        {subCompany.company_name}
                      </span>
                    </div>
                    <Button
                      type="button"
                      onClick={() =>
                        handleSubCompanyRemove(subCompany.sub_company_id)
                      }
                      size="sm"
                      variant="destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Label className="text-xs text-gray-400">
                        Database ID
                      </Label>
                      <Input
                        type="number"
                        value={subCompany.db_id || ""}
                        className="bg-slate-600 border-slate-500 text-white"
                        readOnly
                      />
                      <p className="text-xs text-blue-400 mt-1">
                        Auto-populated from {subCompany.company_name}
                      </p>
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs text-gray-400">
                        Access Level
                      </Label>
                      <Select
                        value={
                          formData.sub_database_access_levels[
                            subCompany.sub_company_id
                          ] || "read_only"
                        }
                        onValueChange={(value) =>
                          updateSubCompanyAccessLevel(
                            subCompany.sub_company_id,
                            value
                          )
                        }
                      >
                        <SelectTrigger className="bg-slate-600 border-slate-500 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          <SelectItem value="full" className="text-white">
                            Full Access
                          </SelectItem>
                          <SelectItem value="read_only" className="text-white">
                            Read Only
                          </SelectItem>
                          <SelectItem value="limited" className="text-white">
                            Limited
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Table Access Configuration */}
          <div className="space-y-4">
            <Label className="text-gray-300">Table Access Configuration</Label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Select
                  value={selectedDbForTable}
                  onValueChange={setSelectedDbForTable}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select database" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {getAllDatabaseIds().map((dbId) => (
                      <SelectItem
                        key={dbId}
                        value={dbId}
                        className="text-white"
                      >
                        Database {dbId}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Input
                  placeholder="Table name"
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <Button
                type="button"
                onClick={addTableToDatabase}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={!selectedDbForTable || !newTableName.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {Object.entries(formData.table_shows).map(([dbId, tables]) => (
              <div key={dbId} className="p-4 bg-slate-700/30 rounded-lg">
                <h4 className="text-white font-medium mb-2">Database {dbId}</h4>
                <div className="flex flex-wrap gap-2">
                  {tables.map((tableName) => (
                    <Badge
                      key={tableName}
                      variant="secondary"
                      className="bg-blue-600/20 text-blue-400"
                    >
                      {tableName}
                      <button
                        type="button"
                        onClick={() => removeTableFromDatabase(dbId, tableName)}
                        className="ml-2 hover:text-red-400"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Error/Success Messages */}
          {error && (
            <Alert className="border-red-500/50 bg-red-500/10">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-400">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-500/50 bg-green-500/10">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-green-400">
                User access configuration created successfully!
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-slate-600 text-gray-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isLoading ? "Creating..." : "Create Access"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
