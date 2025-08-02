import React from "react";

interface ConnectionLineProps {
  height?: string;
  showDot?: boolean;
  dotPosition?: "top" | "middle" | "bottom";
}

export function ConnectionLine({ 
  height = "h-16", 
  showDot = true, 
  dotPosition = "middle" 
}: ConnectionLineProps) {
  const getDotPositionClass = () => {
    switch (dotPosition) {
      case "top":
        return "top-2";
      case "bottom":
        return "bottom-2";
      default:
        return "top-8";
    }
  };

  return (
    <div className={`w-px ${height} bg-gradient-to-b from-green-400 to-transparent relative`}>
      {showDot && (
        <div className={`absolute ${getDotPositionClass()} w-2 h-2 bg-green-400 rounded-full -translate-x-0.5`} />
      )}
    </div>
  );
}