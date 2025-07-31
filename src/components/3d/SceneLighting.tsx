import React from 'react';

interface SceneLightingProps {
  color: string;
}

export const SceneLighting: React.FC<SceneLightingProps> = ({ color }) => (
  <>
    <ambientLight intensity={0.4} color="#404040" />
    <directionalLight
      position={[5, 5, 5]}
      intensity={0.6}
      castShadow
    />
    <pointLight
      position={[0, 0, 0]}
      intensity={0.8}
      color={color}
      distance={15}
    />
  </>
);