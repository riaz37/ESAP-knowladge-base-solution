"use client";

import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, X } from "lucide-react";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddUser: (userData: { name: string; role: string }) => void;
}

export function AddUserModal({ isOpen, onClose, onAddUser }: AddUserModalProps) {
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");

  const handleSubmit = () => {
    if (userName && userRole) {
      onAddUser({ name: userName, role: userRole });
      resetForm();
    }
  };

  const resetForm = () => {
    setUserName("");
    setUserRole("");
  };

  const handleCancel = () => {
    onClose();
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-md w-full bg-slate-800 border-emerald-500/30 text-white p-0 overflow-hidden"
        showCloseButton={false}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-white">Add User</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white h-6 w-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-gray-400 mb-6">
            Add User refund processes with configurable policy enforcement.
          </p>

          {/* User Avatar */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-slate-700 border-2 border-slate-600 flex items-center justify-center">
              <User className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* User Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">User name</label>
              <Select value={userName} onValueChange={setUserName}>
                <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Isharul Islam" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="Isharul Islam" className="text-white">Isharul Islam</SelectItem>
                  <SelectItem value="John Doe" className="text-white">John Doe</SelectItem>
                  <SelectItem value="Jane Smith" className="text-white">Jane Smith</SelectItem>
                  <SelectItem value="Mike Johnson" className="text-white">Mike Johnson</SelectItem>
                  <SelectItem value="Sarah Wilson" className="text-white">Sarah Wilson</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Role */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Role</label>
              <Select value={userRole} onValueChange={setUserRole}>
                <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Admin" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="Admin" className="text-white">Admin</SelectItem>
                  <SelectItem value="Manager" className="text-white">Manager</SelectItem>
                  <SelectItem value="User" className="text-white">User</SelectItem>
                  <SelectItem value="Viewer" className="text-white">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 p-6 border-t border-slate-700">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="border-slate-600 text-gray-300 hover:bg-slate-700 bg-transparent"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!userName || !userRole}
            className="bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}