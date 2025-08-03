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
} from "reactflow";
import "reactflow/dist/style.css";
import { Building2, Plus, ChevronDown } from "lucide-react";
import { CompanyCreationModal, CompanyFormData } from "./CompanyCreationModal";
import { ParentCompanyService } from "@/lib/api/services/parent-company-service";
import { SubCompanyService } from "@/lib/api/services/sub-company-service";
import { ParentCompanyData, SubCompanyData } from "@/types/api";
import { toast } from "sonner";

// Types
interface Company {
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

// Custom Node Component for companies
const CompanyNode = ({ data, selected }: { data: any; selected: boolean }) => {
  const isMainCompany = data.level === 0;

  return (
    <div className="relative">
      {/* Plus button at top center of main card */}
      {isMainCompany && (
        <div
          className="absolute z-20 cursor-pointer"
          style={{
            left: "50%",
            top: "-16px",
            transform: "translateX(-50%)",
          }}
          onClick={(e) => {
            e.stopPropagation();
            data.onAddSubCompany(data.company.id);
          }}
        >
          <div className="w-8 h-8 rounded-full bg-green-500/20 border-2 border-green-400 flex items-center justify-center hover:bg-green-500/30 transition-colors">
            <Plus className="w-4 h-4 text-green-400" />
          </div>
        </div>
      )}

      {/* Main Card */}
      <div
        className={`relative bg-gray-800/95 backdrop-blur-md border-2 rounded-2xl p-6 transition-all duration-300 cursor-pointer ${
          isMainCompany
            ? "w-80 h-48 border-green-400/80 shadow-2xl shadow-green-400/20"
            : "w-72 h-40 border-green-500/30 hover:border-green-400/40"
        } ${selected ? "ring-2 ring-green-400/50" : ""}`}
        onClick={() => data.onSelect?.(data.company.id)}
      >
        {/* Animated glow dots in corners */}
        <div
          className="absolute top-4 left-4 w-1 h-1 bg-emerald-400 rounded-full animate-pulse opacity-60"
          style={{ boxShadow: "0 0 8px #10b981" }}
        />
        <div
          className="absolute top-8 left-2 w-0.5 h-0.5 bg-emerald-300 rounded-full animate-pulse opacity-40"
          style={{ boxShadow: "0 0 4px #6ee7b7" }}
        />
        <div
          className="absolute bottom-12 left-6 w-0.5 h-0.5 bg-emerald-400 rounded-full animate-pulse opacity-50"
          style={{ boxShadow: "0 0 6px #10b981" }}
        />
        <div
          className="absolute bottom-4 left-2 w-1 h-1 bg-emerald-300 rounded-full animate-pulse opacity-30"
          style={{ boxShadow: "0 0 8px #6ee7b7" }}
        />

        {/* Icon and content */}
        <div className="flex items-center gap-4">
          {/* Left side - Icon */}
          <div className="flex-shrink-0">
            <div
              className="w-16 h-16 rounded-full border border-emerald-400/30 flex items-center justify-center relative"
              style={{
                background:
                  "radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)",
                boxShadow: "0 0 20px rgba(16, 185, 129, 0.2)",
              }}
            >
              <div
                className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                }}
              >
                <Building2 className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Right side - Text content */}
          <div className="flex-1">
            <h3 className="text-white font-semibold text-lg mb-2">
              {data.company.name}
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {data.company.description || "Company description"}
            </p>
            {data.company.address && (
              <p className="text-gray-400 text-xs mt-1">
                {data.company.address}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Plus button at bottom for sub-companies */}
      <div
        className="absolute z-20 cursor-pointer"
        style={{
          left: isMainCompany ? "135px" : "125px",
          top: isMainCompany ? "200px" : "170px",
        }}
        onClick={(e) => {
          e.stopPropagation();
          data.onAddSubCompany(data.company.id);
        }}
      >
        <div className="w-8 h-8 rounded-full bg-green-500/20 border-2 border-green-400 flex items-center justify-center hover:bg-green-500/30 transition-colors">
          <Plus className="w-4 h-4 text-green-400" />
        </div>
      </div>
    </div>
  );
};

// Empty State Component - Floating Plus Icon
const EmptyStateNode = ({ data }: { data: any }) => {
  return (
    <div className="relative">
      <div
        className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-400 flex items-center justify-center hover:bg-green-500/30 transition-all duration-300 cursor-pointer shadow-2xl shadow-green-400/20"
        onClick={data.onAddParentCompany}
        style={{
          boxShadow: "0 0 30px rgba(34, 197, 94, 0.3)",
        }}
      >
        <Plus className="w-8 h-8 text-green-400" />
      </div>
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-green-400 text-sm font-medium">Create Parent Company</p>
        <p className="text-gray-400 text-xs mt-1">Click to get started</p>
      </div>
    </div>
  );
};

