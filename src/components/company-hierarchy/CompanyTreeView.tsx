"use client";

import React, { useCallback, useMemo, useState, useEffect } from "react";
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { CompanyCard } from "./CompanyCard";
import { EmptyState } from "./EmptyState";
import { CompanyTreeSidebar } from "./CompanyTreeSidebar";
import { CompanyCreationModal, CompanyFormData } from "./CompanyCreationModal";
import { CompanyUploadModal } from "./CompanyUploadModal";
import { useParentCompanies } from "@/lib/hooks/use-parent-companies";
import { useSubCompanies } from "@/lib/hooks/use-sub-companies";
import { ParentCompanyData, SubCompanyData } from "@/types/api";
import { toast } from "sonner";
import { AnimatedGridBackground } from "./AnimatedGridBackground";

// Types
export interface Company {
  id: string;
  name: string;
  description?: string;
  address?: string;
  contactEmail?: string;
  dbId: number;
  parentId?: string;
  children?: Company[];
}

interface CompanyTreeViewProps {
  onCompanyCreated?: () => void;
}

// Custom Node Component using the new CompanyCard
const CompanyNode = ({ data, selected }: { data: any; selected: boolean }) => {
  return (
    <CompanyCard
      company={data.company}
      onAddSubCompany={data.onAddSubCompany}
      onUpload={data.onUpload}
      isSelected={selected}
      onSelect={() => data.onSelect?.(data.company.id)}
      level={data.level}
    />
  );
};

// Empty State Node Component using the new EmptyState
const EmptyStateNode = ({ data }: { data: any }) => {
  return <EmptyState onAddParentCompany={data.onAddParentCompany} />;
};

// Define nodeTypes outside component to prevent recreation on every render
const nodeTypes = {
  company: CompanyNode,
  emptyState: EmptyStateNode,
};

// Define defaultEdgeOptions outside component to prevent recreation on every render
const defaultEdgeOptions = {
  animated: true,
  style: {
    stroke: "#10b981",
    strokeWidth: 3,
  },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: "#10b981",
    width: 16,
    height: 16,
  },
};

