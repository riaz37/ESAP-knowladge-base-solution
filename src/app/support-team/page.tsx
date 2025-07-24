"use client";

import { useTheme } from "@/contexts/ThemeContext";
import Image from "next/image";

export default function SupportTeamPage() {
  const { resolvedTheme } = useTheme();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="text-center max-w-2xl mx-auto">
        {/* Icon/Illustration */}
        <div className="mb-8">
          <div 
            className="w-32 h-32 mx-auto rounded-full flex items-center justify-center"
            style={{
              background: resolvedTheme === "dark" 
                ? "linear-gradient(135deg, rgba(91,228,155,0.2) 0%, rgba(148,255,212,0.1) 100%)"
                : "linear-gradient(135deg, rgba(91,228,155,0.1) 0%, rgba(148,255,212,0.05) 100%)",
              border: resolvedTheme === "dark" 
                ? "2px solid rgba(91,228,155,0.3)" 
                : "2px solid rgba(91,228,155,0.2)"
            }}
          >
            <svg 
              className="w-16 h-16" 
              fill={resolvedTheme === "dark" ? "#5BE49B" : "#059669"}
              viewBox="0 0 24 24"
            >
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 2.5c0 .83-.67 1.5-1.5 1.5S12 7.33 12 6.5 12.67 5 13.5 5s1.5.67 1.5 1.5zM16 18H8v-.57c0-.81.48-1.53 1.22-1.85.85-.37 1.79-.58 2.78-.58.99 0 1.93.21 2.78.58.74.32 1.22 1.04 1.22 1.85V18z"/>
              <circle cx="9" cy="9" r="2"/>
              <circle cx="15" cy="9" r="2"/>
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 
          className="text-4xl font-bold mb-4"
          style={{
            color: resolvedTheme === "dark" ? "#fff" : "#1f2937",
            letterSpacing: "-0.02em"
          }}
        >
          Support Team Portal
        </h1>

        {/* Subtitle */}
        <p 
          className="text-xl mb-8"
          style={{
            color: resolvedTheme === "dark" ? "#94a3b8" : "#6b7280",
            lineHeight: "1.6"
          }}
        >
          Dedicated support resources and team collaboration tools
        </p>

        {/* Coming Soon Badge */}
        <div 
          className="inline-flex items-center px-6 py-3 rounded-full mb-8"
          style={{
            background: resolvedTheme === "dark" 
              ? "linear-gradient(135deg, rgba(91,228,155,0.15) 0%, rgba(148,255,212,0.08) 100%)"
              : "linear-gradient(135deg, rgba(91,228,155,0.1) 0%, rgba(148,255,212,0.05) 100%)",
            border: resolvedTheme === "dark" 
              ? "1px solid rgba(91,228,155,0.3)" 
              : "1px solid rgba(91,228,155,0.2)",
            backdropFilter: "blur(10px)"
          }}
        >
          <div className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></div>
          <span 
            className="font-semibold text-lg"
            style={{ color: resolvedTheme === "dark" ? "#5BE49B" : "#059669" }}
          >
            Coming Soon
          </span>
        </div>

        {/* Description */}
        <div 
          className="text-base leading-relaxed mb-8"
          style={{ color: resolvedTheme === "dark" ? "#cbd5e1" : "#4b5563" }}
        >
          <p className="mb-4">
            We're developing a comprehensive support team portal featuring:
          </p>
          <ul className="text-left space-y-2 max-w-md mx-auto">
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
              Ticket management system
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
              Knowledge base for common issues
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
              Team collaboration tools
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
              Performance analytics and reporting
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
              Customer communication hub
            </li>
          </ul>
        </div>

        {/* Timeline */}
        <div 
          className="text-sm"
          style={{ color: resolvedTheme === "dark" ? "#94a3b8" : "#6b7280" }}
        >
          Expected launch: Q2 2025
        </div>
      </div>
    </div>
  );
}