const nodeTypes = {
  company: CompanyNode,
  emptyState: EmptyStateNode,
};

export function CompanyTreeView({ onCompanyCreated }: CompanyTreeViewProps) {
  // State management
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'parent' | 'sub'>('parent');
  const [parentCompanyId, setParentCompanyId] = useState<number | undefined>();

  // Load companies on mount
  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      // Load parent companies and sub companies separately to handle errors better
      let parentCompanies: ParentCompanyData[] = [];
      let subCompanies: SubCompanyData[] = [];

      try {
        const parentResponse = await ParentCompanyService.getParentCompanies();
        console.log('Parent companies response:', parentResponse);
        // The service returns response.data, so parentResponse should be {companies: [...], count: number}
        parentCompanies = parentResponse.companies || [];
      } catch (parentError) {
        console.error('Error loading parent companies:', parentError);
        // Continue with empty parent companies array
      }

      try {
        const subResponse = await SubCompanyService.getSubCompanies();
        console.log('Sub companies response:', subResponse);
        // The service returns response.data, so subResponse should be {companies: [...], count: number}
        subCompanies = subResponse.companies || [];
      } catch (subError) {
        console.error('Error loading sub companies:', subError);
        // Continue with empty sub companies array
      }

      console.log('Extracted parent companies:', parentCompanies);
      console.log('Extracted sub companies:', subCompanies);

      // Transform API data to our Company interface
      const transformedCompanies: Company[] = parentCompanies.map((parent: ParentCompanyData) => ({
        id: parent.parent_company_id.toString(),
        name: parent.company_name,
        description: parent.description,
        address: parent.address,
        contactEmail: parent.contact_email,
        dbId: parent.db_id,
        children: subCompanies
          .filter((sub: SubCompanyData) => sub.parent_company_id === parent.parent_company_id)
          .map((sub: SubCompanyData) => ({
            id: sub.sub_company_id.toString(),
            name: sub.company_name,
            description: sub.description,
            address: sub.address,
            contactEmail: sub.contact_email,
            dbId: sub.db_id,
            parentId: sub.parent_company_id.toString(),
          })),
      }));

      console.log('Transformed companies:', transformedCompanies);
      setCompanies(transformedCompanies);
    } catch (error) {
      console.error('Error loading companies:', error);
      toast.error('Failed to load companies');
      setCompanies([]); // Set empty array as fallback
    } finally {
      setLoading(false);
    }
  };

  // Create nodes and edges for React Flow
  const { nodes, edges } = useMemo(() => {
    if (companies.length === 0) {
      // Empty state - show floating plus icon in center
      return {
        nodes: [{
          id: 'empty-state',
          type: 'emptyState',
          position: { x: 400, y: 300 },
          data: {
            onAddParentCompany: () => {
              setModalType('parent');
              setParentCompanyId(undefined);
              setModalOpen(true);
            },
          },
          draggable: false,
        }],
        edges: [],
      };
    }

    // Has companies - create normal flow
    const mainCompany = companies[0];
    const flowNodes: Node[] = [];
    const flowEdges: Edge[] = [];

    // Add main company node
    flowNodes.push({
      id: mainCompany.id,
      type: "company",
      position: { x: 200, y: 150 },
      data: {
        company: mainCompany,
        level: 0,
        onSelect: setSelectedCompany,
        onAddSubCompany: (parentId: string) => {
          setModalType('sub');
          setParentCompanyId(parseInt(parentId));
          setModalOpen(true);
        },
      },
      draggable: false,
    });

    // Add child nodes
    if (mainCompany.children && mainCompany.children.length > 0) {
      const childY = 450;
      const spacing = 320;
      const startX = 200 - ((mainCompany.children.length - 1) * spacing) / 2;

      mainCompany.children.forEach((child, index) => {
        const childX = startX + index * spacing;

        flowNodes.push({
          id: child.id,
          type: "company",
          position: { x: childX, y: childY },
          data: {
            company: child,
            level: 1,
            onSelect: setSelectedCompany,
            onAddSubCompany: (parentId: string) => {
              setModalType('sub');
              setParentCompanyId(parseInt(parentId));
              setModalOpen(true);
            },
          },
          draggable: false,
        });

        // Add edge from parent to child
        flowEdges.push({
          id: `${mainCompany.id}-${child.id}`,
          source: mainCompany.id,
          target: child.id,
          type: "straight",
          style: {
            stroke: "rgba(34, 197, 94, 0.6)",
            strokeWidth: 2,
          },
          animated: true,
        });
      });
    }

    return { nodes: flowNodes, edges: flowEdges };
  }, [companies]);

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

  // Handle company creation
  const handleCompanySubmit = async (companyData: CompanyFormData) => {
    try {
      if (modalType === 'parent') {
        await ParentCompanyService.createParentCompany({
          company_name: companyData.name,
          description: companyData.description,
          address: companyData.address,
          contact_email: companyData.contactEmail,
          db_id: companyData.dbId,
        });
      } else {
        if (!parentCompanyId) {
          throw new Error('Parent company ID is required for sub-company creation');
        }
        await SubCompanyService.createSubCompany({
          company_name: companyData.name,
          description: companyData.description,
          address: companyData.address,
          contact_email: companyData.contactEmail,
          db_id: companyData.dbId,
          parent_company_id: parentCompanyId,
        });
      }

      // Reload companies after creation
      await loadCompanies();
      onCompanyCreated?.();
    } catch (error) {
      console.error('Error creating company:', error);
      throw error; // Re-throw to let modal handle the error
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800">
        <div className="text-white text-xl">Loading companies...</div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen w-full relative overflow-hidden bg-black">
        {/* Custom grid background overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(34, 197, 94, 0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(34, 197, 94, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
            zIndex: 1,
          }}
        />

        {/* React Flow Container */}
        <div
          style={{
            width: "100%",
            height: "100vh",
            position: "relative",
            zIndex: 2,
          }}
        >
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
          >
            {/* Controls (optional - can be hidden) */}
            <Controls className="opacity-50" />
          </ReactFlow>
        </div>

        {/* Right sidebar with company tree - only show if we have companies */}
        {companies.length > 0 && (
          <div className="absolute top-20 right-6 w-80 bg-gray-900/95 backdrop-blur-md border border-green-400/30 rounded-2xl p-6 z-40 shadow-2xl shadow-green-400/10">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 border border-green-400/40 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-green-400" />
                </div>
                <h3 className="text-white font-semibold text-lg">Companies</h3>
              </div>
              <ChevronDown className="w-4 h-4 text-green-400" />
            </div>

            {/* File Tree Structure */}
            <div className="space-y-0 font-mono text-sm">
              {companies.map((company) => (
                <div key={company.id}>
                  {/* Parent company - folder style */}
                  <div
                    className={`flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-800/50 transition-colors ${
                      selectedCompany === company.id ? "bg-green-500/20" : ""
                    }`}
                    onClick={() => setSelectedCompany(company.id)}
                  >
                    {/* Folder icon */}
                    <span className="text-green-400 text-base">📁</span>
                    {/* Green dot */}
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="text-white font-medium">{company.name}</span>
                  </div>

                  {/* Children - file tree structure */}
                  {company.children && company.children.length > 0 && (
                    <div>
                      {company.children.map((child, index) => {
                        const isLast = index === company.children!.length - 1;
                        return (
                          <div key={child.id} className="relative">
                            {/* Tree connector lines */}
                            <div className="absolute left-4 top-0 flex items-center h-10">
                              {/* Vertical line */}
                              {!isLast && (
                                <div className="absolute left-0 top-5 w-px h-5 bg-green-400/40" />
                              )}
                              {/* L-shaped connector */}
                              <div className="flex">
                                <div className="w-px h-5 bg-green-400/40" />
                                <div className="w-4 h-px bg-green-400/40 mt-5" />
                              </div>
                            </div>

                            <div
                              className={`flex items-center gap-2 cursor-pointer p-2 ml-6 hover:bg-gray-800/40 transition-colors ${
                                selectedCompany === child.id
                                  ? "bg-green-500/15"
                                  : ""
                              }`}
                              onClick={() => setSelectedCompany(child.id)}
                            >
                              {/* File icon */}
                              <span className="text-green-400/70 text-sm">📄</span>
                              {/* Green dot */}
                              <div className="w-2 h-2 rounded-full bg-green-400/70" />
                              <span className="text-gray-300">{child.name}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Company Creation Modal */}
      <CompanyCreationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCompanySubmit}
        type={modalType}
        parentCompanyId={parentCompanyId}
      />
    </>
  );
}

// Export the main component as default
export default CompanyTreeView;