export function CompanyTreeView({ onCompanyCreated }: CompanyTreeViewProps) {
  // Use hooks for consistent API calls and state management
  const {
    getParentCompanies,
    createParentCompany,
    isLoading: parentLoading,
    error: parentError,
  } = useParentCompanies();

  const {
    getSubCompanies,
    createSubCompany,
    isLoading: subLoading,
    error: subError,
  } = useSubCompanies();

  // State management
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [selectedParentForFlow, setSelectedParentForFlow] = useState<
    string | null
  >(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"parent" | "sub">("parent");
  const [parentCompanyId, setParentCompanyId] = useState<number | undefined>();

  // Upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadCompanyName, setUploadCompanyName] = useState("");
  const [uploadCompanyType, setUploadCompanyType] = useState<"parent" | "sub">(
    "parent"
  );

  // Derived loading state
  const loading = parentLoading || subLoading;

  // Load companies on mount
  useEffect(() => {
    loadCompanies();
  }, []);

  // Handle upload modal
  const handleUpload = useCallback(
    (companyId: string, companyName: string, companyType: "parent" | "sub") => {
      setUploadCompanyName(companyName);
      setUploadCompanyType(companyType);
      setUploadModalOpen(true);
    },
    []
  );

  const loadCompanies = async () => {
    try {
      // Use hooks for consistent API calls - no more response structure guessing!
      const [parentCompanies, subCompanies] = await Promise.all([
        getParentCompanies(),
        getSubCompanies(),
      ]);

      console.log("Parent companies from hook:", parentCompanies);
      console.log("Sub companies from hook:", subCompanies);

      // Handle null responses gracefully
      const safeParentCompanies = parentCompanies || [];
      const safeSubCompanies = subCompanies || [];

      // Transform API data to our Company interface
      const transformedCompanies: Company[] = safeParentCompanies.map(
        (parent: ParentCompanyData) => ({
          id: `parent-${parent.parent_company_id}`,
          name: parent.company_name,
          description: parent.description,
          address: parent.address,
          contactEmail: parent.contact_email,
          dbId: parent.db_id,
          children: safeSubCompanies
            .filter(
              (sub: SubCompanyData) =>
                sub.parent_company_id === parent.parent_company_id
            )
            .map((sub: SubCompanyData) => ({
              id: `sub-${sub.sub_company_id}`,
              name: sub.company_name,
              description: sub.description,
              address: sub.address,
              contactEmail: sub.contact_email,
              dbId: sub.db_id,
              parentId: `parent-${sub.parent_company_id}`,
            })),
        })
      );

      console.log("Transformed companies:", transformedCompanies);
      setCompanies(transformedCompanies);

      // Show success message if we have data
      if (transformedCompanies.length > 0) {
        toast.success(
          `Loaded ${transformedCompanies.length} companies successfully`
        );
      }
    } catch (error) {
      console.error("Error loading companies:", error);
      toast.error("Failed to load companies");
      setCompanies([]); // Set empty array as fallback
    }
  };

  // Create nodes and edges for React Flow - Simplified and precise
  const { nodes, edges } = useMemo(() => {
    // Empty state
    if (companies.length === 0) {
      return {
        nodes: [
          {
            id: "empty-state",
            type: "emptyState",
            position: { x: 400, y: 300 },
            data: {
              onAddParentCompany: () => {
                setModalType("parent");
                setParentCompanyId(undefined);
                setModalOpen(true);
              },
            },
            draggable: false,
          },
        ],
        edges: [],
      };
    }

    const flowNodes: Node[] = [];
    const flowEdges: Edge[] = [];

    // Helper function to create a company node
    const createCompanyNode = (
      company: Company,
      position: { x: number; y: number },
      level: number
    ) => {
      const node = {
        id: company.id,
        type: "company",
        position,
        data: {
          company,
          level,
          onSelect: (companyId: string) => {
            setSelectedCompany(
              companyId === selectedCompany ? null : companyId
            );
          },
          onAddSubCompany: (parentId: string) => {
            setModalType("sub");
            // Extract the numeric ID from the prefixed ID (e.g., "parent-1" -> 1)
            const numericId = parseInt(parentId.replace("parent-", ""));
            setParentCompanyId(numericId);
            setModalOpen(true);
          },
          onUpload: handleUpload,
        },
        selected: selectedCompany === company.id,
        draggable: true,
      };

      console.log(
        "Creating node:",
        node.id,
        "level:",
        level,
        "hasChildren:",
        company.children?.length || 0
      );
      return node;
    };

    // Helper function to create an edge with proper handle IDs
    const createEdge = (sourceId: string, targetId: string) => {
      const edge = {
        id: `${sourceId}-${targetId}`,
        source: sourceId,
        sourceHandle: "bottom",
        target: targetId,
        targetHandle: "top",
        type: "smoothstep",
        style: {
          stroke: "#10b981",
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#10b981",
          width: 16,
          height: 16,
        },
      };
      console.log("Creating edge:", edge.id, "from", sourceId, "to", targetId);
      return edge;
    };

    // Get the company to display (selected parent or first company)
    const displayCompany = selectedParentForFlow
      ? companies.find((c) => c.id === selectedParentForFlow)
      : companies[0];

    if (!displayCompany) return { nodes: [], edges: [] };

    // Add parent company node
    const parentPosition = { x: 400, y: 150 };
    flowNodes.push(createCompanyNode(displayCompany, parentPosition, 0));

    // Add child nodes and edges if they exist
    if (displayCompany.children && displayCompany.children.length > 0) {
      const childY = 400;
      const spacing = 400;
      const startX = 400 - ((displayCompany.children.length - 1) * spacing) / 2;

      displayCompany.children.forEach((child, index) => {
        const childPosition = { x: startX + index * spacing, y: childY };

        // Add child node
        flowNodes.push(createCompanyNode(child, childPosition, 1));

        // Add edge from parent to child
        console.log(
          "Adding edge from parent:",
          displayCompany.id,
          "to child:",
          child.id
        );
        flowEdges.push(createEdge(displayCompany.id, child.id));
      });
    }

    return { nodes: flowNodes, edges: flowEdges };
  }, [companies, selectedCompany, selectedParentForFlow]);

  const [flowNodes, setNodes, onNodesChange] = useNodesState([]);
  const [flowEdges, setEdges, onEdgesChange] = useEdgesState([]);

  // Update nodes and edges when they change
  useEffect(() => {
    setNodes(nodes);
    setEdges(edges);
  }, [nodes, edges, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Handle company creation using hooks consistently
  const handleCompanySubmit = async (companyData: CompanyFormData) => {
    try {
      if (modalType === "parent") {
        const result = await createParentCompany({
          company_name: companyData.name,
          description: companyData.description,
          address: companyData.address,
          contact_email: companyData.contactEmail,
          db_id: companyData.dbId,
        });

        if (!result) {
          throw new Error("Failed to create parent company");
        }

        toast.success(
          `Parent company "${companyData.name}" created successfully`
        );
      } else {
        if (!parentCompanyId) {
          throw new Error(
            "Parent company ID is required for sub-company creation"
          );
        }

        const result = await createSubCompany({
          company_name: companyData.name,
          description: companyData.description,
          address: companyData.address,
          contact_email: companyData.contactEmail,
          db_id: companyData.dbId,
          parent_company_id: parentCompanyId,
        });

        if (!result) {
          throw new Error("Failed to create sub company");
        }

        toast.success(`Sub company "${companyData.name}" created successfully`);
      }

      // Reload companies after creation
      await loadCompanies();
      onCompanyCreated?.();
      setModalOpen(false); // Close modal on success
    } catch (error) {
      console.error("Error creating company:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create company"
      );
      throw error; // Re-throw to let modal handle the error
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-900 dark:text-white text-xl">
          Loading companies...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-100 dark:from-gray-900 dark:via-emerald-950/20 dark:to-gray-800">
      {/* Animated Grid Background */}
      <AnimatedGridBackground />

      {/* Main Content Area - Account for navbar height */}
      <div className="flex h-screen pt-20">
        {/* ReactFlow Container - Full width */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={flowNodes}
            edges={flowEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            className="bg-transparent"
            proOptions={{ hideAttribution: true }}
            defaultEdgeOptions={defaultEdgeOptions}
          >
            <Controls className="opacity-70" />
          </ReactFlow>
        </div>

        {/* Sidebar - Fixed to right side */}
        <div className="fixed top-24 right-6 z-40 flex-shrink-0">
          <CompanyTreeSidebar
            companies={companies}
            selectedParentForFlow={selectedParentForFlow}
            selectedCompany={selectedCompany}
            onSelectParentForFlow={setSelectedParentForFlow}
            onSelectCompany={setSelectedCompany}
            onAddSubCompany={(parentId: string) => {
              setModalType("sub");
              // Extract the numeric ID from the prefixed ID (e.g., "parent-1" -> 1)
              const numericId = parseInt(parentId.replace("parent-", ""));
              setParentCompanyId(numericId);
              setModalOpen(true);
            }}
            onUpload={handleUpload}
          />
        </div>
      </div>

      {/* Company Creation Modal */}
      <CompanyCreationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCompanySubmit}
        type={modalType}
        parentCompanyId={parentCompanyId}
      />

      {/* Company Upload Modal */}
      <CompanyUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        companyName={uploadCompanyName}
        companyType={uploadCompanyType}
      />
    </div>
  );
}

// Export the main component as default
export default CompanyTreeView;
