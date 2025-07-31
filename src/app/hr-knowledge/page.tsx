"use client";

import { useResolvedTheme } from "@/store/theme-store";
import Image from "next/image";

export default function HRKnowledgePage() {
  const resolvedTheme = useResolvedTheme();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8"
         style={{
           background: resolvedTheme === 'light' 
             ? 'linear-gradient(135deg, #ffffff 0%, #f0f9f5 30%, #e6f7ff 70%, #f0f9f5 100%)'
             : undefined
         }}>
      
      {/* Enhanced background for light mode */}
      {resolvedTheme === 'light' && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 via-transparent to-blue-50/20 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-tl from-green-50/40 via-transparent to-emerald-50/30 pointer-events-none" />
          
          {/* Floating light particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-emerald-400/20 rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `float ${5 + Math.random() * 5}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 3}s`,
                  boxShadow: '0 0 8px rgba(16, 185, 129, 0.25)',
                }}
              />
            ))}
          </div>
        </>
      )}
      
      <div className="text-center max-w-2xl mx-auto relative z-10">
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
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
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
          HR Knowledge Base
        </h1>

        {/* Subtitle */}
        <p 
          className="text-xl mb-8"
          style={{
            color: resolvedTheme === "dark" ? "#94a3b8" : "#6b7280",
            lineHeight: "1.6"
          }}
        >
          Your comprehensive human resources knowledge center
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
            We're building an intelligent HR knowledge base that will help you find answers to:
          </p>
          <ul className="text-left space-y-2 max-w-md mx-auto">
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
              Employee policies and procedures
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
              Benefits and compensation information
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
              Training and development resources
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
              Compliance and regulatory guidelines
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