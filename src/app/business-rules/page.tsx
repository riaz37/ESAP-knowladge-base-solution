"use client";

import { BusinessRulesManager } from "@/components/business-rules/BusinessRulesManager";
import { EnhancedBackground } from "@/components/ui/enhanced-background";

export default function BusinessRulesPage() {
  return (
    <div className="min-h-screen relative">
      <EnhancedBackground />
      
      {/* Content */}
      <div className="relative z-10 pt-24 pb-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Business Rules Management
              </h1>
              <p className="text-gray-400">
                Configure and manage business rules that affect database queries and operations
              </p>
            </div>
            
            <BusinessRulesManager />
          </div>
        </div>
      </div>
    </div>
  );
}