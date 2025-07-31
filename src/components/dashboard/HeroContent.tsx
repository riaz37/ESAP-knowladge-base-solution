import React from 'react';

export const HeroContent: React.FC = () => {
  return (
    <>
      {/* Header */}
      <div className="absolute top-16 left-1/2 transform -translate-x-1/2 text-center pointer-events-none z-30">
        <h1 className="text-4xl md:text-6xl font-light mb-6 text-white">
          Neural Knowledge Hub
        </h1>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto font-light">
          Intelligent data ecosystem powered by AI - <span className="text-emerald-300">Drag nodes to rearrange</span>
        </p>
      </div>

      {/* Bottom Features */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-center pointer-events-none z-30">
        <div className="flex flex-wrap justify-center gap-8 text-sm text-emerald-200/80 mb-10">
          {[
            'Real-time Processing',
            'AI Insights',
            'Seamless Integration',
            'Draggable Nodes'
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-3 bg-emerald-950/30 px-4 py-2 rounded-full backdrop-blur-md border border-emerald-500/20">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50" />
              {feature}
            </div>
          ))}
        </div>

        {/* Enhanced CTA */}
        <div className="pointer-events-auto">
          <button className="relative group bg-gradient-to-r from-emerald-600/20 via-emerald-500/20 to-emerald-600/20 hover:from-emerald-500/30 hover:via-emerald-400/30 hover:to-emerald-500/30 border border-emerald-400/30 hover:border-emerald-300/50 px-10 py-4 rounded-xl font-light text-lg transition-all duration-500 backdrop-blur-md overflow-hidden">
            {/* Button glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 to-emerald-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className="relative z-10 text-emerald-100 group-hover:text-white transition-colors duration-300">Enter Neural Hub</span>
            
            {/* Button shimmer */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </div>
          </button>
        </div>
      </div>
    </>
  );
};