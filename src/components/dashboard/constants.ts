import { SystemNode, CardPosition } from './types';

export const SYSTEM_NODES: SystemNode[] = [
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

export const INITIAL_CARD_POSITIONS: CardPosition[] = [
  { x: 15, y: 25 },
  { x: 85, y: 25 },
  { x: 15, y: 50 },
  { x: 85, y: 50 },
  { x: 15, y: 75 },
  { x: 85, y: 75 },
];

export const ANIMATION_CONFIG = {
  PARTICLE_COUNT: 5,
  PARTICLE_SIZE: 0.02,
  PARTICLE_SPEED_BASE: 0.005,
  PARTICLE_SPEED_VARIANCE: 0.003,
  CONNECTION_OPACITY: 0.6,
  PULSE_AMPLITUDE: 0.2,
  CURVE_POINTS: 50,
} as const;

export const CAMERA_CONFIG = {
  FOV: 75,
  NEAR: 0.1,
  FAR: 1000,
  POSITION: [0, 0, 8] as [number, number, number],
} as const;

export const LIGHTING_CONFIG = {
  AMBIENT_INTENSITY: 0.4,
  DIRECTIONAL_INTENSITY: 0.6,
  POINT_INTENSITY: 0.8,
  POINT_DISTANCE: 15,
} as const;