//@ts-ignore
import React, { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from "three";

// Type definitions
interface SystemNode {
  id: string;
  label: string;
  position: [number, number, number];
  color: string;
  icon: string;
}

interface CardPosition {
  x: number;
  y: number;
}

interface ParticleUserData {
  originalPos: THREE.Vector3;
  orbitSpeed: number;
  angle: number;
}

interface PulseUserData {
  startPos: THREE.Vector3;
  endPos: THREE.Vector3;
  progress: number;
  speed: number;
}

interface NodeGroupUserData extends SystemNode {}

// Extended THREE.js types for userData
interface ExtendedObject3D extends THREE.Object3D {
  userData:
    | ParticleUserData
    | PulseUserData
    | NodeGroupUserData
    | Record<string, any>;
}

interface ExtendedMesh extends THREE.Mesh {
  userData: ParticleUserData | PulseUserData | Record<string, any>;
}

interface ExtendedGroup extends THREE.Group {
  userData: NodeGroupUserData;
}

// Neon SVG Icons
const NeonIcon: React.FC<{ type: string; color: string }> = ({ type, color }) => {
  const getIcon = () => {
    switch (type) {
      case "upload":
        return (
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        );
      case "files":
        return (
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
        );
      case "api":
        return (
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
          </svg>
        );
      case "query":
        return (
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
        );
      case "reports":
        return (
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
            <line x1="18" y1="20" x2="18" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
        );
      case "control":
        return (
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        );
      default:
        return (
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
          </svg>
        );
    }
  };

  return (
    <div 
      className="filter drop-shadow-lg"
      style={{
        filter: `drop-shadow(0 0 8px ${color}40) drop-shadow(0 0 16px ${color}20)`
      }}
    >
      {getIcon()}
    </div>
  );
};

const KnowledgebaseHero: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const animationRef = useRef<number | null>(null);
  const connectionsRef = useRef<THREE.Line[]>([]);
  const particlesRef = useRef<any[]>([]);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const systemNodes: SystemNode[] = [
    {
      id: "upload",
      label: "Upload Data",
      position: [3, 1.5, 0],
      color: "#10b981",
      icon: "upload",
    },
    {
      id: "files",
      label: "File Manager",
      position: [-3, 1.5, 0],
      color: "#059669",
      icon: "files",
    },
    {
      id: "api",
      label: "API Connect",
      position: [2.5, -1.5, 1.5],
      color: "#34d399",
      icon: "api",
    },
    {
      id: "query",
      label: "Smart Query",
      position: [-2.5, -1.5, 1.5],
      color: "#6ee7b7",
      icon: "query",
    },
    {
      id: "reports",
      label: "Generate Reports",
      position: [0, 2.5, -1.5],
      color: "#22c55e",
      icon: "reports",
    },
    {
      id: "control",
      label: "System Control",
      position: [0, -2.5, -1.5],
      color: "#16a34a",
      icon: "control",
    },
  ];

  // Initialize card positions from system nodes
  const [cardPositions, setCardPositions] = useState<CardPosition[]>(() => 
    systemNodes.map((node, index) => {
      // Convert 3D positions to initial screen positions
      const basePositions = [
        { x: 15, y: 25 },
        { x: 85, y: 25 },
        { x: 15, y: 50 },
        { x: 85, y: 50 },
        { x: 15, y: 75 },
        { x: 85, y: 75 },
      ];
      return basePositions[index];
    })
  );

  // Function to update connections smoothly
  const updateConnections = useCallback(() => {
    if (!sceneRef.current) return;

    connectionsRef.current.forEach((connection, index) => {
      const cardPos = cardPositions[index];
      const nodeData = systemNodes[index];
      
      // Convert screen coordinates to 3D world coordinates
      const worldX = ((cardPos.x - 50) / 50) * 6;
      const worldY = -((cardPos.y - 50) / 50) * 4;
      const worldZ = 2;
      
      // Create new curved connection
      const startPoint = new THREE.Vector3(0, 0, 0);
      const endPoint = new THREE.Vector3(worldX, worldY, worldZ);
      const midPoint = new THREE.Vector3(
        worldX * 0.5,
        worldY * 0.5 + 1,
        worldZ * 0.5
      );
      
      const curve = new THREE.QuadraticBezierCurve3(startPoint, midPoint, endPoint);
      const points = curve.getPoints(50);
      
      // Update connection geometry
      const newGeometry = new THREE.BufferGeometry().setFromPoints(points);
      connection.geometry.dispose();
      connection.geometry = newGeometry;
      
      // Update particles along this connection
      const connectionParticles = particlesRef.current.filter(p => p && p.connectionIndex === index);
      connectionParticles.forEach((particleObj) => {
        if (particleObj && particleObj.mesh && particleObj.mesh.userData) {
          particleObj.curve = curve;
          particleObj.startPos = startPoint.clone();
          particleObj.endPos = endPoint.clone();
          // Also update the mesh userData
          particleObj.mesh.userData.curve = curve;
          particleObj.mesh.userData.startPos = startPoint.clone();
          particleObj.mesh.userData.endPos = endPoint.clone();
        }
      });
    });
  }, [cardPositions]);

  // Mouse event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.preventDefault();
    setDragging(nodeId);
    
    const rect = e.currentTarget.getBoundingClientRect();
    const containerRect = mountRef.current?.getBoundingClientRect();
    if (!containerRect) return;
    
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;
    setDragOffset({ x: offsetX, y: offsetY });
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging || !mountRef.current) return;
    
    const containerRect = mountRef.current.getBoundingClientRect();
    const nodeIndex = systemNodes.findIndex(node => node.id === dragging);
    if (nodeIndex === -1) return;
    
    // Calculate new position relative to container
    const newX = ((e.clientX - containerRect.left - dragOffset.x) / containerRect.width) * 100;
    const newY = ((e.clientY - containerRect.top - dragOffset.y) / containerRect.height) * 100;
    
    // Constrain to container bounds
    const constrainedX = Math.max(5, Math.min(95, newX));
    const constrainedY = Math.max(5, Math.min(95, newY));
    
    setCardPositions(prev => {
      const newPositions = [...prev];
      newPositions[nodeIndex] = { x: constrainedX, y: constrainedY };
      return newPositions;
    });
  }, [dragging, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setDragging(null);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  // Effect for drag event listeners
  useEffect(() => {
    if (dragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [dragging, handleMouseMove, handleMouseUp]);

  // Update connections when positions change
  useEffect(() => {
    updateConnections();
  }, [cardPositions, updateConnections]);

  useEffect(() => {
    if (!mountRef.current) return;

    // Clear any existing content
    mountRef.current.innerHTML = "";

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a0a0a, 15, 35);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    // Get actual container dimensions
    const containerWidth = mountRef.current.clientWidth || window.innerWidth;
    const containerHeight = mountRef.current.clientHeight || window.innerHeight;

    renderer.setSize(containerWidth, containerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Update camera aspect ratio
    camera.aspect = containerWidth / containerHeight;
    camera.updateProjectionMatrix();

    mountRef.current.appendChild(renderer.domElement);

    // Minimal lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Single point light for neon effect
    const pointLight = new THREE.PointLight(0x10b981, 0.8, 15);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    // Create simple central sphere
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Main central sphere - minimalist
    const globeGeometry = new THREE.SphereGeometry(1, 32, 32);
    const globeMaterial = new THREE.MeshPhongMaterial({
      color: 0x0a1a1a,
      shininess: 100,
      transparent: true,
      opacity: 0.8,
      emissive: 0x10b981,
      emissiveIntensity: 0.1,
    });

    const mainGlobe = new THREE.Mesh(globeGeometry, globeMaterial);
    globeGroup.add(mainGlobe);

    // Simple wireframe overlay
    const wireframeGeometry = new THREE.SphereGeometry(1.02, 16, 16);
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.3,
      wireframe: true,
    });
    const wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
    globeGroup.add(wireframe);

    // Create connection lines from center to card positions
    const connections: THREE.Line[] = [];
    const particles: any[] = [];

    systemNodes.forEach((nodeData: SystemNode, index: number) => {
      const cardPos = cardPositions[index];
      
      // Convert screen coordinates to 3D world coordinates
      const worldX = ((cardPos.x - 50) / 50) * 6;
      const worldY = -((cardPos.y - 50) / 50) * 4;
      const worldZ = 2;
      
      // Create curved connection line from center to card area
      const startPoint = new THREE.Vector3(0, 0, 0);
      const endPoint = new THREE.Vector3(worldX, worldY, worldZ);
      const midPoint = new THREE.Vector3(
        worldX * 0.5,
        worldY * 0.5 + 1,
        worldZ * 0.5
      );
      
      // Create smooth curve
      const curve = new THREE.QuadraticBezierCurve3(startPoint, midPoint, endPoint);
      const points = curve.getPoints(50);
      
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const lineMaterial = new THREE.LineBasicMaterial({
        color: nodeData.color,
        transparent: true,
        opacity: 0.6,
        linewidth: 2,
      });
      
      const connectionLine = new THREE.Line(lineGeometry, lineMaterial);
      scene.add(connectionLine);
      connections.push(connectionLine);
      
      // Add glowing particles along the connection
      const particleGeometry = new THREE.SphereGeometry(0.02, 8, 8);
      const particleMaterial = new THREE.MeshBasicMaterial({
        color: nodeData.color,
        transparent: true,
        opacity: 0.8,
      });
      
      // Create multiple particles along the curve
      for (let i = 0; i < 5; i++) {
        const particle = new THREE.Mesh(particleGeometry, particleMaterial.clone()) as ExtendedMesh;
        const t = i / 4; // Position along curve (0 to 1)
        const particlePos = curve.getPoint(t);
        particle.position.copy(particlePos);
        
        const particleData = {
          startPos: startPoint.clone(),
          endPos: endPoint.clone(),
          progress: t,
          speed: 0.005 + Math.random() * 0.003,
          curve: curve,
          connectionIndex: index,
        };
        
        particle.userData = particleData;
        
        // Store particle object with mesh reference and data
        const particleObj = {
          mesh: particle,
          startPos: startPoint.clone(),
          endPos: endPoint.clone(),
          progress: t,
          speed: 0.005 + Math.random() * 0.003,
          curve: curve,
          connectionIndex: index,
        };
        
        particles.push(particleObj);
        
        scene.add(particle);
      }
    });

    connectionsRef.current = connections;
    particlesRef.current = particles;

    // Camera positioning
    camera.position.set(0, 0, 8);
    camera.lookAt(0, 0, 0);

    // Animation loop
    let isAnimating = true;
    const animate = (): void => {
      if (!isAnimating) return;

      animationRef.current = requestAnimationFrame(animate);

      // Very subtle globe rotation
      if (globeGroup) {
        globeGroup.rotation.y += 0.002;
      }

      // Animate connection particles
      particlesRef.current.forEach(particleObj => {
        if (!particleObj || !particleObj.mesh) return;
        
        const particle = particleObj.mesh;
        
        // Update progress
        particleObj.progress += particleObj.speed;
        if (particleObj.progress > 1) particleObj.progress = 0;
        
        // Update position if curve exists
        if (particleObj.curve) {
          try {
            const newPos = particleObj.curve.getPoint(particleObj.progress);
            particle.position.copy(newPos);
            
            // Pulsing effect
            const pulse = Math.sin(particleObj.progress * Math.PI * 2);
            particle.scale.setScalar(0.5 + pulse * 0.5);
            
            const mesh = particle as THREE.Mesh;
            if (mesh.material && 'opacity' in mesh.material) {
              (mesh.material as THREE.Material & { opacity: number }).opacity = 
                0.3 + pulse * 0.5;
            }
          } catch (error) {
            console.warn('Error updating particle position:', error);
          }
        }
      });

      // Animate connection lines with subtle pulsing
      connections.forEach((line, index) => {
        const material = line.material as THREE.LineBasicMaterial;
        material.opacity = 0.4 + Math.sin(Date.now() * 0.001 + index) * 0.2;
      });

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = (): void => {
      if (!mountRef.current) return;

      const containerWidth = mountRef.current.clientWidth || window.innerWidth;
      const containerHeight = mountRef.current.clientHeight || window.innerHeight;

      camera.aspect = containerWidth / containerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerWidth, containerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      isAnimating = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener("resize", handleResize);
      if (
        mountRef.current &&
        renderer.domElement &&
        mountRef.current.contains(renderer.domElement)
      ) {
        mountRef.current.removeChild(renderer.domElement);
      }
      scene.clear();
      renderer.dispose();
      renderer.forceContextLoss();
    };
  }, []);

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

      {/* Overlay Content */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full text-white px-4 pointer-events-none">
        {/* Header */}
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 text-center pointer-events-none z-30">
          <h1 className="text-4xl md:text-6xl font-light mb-6 text-white">
            Neural Knowledge Hub
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto font-light">
            Intelligent data ecosystem powered by AI - <span className="text-emerald-300">Drag nodes to rearrange</span>
          </p>
        </div>

        {/* System Cards - Now draggable */}
        <div className="absolute inset-0 pointer-events-none">
          {systemNodes.map((node: SystemNode, index: number) => {
            const position: CardPosition = cardPositions[index];
            const isDragging = dragging === node.id;

            return (
              <div
                key={node.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                style={{
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                  zIndex: isDragging ? 1000 : 10,
                  transition: isDragging ? 'none' : 'all 0.3s ease-out',
                }}
                onMouseEnter={() => handleNodeMouseEnter(node.id)}
                onMouseLeave={handleNodeMouseLeave}
              >
                <div
                  className={`relative group cursor-grab active:cursor-grabbing transition-all duration-300 ${
                    activeNode === node.id || isDragging ? "scale-105" : "hover:scale-105"
                  } ${isDragging ? "z-50 shadow-2xl" : ""}`}
                  onMouseDown={(e) => handleMouseDown(e, node.id)}
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
                    
                    {/* Animated border glow - enhanced when dragging */}
                    <div 
                      className={`absolute inset-0 rounded-xl transition-all duration-500 ${
                        isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                      style={{
                        background: `linear-gradient(45deg, ${node.color}40, transparent, ${node.color}40)`,
                        backgroundSize: '400% 400%',
                        animation: (activeNode === node.id || isDragging) ? 'borderGlow 2s ease infinite' : 'none',
                      }}
                    />
                    
                    {/* Inner glow effect */}
                    <div
                      className={`absolute inset-[1px] rounded-xl bg-gradient-to-br from-black/20 via-black/30 to-black/40 backdrop-blur-sm ${
                        isDragging ? 'from-black/10 via-black/20 to-black/30' : ''
                      }`}
                    />
                    
                    {/* Shimmer effect - always active when dragging */}
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
                        animation: (activeNode === node.id || isDragging) ? 'borderSweep 3s ease infinite' : 'none',
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Features - Enhanced */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-center pointer-events-none z-30">
          <div className="flex flex-wrap justify-center gap-8 text-sm text-emerald-200/80 mb-10">
            <div className="flex items-center gap-3 bg-emerald-950/30 px-4 py-2 rounded-full backdrop-blur-md border border-emerald-500/20">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50" />
              Real-time Processing
            </div>
            <div className="flex items-center gap-3 bg-emerald-950/30 px-4 py-2 rounded-full backdrop-blur-md border border-emerald-500/20">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50" />
              AI Insights
            </div>
            <div className="flex items-center gap-3 bg-emerald-950/30 px-4 py-2 rounded-full backdrop-blur-md border border-emerald-500/20">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50" />
              Seamless Integration
            </div>
            <div className="flex items-center gap-3 bg-emerald-950/30 px-4 py-2 rounded-full backdrop-blur-md border border-emerald-500/20">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50" />
              Draggable Nodes
            </div>
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
      </div>

      {/* Enhanced gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/60 via-transparent to-emerald-950/30 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/20 via-transparent to-teal-950/20 pointer-events-none" />
      
      {/* Animated background particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i: number) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-emerald-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${4 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
              boxShadow: '0 0 6px currentColor',
            }}
          />
        ))}
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) translateX(0px); 
            opacity: 0.3;
          }
          50% { 
            transform: translateY(-20px) translateX(10px); 
            opacity: 0.8;
          }
        }
        
        @keyframes borderGlow {
          0%, 100% { 
            background-position: 0% 50%; 
          }
          50% { 
            background-position: 100% 50%; 
          }
        }
        
        @keyframes shimmer {
          0% { 
            transform: translateX(-100%); 
          }
          100% { 
            transform: translateX(100%); 
          }
        }
        
        @keyframes borderSweep {
          0%, 100% { 
            background-position: -200% 0; 
          }
          50% { 
            background-position: 200% 0; 
          }
        }
      `}</style>
    </div>
  );
};

export default KnowledgebaseHero;