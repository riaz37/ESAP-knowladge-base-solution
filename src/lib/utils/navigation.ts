import { collections } from "@/app/dummy-data/information";

export type NavigationItem = typeof collections[0];

/**
 * Get navigation item by route path
 */
export const getNavItemByRoute = (route: string): NavigationItem | undefined => {
  return collections.find(item => item.route === route);
};

/**
 * Get navigation items by category
 */
export const getNavItemsByCategory = (category: string) => {
  return collections.filter(item => item.category === category);
};

/**
 * Check if a route is active based on current pathname
 */
export const isRouteActive = (pathname: string, route: string): boolean => {
  if (route === "/" && pathname === "/") return true;
  if (route !== "/" && (pathname === route || pathname.startsWith(route + "/"))) return true;
  return false;
};

/**
 * Get breadcrumb items for current route
 */
export const getBreadcrumbs = (pathname: string) => {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs = [{ name: 'Dashboard', route: '/' }];
  
  let currentPath = '';
  segments.forEach(segment => {
    currentPath += `/${segment}`;
    const navItem = getNavItemByRoute(currentPath);
    if (navItem) {
      breadcrumbs.push({ name: navItem.name, route: currentPath });
    }
  });
  
  return breadcrumbs;
};

/**
 * Get the current page title based on pathname
 */
export const getPageTitle = (pathname: string): string => {
  const navItem = getNavItemByRoute(pathname);
  return navItem?.name || 'Dashboard';
};

/**
 * Navigation constants
 */
export const NAVIGATION_CATEGORIES = {
  MAIN: 'main',
  KNOWLEDGE: 'knowledge', 
  TOOLS: 'tools'
} as const;

export const SPECIAL_ROUTES = {
  DB_KNOWLEDGE: '/db-knowledge',
  DASHBOARD: '/',
  FILE_SYSTEM: '/file-system',
  HR_KNOWLEDGE: '/hr-knowledge',
  SUPPORT_TEAM: '/support-team'
} as const;