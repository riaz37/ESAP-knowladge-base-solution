"use client";

import { BusinessRulesManager } from "@/components/business-rules/BusinessRulesManager";

export default function BusinessRulesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Add top padding to account for fixed navbar */}
      <div className="pt-24 pb-8">
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