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
      console.log('Upload response:', response);
      
      // With API client interceptor, response now contains just the data portion
      if (!response) {
        throw new Error('Invalid response from upload service');
      }
      
      const data = response as any;
      console.log('Upload data:', data);
      
      // Check if bundle_id exists
      if (!data.bundle_id) {
        throw new Error('No bundle_id received from upload service');
      }
      
      setInitialResponse(data);
      setBundleId(data.bundle_id);
      setStatus("pending");
      // Start polling using the store's global polling
      startPolling(data.bundle_id);
    } catch (e: any) {
      console.error('Upload error:', e);
      setError(e.message || "Unknown error");
      setProcessing(false);
    }
  };

  return {
    startUpload,
  };
}
