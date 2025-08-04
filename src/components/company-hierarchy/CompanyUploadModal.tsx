"use client";

import React, { useState, useCallback, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Database, Upload, X, FileText, Trash2, ChevronLeft } from "lucide-react";
import { useSmartFileUpload } from "@/lib/hooks/use-smart-file-upload";
import { useFileUploadStore } from "@/store/file-upload-store";
import { FileMeta } from "@/types/store";

interface CompanyUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyName: string;
  companyType: 'parent' | 'sub';
}

type UploadType = 'api' | 'file' | null;

export function CompanyUploadModal({
  isOpen,
  onClose,
  companyName,
  companyType,
}: CompanyUploadModalProps) {
  const [selectedType, setSelectedType] = useState<UploadType>(null);
  const [step, setStep] = useState(1);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [fileMetas, setFileMetas] = useState<FileMeta[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { startUpload } = useSmartFileUpload();
  const { processing, error, status } = useFileUploadStore();

  const handleTypeSelect = (type: UploadType) => {
    setSelectedType(type);
    if (type === 'file') {
      setStep(2);
    }
  };

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;
    
    const newFiles = Array.from(files);
    const newFileMetas: FileMeta[] = newFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'ready',
      progress: 0,
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    setFileMetas(prev => [...prev, ...newFileMetas]);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  }, [handleFileSelect]);

  const removeFile = useCallback((fileId: string) => {
    const fileIndex = fileMetas.findIndex(meta => meta.id === fileId);
    if (fileIndex !== -1) {
      setFileMetas(prev => prev.filter(meta => meta.id !== fileId));
      setUploadedFiles(prev => prev.filter((_, index) => index !== fileIndex));
    }
  }, [fileMetas]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleConfirm = async () => {
    if (step === 2 && uploadedFiles.length > 0) {
      try {
        await startUpload(uploadedFiles);
        setStep(3); // Move to mapping step
      } catch (error) {
        console.error('Upload failed:', error);
      }
    } else if (selectedType === 'api') {
      // Handle API connection logic
      console.log(`Connecting API for ${companyName} (${companyType})`);
      onClose();
      resetModal();
    }
  };

  const resetModal = () => {
    setSelectedType(null);
    setStep(1);
    setSelectedTable('');
    setUploadedFiles([]);
    setFileMetas([]);
    setIsDragOver(false);
  };

  const handleCancel = () => {
    onClose();
    resetModal();
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const canConfirm = () => {
    if (step === 1) return selectedType !== null;
    if (step === 2) return uploadedFiles.length > 0 && !processing;
    if (step === 3) return true;
    return false;
  };

  const canGoBack = () => {
    return step > 1;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-4xl w-full bg-slate-800 border-slate-700 text-white p-0 overflow-hidden"
        showCloseButton={false}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-white">
            File Upload - {companyName}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white h-6 w-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {/* Step 1 */}
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-2 ${
                step >= 1 ? 'bg-emerald-500 text-white' : 'bg-slate-600 text-gray-400'
              }`}>
                1
              </div>
              <div className="text-center">
                <div className={`text-sm font-medium ${step >= 1 ? 'text-white' : 'text-gray-400'}`}>Select Data</div>
                <div className={`text-sm font-medium ${step >= 1 ? 'text-white' : 'text-gray-400'}`}>Type</div>
              </div>
            </div>

            {/* Connector 1 */}
            <div className={`flex-1 h-px mx-4 ${step >= 2 ? 'bg-emerald-500' : 'bg-slate-600'}`} />

            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-2 ${
                step >= 2 ? 'bg-emerald-500 text-white' : 'bg-slate-600 text-gray-400'
              }`}>
                2
              </div>
              <div className="text-center">
                <div className={`text-sm ${step >= 2 ? 'text-white' : 'text-gray-400'}`}>Select</div>
                <div className={`text-sm ${step >= 2 ? 'text-white' : 'text-gray-400'}`}>Destination</div>
              </div>
            </div>

            {/* Connector 2 */}
            <div className={`flex-1 h-px mx-4 ${step >= 3 ? 'bg-emerald-500' : 'bg-slate-600'}`} />

            {/* Step 3 */}
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-2 ${
                step >= 3 ? 'bg-emerald-500 text-white' : 'bg-slate-600 text-gray-400'
              }`}>
                3
              </div>
              <div className="text-center">
                <div className={`text-sm ${step >= 3 ? 'text-white' : 'text-gray-400'}`}>Mapping</div>
              </div>
            </div>

            {/* Connector 3 */}
            <div className={`flex-1 h-px mx-4 ${step >= 4 ? 'bg-emerald-500' : 'bg-slate-600'}`} />

            {/* Step 4 */}
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-2 ${
                step >= 4 ? 'bg-emerald-500 text-white' : 'bg-slate-600 text-gray-400'
              }`}>
                4
              </div>
              <div className="text-center">
                <div className={`text-sm ${step >= 4 ? 'text-white' : 'text-gray-400'}`}>Confirm</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content based on step */}
        <div className="px-6 py-8">
          {step === 1 && (
            <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
              {/* Connect API Card */}
              <div 
                className={`relative cursor-pointer transition-all duration-300 rounded-lg border-2 p-8 text-center ${
                  selectedType === 'api' 
                    ? 'border-emerald-500 bg-slate-700/50' 
                    : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                }`}
                onClick={() => handleTypeSelect('api')}
              >
                <div className="mb-6">
                  <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Database className="w-8 h-8 text-emerald-400" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Connect API</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Drop files here or click to browse<br />
                  through your machine.
                </p>
              </div>

              {/* File Upload Card */}
              <div 
                className={`relative cursor-pointer transition-all duration-300 rounded-lg border-2 p-8 text-center ${
                  selectedType === 'file' 
                    ? 'border-emerald-500 bg-slate-700/50' 
                    : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                }`}
                onClick={() => handleTypeSelect('file')}
              >
                <div className="mb-6">
                  <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Upload className="w-8 h-8 text-emerald-400" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">File Upload</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Drop files here or click to browse<br />
                  through your machine.
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Table Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Select Table</label>
                <Select value={selectedTable} onValueChange={setSelectedTable}>
                  <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Table no 21" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="table-21" className="text-white">Table no 21</SelectItem>
                    <SelectItem value="table-22" className="text-white">Table no 22</SelectItem>
                    <SelectItem value="table-23" className="text-white">Table no 23</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* File Upload Area */}
              <div 
                className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-all duration-300 ${
                  isDragOver 
                    ? 'border-emerald-500 bg-emerald-500/10' 
                    : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="mb-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Upload className="w-8 h-8 text-emerald-400" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Drop or select file</h3>
                <p className="text-sm text-gray-400">
                  Drop files here or click to <span className="text-emerald-400">browse</span> through your machine.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileInputChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls"
                />
              </div>

              {/* Uploaded Files List */}
              {fileMetas.length > 0 && (
                <div className="space-y-3">
                  {fileMetas.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-emerald-500/20 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{file.name}</div>
                          <div className="text-xs text-gray-400">{formatFileSize(file.size)}</div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="max-w-3xl mx-auto text-center">
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-emerald-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Files Uploaded Successfully</h3>
              <p className="text-sm text-gray-400 mb-6">
                Your files have been uploaded and are being processed. You can now proceed to the mapping step.
              </p>
              {processing && (
                <div className="text-sm text-emerald-400">
                  Processing files... Status: {status || 'pending'}
                </div>
              )}
              {error && (
                <div className="text-sm text-red-400">
                  Error: {error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between p-6 border-t border-slate-700">
          {/* Left side - Back button */}
          <div>
            {canGoBack() && (
              <Button
                variant="outline"
                onClick={handleBack}
                className="border-slate-600 text-gray-300 hover:bg-slate-700 bg-transparent flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
            )}
          </div>
          
          {/* Right side - Cancel and Confirm buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="border-slate-600 text-gray-300 hover:bg-slate-700 bg-transparent"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!canConfirm()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}