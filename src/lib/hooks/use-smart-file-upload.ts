import { FileService } from "../api";
import { useFileUploadStore } from "../../store/file-upload-store";

export function useSmartFileUpload() {
  const {
    setProcessing,
    setError,
    setBundleId,
    setStatus,
    setBundleStatus,
    setInitialResponse,
    startPolling,
    stopPolling,
  } = useFileUploadStore();

  // Start upload and polling
  const startUpload = async (files: File[]) => {
    setProcessing(true);
    setError(null);
    setBundleId(null);
    setStatus(null);
    setBundleStatus(null);
    setInitialResponse(null);
    stopPolling();

    try {
      const response = await FileService.uploadFiles(files);
      const data = response.data;
      setInitialResponse(data);
      setBundleId(data.bundle_id);
      setStatus("pending");
      // Start polling using the store's global polling
      startPolling(data.bundle_id);
    } catch (e: any) {
      setError(e.message || "Unknown error");
      setProcessing(false);
    }
  };

  return {
    startUpload,
  };
}
