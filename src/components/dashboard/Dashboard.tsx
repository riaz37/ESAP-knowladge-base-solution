import React, { useRef, useState, useEffect } from "react";
import { BrainModel } from "../3d/BrainModel";
import { SystemCard } from "./SystemCard";
import { HeroContent } from "./HeroContent";
import { BackgroundEffects } from "./BackgroundEffects";
import { AnimationStyles } from "./AnimationStyles";
import { useDragAndDrop } from "./hooks/useDragAndDrop";
import { useThreeScene } from "./hooks/useThreeScene";
import { SYSTEM_NODES, INITIAL_CARD_POSITIONS } from "./constants";

const Dashboard: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeNode, setActiveNode] = useState<string | null>(null);

  // Use custom hooks for drag and drop functionality
  const { cardPositions, dragging, handleMouseDown } = useDragAndDrop({
    initialPositions: INITIAL_CARD_POSITIONS,
    containerRef: mountRef,
  });

  // Use custom hook for Three.js scene management
  const { updateConnections } = useThreeScene({
    mountRef,
    cardPositions,
  });

  // Update connections when positions change
  useEffect(() => {
    updateConnections();
  }, [cardPositions, updateConnections]);

  const handleNodeMouseEnter = (nodeId: string): void => {
    if (!dragging) {
      setActiveNode(nodeId);
    }
  };

  const handleNodeMouseLeave = (): void => {
    if (!dragging) {
      setActiveNode(null);
    }
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-emerald-950 via-green-950 to-teal-950 overflow-hidden">
      {/* 3D Scene */}
      <div ref={mountRef} className="absolute inset-0" />

      {/* 3D Brain Model - Interactive */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="w-96 h-96">
          <BrainModel
            color="#10b981"
            emissiveIntensity={0.2}
            enableControls={true}
          />
        </div>
      </div>

      {/* Overlay Content */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full text-white px-4 pointer-events-none">
        {/* System Cards - Now draggable */}
        <div className="absolute inset-0 pointer-events-none">
          {SYSTEM_NODES.map((node, index) => (
            <SystemCard
              key={node.id}
              node={node}
              position={cardPositions[index]}
              isActive={activeNode === node.id}
              isDragging={dragging === node.id}
              onMouseDown={handleMouseDown}
              onMouseEnter={handleNodeMouseEnter}
              onMouseLeave={handleNodeMouseLeave}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
