"use client";

import React from "react";
import { UsersManager } from "@/components/users/UsersManager";

export default function UsersPage() {
  return (
    <div className="w-full min-h-screen relative bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
      <UsersManager />
    </div>
  );
}