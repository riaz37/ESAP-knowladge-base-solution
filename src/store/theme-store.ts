import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createSemanticThemeTransition } from "@/lib/hooks/useThemeTransition";

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  mounted: boolean;
  
  // Actions
  setTheme: (theme: Theme) => void;
  toggleTheme: (event?: React.MouseEvent) => void;
  setResolvedTheme: (resolvedTheme: 'light' | 'dark') => void;
  setMounted: (mounted: boolean) => void;
  initializeTheme: () => void;
  
  // Internal helper methods
  updateResolvedTheme: () => void;
  updateDOM: () => void;
  setupSystemThemeListener: () => (() => void) | undefined;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      resolvedTheme: 'dark',
      mounted: false,

      setTheme: (newTheme: Theme) => {
        set({ theme: newTheme });
        get().updateResolvedTheme();
      },

      toggleTheme: (event?: React.MouseEvent) => {
        const { theme, resolvedTheme } = get();
        const newTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'light' : (resolvedTheme === 'dark' ? 'light' : 'dark');

        // Use semantic theme transition if event is provided
        if (event && typeof document !== 'undefined') {
          const isCurrentlyDark = resolvedTheme === 'dark';

          createSemanticThemeTransition(
            event,
            () => get().setTheme(newTheme),
            isCurrentlyDark,
            1200
          );
        } else {
          get().setTheme(newTheme);
        }
      },

      setResolvedTheme: (resolvedTheme: 'light' | 'dark') => {
        set({ resolvedTheme });
        get().updateDOM();
      },

      setMounted: (mounted: boolean) => set({ mounted }),

      initializeTheme: () => {
        if (typeof window === 'undefined') return;
        
        set({ mounted: true });
        get().updateResolvedTheme();
        get().setupSystemThemeListener();
      },

      // Internal helper methods (not exposed in interface)
      updateResolvedTheme: () => {
        if (typeof window === 'undefined') return;
        
        const { theme } = get();
        let resolved: 'light' | 'dark';
        
        if (theme === 'system') {
          resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        } else {
          resolved = theme;
        }
        
        get().setResolvedTheme(resolved);
      },

      updateDOM: () => {
        if (typeof document === 'undefined') return;
        
        const { resolvedTheme } = get();
        const root = document.documentElement;
        
        // Add no-transition class temporarily to prevent flash
        document.body.classList.add('no-transition');
        
        root.classList.remove('light', 'dark');
        root.classList.add(resolvedTheme);
        root.setAttribute('data-theme', resolvedTheme);
        
        // Remove no-transition class after DOM update
        requestAnimationFrame(() => {
          document.body.classList.remove('no-transition');
        });
        
        // Update meta theme-color for mobile browsers
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
          metaThemeColor.setAttribute('content', resolvedTheme === 'dark' ? '#0f172a' : '#ffffff');
        }
      },

      setupSystemThemeListener: () => {
        if (typeof window === 'undefined') return;
        
        const { theme } = get();
        
        if (theme === 'system') {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
          const handleChange = () => get().updateResolvedTheme();
          
          mediaQuery.addEventListener('change', handleChange);
          
          // Store cleanup function (you might want to call this on unmount)
          return () => mediaQuery.removeEventListener('change', handleChange);
        }
      },
    }),
    {
      name: 'esap-theme',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);

// Selector hooks for better performance
export const useTheme = () => useThemeStore((state) => state.theme);
export const useResolvedTheme = () => useThemeStore((state) => state.resolvedTheme);
export const useThemeActions = () => useThemeStore((state) => ({
  setTheme: state.setTheme,
  toggleTheme: state.toggleTheme,
  initializeTheme: state.initializeTheme,
}));

// Combined hook for components that need both theme and actions
export const useThemeState = () => useThemeStore((state) => ({
  theme: state.theme,
  resolvedTheme: state.resolvedTheme,
  mounted: state.mounted,
  setTheme: state.setTheme,
  toggleTheme: state.toggleTheme,
}));