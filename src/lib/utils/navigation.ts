import {
  type RouteConfig,
  type RouteCategory,
  ROUTES,
  ROUTE_PATHS,
  ROUTE_CATEGORIES,
  getRouteByKey,
  getRouteByPath,
  getRoutesByCategory,
  getNavigationRoutes,
  getSidebarRoutes,
  getAllRoutes,
  isActiveRoute,
  getBreadcrumbs,
  getPageTitle,
  getPageDescription
} from '@/lib/config/routes';

// Re-export routing utilities from the centralized config
export {
  type RouteConfig,
  type RouteCategory,
  ROUTES,
  ROUTE_PATHS,
  ROUTE_CATEGORIES,
  getRouteByKey,
  getRouteByPath,
  getRoutesByCategory,
  getNavigationRoutes,
  getSidebarRoutes,
  getAllRoutes,
  isActiveRoute,
  getBreadcrumbs,
  getPageTitle,
  getPageDescription
};

// Legacy compatibility - these functions use the new routing system
export const getNavItemByRoute = getRouteByPath;
export const getNavItemsByCategory = getRoutesByCategory;
export const isRouteActive = isActiveRoute;

// Navigation constants (kept for backward compatibility)
export const NAVIGATION_CATEGORIES = ROUTE_CATEGORIES;
export const SPECIAL_ROUTES = ROUTE_PATHS;