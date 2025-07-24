import React from "react";

const AuroraBackground: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  return (
    <div
      className={`absolute inset-0 pointer-events-none z-0 ${className}`}
      aria-hidden="true"
    >
      <div className="aurora-blur-animation w-full h-full" />
      <style jsx>{`
        .aurora-blur-animation {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 1.5rem;
          background: radial-gradient(
              ellipse 80% 60% at 60% 40%,
              rgba(91, 228, 155, 0.18) 0%,
              rgba(0, 191, 111, 0.12) 60%,
              transparent 100%
            ),
            radial-gradient(
              ellipse 60% 40% at 30% 70%,
              rgba(0, 191, 111, 0.1) 0%,
              transparent 100%
            );
          filter: blur(18px) brightness(1.2);
          opacity: 0.85;
          animation: auroraMove 7s ease-in-out infinite alternate;
        }
        @keyframes auroraMove {
          0% {
            transform: scale(1) translateY(0px) translateX(0px);
            opacity: 0.85;
          }
          50% {
            transform: scale(1.08) translateY(-10px) translateX(8px);
            opacity: 1;
          }
          100% {
            transform: scale(1) translateY(0px) translateX(0px);
            opacity: 0.85;
          }
        }
        :global(.dark) .aurora-blur-animation {
          background: radial-gradient(
              ellipse 80% 60% at 60% 40%,
              rgba(91, 228, 155, 0.22) 0%,
              rgba(0, 191, 111, 0.13) 60%,
              transparent 100%
            ),
            radial-gradient(
              ellipse 60% 40% at 30% 70%,
              rgba(0, 191, 111, 0.13) 0%,
              transparent 100%
            );
          filter: blur(22px) brightness(1.3);
        }
      `}</style>
    </div>
  );
};

export default AuroraBackground;
