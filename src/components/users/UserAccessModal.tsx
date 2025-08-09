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
import { Trash2, Plus, AlertCircle, CheckCircle } from "lucide-react";
import { useUserAccess } from "@/lib/hooks/use-user-access";
import { useParentCompanies } from "@/lib/hooks/use-parent-companies";
import { useSubCompanies } from "@/lib/hooks/use-sub-companies";
import { UserAccessCreateRequest, DatabaseAccess } from "@/types/api";

interface UserAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  onSuccess?: () => void;
}

interface DatabaseAccessForm extends DatabaseAccess {
  tempId: string;
}

interface SubDatabaseForm {
  tempId: string;
  sub_company_id: number;
  databases: DatabaseAccessForm[];
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
    parent_databases: DatabaseAccessForm[];
    sub_databases: SubDatabaseForm[];
    table_shows: Record<string, string[]>;
  }>({
    user_id: userId,
    parent_company_id: 0,
    sub_company_ids: [],
    parent_databases: [],
    sub_databases: [],
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

  const addParentDatabase = () => {
    const newDb: DatabaseAccessForm = {
      tempId: Date.now().toString(),
      db_id: 0,
      access_level: "read_only",
    };
    setFormData((prev) => ({
      ...prev,
      parent_databases: [...prev.parent_databases, newDb],
    }));
  };

  const updateParentDatabase = (
    tempId: string,
    field: keyof DatabaseAccess,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      parent_databases: prev.parent_databases.map((db) =>
        db.tempId === tempId ? { ...db, [field]: value } : db
      ),
    }));
  };

  const removeParentDatabase = (tempId: string) => {
    setFormData((prev) => ({
      ...prev,
      parent_databases: prev.parent_databases.filter(
        (db) => db.tempId !== tempId
      ),
    }));
  };

  const addSubDatabase = () => {
    const newSubDb: SubDatabaseForm = {
      tempId: Date.now().toString(),
      sub_company_id: 0,
      databases: [],
    };
    setFormData((prev) => ({
      ...prev,
      sub_databases: [...prev.sub_databases, newSubDb],
    }));
  };

  const updateSubDatabase = (tempId: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      sub_databases: prev.sub_databases.map((subDb) =>
        subDb.tempId === tempId ? { ...subDb, [field]: value } : subDb
      ),
    }));
  };

  const removeSubDatabase = (tempId: string) => {
    setFormData((prev) => ({
      ...prev,
      sub_databases: prev.sub_databases.filter(
        (subDb) => subDb.tempId !== tempId
      ),
    }));
  };

  const addDatabaseToSubCompany = (subDbTempId: string) => {
    const newDb: DatabaseAccessForm = {
      tempId: Date.now().toString(),
      db_id: 0,
      access_level: "read_only",
    };

    setFormData((prev) => ({
      ...prev,
      sub_databases: prev.sub_databases.map((subDb) =>
        subDb.tempId === subDbTempId
          ? { ...subDb, databases: [...subDb.databases, newDb] }
          : subDb
      ),
    }));
  };

  const updateSubCompanyDatabase = (
    subDbTempId: string,
    dbTempId: string,
    field: keyof DatabaseAccess,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      sub_databases: prev.sub_databases.map((subDb) =>
        subDb.tempId === subDbTempId
          ? {
              ...subDb,
              databases: subDb.databases.map((db) =>
                db.tempId === dbTempId ? { ...db, [field]: value } : db
              ),
            }
          : subDb
      ),
    }));
  };

  const removeSubCompanyDatabase = (subDbTempId: string, dbTempId: string) => {
    setFormData((prev) => ({
      ...prev,
      sub_databases: prev.sub_databases.map((subDb) =>
        subDb.tempId === subDbTempId
          ? {
              ...subDb,
              databases: subDb.databases.filter((db) => db.tempId !== dbTempId),
            }
          : subDb
      ),
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const requestData: UserAccessCreateRequest = {
      user_id: formData.user_id,
      parent_company_id: formData.parent_company_id,
      sub_company_ids: formData.sub_company_ids,
      database_access: {
        parent_databases: formData.parent_databases.map(
          ({ tempId, ...db }) => db
        ),
        sub_databases: formData.sub_databases.map(
          ({ tempId, databases, ...subDb }) => ({
            ...subDb,
            databases: databases.map(({ tempId, ...db }) => db),
          })
        ),
      },
      table_shows: formData.table_shows,
    };

    await createUserAccess(requestData);
  };

  const getAllDatabaseIds = () => {
    const dbIds = new Set<string>();
    formData.parent_databases.forEach((db) => {
      if (db.db_id > 0) dbIds.add(db.db_id.toString());
    });
    formData.sub_databases.forEach((subDb) => {
      subDb.databases.forEach((db) => {
        if (db.db_id > 0) dbIds.add(db.db_id.toString());
      });
    });
    return Array.from(dbIds);
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
              User Email
            </Label>
            <Input
              id="user_id"
              type="email"
              value={formData.user_id}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, user_id: e.target.value }))
              }
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="user@company.com"
              required
            />
          </div>

          {/* Parent Company */}
          <div className="space-y-2">
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
          </div>

          {/* Sub Companies */}
          <div className="space-y-2">
            <Label className="text-gray-300">Sub Companies</Label>
            <Select
              onValueChange={(value) => {
                const subCompanyId = Number(value);
                if (!formData.sub_company_ids.includes(subCompanyId)) {
                  setFormData((prev) => ({
                    ...prev,
                    sub_company_ids: [...prev.sub_company_ids, subCompanyId],
                  }));
                }
              }}
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
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.sub_company_ids.map((id) => {
                const company = subCompanies.find(
                  (c) => c.sub_company_id === id
                );
                return (
                  <Badge
                    key={id}
                    variant="secondary"
                    className="bg-emerald-600/20 text-emerald-400"
                  >
                    {company?.company_name || `Company ${id}`}
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          sub_company_ids: prev.sub_company_ids.filter(
                            (cId) => cId !== id
                          ),
                        }))
                      }
                      className="ml-2 hover:text-red-400"
                    >
                      ×
                    </button>
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Parent Databases */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-gray-300">Parent Company Databases</Label>
              <Button
                type="button"
                onClick={addParentDatabase}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Database
              </Button>
            </div>
            {formData.parent_databases.map((db) => (
              <div
                key={db.tempId}
                className="flex items-center gap-4 p-4 bg-slate-700/50 rounded-lg"
              >
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="Database ID"
                    value={db.db_id || ""}
                    onChange={(e) =>
                      updateParentDatabase(
                        db.tempId,
                        "db_id",
                        Number(e.target.value)
                      )
                    }
                    className="bg-slate-600 border-slate-500 text-white"
                  />
                </div>
                <div className="flex-1">
                  <Select
                    value={db.access_level}
                    onValueChange={(value) =>
                      updateParentDatabase(db.tempId, "access_level", value)
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
                <Button
                  type="button"
                  onClick={() => removeParentDatabase(db.tempId)}
                  size="sm"
                  variant="destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Sub Company Databases */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-gray-300">Sub Company Databases</Label>
              <Button
                type="button"
                onClick={addSubDatabase}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Sub Company
              </Button>
            </div>
            {formData.sub_databases.map((subDb) => (
              <div
                key={subDb.tempId}
                className="p-4 bg-slate-700/30 rounded-lg space-y-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Select
                      value={subDb.sub_company_id.toString()}
                      onValueChange={(value) =>
                        updateSubDatabase(
                          subDb.tempId,
                          "sub_company_id",
                          Number(value)
                        )
                      }
                    >
                      <SelectTrigger className="bg-slate-600 border-slate-500 text-white">
                        <SelectValue placeholder="Select sub company" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        {subCompanies.map((company) => (
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
                  </div>
                  <Button
                    type="button"
                    onClick={() => addDatabaseToSubCompany(subDb.tempId)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add DB
                  </Button>
                  <Button
                    type="button"
                    onClick={() => removeSubDatabase(subDb.tempId)}
                    size="sm"
                    variant="destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                {subDb.databases.map((db) => (
                  <div
                    key={db.tempId}
                    className="flex items-center gap-4 ml-4 p-3 bg-slate-600/50 rounded"
                  >
                    <div className="flex-1">
                      <Input
                        type="number"
                        placeholder="Database ID"
                        value={db.db_id || ""}
                        onChange={(e) =>
                          updateSubCompanyDatabase(
                            subDb.tempId,
                            db.tempId,
                            "db_id",
                            Number(e.target.value)
                          )
                        }
                        className="bg-slate-500 border-slate-400 text-white"
                      />
                    </div>
                    <div className="flex-1">
                      <Select
                        value={db.access_level}
                        onValueChange={(value) =>
                          updateSubCompanyDatabase(
                            subDb.tempId,
                            db.tempId,
                            "access_level",
                            value
                          )
                        }
                      >
                        <SelectTrigger className="bg-slate-500 border-slate-400 text-white">
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
                    <Button
                      type="button"
                      onClick={() =>
                        removeSubCompanyDatabase(subDb.tempId, db.tempId)
                      }
                      size="sm"
                      variant="destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Table Shows */}
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
