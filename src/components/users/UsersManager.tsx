"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Plus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
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
import { AddUserModal } from "./AddUserModal";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: string;
  lastActive: string;
}

// Mock data for demonstration
const mockUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@company.com",
    role: "Admin",
    department: "IT",
    status: "Active",
    lastActive: "2 hours ago",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@company.com",
    role: "User",
    department: "HR",
    status: "Active",
    lastActive: "1 day ago",
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike.johnson@company.com",
    role: "Manager",
    department: "Sales",
    status: "Active",
    lastActive: "3 hours ago",
  },
  {
    id: "4",
    name: "Sarah Wilson",
    email: "sarah.wilson@company.com",
    role: "User",
    department: "Marketing",
    status: "Inactive",
    lastActive: "1 week ago",
  },
  {
    id: "5",
    name: "David Brown",
    email: "david.brown@company.com",
    role: "Admin",
    department: "IT",
    status: "Active",
    lastActive: "30 minutes ago",
  },
  {
    id: "6",
    name: "Lisa Davis",
    email: "lisa.davis@company.com",
    role: "User",
    department: "Finance",
    status: "Active",
    lastActive: "5 hours ago",
  },
  {
    id: "7",
    name: "Tom Anderson",
    email: "tom.anderson@company.com",
    role: "Manager",
    department: "Operations",
    status: "Active",
    lastActive: "2 days ago",
  },
  {
    id: "8",
    name: "Emily Taylor",
    email: "emily.taylor@company.com",
    role: "User",
    department: "HR",
    status: "Active",
    lastActive: "1 hour ago",
  },
];

export function UsersManager() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.department.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(paginatedUsers.map((user) => user.id));
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

  const handleAddUser = (userData: { name: string; role: string }) => {
    const newUser: User = {
      id: (users.length + 1).toString(),
      name: userData.name,
      email: `${userData.name.toLowerCase().replace(" ", ".")}@company.com`,
      role: userData.role,
      department: "General",
      status: "Active",
      lastActive: "Just now",
    };
    setUsers((prev) => [...prev, newUser]);
    setIsAddUserModalOpen(false);
  };

  const isAllSelected =
    paginatedUsers.length > 0 && selectedUsers.length === paginatedUsers.length;
  const isIndeterminate =
    selectedUsers.length > 0 && selectedUsers.length < paginatedUsers.length;

  return (
    <div className="w-full min-h-screen pt-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">User</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64 bg-slate-800 border-slate-600 text-white placeholder-gray-400"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-emerald-500 text-emerald-400 hover:bg-emerald-500/10"
              >
                Import
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-emerald-500 text-emerald-400 hover:bg-emerald-500/10"
              >
                Export
              </Button>
              <Button
                onClick={() => setIsAddUserModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
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
                      <span>TABLE HEADER</span>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="text-left p-4 text-gray-300 font-medium">
                    <div className="flex items-center gap-2">
                      TABLE HEADER
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="text-left p-4 text-gray-300 font-medium">
                    <div className="flex items-center gap-2">
                      TABLE HEADER
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="text-left p-4 text-gray-300 font-medium">
                    <div className="flex items-center gap-2">
                      TABLE HEADER
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="text-left p-4 text-gray-300 font-medium">
                    <div className="flex items-center gap-2">
                      TABLE HEADER
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="text-left p-4 text-gray-300 font-medium">
                    <div className="flex items-center gap-2">
                      TABLE HEADER
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-slate-700 hover:bg-slate-700/30"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={(e) =>
                            handleSelectUser(user.id, e.target.checked)
                          }
                          className="rounded border-gray-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500"
                        />
                        <span className="text-gray-300">Table Data</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-300">Table Data</td>
                    <td className="p-4 text-gray-300">Table Data</td>
                    <td className="p-4 text-gray-300">Table Data</td>
                    <td className="p-4 text-gray-300">Table Data</td>
                    <td className="p-4 text-gray-300">Table Data</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 bg-slate-700/30 border-t border-slate-600">
            <div className="text-sm text-gray-400">
              {selectedUsers.length} of {filteredUsers.length} Row(s) Selected
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

        {/* Add User Modal */}
        <AddUserModal
          isOpen={isAddUserModalOpen}
          onClose={() => setIsAddUserModalOpen(false)}
          onAddUser={handleAddUser}
        />
      </div>
    </div>
  );
}
