"use client";
import React, { useRef, useState } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import * as THREE from 'three';
import { BrainMeshProps } from './types';

export const BrainMesh: React.FC<BrainMeshProps> = ({
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