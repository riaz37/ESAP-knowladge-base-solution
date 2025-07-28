//@ts-ignore
import React, { useRef, useEffect, useState } from "react";
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

const KnowledgebaseHero: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const animationRef = useRef<number | null>(null);
  const [activeNode, setActiveNode] = useState<string | null>(null);

  const systemNodes: SystemNode[] = [
    {
      id: "upload",
      label: "Upload Data",
      position: [4, 2, 0],
      color: "#10b981",
      icon: "📊",
    },
    {
      id: "files",
      label: "File Manager",
      position: [-4, 2, 0],
      color: "#059669",
      icon: "📁",
    },
    {
      id: "api",
      label: "API Connect",
      position: [3, -2, 2],
      color: "#34d399",
      icon: "🔗",
    },
    {
      id: "query",
      label: "Smart Query",
      position: [-3, -2, 2],
      color: "#6ee7b7",
      icon: "🔍",
    },
    {
      id: "reports",
      label: "Generate Reports",
      position: [0, 3, -2],
      color: "#22c55e",
      icon: "📈",
    },
    {
      id: "control",
      label: "System Control",
      position: [0, -3, -2],
      color: "#16a34a",
      icon: "⚙️",
    },
  ];

  // Cards positioned with equal distance from center - perfectly balanced
  const cardPositions: CardPosition[] = [
    { x: 15, y: 25 }, // Left side - upper
    { x: 85, y: 25 }, // Right side - upper
    { x: 15, y: 50 }, // Left side - middle
    { x: 85, y: 50 }, // Right side - middle
    { x: 15, y: 75 }, // Left side - lower
    { x: 85, y: 75 }, // Right side - lower
  ];

  useEffect(() => {
    if (!mountRef.current) return;

    // Clear any existing content
    mountRef.current.innerHTML = "";

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a0a0a, 10, 50);
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

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(0x10b981, 1, 10);
    pointLight1.position.set(5, 0, 0);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x22c55e, 1, 10);
    pointLight2.position.set(-5, 0, 0);
    scene.add(pointLight2);

    // Create Modern Globe in Center
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Main globe sphere with Earth-like appearance
    const globeGeometry = new THREE.SphereGeometry(1.2, 64, 64);

    // Create earth-like texture with procedural patterns
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;
    const context = canvas.getContext("2d")!;

    // Create gradient for ocean/land
    const gradient = context.createLinearGradient(0, 0, 512, 256);
    gradient.addColorStop(0, "#0a4d68");
    gradient.addColorStop(0.3, "#0d7377");
    gradient.addColorStop(0.6, "#14a085");
    gradient.addColorStop(1, "#059669");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 512, 256);

    // Add landmass patterns
    context.fillStyle = "#065f46";
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 256;
      const size = 10 + Math.random() * 40;
      context.beginPath();
      context.arc(x, y, size, 0, Math.PI * 2);
      context.fill();
    }

    const earthTexture = new THREE.CanvasTexture(canvas);
    earthTexture.wrapS = THREE.RepeatWrapping;
    earthTexture.wrapT = THREE.RepeatWrapping;

    const globeMaterial = new THREE.MeshPhongMaterial({
      map: earthTexture,
      shininess: 100,
      transparent: true,
      opacity: 0.9,
      emissive: 0x001122,
      emissiveIntensity: 0.1,
    });

    const mainGlobe = new THREE.Mesh(globeGeometry, globeMaterial);
    globeGroup.add(mainGlobe);

    // Atmosphere glow
    const atmosphereGeometry = new THREE.SphereGeometry(1.35, 32, 32);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    globeGroup.add(atmosphere);

    // Data connection lines around globe
    const connectionGroup = new THREE.Group();
    globeGroup.add(connectionGroup);

    for (let i = 0; i < 25; i++) {
      const phi1 = Math.random() * Math.PI * 2;
      const theta1 = Math.random() * Math.PI;
      const phi2 = Math.random() * Math.PI * 2;
      const theta2 = Math.random() * Math.PI;

      const start = new THREE.Vector3(
        Math.sin(theta1) * Math.cos(phi1) * 1.25,
        Math.cos(theta1) * 1.25,
        Math.sin(theta1) * Math.sin(phi1) * 1.25
      );

      const end = new THREE.Vector3(
        Math.sin(theta2) * Math.cos(phi2) * 1.25,
        Math.cos(theta2) * 1.25,
        Math.sin(theta2) * Math.sin(phi2) * 1.25
      );

      // Create curved connection
      const curve = new THREE.QuadraticBezierCurve3(
        start,
        start.clone().add(end).multiplyScalar(0.7),
        end
      );

      const points = curve.getPoints(20);
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x34d399,
        transparent: true,
        opacity: 0.4,
        linewidth: 2,
      });
      const connection = new THREE.Line(lineGeometry, lineMaterial);
      connectionGroup.add(connection);
    }

    // Orbital rings around globe
    for (let i = 0; i < 3; i++) {
      const ringGeometry = new THREE.TorusGeometry(1.6 + i * 0.2, 0.01, 8, 32);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0.3 - i * 0.05,
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.random() * Math.PI;
      ring.rotation.y = Math.random() * Math.PI;
      ring.rotation.z = Math.random() * Math.PI;
      globeGroup.add(ring);
    }

    // Floating data nodes around globe
    const dataNodes: THREE.Mesh[] = [];
    for (let i = 0; i < 12; i++) {
      const nodeGeometry = new THREE.OctahedronGeometry(0.05, 1);
      const nodeMaterial = new THREE.MeshBasicMaterial({
        color: 0x22c55e,
        transparent: true,
        opacity: 0.8,
      });
      const dataNode = new THREE.Mesh(nodeGeometry, nodeMaterial);

      // Position randomly around globe
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.random() * Math.PI;
      const radius = 2.0 + Math.random() * 0.5;

      dataNode.position.set(
        Math.sin(theta) * Math.cos(phi) * radius,
        Math.cos(theta) * radius,
        Math.sin(theta) * Math.sin(phi) * radius
      );

      globeGroup.add(dataNode);
      dataNodes.push(dataNode);
    }

    // Create realistic 3D Brain (moved behind globe)
    const brainGroup = new THREE.Group();
    brainGroup.position.z = -3; // Move brain behind globe
    brainGroup.scale.setScalar(0.8); // Make slightly smaller
    scene.add(brainGroup);

    // Main brain hemisphere (left)
    const leftHemisphere = new THREE.SphereGeometry(1.0, 32, 32, 0, Math.PI);
    const brainMaterial = new THREE.MeshPhongMaterial({
      color: 0x059669,
      shininess: 60,
      transparent: true,
      opacity: 0.6, // More transparent to not compete with globe
      bumpScale: 0.1,
    });
    const leftBrain = new THREE.Mesh(leftHemisphere, brainMaterial);
    leftBrain.position.x = -0.1;
    brainGroup.add(leftBrain);

    // Right hemisphere
    const rightHemisphere = new THREE.SphereGeometry(
      1.0,
      32,
      32,
      Math.PI,
      Math.PI
    );
    const rightBrain = new THREE.Mesh(rightHemisphere, brainMaterial.clone());
    rightBrain.position.x = 0.1;
    brainGroup.add(rightBrain);

    // Brain stem
    const stemGeometry = new THREE.CylinderGeometry(0.2, 0.3, 0.8, 8);
    const stemMaterial = new THREE.MeshPhongMaterial({
      color: 0x047857,
      shininess: 40,
      transparent: true,
      opacity: 0.6,
    });
    const brainStem = new THREE.Mesh(stemGeometry, stemMaterial);
    brainStem.position.y = -0.8;
    brainGroup.add(brainStem);

    // Neural pathways - create realistic brain folds
    const createNeuralPath = (
      startPos: THREE.Vector3,
      endPos: THREE.Vector3,
      segments: number = 20
    ): THREE.Line => {
      const curve = new THREE.CatmullRomCurve3([
        startPos,
        new THREE.Vector3(
          startPos.x + (Math.random() - 0.5) * 0.5,
          startPos.y + (Math.random() - 0.5) * 0.5,
          startPos.z + (Math.random() - 0.5) * 0.5
        ),
        new THREE.Vector3(
          endPos.x + (Math.random() - 0.5) * 0.5,
          endPos.y + (Math.random() - 0.5) * 0.5,
          endPos.z + (Math.random() - 0.5) * 0.5
        ),
        endPos,
      ]);

      const points = curve.getPoints(segments);
      const pathGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const pathMaterial = new THREE.LineBasicMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0.4, // Reduced opacity
        linewidth: 2,
      });
      return new THREE.Line(pathGeometry, pathMaterial);
    };

    // Add multiple neural pathways across brain surface
    for (let i = 0; i < 15; i++) {
      const theta1: number = (i / 15) * Math.PI * 2;
      const phi1: number = Math.random() * Math.PI;
      const theta2: number = ((i + 1) / 15) * Math.PI * 2;
      const phi2: number = Math.random() * Math.PI;

      const start = new THREE.Vector3(
        Math.sin(phi1) * Math.cos(theta1) * 0.95,
        Math.cos(phi1) * 0.95,
        Math.sin(phi1) * Math.sin(theta1) * 0.95
      );

      const end = new THREE.Vector3(
        Math.sin(phi2) * Math.cos(theta2) * 0.95,
        Math.cos(phi2) * 0.95,
        Math.sin(phi2) * Math.sin(theta2) * 0.95
      );

      const neuralPath = createNeuralPath(start, end);
      brainGroup.add(neuralPath);
    }

    // Brain cortex detail with bumps and folds
    const cortexGeometry = new THREE.SphereGeometry(1.05, 64, 64);
    const cortexMaterial = new THREE.MeshPhongMaterial({
      color: 0x065f46,
      transparent: true,
      opacity: 0.2, // Reduced opacity
      wireframe: true,
    });
    const cortex = new THREE.Mesh(cortexGeometry, cortexMaterial);
    brainGroup.add(cortex);

    // Pulsing energy core
    const coreGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.6, // Reduced opacity
    });
    const energyCore = new THREE.Mesh(coreGeometry, coreMaterial);
    brainGroup.add(energyCore);

    brainGroup.castShadow = true;

    // Create realistic system nodes
    const nodes: ExtendedGroup[] = [];
    const connections: THREE.Mesh[] = [];

    systemNodes.forEach((nodeData: SystemNode, index: number) => {
      // Create node group for complex geometry
      const nodeGroup = new THREE.Group() as ExtendedGroup;
      scene.add(nodeGroup);
      nodeGroup.position.set(...nodeData.position);

      // Main node - crystalline structure
      const nodeGeometry = new THREE.OctahedronGeometry(0.4, 2);
      const nodeMaterial = new THREE.MeshPhongMaterial({
        color: nodeData.color,
        shininess: 100,
        transparent: true,
        opacity: 0.9,
        emissive: nodeData.color,
        emissiveIntensity: 0.1,
      });
      const mainNode = new THREE.Mesh(nodeGeometry, nodeMaterial);
      nodeGroup.add(mainNode);

      // Inner core
      const coreGeometry = new THREE.SphereGeometry(0.15, 12, 12);
      const coreMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.8,
      });
      const nodeCore = new THREE.Mesh(coreGeometry, coreMaterial);
      nodeGroup.add(nodeCore);

      // Orbital rings
      const ringGeometry = new THREE.TorusGeometry(0.6, 0.02, 8, 16);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: nodeData.color,
        transparent: true,
        opacity: 0.4,
      });

      for (let i = 0; i < 2; i++) {
        const ring = new THREE.Mesh(ringGeometry, ringMaterial.clone());
        ring.rotation.x = (i * Math.PI) / 3;
        ring.rotation.y = (i * Math.PI) / 4;
        nodeGroup.add(ring);
      }

      // Data particles around node
      for (let i = 0; i < 8; i++) {
        const particleGeometry = new THREE.SphereGeometry(0.03, 6, 6);
        const particleMaterial = new THREE.MeshBasicMaterial({
          color: nodeData.color,
          transparent: true,
          opacity: 0.7,
        });
        const particle = new THREE.Mesh(
          particleGeometry,
          particleMaterial
        ) as ExtendedMesh;

        const angle: number = (i / 8) * Math.PI * 2;
        particle.position.set(
          Math.cos(angle) * 0.8,
          Math.sin(angle * 0.5) * 0.3,
          Math.sin(angle) * 0.8
        );
        particle.userData = {
          originalPos: particle.position.clone(),
          orbitSpeed: 0.01 + Math.random() * 0.02,
          angle: angle,
        } as ParticleUserData;
        nodeGroup.add(particle);
      }

      nodeGroup.userData = nodeData;
      nodeGroup.castShadow = true;
      nodes.push(nodeGroup);

      // Realistic connection beams to brain
      const beamGeometry = new THREE.CylinderGeometry(
        0.02,
        0.05,
        new THREE.Vector3(...nodeData.position).length(),
        8
      );
      const beamMaterial = new THREE.MeshStandardMaterial({
        color: nodeData.color,
        transparent: true,
        opacity: 0.4,
        emissive: nodeData.color,
        emissiveIntensity: 0.1,
      });
      const beam = new THREE.Mesh(beamGeometry, beamMaterial);

      // Position and orient beam
      const direction = new THREE.Vector3(...nodeData.position).normalize();
      beam.position.copy(
        direction
          .clone()
          .multiplyScalar(new THREE.Vector3(...nodeData.position).length() / 2)
      );
      beam.lookAt(new THREE.Vector3(...nodeData.position));
      beam.rotateX(Math.PI / 2);

      scene.add(beam);
      connections.push(beam);

      // Energy pulse along beam
      const pulseGeometry = new THREE.SphereGeometry(0.08, 8, 8);
      const pulseMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.9,
      });
      const pulse = new THREE.Mesh(
        pulseGeometry,
        pulseMaterial
      ) as ExtendedMesh;
      scene.add(pulse);
      pulse.userData = {
        startPos: new THREE.Vector3(0, 0, 0),
        endPos: new THREE.Vector3(...nodeData.position),
        progress: Math.random(),
        speed: 0.008 + Math.random() * 0.004,
      } as PulseUserData;
    });

    // Camera positioning - adjusted for globe focus
    camera.position.set(0, 1, 6);
    camera.lookAt(0, 0, 0);

    // Animation loop
    let isAnimating = true;
    const animate = (): void => {
      if (!isAnimating) return;

      animationRef.current = requestAnimationFrame(animate);

      // Animate globe with smooth rotation and effects
      if (globeGroup) {
        // Main globe rotation
        globeGroup.rotation.y += 0.005;
        globeGroup.children[0].rotation.y += 0.002; // Earth texture rotation

        // Atmosphere pulsing
        if (globeGroup.children[1]) {
          const atmosphere = globeGroup.children[1] as THREE.Mesh;
          const scale = 1 + Math.sin(Date.now() * 0.003) * 0.05;
          atmosphere.scale.setScalar(scale);
          const material = atmosphere.material as THREE.MeshBasicMaterial;
          material.opacity = 0.1 + Math.sin(Date.now() * 0.004) * 0.05;
        }

        // Animate orbital rings
        globeGroup.children.forEach((child: THREE.Object3D, index: number) => {
          if (index > 2 && index < 6) {
            // Orbital rings
            child.rotation.x += 0.01 * (1 + index * 0.2);
            child.rotation.y += 0.008 * (1 + index * 0.3);
            child.rotation.z += 0.005 * (1 + index * 0.1);
          }
        });

        // Animate data nodes orbiting the globe
        globeGroup.children.forEach((child: THREE.Object3D, index: number) => {
          if (index > 5) {
            // Data nodes
            const time = Date.now() * 0.001;
            const orbitSpeed = 0.5 + (index - 6) * 0.1;
            const radius = 2.0 + Math.sin(time * 0.5 + index) * 0.3;
            const angle = time * orbitSpeed + index * 0.5;

            child.position.x = Math.cos(angle) * radius;
            child.position.z = Math.sin(angle) * radius;
            child.position.y = Math.sin(time * 0.8 + index) * 0.5;

            // Rotate individual nodes
            child.rotation.x += 0.02;
            child.rotation.y += 0.03;

            // Pulsing effect
            const pulse = 1 + Math.sin(time * 2 + index) * 0.3;
            child.scale.setScalar(pulse);
          }
        });

        // Animate connection lines
        if (globeGroup.children[2]) {
          globeGroup.children[2].rotation.y += 0.003;
          globeGroup.children[2].rotation.x += 0.001;
        }
      }

      // Rotate brain components (now positioned behind globe)
      if (brainGroup) {
        brainGroup.rotation.y += 0.002;
        brainGroup.rotation.x += 0.0005;

        // Animate energy core
        brainGroup.children.forEach((child: THREE.Object3D) => {
          const mesh = child as THREE.Mesh;
          if (
            mesh.material &&
            (mesh.material as THREE.MeshBasicMaterial).color &&
            (mesh.material as THREE.MeshBasicMaterial).color.getHex() ===
              0x34d399
          ) {
            child.scale.setScalar(1 + Math.sin(Date.now() * 0.005) * 0.2);
            (mesh.material as THREE.MeshBasicMaterial).opacity =
              0.4 + Math.sin(Date.now() * 0.008) * 0.2;
          }
        });
      }

      // Animate nodes with realistic movement
      nodes.forEach((nodeGroup: ExtendedGroup, index: number) => {
        // Rotate main node
        if (nodeGroup.children[0]) {
          nodeGroup.children[0].rotation.y += 0.02;
          nodeGroup.children[0].rotation.x += 0.01;
        }

        // Rotate orbital rings and animate particles
        nodeGroup.children.forEach(
          (child: THREE.Object3D, childIndex: number) => {
            if (childIndex > 1 && childIndex < 4) {
              // Ring objects
              child.rotation.z += 0.05;
              child.rotation.x += 0.02;
            }

            // Animate orbiting particles
            const extendedChild = child as ExtendedMesh;
            if (
              extendedChild.userData &&
              "orbitSpeed" in extendedChild.userData
            ) {
              const userData = extendedChild.userData as ParticleUserData;
              userData.angle += userData.orbitSpeed;
              const radius: number =
                0.8 + Math.sin(Date.now() * 0.001 + index) * 0.2;
              child.position.set(
                Math.cos(userData.angle) * radius,
                Math.sin(userData.angle * 0.5) * 0.4 +
                  Math.sin(Date.now() * 0.002) * 0.1,
                Math.sin(userData.angle) * radius
              );
            }
          }
        );

        // Gentle floating motion
        const baseY: number = nodeGroup.userData.position[1];
        nodeGroup.position.y =
          baseY + Math.sin(Date.now() * 0.002 + index) * 0.1;
      });

      // Animate connection beams and energy pulses
      scene.traverse((child: THREE.Object3D) => {
        const extendedChild = child as ExtendedObject3D;
        if (
          extendedChild.userData &&
          "startPos" in extendedChild.userData &&
          "endPos" in extendedChild.userData
        ) {
          const userData = extendedChild.userData as PulseUserData;
          userData.progress += userData.speed;
          if (userData.progress > 1) userData.progress = 0;

          child.position.lerpVectors(
            userData.startPos,
            userData.endPos,
            userData.progress
          );

          // Pulsing effect
          const pulse: number = Math.sin(userData.progress * Math.PI);
          child.scale.setScalar(0.5 + pulse * 0.5);
          const mesh = child as THREE.Mesh;
          if (mesh.material && "opacity" in mesh.material) {
            (mesh.material as THREE.Material & { opacity: number }).opacity =
              0.4 + pulse * 0.6;
          }
        }
      });

      // Gentle camera movement with globe focus
      camera.position.x = Math.sin(Date.now() * 0.0003) * 0.3;
      camera.position.y = 1 + Math.cos(Date.now() * 0.0002) * 0.2;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = (): void => {
      if (!mountRef.current) return;

      const containerWidth = mountRef.current.clientWidth || window.innerWidth;
      const containerHeight =
        mountRef.current.clientHeight || window.innerHeight;

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
      // Clean up Three.js resources
      scene.clear();
      renderer.dispose();
      renderer.forceContextLoss();
    };
  }, []);

  const handleNodeMouseEnter = (nodeId: string): void => {
    setActiveNode(nodeId);
  };

  const handleNodeMouseLeave = (): void => {
    setActiveNode(null);
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 overflow-hidden">
      {/* 3D Scene */}
      <div ref={mountRef} className="absolute inset-0" />

      {/* Overlay Content */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full text-white px-4 pointer-events-none">
        {/* Header - Fixed positioning to ensure visibility */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-center pointer-events-none z-30">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-green-300 via-emerald-400 to-green-500 bg-clip-text text-transparent drop-shadow-2xl">
            Neural Knowledge Hub
          </h1>
          <p className="text-base md:text-lg text-gray-200 max-w-2xl mx-auto leading-relaxed drop-shadow-lg">
            Your intelligent data ecosystem where information flows seamlessly
            through an AI-powered neural network
          </p>
        </div>

        {/* System Overview - Cards positioned on left and right sides only */}
        <div className="absolute inset-0 pointer-events-none">
          {systemNodes.map((node: SystemNode, index: number) => {
            const position: CardPosition = cardPositions[index];

            return (
              <div
                key={node.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                style={{
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                  animation: `float ${3 + index * 0.5}s ease-in-out infinite`,
                  animationDelay: `${index * 0.2}s`,
                }}
                onMouseEnter={() => handleNodeMouseEnter(node.id)}
                onMouseLeave={handleNodeMouseLeave}
              >
                <div
                  className={`relative group cursor-pointer transition-all duration-500 transform hover:scale-110 ${
                    activeNode === node.id ? "scale-110 z-20" : "hover:z-10"
                  }`}
                >
                  {/* Card Background with 3D effect */}
                  <div
                    className="w-40 h-28 rounded-xl backdrop-blur-md border border-white/20 shadow-2xl relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${node.color}15, ${node.color}05)`,
                      boxShadow: `0 8px 32px ${node.color}30, inset 0 1px 0 rgba(255,255,255,0.1)`,
                    }}
                  >
                    {/* Animated background pattern */}
                    <div
                      className="absolute inset-0 opacity-10"
                      style={{
                        background: `radial-gradient(circle at 30% 20%, ${node.color}, transparent 50%)`,
                      }}
                    />

                    {/* Content */}
                    <div className="relative z-10 p-3 h-full flex flex-col justify-between">
                      {/* Icon and status */}
                      <div className="flex items-center justify-between">
                        <div className="text-2xl filter drop-shadow-lg">
                          {node.icon}
                        </div>
                        <div
                          className="w-2 h-2 rounded-full animate-pulse shadow-lg"
                          style={{ backgroundColor: node.color }}
                        />
                      </div>

                      {/* Title */}
                      <div>
                        <h3 className="text-white font-bold text-sm mb-1 drop-shadow-lg">
                          {node.label}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-gray-300">
                          <div className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />
                          Active
                        </div>
                      </div>
                    </div>

                    {/* Glow effect */}
                    <div
                      className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
                      style={{
                        background: `radial-gradient(circle at center, ${node.color}, transparent 70%)`,
                      }}
                    />

                    {/* Border glow */}
                    <div
                      className="absolute inset-0 rounded-xl border-2 opacity-0 group-hover:opacity-60 transition-opacity duration-300"
                      style={{ borderColor: node.color }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Key Features - Bottom positioning */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-center pointer-events-none z-30">
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-200 mb-6">
            <div className="flex items-center gap-2 bg-black/20 px-3 py-2 rounded-full backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Real-time Data Processing
            </div>
            <div className="flex items-center gap-2 bg-black/20 px-3 py-2 rounded-full backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              AI-Powered Insights
            </div>
            <div className="flex items-center gap-2 bg-black/20 px-3 py-2 rounded-full backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
              Seamless Integration
            </div>
            <div className="flex items-center gap-2 bg-black/20 px-3 py-2 rounded-full backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              Advanced Analytics
            </div>
          </div>

          {/* CTA */}
          <div className="pointer-events-auto">
            <button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-8 py-3 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl">
              Enter the Knowledge Matrix
            </button>
          </div>
        </div>
      </div>

      {/* Floating particles background */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(30)].map((_, i: number) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-green-900/10 to-emerald-900/10 pointer-events-none" />

      {/* CSS for floating animation */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) translateX(0px);
          }
          25% {
            transform: translateY(-8px) translateX(3px);
          }
          50% {
            transform: translateY(-4px) translateX(-3px);
          }
          75% {
            transform: translateY(-12px) translateX(2px);
          }
        }
      `}</style>
    </div>
  );
};

export default KnowledgebaseHero;
