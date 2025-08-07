"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  ReactFlow,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  ConnectionMode,
  Panel,
} from "reactflow";
import "reactflow/dist/style.css";

import { TableNode } from "./TableNode";
import { TablesSidebar } from "./TablesSidebar";
import { TableDetailsModal } from "./TableDetailsModal";
import { useMSSQLTableOperations } from "@/lib/hooks/use-mssql-table-operations";
import { useUserCurrentDB } from "@/lib/hooks/use-user-current-db";
import { Button } from "@/components/ui/button";
import { RefreshCw, Layout } from "lucide-react";

// Define nodeTypes outside component to prevent recreation on every render
const nodeTypes = {
  tableNode: TableNode,
};



interface TableData {
  id: string;
  name: string;
  fullName: string;
  schema: string;
  primaryKeys: string[];
  columns: Array<{
    name: string;
    type: string;
    isPrimary: boolean;
    isForeign: boolean;
    isRequired: boolean;
    maxLength?: number;
    references?: {
      table: string;
      column: string;
      constraint: string;
    };
  }>;
  relationships: Array<{
    type: string;
    viaColumn: string;
    viaRelated: string;
    relatedTable: string;
  }>;
  sampleData?: Array<Record<string, any>>;
  rowCount?: number;
}

export function TablesManager() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    currentDB,
    isLoading: isLoadingDB,
    getCurrentDB,
  } = useUserCurrentDB();
  const { generateTableInfo, isGeneratingTableInfo } =
    useMSSQLTableOperations();

  // Load current database on component mount
  React.useEffect(() => {
    // For demo purposes, we'll use a sample user ID
    // In a real app, this would come from authentication context
    getCurrentDB("nilab");
  }, [getCurrentDB]);



  // Convert database schema to table data
  const tableData = useMemo(() => {
    // Only use real database table_info
    if (currentDB?.table_info?.tables) {
      const tables: TableData[] = [];
      const apiTables = currentDB.table_info.tables;

      apiTables.forEach((apiTable: any) => {
        const columns = apiTable.columns.map((col: any) => ({
          name: col.name,
          type: col.type,
          isPrimary: col.is_primary || false,
          isForeign: col.is_foreign || false,
          isRequired: col.is_required || false,
          maxLength: col.max_length,
          references: col.references,
        }));

        tables.push({
          id: apiTable.full_name,
          name: apiTable.table_name,
          fullName: apiTable.full_name,
          schema: apiTable.schema,
          primaryKeys: apiTable.primary_keys || [],
          columns,
          relationships: apiTable.relationships || [],
          sampleData: apiTable.sample_data,
          rowCount: apiTable.row_count_sample,
        });
      });

      return tables;
    }

    // Return empty array if no API data
    return [];
  }, [currentDB]);

  // Generate nodes from table data
  const generateNodes = useCallback((tables: TableData[]) => {
    const nodeSpacing = 300;
    const nodesPerRow = Math.ceil(Math.sqrt(tables.length));

    return tables.map((table, index) => {
      const row = Math.floor(index / nodesPerRow);
      const col = index % nodesPerRow;

      return {
        id: table.id,
        type: "tableNode",
        position: {
          x: col * nodeSpacing,
          y: row * nodeSpacing,
        },
        data: {
          table,
          onTableClick: (tableData: TableData) => {
            setSelectedTable(tableData);
            setIsModalOpen(true);
          },
        },
      };
    });
  }, []);

  // Generate edges from relationships
  const generateEdges = useCallback((tables: TableData[]) => {
    const edges: Edge[] = [];

    tables.forEach((table) => {
      table.relationships.forEach((rel, index) => {
        // Find target table by name (not full name)
        const targetTable = tables.find((t) => t.name === rel.relatedTable);
        if (targetTable) {
          edges.push({
            id: `${table.id}-${targetTable.id}-${index}`,
            source: table.id,
            sourceHandle: "bottom",
            target: targetTable.id,
            targetHandle: "top",
            type: "smoothstep",
            animated: true,
            label: `${rel.type}\n${rel.viaColumn} → ${rel.viaRelated}`,
            style: {
              stroke: "#10b981",
              strokeWidth: 2,
            },
            labelStyle: {
              fill: "#10b981",
              fontWeight: 600,
              fontSize: 10,
            },
          });
        }
      });
    });

    return edges;
  }, []);

  // Update nodes and edges when table data changes
  React.useEffect(() => {
    if (tableData.length > 0) {
      const newNodes = generateNodes(tableData);
      const newEdges = generateEdges(tableData);

      setNodes(newNodes);
      setEdges(newEdges);
    }
  }, [tableData, generateNodes, generateEdges, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleRefreshTables = async () => {
    if (!currentDB) return;

    setIsLoading(true);
    try {
      await generateTableInfo(currentDB.db_id, currentDB.user_id);
      // The data will be refreshed through the useUserCurrentDB hook
    } catch (error) {
      console.error("Failed to refresh tables:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoLayout = () => {
    // Simple auto-layout algorithm
    const newNodes = nodes.map((node, index) => {
      const angle = (index / nodes.length) * 2 * Math.PI;
      const radius = Math.max(200, nodes.length * 30);

      return {
        ...node,
        position: {
          x: Math.cos(angle) * radius + 400,
          y: Math.sin(angle) * radius + 300,
        },
      };
    });

    setNodes(newNodes);
  };

  if (isLoadingDB) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 pt-20">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-gray-300">Loading database schema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-900 pt-20">
      {/* Sidebar */}
      <TablesSidebar
        tables={tableData}
        onTableSelect={(table) => {
          setSelectedTable(table);
          setIsModalOpen(true);
        }}
        currentDB={currentDB}
      />

      {/* Main Flow Area */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          connectionMode={ConnectionMode.Loose}
          fitView
          className="bg-slate-900"
        >
          <Background color="#1e293b" gap={20} />
          <Controls className="bg-slate-800 border-slate-700" />

          {/* Top Panel with Controls */}
          <Panel position="top-right" className="flex gap-2">
            <Button
              onClick={handleRefreshTables}
              disabled={isLoading || isGeneratingTableInfo}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${
                  isLoading || isGeneratingTableInfo ? "animate-spin" : ""
                }`}
              />
              Refresh
            </Button>

            <Button
              onClick={handleAutoLayout}
              size="sm"
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              <Layout className="w-4 h-4 mr-2" />
              Auto Layout
            </Button>
          </Panel>

          {/* Info Panel */}
          <Panel position="top-left">
            <div className="bg-slate-800/90 backdrop-blur-sm rounded-lg p-4 border border-slate-700">
              <h3 className="text-emerald-400 font-semibold mb-2">
                Database Schema
              </h3>
              <div className="text-sm text-gray-300 space-y-1">
                <p>
                  Database ID:{" "}
                  <span className="text-emerald-400">
                    {currentDB?.db_id || "Not selected"}
                  </span>
                </p>
                <p>
                  Tables:{" "}
                  <span className="text-emerald-400">{tableData.length}</span>
                </p>
                <p>
                  Relationships:{" "}
                  <span className="text-emerald-400">{edges.length}</span>
                </p>
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {/* Table Details Modal */}
      {selectedTable && (
        <TableDetailsModal
          table={selectedTable}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTable(null);
          }}
        />
      )}
    </div>
  );
}
