"use client";

import React, { useState, useEffect } from "react";
import { TableManagementSection } from "@/components/tables/TableManagementSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";

export default function TableManagementPage() {
  const [userId, setUserId] = useState("");
  const [debouncedUserId, setDebouncedUserId] = useState("");

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedUserId(userId);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [userId]);

  // This page will host the TableManagementSection.
  // The TableManagementSection component will now manage its own internal user ID state
  // directly within the table creation form, as per the user's request.
  // The database configuration (User ID/DB ID inputs) remains on the
  // original /tables page.
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
              <Label className="text-sm text-slate-400 whitespace-nowrap">
                User ID:
              </Label>
              <Input
                placeholder="Enter User ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-40"
              />
            </div>
          </CardContent>
        </Card>
        <TableManagementSection userId={debouncedUserId} />
      </div>
    </div>
  );
}
