import { create } from "zustand";
import { FileUploadState } from "@/types";
import { FileService } from "../lib/api";

export const useFileUploadStore = create<FileUploadState>((set, get) => ({
  uploadedFiles: [],
  fileMetas: [],
  processing: false,
  status: null,
  bundleId: null,
  bundleStatus: null,
  initialResponse: null,
  error: null,
  polling: false,
  pollingRef: null,
  setFiles: (files, metas) => set({ uploadedFiles: files, fileMetas: metas }),
  setProcessing: (processing) => set({ processing }),
  setStatus: (status) => set({ status }),
  setBundleId: (bundleId) => set({ bundleId }),
  setBundleStatus: (bundleStatus) => set({ bundleStatus }),
  setInitialResponse: (initialResponse) => set({ initialResponse }),
  setError: (error) => set({ error }),
  reset: () => {
    const { stopPolling } = get();
    stopPolling();
    set({
      uploadedFiles: [],
      fileMetas: [],
      processing: false,
      status: null,
      bundleId: null,
      bundleStatus: null,
      initialResponse: null,
      error: null,
      polling: false,
      pollingRef: null,
    });
  },
  startPolling: (bundleId: string) => {
    const { stopPolling, setBundleStatus, setStatus, setProcessing, setError } =
      get();
    stopPolling();
    set({ polling: true });
    const ref = setInterval(async () => {
      try {
        const response = await FileService.getBundleStatus(bundleId);
        const data = response.data;
        setBundleStatus(data);
        // Normalize status
        let normalized = "pending";
        if (data.status === "PROCESSING" || data.status === "RUNNING")
          normalized = "running";
        if (data.status === "COMPLETED" || data.status === "completed")
          normalized = "completed";
        setStatus(normalized as "pending" | "running" | "completed");
        if (normalized === "completed") {
          setProcessing(false);
          get().stopPolling();
        }
      } catch (e: any) {
        setError(e.message || "Unknown error");
        setProcessing(false);
        get().stopPolling();
      }
    }, 3000);
    set({ pollingRef: ref });
  },
  stopPolling: () => {
    const { pollingRef } = get();
    if (pollingRef) clearInterval(pollingRef);
    set({ polling: false, pollingRef: null });
  },
}));
