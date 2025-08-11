"use client";

import { CompanyTreeView } from "./CompanyTreeView";
import { EnhancedBackground } from "@/components/ui/enhanced-background";

export function CompanyHierarchy() {
  const handleCompanyCreated = () => {
    // Optional callback when a company is created
  };

  return (
    <EnhancedBackground intensity="medium" className="min-h-screen">
      <CompanyTreeView onCompanyCreated={handleCompanyCreated} />
    </EnhancedBackground>
  );
}
