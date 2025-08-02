import React from "react";
import { DatabaseNode } from "./DatabaseNode";
import { CompanyNode } from "./CompanyNode";
import { ConnectionLine } from "./ConnectionLine";

export interface HierarchyNode {
  id: string;
  name: string;
  description: string;
  type: "database" | "parent" | "sub";
  data: any;
  children?: HierarchyNode[];
}

interface HierarchyVisualizationProps {
  hierarchyData: HierarchyNode[];
  onDatabaseAdd?: (nodeId: string) => void;
  onParentAdd?: (nodeId: string) => void;
  onSubAdd?: (nodeId: string) => void;
  onUpload?: (nodeId: string, type: string) => void;
}

export function HierarchyVisualization({ 
  hierarchyData,
  onDatabaseAdd,
  onParentAdd,
  onSubAdd,
  onUpload
}: HierarchyVisualizationProps) {
  return (
    <div className="flex flex-col items-center space-y-16">
      {hierarchyData.map((database) => (
        <div key={database.id} className="flex flex-col items-center">
          {/* Database Node */}
          <DatabaseNode
            name={database.name}
            description={database.description}
            onAddClick={() => onParentAdd?.(database.id)}
          />

          {/* Connection Line Down */}
          {database.children && database.children.length > 0 && (
            <ConnectionLine />
          )}

          {/* Parent Companies Level */}
          {database.children && database.children.length > 0 && (
            <div className="flex items-start justify-center space-x-32">
              {database.children.map((parent) => (
                <div key={parent.id} className="flex flex-col items-center">
                  {/* Parent Company Node */}
                  <CompanyNode
                    name={parent.name}
                    description={parent.description}
                    type="parent"
                    onUploadClick={() => onUpload?.(parent.id, "parent")}
                    onAddClick={() => onSubAdd?.(parent.id)}
                  />

                  {/* Connection Line Down */}
                  {parent.children && parent.children.length > 0 && (
                    <ConnectionLine />
                  )}

                  {/* Sub Companies Level */}
                  {parent.children && parent.children.length > 0 && (
                    <div className="flex items-start justify-center space-x-16">
                      {parent.children.map((sub) => (
                        <CompanyNode
                          key={sub.id}
                          name={sub.name}
                          description={sub.description}
                          type="sub"
                          onUploadClick={() => onUpload?.(sub.id, "sub")}
                          onAddClick={() => onSubAdd?.(sub.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}