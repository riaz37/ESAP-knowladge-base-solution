import { create } from "zustand";

interface UIState {
  showBusinessRulesModal: boolean;
  setShowBusinessRulesModal: (show: boolean) => void;
  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  showBusinessRulesModal: false,
  setShowBusinessRulesModal: (show) => set({ showBusinessRulesModal: show }),
  showSidebar: false,
  setShowSidebar: (show) => set({ showSidebar: show }),
}));
