import React from "react";
import { SystemNode, CardPosition } from "./types";

interface SystemCardProps {
  node: SystemNode;
  position: CardPosition;
  isActive: boolean;
  isDragging: boolean;
  onMouseDown: (e: React.MouseEvent, nodeId: string) => void;
  onMouseEnter: (nodeId: string) => void;
  onMouseLeave: () => void;
}

export const SystemCard: React.FC<SystemCardProps> = ({
  node,
  position,
  isActive,
  isDragging,
  onMouseDown,
  onMouseEnter,
  onMouseLeave,
}) => {
  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        zIndex: isDragging ? 1000 : 10,
        transition: isDragging ? "none" : "all 0.3s ease-out",
      }}
      onMouseEnter={() => onMouseEnter(node.id)}
      onMouseLeave={onMouseLeave}
    >
      <div
        className={`relative group cursor-grab active:cursor-grabbing transition-all duration-300 ${
          isActive || isDragging ? "scale-105" : "hover:scale-105"
        } ${isDragging ? "z-50 shadow-2xl" : ""}`}
        onMouseDown={(e) => onMouseDown(e, node.id)}
        style={{
          cursor: isDragging ? "grabbing" : "grab",
          filter: isActive || isDragging ? "drop-shadow(0 0 30px rgba(16, 185, 129, 0.6))" : undefined,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.filter = "drop-shadow(0 0 40px rgba(16, 185, 129, 0.8))";
        }}
        onMouseLeave={(e) => {
          if (!isActive && !isDragging) {
            e.currentTarget.style.filter = "";
          }
        }}
      >
        {/* Glass Card - Exact API Connect Design */}
        <div
          className={`relative overflow-hidden ${
            isDragging ? "shadow-2xl shadow-emerald-500/20" : ""
          }`}
          style={{
            width: "371.2px",
            height: "200px",
            borderRadius: "25.6px",
            background: "rgba(255, 255, 255, 0.03)",
            border: "1.2px solid transparent",
            backgroundImage: "linear-gradient(158.39deg, rgba(255, 255, 255, 0.06) 14.19%, rgba(255, 255, 255, 0.000015) 50.59%, rgba(255, 255, 255, 0.000015) 68.79%, rgba(255, 255, 255, 0.015) 105.18%)",
            backgroundOrigin: "border-box",
            backgroundClip: "padding-box, border-box",
            padding: "12.8px",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          {/* Animated glow dots in corners */}
          <div className="absolute top-4 left-4 w-1 h-1 bg-emerald-400 rounded-full animate-pulse opacity-60" 
               style={{ boxShadow: "0 0 8px #10b981" }} />
          <div className="absolute top-8 left-2 w-0.5 h-0.5 bg-emerald-300 rounded-full animate-pulse opacity-40" 
               style={{ boxShadow: "0 0 4px #6ee7b7" }} />
          <div className="absolute bottom-12 left-6 w-0.5 h-0.5 bg-emerald-400 rounded-full animate-pulse opacity-50" 
               style={{ boxShadow: "0 0 6px #10b981" }} />
          <div className="absolute bottom-4 left-2 w-1 h-1 bg-emerald-300 rounded-full animate-pulse opacity-30" 
               style={{ boxShadow: "0 0 8px #6ee7b7" }} />

          {/* Main content layout */}
          <div className="relative z-10 h-full flex items-center gap-6">
            {/* Left side - Circular icon area */}
            <div className="flex-shrink-0">
              {/* Outer glow ring */}
              <div 
                className="relative w-24 h-24 rounded-full border border-emerald-400/30"
                style={{
                  background: "radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)",
                  boxShadow: "0 0 20px rgba(16, 185, 129, 0.2), inset 0 0 20px rgba(16, 185, 129, 0.1)"
                }}
              >
                {/* Inner icon container */}
                <div className="absolute inset-2 rounded-full bg-emerald-600 flex items-center justify-center"
                     style={{
                       background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                       boxShadow: "0 0 15px rgba(16, 185, 129, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.1)"
                     }}>
                  {/* API text */}
                  <span className="text-white font-bold text-sm tracking-wide">API</span>
                  
                  {/* Gear icon on top */}
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-emerald-300">
                      <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5a3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97c0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1c0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66Z" fill="currentColor"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Text content */}
            <div className="flex-1">
              <h2 className="text-white text-2xl font-semibold mb-3 tracking-wide">
                API Connect
              </h2>
              <p className="text-gray-300 text-base leading-relaxed">
                Automate refund<br />
                processes with<br />
                configurable policy<br />
                enforcement.
              </p>
            </div>
          </div>

          {/* Drag indicator */}
          {isDragging && (
            <div className="absolute top-3 right-3 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" 
                 style={{ boxShadow: "0 0 8px #10b981" }} />
          )}

          {/* Hover glow effect */}
          <div
            className={`absolute inset-0 rounded-[25.6px] transition-all duration-500 pointer-events-none ${
              isDragging || isActive ? "opacity-30" : "opacity-0 group-hover:opacity-20"
            }`}
            style={{
              background: "radial-gradient(circle at 30% 50%, rgba(16, 185, 129, 0.2) 0%, transparent 70%)",
            }}
          />
        </div>
      </div>
    </div>
  );
};
