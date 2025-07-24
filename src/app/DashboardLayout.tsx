"use client";

import React from "react";

interface DashboardProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardProps) {
  return (
    <div className="p-5">
      {/* Blurred blobs from Figma */}
      <div
        className="fixed"
        style={{
          width: "753px",
          height: "572px",
          left: "1549px",
          top: "-220px",
          backgroundColor: "#614A64",
          opacity: 0.4,
          borderRadius: "753px",
          filter: "blur(97px)",
          zIndex: -30,
        }}
      />
      <div
        className="fixed"
        style={{
          width: "753px",
          height: "533px",
          left: "839px",
          top: "-436px",
          backgroundColor: "#94FFD4",
          opacity: 0.4,
          borderRadius: "753px",
          filter: "blur(97px)",
          zIndex: -30,
        }}
      />
      <div
        className="fixed"
        style={{
          width: "753px",
          height: "533px",
          left: "50%",
          bottom: "0px",
          transform: "translateX(-50%)",
          backgroundColor: "rgba(255,135,253,0.9)",
          opacity: 0.4,
          borderRadius: "753px",
          filter: "blur(212px)",
          zIndex: -30,
        }}
      />

      {/* Render the children (which will be the DashboardContent) */}
      {children}
    </div>
  );
}
