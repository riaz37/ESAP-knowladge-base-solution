"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Plus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Shield,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { UserAccessModal } from "./UserAccessModal";
import { useUserAccess } from "@/lib/hooks/use-user-access";
import { UserAccessData } from "@/types/api";

export function UsersManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isUserAccessModalOpen, setIsUserAccessModalOpen] = useState(false);
  const [selectedUserForAccess, setSelectedUserForAccess] =
    useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [userAccessConfigs, setUserAccessConfigs] = useState<UserAccessData[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);

  const { getUserAccessConfigs } = useUserAccess();

  useEffect(() => {
    loadUserAccessConfigs();
  }, []);

  const loadUserAccessConfigs = async () => {
    setIsLoading(true);
    try {
      const configs = await getUserAccessConfigs();
      if (configs) {
        setUserAccessConfigs(configs);
      }
    } catch (error) {
      console.error("Error loading user access configs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccess = () => {
    setSelectedUserForAccess("");
    setIsUserAccessModalOpen(true);
  };

  const handleEditAccess = (userEmail: string) => {
    setSelectedUserForAccess(userEmail);
    setIsUserAccessModalOpen(true);
  };

  const handleAccessSuccess = () => {
    loadUserAccessConfigs();
  };

  const extractNameFromEmail = (email: string): string => {
    const localPart = email.split("@")[0];
    return localPart
      .split(/[._-]/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ");
  };

  const getAccessSummary = (config: UserAccessData): string => {
    const parentDbCount = config.database_access?.parent_databases?.length || 0;
    const subDbCount =
      config.database_access?.sub_databases?.reduce(
        (total, subDb) => total + (subDb.databases?.length || 0),
        0
      ) || 0;
    const totalDbs = parentDbCount + subDbCount;
    return `${totalDbs} database${totalDbs !== 1 ? "s" : ""}, ${
      config.sub_company_ids?.length || 0
    } sub-companies`;
  };

  // Filter user access configs based on search term
  const filteredConfigs = useMemo(() => {
    return userAccessConfigs.filter(
      (config) =>
        config.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        extractNameFromEmail(config.user_id)
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (config.parent_company_name &&
          config.parent_company_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()))
    );
  }, [userAccessConfigs, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredConfigs.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedConfigs = filteredConfigs.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(paginatedConfigs.map((config) => config.user_id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers((prev) => [...prev, userId]);
    } else {
      setSelectedUsers((prev) => prev.filter((id) => id !== userId));
    }
  };

  const isAllSelected =
    paginatedConfigs.length > 0 &&
    selectedUsers.length === paginatedConfigs.length;
  const isIndeterminate =
    selectedUsers.length > 0 && selectedUsers.length < paginatedConfigs.length;

  return (
    <div className="w-full min-h-screen pt-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              User Access Management
            </h1>
            <p className="text-gray-400">
              Manage database access permissions for users
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64 bg-slate-800 border-slate-600 text-white placeholder-gray-400"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                onClick={handleCreateAccess}
                className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Access
              </Button>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-slate-800/50 rounded-lg border border-emerald-500/30 overflow-hidden">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50 border-b border-slate-600">
                <tr>
                  <th className="text-left p-4 text-gray-300 font-medium">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = isIndeterminate;
                        }}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-gray-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500"
                      />
                      <span>User</span>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="text-left p-4 text-gray-300 font-medium">
                    <div className="flex items-center gap-2">
                      Parent Company
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="text-left p-4 text-gray-300 font-medium">
                    <div className="flex items-center gap-2">
                      Access Summary
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="text-left p-4 text-gray-300 font-medium">
                    <div className="flex items-center gap-2">
                      Created
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="text-left p-4 text-gray-300 font-medium">
                    <div className="flex items-center gap-2">
                      Updated
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="text-left p-4 text-gray-300 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400">
                      Loading user access configurations...
                    </td>
                  </tr>
                ) : paginatedConfigs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400">
                      {searchTerm
                        ? "No user access configurations found matching your search."
                        : "No user access configurations found. Create one to get started."}
                    </td>
                  </tr>
                ) : (
                  paginatedConfigs.map((config) => (
                    <tr
                      key={config.user_id}
                      className="border-b border-slate-700 hover:bg-slate-700/30"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(config.user_id)}
                            onChange={(e) =>
                              handleSelectUser(config.user_id, e.target.checked)
                            }
                            className="rounded border-gray-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500"
                          />
                          <div className="flex flex-col">
                            <span className="text-white font-medium">
                              {extractNameFromEmail(config.user_id)}
                            </span>
                            <span className="text-gray-400 text-sm">
                              {config.user_id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="text-gray-300">
                            {config.parent_company_name ||
                              `Company ${config.parent_company_id}`}
                          </span>
                          <span className="text-gray-500 text-sm">
                            ID: {config.parent_company_id}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-gray-300 text-sm">
                            {getAccessSummary(config)}
                          </span>
                          <div className="flex gap-1">
                            <Badge
                              variant="secondary"
                              className="bg-blue-600/20 text-blue-400 text-xs"
                            >
                              {config.database_access?.parent_databases
                                ?.length || 0}{" "}
                              parent DBs
                            </Badge>
                            <Badge
                              variant="secondary"
                              className="bg-purple-600/20 text-purple-400 text-xs"
                            >
                              {config.database_access?.sub_databases?.length ||
                                0}{" "}
                              sub DBs
                            </Badge>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-gray-400 text-sm">
                          {new Date(config.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-gray-400 text-sm">
                          {new Date(config.updated_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditAccess(config.user_id)}
                            className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
                          >
                            <Shield className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 bg-slate-700/30 border-t border-slate-600">
            <div className="text-sm text-gray-400">
              {selectedUsers.length} of {filteredConfigs.length} Row(s) Selected
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Rows per page:</span>
                <Select
                  value={rowsPerPage.toString()}
                  onValueChange={(value) => setRowsPerPage(Number(value))}
                >
                  <SelectTrigger className="w-16 bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="5" className="text-white">
                      5
                    </SelectItem>
                    <SelectItem value="10" className="text-white">
                      10
                    </SelectItem>
                    <SelectItem value="20" className="text-white">
                      20
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="text-sm text-gray-400">
                Page {currentPage} of {totalPages}
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="text-gray-400 hover:text-white hover:bg-slate-700"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <ChevronLeft className="w-4 h-4 -ml-2" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="text-gray-400 hover:text-white hover:bg-slate-700"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="text-gray-400 hover:text-white hover:bg-slate-700"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="text-gray-400 hover:text-white hover:bg-slate-700"
                >
                  <ChevronRight className="w-4 h-4" />
                  <ChevronRight className="w-4 h-4 -ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* User Access Modal */}
        <UserAccessModal
          isOpen={isUserAccessModalOpen}
          onClose={() => setIsUserAccessModalOpen(false)}
          userId={selectedUserForAccess}
          onSuccess={handleAccessSuccess}
        />
      </div>
    </div>
  );
}
