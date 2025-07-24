"use client";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useState } from "react";

export default function Topbar() {
  const { theme, setTheme } = useTheme();
  const [lang, setLang] = useState("en");

  return (
    <nav className="w-full flex items-center justify-between px-8 py-4 bg-white shadow rounded-b-2xl">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🗄️</span>
        <span className="font-extrabold text-xl text-blue-700">
          AI Database <span className="text-purple-600">Query System</span>
        </span>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-red-500 inline-block"></span>
          <span className="text-sm font-semibold text-gray-500">Offline</span>
        </div>
        <ThemeToggle variant="button" size="sm" />
        <Button
          variant="outline"
          onClick={() => setLang(lang === "en" ? "ar" : "en")}
        >
          {lang === "en" ? "EN" : "AR"}
        </Button>
      </div>
    </nav>
  );
}
