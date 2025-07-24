import React from "react";

interface ShimmerProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number | string;
  style?: React.CSSProperties;
  className?: string;
}

export const Shimmer: React.FC<ShimmerProps> = ({
  width = "100%",
  height = 180,
  borderRadius = 16,
  style = {},
  className = "",
}) => (
  <div
    className={className}
    style={{
      width,
      height,
      borderRadius,
      background: "#232435",
      position: "relative",
      overflow: "hidden",
      ...style,
    }}
  >
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background:
          "linear-gradient(90deg, rgba(35,36,53,0.8) 0%, rgba(90,90,120,0.18) 50%, rgba(35,36,53,0.8) 100%)",
        animation: "shimmer 1.5s infinite linear",
        zIndex: 1,
      }}
    />
    <style>{`
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      div[style*='animation: shimmer'] {
        background-size: 200% 100%;
      }
    `}</style>
  </div>
);

export default Shimmer;
