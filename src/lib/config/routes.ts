import { ComponentType } from "react";
import DatabaseIcon from "@/icons/sidebar/DatabaseIcon";
import DashboardIcon from "@/icons/sidebar/DashboardIcon";
import SalesKnowledgeIcon from "@/icons/sidebar/SalesKnowledgeIcon";
import HrKnowledgeIcon from "@/icons/sidebar/HrKnowledgeIcon";
import SupportKnowledgeIcon from "@/icons/sidebar/supportIcon";

export type RouteCategory = "main" | "knowledge" | "tools";

export interface RouteConfig {
  key: string;
  path: string;
  name: string;
  description?: string;
  category: RouteCategory;
  icon?: string;
  sidebarIcon?: ComponentType<any>;
  isProtected?: boolean;
  showInNavigation?: boolean;
  showInSidebar?: boolean;
  order?: number;
  metadata?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

export const ROUTES: Record<string, RouteConfig> = {
  dashboard: {
    key: "dashboard",
    path: "/",
    name: "Dashboard",
    description:
      "Main dashboard overview with system metrics and recent activity",
    category: "main",
    icon: "🏠",
    sidebarIcon: DashboardIcon,
    showInNavigation: true,
    showInSidebar: true,
    order: 1,
    metadata: {
      title: "Dashboard - Knowledge Management System",
      description:
        "Overview of your knowledge management system with key metrics and insights",
    },
  },
  dbKnowledge: {
    key: "db",
    path: "/db-knowledge",
    name: "DB Knowledge",
    description: "Database knowledge management and documentation",
    category: "knowledge",
    icon: "🔒",
    sidebarIcon: DatabaseIcon,
    showInNavigation: true,
    showInSidebar: true,
    order: 2,
    metadata: {
      title: "Database Knowledge - KMS",
      description: "Manage and access your database knowledge base",
    },
  },
  companyStructure: {
    key: "company-structure",
    path: "/company-structure",
    name: "Company Structure",
    description: "Company hierarchy and organizational structure management",
    category: "tools",
    icon: "🏢",
    sidebarIcon: SalesKnowledgeIcon,
    showInNavigation: true,
    showInSidebar: true,
    order: 3,
    metadata: {
      title: "Company Structure - KMS",
      description: "Manage company hierarchy and organizational structure",
    },
  },
  hrKnowledge: {
    key: "hr",
    path: "/hr-knowledge",
    name: "HR Knowledge",
    description: "Human resources knowledge base and documentation",
    category: "knowledge",
    icon: "👥",
    sidebarIcon: HrKnowledgeIcon,
    showInNavigation: true,
    showInSidebar: true,
    order: 4,
    metadata: {
      title: "HR Knowledge - KMS",
      description: "Access HR policies, procedures, and employee information",
    },
  },
  supportTeam: {
    key: "support-team",
    path: "/support-team",
    name: "Support Team",
    description: "Support team knowledge base and ticketing system",
    category: "knowledge",
    icon: "🛠️",
    sidebarIcon: SupportKnowledgeIcon,
    showInNavigation: true,
    showInSidebar: true,
    order: 5,
    metadata: {
      title: "Support Team - KMS",
      description: "Support documentation, FAQs, and ticket management",
    },
  },
  databaseHierarchy: {
    key: "database-hierarchy",
    path: "/database-hierarchy",
    name: "Database Hierarchy",
    description: "Visual database and company hierarchy management",
    category: "tools",
    icon: "🌐",
    sidebarIcon: DatabaseIcon,
    showInNavigation: true,
    showInSidebar: true,
    order: 6,
    metadata: {
      title: "Database Hierarchy - KMS",
      description: "Manage database configurations and company structure hierarchy",
    },
  },
  userConfig: {
    key: "user-config",
    path: "/user-config",
    name: "User Config",
    description: "User configuration and database access management",
    category: "tools",
    icon: "⚙️",
    sidebarIcon: DatabaseIcon,
    showInNavigation: true,
    showInSidebar: true,
    order: 7,
    metadata: {
      title: "User Configuration - KMS",
      description: "Manage user configurations and database access settings",
    },
  },
} as const;

// Route constants for easy access
export const ROUTE_PATHS = {
  DASHBOARD: "/",
  DB_KNOWLEDGE: "/db-knowledge",
  COMPANY_STRUCTURE: "/company-structure",
  HR_KNOWLEDGE: "/hr-knowledge",
  SUPPORT_TEAM: "/support-team",
  DATABASE_HIERARCHY: "/database-hierarchy",
  USER_CONFIG: "/user-config",
} as const;

export const ROUTE_CATEGORIES = {
  MAIN: "main",
  KNOWLEDGE: "knowledge",
  TOOLS: "tools",
} as const;

// Helper functions
export const getRouteByKey = (key: string): RouteConfig | undefined => {
  return Object.values(ROUTES).find((route) => route.key === key);
};

export const getRouteByPath = (path: string): RouteConfig | undefined => {
  return Object.values(ROUTES).find((route) => route.path === path);
};

export const getRoutesByCategory = (category: RouteCategory): RouteConfig[] => {
  return Object.values(ROUTES)
    .filter((route) => route.category === category)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
};

export const getNavigationRoutes = (): RouteConfig[] => {
  return Object.values(ROUTES)
    .filter((route) => route.showInNavigation)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
};

export const getSidebarRoutes = (): RouteConfig[] => {
  return Object.values(ROUTES)
    .filter((route) => route.showInSidebar)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
};

export const getAllRoutes = (): RouteConfig[] => {
  return Object.values(ROUTES).sort((a, b) => (a.order || 0) - (b.order || 0));
};

export const isActiveRoute = (pathname: string, routePath: string): boolean => {
  if (routePath === "/" && pathname === "/") return true;
  if (
    routePath !== "/" &&
    (pathname === routePath || pathname.startsWith(routePath + "/"))
  )
    return true;
  return false;
};

export const getBreadcrumbs = (pathname: string) => {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = [{ name: "Dashboard", path: "/" }];

  let currentPath = "";
  segments.forEach((segment) => {
    currentPath += `/${segment}`;
    const route = getRouteByPath(currentPath);
    if (route) {
      breadcrumbs.push({ name: route.name, path: currentPath });
    }
  });

  return breadcrumbs;
};

export const getPageTitle = (pathname: string): string => {
  const route = getRouteByPath(pathname);
  return route?.name || "Dashboard";
};

export const getPageDescription = (pathname: string): string | undefined => {
  const route = getRouteByPath(pathname);
  return route?.description;
};
