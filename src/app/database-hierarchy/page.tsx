"use client";

import React, { useState } from "react";
import { useHierarchyData } from "@/lib/hooks";
import { HierarchyService } from "@/lib/api/services/hierarchy-service";
import {
  HierarchyContainer,
  HierarchyHeader,
  HierarchyVisualization,
  LoadingState,
  CreateCompanyModal,
  EmptyHierarchyState,
} from "@/components/database-hierarchy";
import { toast } from "sonner";

export default function DatabaseHierarchyPage() {
  const { hierarchyData, isLoading, error, refetch } = useHierarchyData();

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [modalType, setModalType] = useState<"parent" | "sub">("parent");
  const [selectedParentName, setSelectedParentName] = useState<string>("");
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Event handlers for different actions
  const handleDatabaseAdd = (nodeId: string) => {
    console.log("Add database action for:", nodeId);
    // TODO: Implement database creation modal/form
    toast.info("Database creation feature coming soon!");
  };

  const handleParentAdd = (nodeId: string) => {
    console.log("Add parent company action for:", nodeId);
    setModalType("parent");
    setSelectedParentId(null);
    setSelectedParentName("");
    setShowCreateModal(true);
  };

  const handleSubAdd = async (nodeId: string) => {
    console.log("Add sub company action for:", nodeId);

    try {
      // Extract parent company info from the node ID
      const parentCompany = await HierarchyService.getParentCompanyByNodeId(
        nodeId
      );

      if (parentCompany) {
        setModalType("sub");
        setSelectedParentId(parentCompany.parent_company_id);
        setSelectedParentName(parentCompany.company_name);
        setShowCreateModal(true);
      } else {
        toast.error("Could not find parent company information");
      }
    } catch (error) {
      console.error("Error getting parent company info:", error);
      toast.error("Error loading parent company information");
    }
  };

  const handleUpload = (nodeId: string, type: string) => {
    console.log("Upload action for:", nodeId, "type:", type);
    // TODO: Implement file upload functionality
    toast.info("File upload feature coming soon!");
  };

  const handleCreateFirst = () => {
    setModalType("parent");
    setSelectedParentId(null);
    setSelectedParentName("");
    setShowCreateModal(true);
  };

  const handleModalSubmit = async (data: {
    name: string;
    details: string;
    type: "parent" | "sub";
  }) => {
    try {
      setIsCreating(true);

      // Validate the request
      const createRequest = {
        name: data.name,
        details: data.details,
        type: data.type,
        parentCompanyId:
          data.type === "sub" ? selectedParentId || undefined : undefined,
      };

      const validation =
        HierarchyService.validateCreateCompanyRequest(createRequest);

      if (!validation.isValid) {
        toast.error(validation.errors.join(", "));
        return;
      }

      // Create the company
      const result = await HierarchyService.createCompany(createRequest);

      // Show success message
      const companyType =
        data.type === "parent" ? "Parent company" : "Sub-company";
      toast.success(`${companyType} "${data.name}" created successfully!`);

      // Close modal and refresh data
      setShowCreateModal(false);
      await refetch();
    } catch (error: any) {
      console.error("Error creating company:", error);

      // Show user-friendly error message
      const errorMessage =
        error?.message || "Failed to create company. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const handleModalClose = () => {
    if (!isCreating) {
      setShowCreateModal(false);
      setSelectedParentId(null);
      setSelectedParentName("");
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <HierarchyContainer>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="text-red-400 text-lg">Error loading hierarchy</div>
          <p className="text-gray-400 text-center max-w-md">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-green-400 text-gray-900 rounded-lg hover:bg-green-300 transition-colors"
          >
            Try Again
          </button>
        </div>
      </HierarchyContainer>
    );
  }

  return (
    <>
      <HierarchyContainer>
        <HierarchyHeader />

        {/* Show empty state if no hierarchy data */}
        {!hierarchyData || hierarchyData.length === 0 ? (
          <EmptyHierarchyState onCreateFirst={handleCreateFirst} />
        ) : (
          <HierarchyVisualization
            hierarchyData={hierarchyData}
            onDatabaseAdd={handleDatabaseAdd}
            onParentAdd={handleParentAdd}
            onSubAdd={handleSubAdd}
            onUpload={handleUpload}
          />
        )}
      </HierarchyContainer>

      {/* Create Company Modal */}
      <CreateCompanyModal
        isOpen={showCreateModal}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        type={modalType}
        parentName={selectedParentName}
      />
    </>
  );
}
