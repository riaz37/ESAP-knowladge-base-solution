"use client";

import React, { useCallback, useMemo } from "react";
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
} from "reactflow";
import "reactflow/dist/style.css";
import { TableNode } from "./TableNode";
import { parseApiResponse, filterImportantTables, ParsedTable } from "@/lib/utils/sql-parser";

interface TableFlowVisualizationProps {
  tables?: ParsedTable[];
  rawData?: any; // For handling raw API response
  maxTables?: number; // Maximum number of tables to display
}

const nodeTypes = {
  tableNode: TableNode,
};

export function TableFlowVisualization({
  tables = [],
  rawData,
  maxTables = 15,
}: TableFlowVisualizationProps) {
  // Parse raw API data if provided, otherwise use tables prop
  const processedTables = useMemo(() => {
    if (rawData) {
      const parsed = parseApiResponse(rawData);
      return filterImportantTables(parsed.tables, maxTables);
    }
    return tables;
  }, [rawData, tables, maxTables]);

  // Generate nodes with intelligent layout and enhanced edges
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    if (processedTables.length === 0) {
      return { initialNodes: nodes, initialEdges: edges };
    }

    // Separate tables by relationship count for better layout
    const tablesWithRelationships = processedTables.filter(t => t.relationships && t.relationships.length > 0);
    const isolatedTables = processedTables.filter(t => !t.relationships || t.relationships.length === 0);

    // Create a more intelligent layout
    const createLayout = () => {
      let currentX = 100;
      let currentY = 100;
      const nodeSpacing = 280;
      const rowHeight = 200;
      const maxCols = Math.ceil(Math.sqrt(processedTables.length));

      // Place connected tables first in a more organized way
      tablesWithRelationships.forEach((table, index) => {
        const row = Math.floor(index / maxCols);
        const col = index % maxCols;
        
        nodes.push({
          id: table.full_name,
          type: "tableNode",
          position: { 
            x: col * nodeSpacing + currentX, 
            y: row * rowHeight + currentY 
          },
          data: {
            table,
            label: table.name,
          },
        });
      });

      // Place isolated tables in a separate area
      const isolatedStartY = currentY + Math.ceil(tablesWithRelationships.length / maxCols) * rowHeight + 100;
      isolatedTables.forEach((table, index) => {
        const row = Math.floor(index / maxCols);
        const col = index % maxCols;
        
        nodes.push({
          id: table.full_name,
          type: "tableNode",
          position: { 
            x: col * nodeSpacing + currentX, 
            y: row * rowHeight + isolatedStartY 
          },
          data: {
            table,
            label: table.name,
          },
        });
      });
    };

    createLayout();

    // Enhanced edges with better styling and colors
    processedTables.forEach((table) => {
      if (table.relationships) {
        table.relationships.forEach((relationship, index) => {
          const targetExists = processedTables.some(
            (t) => t.full_name === relationship.related_table
          );

          if (targetExists) {
            // Get colors based on relationship type
            const getRelationshipColor = (type: string) => {
              switch (type) {
                case 'many_to_one':
                  return { stroke: '#10b981', fill: '#10b981' }; // emerald
                case 'one_to_many':
                  return { stroke: '#3b82f6', fill: '#3b82f6' }; // blue
                case 'one_to_one':
                  return { stroke: '#f59e0b', fill: '#f59e0b' }; // amber
                default:
                  return { stroke: '#8b5cf6', fill: '#8b5cf6' }; // violet
              }
            };

            const colors = getRelationshipColor(relationship.type || 'foreign_key');

            edges.push({
              id: `${table.full_name}-${relationship.related_table}-${index}`,
              source: table.full_name,
              target: relationship.related_table,
              type: "smoothstep",
              style: {
                stroke: colors.stroke,
                strokeWidth: 2,
                strokeDasharray: relationship.type === "many_to_one" ? "5,5" : undefined,
              },
              markerEnd: {
                type: 'arrowclosed',
                color: colors.stroke,
                width: 20,
                height: 20,
              },
              animated: true,
            });
          }
        });
      }
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [processedTables]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-gray-900 to-black rounded-lg overflow-hidden relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-transparent"
        proOptions={{ hideAttribution: true }}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        minZoom={0.3}
        maxZoom={2}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={25}
          size={1.5}
          color="#374151"
          className="opacity-60"
        />
        <Controls 
          className="bg-gray-900/90 border-gray-700 backdrop-blur-sm" 
          showInteractive={false}
        />
        
        {/* Legend Panel */}
        <div className="absolute top-4 right-4 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-4 min-w-[200px] z-10">
          <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
            Table Legend
          </h3>
          
          {/* Table Types */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 bg-blue-400 rounded"></div>
              <span className="text-blue-300">User/Employee Tables</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 bg-green-400 rounded"></div>
              <span className="text-green-300">Financial Tables</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 bg-purple-400 rounded"></div>
              <span className="text-purple-300">Document Tables</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 bg-orange-400 rounded"></div>
              <span className="text-orange-300">Time/Date Tables</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 bg-indigo-400 rounded"></div>
              <span className="text-indigo-300">Project Tables</span>
            </div>
          </div>

          {/* Relationship Types */}
          <div className="border-t border-gray-700 pt-3">
            <h4 className="text-gray-300 font-medium text-xs mb-2">Relationships</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-0.5 bg-emerald-400 border-dashed border border-emerald-400"></div>
                <span className="text-emerald-300">Many-to-One</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-0.5 bg-blue-400"></div>
                <span className="text-blue-300">One-to-Many</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-0.5 bg-amber-400"></div>
                <span className="text-amber-300">One-to-One</span>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="border-t border-gray-700 pt-3 mt-3">
            <div className="text-xs text-gray-400">
              <div>Tables: {processedTables.length}</div>
              <div>Connected: {processedTables.filter(t => t.relationships && t.relationships.length > 0).length}</div>
              <div>Isolated: {processedTables.filter(t => !t.relationships || t.relationships.length === 0).length}</div>
            </div>
          </div>
        </div>


      </ReactFlow>
    </div>
  );
}
