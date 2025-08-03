"use client";

import { CompanyTreeView } from "./CompanyTreeView";

export function CompanyHierarchy() {
  const handleCompanyCreated = () => {
    // Optional callback when a company is created
    console.log('Company created successfully');
  };

  return (
    <div className="min-h-screen bg-black">
      <CompanyTreeView onCompanyCreated={handleCompanyCreated} />
    </div>
  );
}
