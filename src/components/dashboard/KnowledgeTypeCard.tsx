import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface Collection {
  key: string;
  name: string;
  icon: string;
  sidebarIcon: React.ComponentType<{
    fill?: string;
    className?: string;
    width?: number;
    height?: number;
  }>;
}

interface KnowledgeTypeCardProps {
  collection: Collection;
  onClick: (key: string) => void;
}

const springValues = {
  damping: 30,
  stiffness: 100,
  mass: 2,
};

const KnowledgeTypeCard: React.FC<KnowledgeTypeCardProps> = ({
  collection,
  onClick,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useSpring(useMotionValue(0), springValues);
  const rotateY = useSpring(useMotionValue(0), springValues);
  const scale = useSpring(1, springValues);

  function handleMouse(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;
    const rotationX = (offsetY / (rect.height / 2)) * -12; // amplitude
    const rotationY = (offsetX / (rect.width / 2)) * 12;
    rotateX.set(rotationX);
    rotateY.set(rotationY);
  }
  function handleMouseEnter() {
    scale.set(1.06);
  }
  function handleMouseLeave() {
    scale.set(1);
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <div
      ref={ref}
      onClick={() => onClick(collection.key)}
      onMouseMove={handleMouse}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group cursor-pointer transition-all duration-300 relative"
      style={{ perspective: 1000 }}
    >
      <motion.div
        style={{ rotateX, rotateY, scale, willChange: "transform" }}
        className="rounded-2xl p-6 border border-[#e1f4ea]/70 dark:border-[#013828]/50 bg-white/50 dark:bg-transparent hover:border-[#00bf6f]/30 hover:shadow-lg"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#f0f9f5] dark:bg-[#012920] text-[#00bf6f]">
            <collection.sidebarIcon fill="#00bf6f" className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              {collection.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Access {collection.name.toLowerCase()} data
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Click to explore
          </span>
          <div className="w-6 h-6 flex items-center justify-center rounded-full bg-[#f0f9f5] dark:bg-[#012920] group-hover:bg-[#00bf6f] transition-colors">
            <svg
              className="w-4 h-4 text-[#00bf6f] group-hover:text-white transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default KnowledgeTypeCard;
