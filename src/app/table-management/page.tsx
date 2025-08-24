"use client";

import React, { useEffect } from "react";
import { TableManagementSection } from "@/components/tables/TableManagementSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";
import { useAuthContext } from "@/components/providers/AuthContextProvider";

export default function TableManagementPage() {
  const { user } = useAuthContext();

  return (
    <div className="w-full min-h-screen relative bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 pt-20">
      <div className="container mx-auto p-6 space-y-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Settings className="h-5 w-5" />
              User Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-sm text-slate-400 whitespace-nowrap">
                User ID:
              </div>
              <div className="text-white font-medium">
                {user?.user_id || 'Not authenticated'}
              </div>
              <div className="text-xs text-slate-500 ml-2">
                (Automatically set from your account)
              </div>
            </div>
          </CardContent>
        </Card>
        <TableManagementSection />
      </div>
    </div>
  );
}
