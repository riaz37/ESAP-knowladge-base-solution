"use client";
import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import * as THREE from 'three';

interface BrainMeshProps {
  color?: string;
  emissiveIntensity?: number;
}

const BrainMesh: React.FC<BrainMeshProps> = ({
  color = "#10b981",
  emissiveIntensity = 0.1
}) => {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Use React Three Fiber's useLoader hook for better integration
  const brainObject = useLoader(OBJLoader, '/obj/freesurff.Obj');
  const texture = useTexture('/obj/brain.jpg');

  // Animate the brain rotation with interactive effects
  useFrame((state) => {
    if (meshRef.current) {
      // Slower rotation when hovered to allow better inspection
      const rotationSpeed = hovered ? 0.002 : 0.005;
      meshRef.current.rotation.y += rotationSpeed;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;

      // Subtle pulsing effect when hovered
      if (hovered) {
        const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.02;
        meshRef.current.scale.setScalar(scale);
      } else {
        meshRef.current.scale.setScalar(1);
      }
    }
  });

  // Clone and prepare the brain object
  const brainClone = brainObject.clone();

  // Apply materials to all meshes in the object with interactive properties
  brainClone.traverse((child: THREE.Object3D) => {
    if (child instanceof THREE.Mesh) {
      child.material = new THREE.MeshPhongMaterial({
        map: texture,
        color: color,
        transparent: true,
        opacity: hovered ? 1.0 : 0.9,
        emissive: color,
        emissiveIntensity: hovered ? emissiveIntensity * 1.5 : emissiveIntensity,
        shininess: hovered ? 150 : 100,
      });
    }
  });

  // Create wireframe version
  const wireframeClone = brainObject.clone();
  wireframeClone.traverse((child: THREE.Object3D) => {
    if (child instanceof THREE.Mesh) {
      child.material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.2,
        wireframe: true,
      });
    }
  });

  return (
    <group
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <primitive object={brainClone} scale={[1, 1, 1]} />
      <primitive object={wireframeClone} scale={[1.02, 1.02, 1.02]} />
    </group>
  );
};

interface BrainModelProps {
  className?: string;
  color?: string;
  emissiveIntensity?: number;
  enableControls?: boolean;
}

// Loading fallback component
const LoadingFallback = ({ color }: { color: string }) => (
  <mesh>
    <sphereGeometry args={[1, 32, 32]} />
    <meshPhongMaterial
      color={color}
      transparent
      opacity={0.4}
      emissive={color}
      emissiveIntensity={0.1}
    />
  </mesh>
);

export const BrainModel: React.FC<BrainModelProps> = ({
  className = "",
  color = "#10b981",
  emissiveIntensity = 0.1,
  enableControls = false
}) => {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{
          background: 'transparent',
          cursor: enableControls ? 'grab' : 'default'
        }}
        onPointerDown={(e) => {
          if (enableControls) {
            e.currentTarget.style.cursor = 'grabbing';
          }
        }}
        onPointerUp={(e) => {
          if (enableControls) {
            e.currentTarget.style.cursor = 'grab';
          }
        }}
      >
        {/* Lighting setup similar to the original */}
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

        {/* Brain model with Suspense */}
        <Suspense fallback={<LoadingFallback color={color} />}>
          <BrainMesh color={color} emissiveIntensity={emissiveIntensity} />
        </Suspense>

        {/* Interactive orbit controls */}
        {enableControls && (
          <OrbitControls
            minDistance={3}
            maxDistance={20}
            rotateSpeed={1.0}
            zoomSpeed={0.8}
            panSpeed={0.5}
            maxPolarAngle={Math.PI}
            minPolarAngle={0}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            autoRotate={false}
            dampingFactor={0.05}
            enableDamping={true}
          />
        )}
      </Canvas>
    </div>
  );
};

export default BrainModel;
