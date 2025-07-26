export interface RouteConfig {
  key: string;
  path: string;
  name: string;
  description?: string;
  category?: 'main' | 'knowledge' | 'tools';
}

export const ROUTES: Record<string, RouteConfig> = {
  dashboard: {
    key: 'dashboard',
    path: '/',
    name: 'Dashboard',
    description: 'Main dashboard overview',
    category: 'main'
  },
  dbKnowledge: {
    key: 'db',
    path: '/db-knowledge',
    name: 'DB Knowledge',
    description: 'Database knowledge management',
    category: 'knowledge'
  },
  fileSystem: {
    key: 'File system',
    path: '/file-system',
    name: 'File System',
    description: 'File management and operations',
    category: 'tools'
  },
  hrKnowledge: {
    key: 'hr',
    path: '/hr-knowledge',
    name: 'HR Knowledge',
    description: 'Human resources knowledge base',
    category: 'knowledge'
  },
  supportTeam: {
    key: 'support Team',
    path: '/support-team',
    name: 'Support Team',
    description: 'Support team knowledge and tools',
    category: 'knowledge'
  }
} as const;

// Helper functions
export const getRouteByKey = (key: string): RouteConfig | undefined => {
  return Object.values(ROUTES).find(route => route.key === key);
};

export const getRoutesByCategory = (category: RouteConfig['category']) => {
  return Object.values(ROUTES).filter(route => route.category === category);
};

export const isActiveRoute = (pathname: string, routePath: string): boolean => {
  if (routePath === '/' && pathname === '/') return true;
  if (routePath !== '/' && (pathname === routePath || pathname.startsWith(routePath + '/'))) return true;
  return false;
};