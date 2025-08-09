"use client";

import React from "react";
import { TablesManager } from "@/components/tables/TablesManager";

export default function TablesPage() {
  return (
    <div className="w-full min-h-screen relative bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 pt-20">
      <TablesManager />
    </div>
  );
}