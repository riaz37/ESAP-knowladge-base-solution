# Dashboard Components

This directory contains the refactored and organized components for the Neural Knowledge Hub dashboard interface.

## Structure

```
dashboard/
├── ComingSoon.tsx          # Main component (KnowledgebaseHero)
├── SystemCard.tsx          # Individual draggable system cards
├── NeonIcon.tsx           # SVG icon components with neon effects
├── HeroContent.tsx        # Header and footer content
├── BackgroundEffects.tsx  # Animated background particles and gradients
├── AnimationStyles.tsx    # CSS-in-JS animation definitions
├── types.ts              # TypeScript type definitions
├── constants.ts          # Configuration constants
├── hooks/
│   ├── useDragAndDrop.ts # Drag and drop functionality
│   └── useThreeScene.ts  # Three.js scene management
└── index.ts              # Barrel exports

3d/
├── BrainModel.tsx        # Main 3D brain component
├── BrainMesh.tsx         # Brain mesh with animations
├── LoadingFallback.tsx   # Loading state component
├── SceneLighting.tsx     # Three.js lighting setup
├── types.ts             # 3D component types
└── index.ts             # Barrel exports
```

## Key Features

### 🎯 Modular Architecture
- **Separation of Concerns**: Each component has a single responsibility
- **Reusable Components**: Components can be easily reused across the application
- **Custom Hooks**: Business logic extracted into reusable hooks
- **Type Safety**: Comprehensive TypeScript definitions

### 🎨 Interactive Elements
- **Draggable System Cards**: Users can drag and rearrange system nodes
- **3D Brain Model**: Interactive brain model with hover effects and controls
- **Real-time Connections**: Dynamic particle connections that update with card positions
- **Smooth Animations**: CSS and Three.js animations for enhanced UX

### ⚡ Performance Optimizations
- **Lazy Loading**: Components use React.Suspense for better loading states
- **Memoization**: Proper use of useCallback and useMemo where needed
- **Efficient Rendering**: Three.js scene management optimized for performance
- **Clean Disposal**: Proper cleanup of Three.js resources

## Usage

### Basic Usage

```tsx
import { KnowledgebaseHero } from '@/components/dashboard';

export default function DashboardPage() {
  return <KnowledgebaseHero />;
}
```

### Using Individual Components

```tsx
import { 
  SystemCard, 
  NeonIcon, 
  BackgroundEffects 
} from '@/components/dashboard';

// Use individual components as needed
<SystemCard
  node={systemNode}
  position={{ x: 50, y: 50 }}
  isActive={false}
  isDragging={false}
  onMouseDown={handleMouseDown}
  onMouseEnter={handleMouseEnter}
  onMouseLeave={handleMouseLeave}
/>
```

### Custom Hooks

```tsx
import { useDragAndDrop, useThreeScene } from '@/components/dashboard';

function CustomDashboard() {
  const mountRef = useRef<HTMLDivElement>(null);
  
  const { cardPositions, dragging, handleMouseDown } = useDragAndDrop({
    initialPositions: INITIAL_POSITIONS,
    containerRef: mountRef,
  });

  const { updateConnections } = useThreeScene({
    mountRef,
    cardPositions,
  });

  // Your custom logic here
}
```

## Configuration

### System Nodes

Modify `constants.ts` to customize the system nodes:

```typescript
export const SYSTEM_NODES: SystemNode[] = [
  {
    id: "custom-node",
    label: "Custom Node",
    position: [0, 0, 0],
    color: "#ff6b6b",
    icon: "custom",
  },
  // ... more nodes
];
```

### Animation Settings

Adjust animation parameters in `constants.ts`:

```typescript
export const ANIMATION_CONFIG = {
  PARTICLE_COUNT: 5,           // Number of particles per connection
  PARTICLE_SIZE: 0.02,         // Size of connection particles
  PARTICLE_SPEED_BASE: 0.005,  // Base animation speed
  PARTICLE_SPEED_VARIANCE: 0.003, // Speed randomization
  CONNECTION_OPACITY: 0.6,     // Connection line opacity
  PULSE_AMPLITUDE: 0.2,        // Pulsing effect strength
  CURVE_POINTS: 50,           // Curve resolution
} as const;
```

### Camera and Lighting

Customize the 3D scene in `constants.ts`:

```typescript
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
```

## Customization

### Adding New Icons

Add new icon types to `NeonIcon.tsx`:

```tsx
case "new-icon":
  return (
    <svg {...commonProps}>
      {/* Your SVG path here */}
    </svg>
  );
```

### Custom Animations

Add new animations to `AnimationStyles.tsx`:

```tsx
@keyframes customAnimation {
  0% { /* start state */ }
  100% { /* end state */ }
}
```

### Extending Types

Add new types to `types.ts`:

```typescript
export interface CustomNodeData {
  // Your custom properties
}
```

## Dependencies

- **React**: ^18.0.0
- **Three.js**: ^0.150.0
- **@react-three/fiber**: ^8.0.0
- **@react-three/drei**: ^9.0.0
- **TypeScript**: ^5.0.0

## Performance Notes

1. **Three.js Scene**: The scene is properly disposed of on component unmount
2. **Event Listeners**: All event listeners are cleaned up in useEffect cleanup
3. **Animation Frames**: Animation loops are cancelled when components unmount
4. **Memory Management**: Geometries and materials are disposed of properly

## Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **WebGL**: Requires WebGL support for 3D features
- **ES6+**: Uses modern JavaScript features

## Troubleshooting

### Common Issues

1. **Three.js Context Loss**: Handled automatically with proper cleanup
2. **Performance Issues**: Reduce particle count or curve resolution
3. **Mobile Performance**: Consider disabling some effects on mobile devices
4. **TypeScript Errors**: Ensure all types are properly imported

### Debug Mode

Enable debug logging by setting:

```typescript
const DEBUG = process.env.NODE_ENV === 'development';
```

## Contributing

When adding new features:

1. Follow the existing component structure
2. Add proper TypeScript types
3. Include proper cleanup in useEffect
4. Test drag and drop functionality
5. Ensure responsive design
6. Add JSDoc comments for complex functions

## Future Enhancements

- [ ] Add keyboard navigation support
- [ ] Implement touch gestures for mobile
- [ ] Add sound effects for interactions
- [ ] Create preset layouts for different use cases
- [ ] Add export/import functionality for layouts
- [ ] Implement undo/redo for drag operations