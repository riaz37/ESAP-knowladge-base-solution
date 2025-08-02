import React from "react";

interface HierarchyHeaderProps {
  title?: string;
  description?: string;
}

export function HierarchyHeader({ 
  title = "Database Hierarchy",
  description = "Manage your database configurations and company structure"
}: HierarchyHeaderProps) {
  return (
    <div className="text-center mb-12">
      <h1 className="text-3xl font-bold text-white mb-4">
        {title}
      </h1>
      <p className="text-gray-400">
        {description}
      </p>
    </div>
  );
}