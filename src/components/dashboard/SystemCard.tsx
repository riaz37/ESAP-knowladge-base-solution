import React from 'react';
import { SystemNode, CardPosition } from './types';
import { NeonIcon } from './NeonIcon';

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
        transition: isDragging ? 'none' : 'all 0.3s ease-out',
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
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      >
        {/* Glass Morphism Card */}
        <div className={`w-48 h-36 rounded-xl relative overflow-hidden ${
          isDragging ? 'shadow-2xl shadow-emerald-500/20' : ''
        }`}>
          {/* Background glass layer */}
          <div className={`absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl rounded-xl border border-white/20 shadow-2xl ${
            isDragging ? 'border-emerald-400/50 shadow-emerald-500/30' : ''
          }`} />
          
          {/* Animated border glow */}
          <div 
            className={`absolute inset-0 rounded-xl transition-all duration-500 ${
              isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
            style={{
              background: `linear-gradient(45deg, ${node.color}40, transparent, ${node.color}40)`,
              backgroundSize: '400% 400%',
              animation: (isActive || isDragging) ? 'borderGlow 2s ease infinite' : 'none',
            }}
          />
          
          {/* Inner glow effect */}
          <div
            className={`absolute inset-[1px] rounded-xl bg-gradient-to-br from-black/20 via-black/30 to-black/40 backdrop-blur-sm ${
              isDragging ? 'from-black/10 via-black/20 to-black/30' : ''
            }`}
          />
          
          {/* Shimmer effect */}
          <div className={`absolute inset-0 rounded-xl transition-opacity duration-700 ${
            isDragging ? 'opacity-50' : 'opacity-0 group-hover:opacity-30'
          }`}>
            <div 
              className="absolute inset-0 rounded-xl"
              style={{
                background: `linear-gradient(135deg, transparent 0%, ${node.color}20 50%, transparent 100%)`,
                transform: 'translateX(-100%)',
                animation: 'shimmer 2s ease-in-out infinite',
              }}
            />
          </div>

          {/* Corner highlights */}
          <div className="absolute top-0 left-0 w-8 h-8 bg-gradient-to-br from-white/30 to-transparent rounded-xl opacity-60" />
          <div className="absolute bottom-0 right-0 w-6 h-6 bg-gradient-to-tl from-white/20 to-transparent rounded-xl opacity-40" />

          {/* Drag indicator */}
          {isDragging && (
            <div className="absolute top-2 right-2 w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50" />
          )}

          {/* Content */}
          <div className="relative z-20 p-5 h-full flex flex-col justify-between">
            {/* Icon and status */}
            <div className="flex items-center justify-between">
              <div className={`transform transition-transform duration-300 ${
                isDragging ? 'scale-110' : 'group-hover:scale-110'
              }`}>
                <NeonIcon type={node.icon} color={node.color} />
              </div>
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isDragging ? 'animate-pulse' : 'animate-pulse'
                  }`}
                  style={{ 
                    backgroundColor: node.color,
                    boxShadow: `0 0 12px ${node.color}80, 0 0 24px ${node.color}40`
                  }}
                />
                <div className="text-[10px] text-emerald-300/80 font-light">
                  {isDragging ? 'MOVING' : 'LIVE'}
                </div>
              </div>
            </div>

            {/* Title and description */}
            <div>
              <h3 className={`text-white font-medium text-base mb-2 transition-colors duration-300 ${
                isDragging ? 'text-emerald-100' : 'group-hover:text-emerald-100'
              }`}>
                {node.label}
              </h3>
              <div className="flex items-center gap-2 text-xs text-emerald-300/70">
                <div 
                  className="w-1 h-1 rounded-full animate-pulse" 
                  style={{ 
                    backgroundColor: node.color,
                    boxShadow: `0 0 4px ${node.color}`
                  }}
                />
                {isDragging ? 'Repositioning...' : 'System Active'}
              </div>
            </div>
          </div>

          {/* Border highlight on hover */}
          <div 
            className={`absolute inset-0 rounded-xl transition-all duration-500 pointer-events-none ${
              isDragging ? 'opacity-80' : 'opacity-0 group-hover:opacity-60'
            }`}
            style={{
              background: `linear-gradient(90deg, transparent, ${node.color}40, transparent)`,
              backgroundSize: '200% 100%',
              animation: (isActive || isDragging) ? 'borderSweep 3s ease infinite' : 'none',
            }}
          />
        </div>
      </div>
    </div>
  );
};