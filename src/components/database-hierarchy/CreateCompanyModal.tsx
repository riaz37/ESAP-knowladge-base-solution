import React, { useState, useEffect } from "react";
import { X, Folder, Plus, Loader2, Mail, MapPin, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMSSQLConfig } from "@/lib/hooks/use-mssql-config";

interface CreateCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    details: string;
    address: string;
    contactEmail: string;
    type: "parent" | "sub";
    databaseId?: number;
  }) => Promise<void>;
  type: "parent" | "sub";
  parentName?: string;
}

export function CreateCompanyModal({
  isOpen,
  onClose,
  onSubmit,
  type,
  parentName,
}: CreateCompanyModalProps) {
  const [name, setName] = useState("");
  const [details, setDetails] = useState("");
  const [address, setAddress] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [selectedDatabaseId, setSelectedDatabaseId] = useState<number | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch available database configurations
  const {
    configs: databases,
    getConfigs,
    isLoading: loadingDatabases,
    error: databaseError,
  } = useMSSQLConfig();

  // Load databases when modal opens
  useEffect(() => {
    if (isOpen && type === "parent") {
      console.log("Modal opened for parent company, fetching databases...");
      getConfigs()
        .then(() => {
          console.log("Database configs fetched:", databases);
        })
        .catch((error) => {
          console.error("Error fetching database configs:", error);
        });
    }
  }, [isOpen, type, getConfigs]);

  // Debug log when databases change
  useEffect(() => {
    console.log("Databases updated:", databases);
    console.log("Database loading:", loadingDatabases);
    console.log("Database error:", databaseError);
  }, [databases, loadingDatabases, databaseError]);

  const handleSubmit = async () => {
    if (!name.trim() || isSubmitting) return;

    // For parent companies, require database selection
    if (type === "parent" && !selectedDatabaseId) return;

    try {
      setIsSubmitting(true);

      await onSubmit({
        name: name.trim(),
        details: details.trim(),
        address: address.trim(),
        contactEmail: contactEmail.trim(),
        type,
        databaseId: selectedDatabaseId || undefined,
      });

      // Reset form only on successful submission
      setName("");
      setDetails("");
      setAddress("");
      setContactEmail("");
      setSelectedDatabaseId(null);
    } catch (error) {
      // Error handling is done in the parent component
      console.error("Error in modal submit:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isSubmitting) return; // Prevent closing during submission
    setName("");
    setDetails("");
    setAddress("");
    setContactEmail("");
    setSelectedDatabaseId(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleCancel}
      />

      {/* Modal */}
      <div className="relative bg-gray-900/95 backdrop-blur-xl border border-green-400/30 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={handleCancel}
          disabled={isSubmitting}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            Create Folder/Company/Branch
          </h2>
          <p className="text-gray-400 text-sm">
            {type === "parent"
              ? "Add User refund processes with configurable policy enforcement."
              : `Add a sub-company under ${parentName}`}
          </p>
        </div>

        {/* Folder Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            {/* Folder Icon */}
            <div className="w-24 h-20 relative">
              <Folder className="w-full h-full text-green-400/60" />
              {/* Plus Icon */}
              <div className="absolute bottom-2 right-2 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                <Plus className="w-4 h-4 text-gray-900" />
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Name Field */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter company name"
              disabled={isSubmitting}
              className="bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-green-400/50 focus:ring-green-400/20 disabled:opacity-50"
            />
          </div>

          {/* Details Field */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Details
            </label>
            <Textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="This is a ...."
              rows={3}
              disabled={isSubmitting}
              className="bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-green-400/50 focus:ring-green-400/20 resize-none disabled:opacity-50"
            />
          </div>

          {/* Address Field */}
          <div>
            <label className=" text-white text-sm font-medium mb-2 flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              Address
            </label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter company address (optional)"
              disabled={isSubmitting}
              className="bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-green-400/50 focus:ring-green-400/20 disabled:opacity-50"
            />
          </div>

          {/* Contact Email Field */}
          <div>
            <label className=" text-white text-sm font-medium mb-2 flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              Contact Email
            </label>
            <Input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="Enter contact email (optional)"
              disabled={isSubmitting}
              className="bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-green-400/50 focus:ring-green-400/20 disabled:opacity-50"
            />
          </div>

          {/* Database Selection Field - Only for Parent Companies */}
          {type === "parent" && (
            <div>
              <label className=" text-white text-sm font-medium mb-2 flex items-center">
                <Database className="w-4 h-4 mr-2" />
                Database Configuration
              </label>
              {loadingDatabases ? (
                <div className="bg-gray-800/50 border border-gray-600/50 rounded-md px-3 py-2 text-gray-400 flex items-center">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading database configurations...
                </div>
              ) : databaseError ? (
                <div className="bg-red-900/20 border border-red-400/30 rounded-md px-3 py-2 text-red-400">
                  Error loading databases: {databaseError}
                </div>
              ) : databases && databases.length > 0 ? (
                <select
                  value={selectedDatabaseId || ""}
                  onChange={(e) =>
                    setSelectedDatabaseId(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  disabled={isSubmitting}
                  className="w-full bg-gray-800/50 border border-gray-600/50 text-white rounded-md px-3 py-2 focus:border-green-400/50 focus:ring-green-400/20 focus:ring-1 focus:outline-none disabled:opacity-50"
                >
                  <option value="">Select a database configuration</option>
                  {databases.map((db) => (
                    <option key={db.db_id} value={db.db_id}>
                      {db.db_name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="bg-gray-800/50 border border-gray-600/50 rounded-md px-3 py-2 text-gray-400">
                  No database configurations available. Please create one first.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 mt-8">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="border-gray-600/50 text-gray-300 hover:bg-gray-800/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !name.trim() ||
              isSubmitting ||
              (type === "parent" && !selectedDatabaseId)
            }
            className="bg-green-400 hover:bg-green-300 text-gray-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
