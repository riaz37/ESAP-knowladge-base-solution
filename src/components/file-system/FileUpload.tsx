"use client";
import { useDropzone } from "react-dropzone";
import { SecondaryButton } from "@/components/glass-ui/buttons/SecondaryButton";
import { useFileUploadStore } from "@/store/file-upload-store";
import { useSmartFileUpload } from "@/lib/hooks";
import { FileUploadStatus } from "./FileUploadStatus";
import { useEffect, useState } from "react";
import { Toast } from "@/components/Toast";
import { StatefulButton } from "../ui/stateful-button";
import { useResolvedTheme } from "@/contexts/ThemeContext";

interface FileUploadProps {}

export const FileUpload: React.FC<FileUploadProps> = () => {
  const theme = useResolvedTheme();
  const {
    uploadedFiles,
    fileMetas,
    processing,
    status,
    bundleStatus,
    initialResponse,
    error,
    setFiles,
    reset,
  } = useFileUploadStore();
  const { startUpload } = useSmartFileUpload();
  const [showToast, setShowToast] = useState(false);

  // Handle file drop
  const onDrop = (acceptedFiles: File[]) => {
    if (processing) return;
    const metas = acceptedFiles.map((file) => ({
      id: Math.random().toString(36).substring(2, 11),
      name: file.name,
      size: file.size,
      type: file.type,
      status: "success",
      progress: 100,
    }));
    setFiles([...uploadedFiles, ...acceptedFiles], [...fileMetas, ...metas]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "text/plain": [".txt"],
      "text/csv": [".csv"],
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".bmp"],
      "video/*": [".mp4", ".avi", ".mov", ".wmv"],
      "audio/*": [".mp3", ".wav", ".flac"],
    },
    multiple: true,
    disabled: processing,
  });

  // Remove file
  const removeFile = (fileId: string) => {
    if (processing) return;
    setFiles(
      uploadedFiles.filter((f, i) => fileMetas[i]?.id !== fileId),
      fileMetas.filter((f) => f.id !== fileId)
    );
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // File icon
  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return "📄";
    if (type.includes("word") || type.includes("document")) return "📝";
    if (type.includes("excel") || type.includes("spreadsheet")) return "📊";
    if (type.includes("image")) return "🖼️";
    if (type.includes("video")) return "🎥";
    if (type.includes("audio")) return "🎵";
    if (type.includes("text")) return "📄";
    return "📁";
  };

  // Handle submit
  const handleSubmit = () => {
    if (processing || uploadedFiles.length === 0) return;
    startUpload(uploadedFiles);
  };

  // Toast and reset after completion
  useEffect(() => {
    if (status === "completed") {
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        reset();
      }, 3000);
    }
  }, [status, reset]);

  // UI
  return (
    <div className="w-full">
      {/* Toast on completion */}
      <Toast
        isVisible={showToast}
        message="All files processed successfully!"
        type="success"
        onClose={() => setShowToast(false)}
      />
      {/* Dropzone is always visible, but disabled and animated during processing */}
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ${
          isDragActive && !processing
            ? theme === "dark"
              ? "border-green-400 bg-green-400/10"
              : "border-green-500 bg-green-50"
            : theme === "dark"
            ? "border-gray-600 bg-gray-800/30 hover:border-gray-500"
            : "border-gray-300 bg-gray-50 hover:border-gray-400"
        } ${processing ? "pointer-events-none opacity-60 animate-pulse" : ""}`}
        style={{
          filter: processing ? "grayscale(0.3)" : undefined,
          cursor: processing ? "not-allowed" : undefined,
        }}
      >
        <input {...getInputProps()} disabled={processing} />
        <div className="text-center">
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center relative">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              {processing && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="w-10 h-10 border-4 border-green-400 border-t-transparent rounded-full animate-spin"></span>
                </span>
              )}
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
            {processing
              ? "Processing files..."
              : isDragActive
              ? "Drop files here"
              : "Upload Files"}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Drag and drop files here, or click to select files
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span>PDF</span>
            <span>•</span>
            <span>DOC</span>
            <span>•</span>
            <span>XLS</span>
            <span>•</span>
            <span>TXT</span>
            <span>•</span>
            <span>Images</span>
            <span>•</span>
            <span>Videos</span>
            <span>•</span>
            <span>Audio</span>
          </div>
        </div>
      </div>
      {/* Uploaded Files List and buttons only if not processing */}
      {!processing && fileMetas.length > 0 && (
        <div className="mt-8 w-full relative">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Uploaded Files
            </h3>
          </div>
          <div className="space-y-3 w-full">
            {fileMetas.map((file) => (
              <div
                key={file.id}
                className={`p-4 rounded-xl border transition-all w-full ${
                  theme === "dark"
                    ? "bg-gray-800/50 border-gray-700/50"
                    : "bg-white/80 border-gray-200/80"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="text-2xl">{getFileIcon(file.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-800 dark:text-gray-100 truncate">
                          {file.name}
                        </h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatFileSize(file.size)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-xs text-green-600 dark:text-green-400">
                          Uploaded successfully
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(file.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    disabled={processing}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
          {/* Submit Button at bottom right */}
          <div className="flex w-full justify-end mt-6 gap-3">
            <SecondaryButton
              text="Clear All"
              onClick={() => setFiles([], [])}
              disabled={processing}
              style={{
                minWidth: 0,
                padding: "0 12px",
                height: "38px",
                fontSize: "14px",
              }}
              mode={theme === "dark" ? "dark" : "light"}
            />

            <StatefulButton
              onClick={handleSubmit}
              disabled={processing || uploadedFiles.length === 0}
              className="h-[40px] send-button"
              mode={theme === "dark" ? "dark" : "light"}
            >
              {processing ? "Uploading..." : "Submit"}
            </StatefulButton>
          </div>
        </div>
      )}
      {/* Status UI (always shown if processing or status exists) */}
      {(processing || status) && (
        <FileUploadStatus
          status={status}
          bundleStatus={bundleStatus}
          initialResponse={initialResponse}
          uploading={processing}
          error={error}
          theme={theme}
        />
      )}
    </div>
  );
};
