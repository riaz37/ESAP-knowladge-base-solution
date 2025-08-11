"use client";

import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Upload,
  FileSpreadsheet,
  Database,
  CheckCircle,
  AlertCircle,
  Zap,
  ArrowRight,
  RefreshCw,
  Trash2,
  Download,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useExcelToDB } from "@/lib/hooks/use-excel-to-db";
import { toast } from "sonner";

interface ExcelToDBManagerProps {
  userId: string;
  availableTables?: Array<{
    table_name: string;
    full_name: string;
    columns: Array<{
      column_name: string;
      data_type: string;
      is_nullable: boolean;
    }>;
  }>;
  onViewTableData?: (tableName: string) => void;
}

export function ExcelToDBManager({
  userId,
  availableTables = [],
  onViewTableData,
}: ExcelToDBManagerProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [skipFirstRow, setSkipFirstRow] = useState(true);
  const [aiMappingData, setAIMappingData] = useState<any>(null);
  const [customMapping, setCustomMapping] = useState<Record<string, string>>(
    {}
  );
  const [step, setStep] = useState<
    "upload" | "mapping" | "confirm" | "complete"
  >("upload");

  const {
    checkHealth,
    getAIMapping,
    pushDataToDatabase,
    isLoading,
    error,
    success,
    uploadProgress,
    clearError,
    clearSuccess,
  } = useExcelToDB();

  // File drop zone configuration
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setSelectedFile(file);
        clearError();
        clearSuccess();
        setStep("upload");
        setAIMappingData(null);
        setCustomMapping({});
      }
    },
    [clearError, clearSuccess]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  // Get AI mapping suggestions
  const handleGetAIMapping = async () => {
    if (!selectedFile || !selectedTable || !userId) {
      toast.error("Please select a file and table first");
      return;
    }

    console.log("Getting AI mapping for:", {
      userId,
      selectedTable,
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
    });

    try {
      const response = await getAIMapping({
        user_id: userId,
        table_full_name: selectedTable,
        excel_file: selectedFile,
      });

      console.log("AI mapping response:", response);

      // Validate response structure (API client already extracts data portion)
      if (response && 
          response.all_table_columns && 
          response.all_excel_columns && 
          response.mapping_details &&
          Array.isArray(response.all_table_columns) &&
          Array.isArray(response.all_excel_columns) &&
          Array.isArray(response.mapping_details)) {
        
        setAIMappingData(response);

        // Initialize custom mapping with AI suggestions
        const initialMapping: Record<string, string> = {};
        response.mapping_details.forEach((detail: any) => {
          if (detail.is_mapped && detail.excel_column && detail.table_column) {
            initialMapping[detail.excel_column] = detail.table_column;
          }
        });
        
        setCustomMapping(initialMapping);
        setStep("mapping");

        toast.success("AI mapping suggestions generated successfully");
      } else {
        console.error("Invalid response format:", response);
        console.error("Expected structure: { all_table_columns: [], all_excel_columns: [], mapping_details: [] }");
        toast.error("Invalid response from AI mapping service");
      }
    } catch (err) {
      console.error("Error getting AI mapping:", err);
      toast.error("Failed to get AI mapping suggestions. Please check the console for details.");
    }
  };

  // Push data to database
  const handlePushData = async () => {
    if (
      !selectedFile ||
      !selectedTable ||
      !userId ||
      Object.keys(customMapping).length === 0
    ) {
      toast.error("Please complete the mapping configuration");
      return;
    }

    try {
      const response = await pushDataToDatabase({
        user_id: userId,
        table_full_name: selectedTable,
        column_mapping: customMapping,
        skip_first_row: skipFirstRow,
        excel_file: selectedFile,
      });

      if (response) {
        setStep("complete");
        toast.success(
          `Successfully imported ${response.data.rows_inserted} rows`
        );
      }
    } catch (err) {
      console.error("Error pushing data:", err);
    }
  };

  // Reset the form
  const handleReset = () => {
    setSelectedFile(null);
    setSelectedTable("");
    setAIMappingData(null);
    setCustomMapping({});
    setStep("upload");
    clearError();
    clearSuccess();
  };

  // Update custom mapping
  const updateMapping = (excelColumn: string, dbColumn: string) => {
    if (dbColumn === "__no_mapping__") {
      // Remove the mapping if "No mapping" is selected
      setCustomMapping((prev) => {
        const newMapping = { ...prev };
        delete newMapping[excelColumn];
        return newMapping;
      });
    } else {
      setCustomMapping((prev) => ({
        ...prev,
        [excelColumn]: dbColumn,
      }));
    }
  };

  // Remove mapping
  const removeMapping = (excelColumn: string) => {
    setCustomMapping((prev) => {
      const newMapping = { ...prev };
      delete newMapping[excelColumn];
      return newMapping;
    });
  };

  const selectedTableData = availableTables.find(
    (table) => table.full_name === selectedTable
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6 text-green-400" />
            Excel to Database
          </h2>
          <p className="text-slate-400 mt-1">
            Upload and map Excel files to your database tables
          </p>
        </div>
        {step !== "upload" && (
          <Button onClick={handleReset} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Start Over
          </Button>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step 1: File Upload */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Upload className="h-5 w-5" />
            Step 1: Upload Excel File
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Drop Zone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-green-400 bg-green-400/10"
                : "border-slate-600 hover:border-slate-500"
            }`}
          >
            <input {...getInputProps()} />
            <FileSpreadsheet className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-green-400">Drop the Excel file here...</p>
            ) : (
              <div>
                <p className="text-white mb-2">
                  Drag & drop an Excel file here, or click to select
                </p>
                <p className="text-slate-400 text-sm">
                  Supports .xlsx and .xls files up to 50MB
                </p>
              </div>
            )}
          </div>

          {/* Selected File Info */}
          {selectedFile && (
            <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
              <FileSpreadsheet className="h-5 w-5 text-green-400" />
              <div className="flex-1">
                <p className="text-white font-medium">{selectedFile.name}</p>
                <p className="text-slate-400 text-sm">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button
                onClick={() => setSelectedFile(null)}
                variant="ghost"
                size="sm"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Table Selection */}
          <div className="space-y-2">
            <Label className="text-white">Select Target Table</Label>
            <Select value={selectedTable} onValueChange={setSelectedTable}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a database table" />
              </SelectTrigger>
              <SelectContent>
                {availableTables.map((table) => (
                  <SelectItem key={table.full_name} value={table.full_name}>
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      <span>{table.full_name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {table.columns.length} columns
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Options */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="skipFirstRow"
              checked={skipFirstRow}
              onChange={(e) => setSkipFirstRow(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="skipFirstRow" className="text-white">
              Skip first row (headers)
            </Label>
          </div>

          {/* Get AI Mapping Button */}
          <Button
            onClick={handleGetAIMapping}
            disabled={!selectedFile || !selectedTable || isLoading}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            Get AI Mapping Suggestions
          </Button>
        </CardContent>
      </Card>

      {/* Step 2: Column Mapping */}
      {step === "mapping" && aiMappingData && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <ArrowRight className="h-5 w-5" />
              Step 2: Configure Column Mapping
            </CardTitle>
            <div className="flex items-center gap-4 text-sm">
              <Badge className="bg-blue-500/20 text-blue-400">
                {aiMappingData.all_excel_columns.length} Excel columns
              </Badge>
              <Badge className="bg-green-500/20 text-green-400">
                {aiMappingData.all_table_columns.length} DB columns
              </Badge>
              <Badge className="bg-purple-500/20 text-purple-400">
                {
                  aiMappingData.mapping_details.filter((d: any) => d.is_mapped)
                    .length
                }{" "}
                mapped
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Mapping Table */}
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4 text-sm font-medium text-slate-400 pb-2 border-b border-slate-600">
                <div>Excel Column</div>
                <div>Database Column</div>
                <div>Actions</div>
              </div>

              {aiMappingData.all_excel_columns.map((excelColumn: string) => {
                const mappingDetail = aiMappingData.mapping_details.find(
                  (detail: any) => detail.excel_column === excelColumn
                );
                const currentMapping = customMapping[excelColumn];

                return (
                  <div
                    key={excelColumn}
                    className="grid grid-cols-3 gap-4 items-center p-3 bg-slate-700/30 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-blue-400" />
                      <span className="text-white font-medium">
                        {excelColumn}
                      </span>
                    </div>

                    <div>
                      <Select
                        value={currentMapping || ""}
                        onValueChange={(value) =>
                          updateMapping(excelColumn, value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select DB column" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__no_mapping__">No mapping</SelectItem>
                          {selectedTableData?.columns.map((col) => (
                            <SelectItem
                              key={col.column_name}
                              value={col.column_name}
                            >
                              <div className="flex items-center gap-2">
                                <Database className="h-3 w-3" />
                                <span>{col.column_name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {col.data_type}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {mappingDetail && (
                        <div className="flex items-center gap-2 mt-1 text-xs">
                          <Badge
                            className={`${
                              mappingDetail.mapping_status === "MAPPED"
                                ? "bg-green-500/20 text-green-400"
                                : mappingDetail.mapping_status === "IDENTITY"
                                ? "bg-blue-500/20 text-blue-400"
                                : "bg-gray-500/20 text-gray-400"
                            }`}
                          >
                            {mappingDetail.mapping_status}
                          </Badge>
                          {mappingDetail.is_identity && (
                            <Badge className="bg-purple-500/20 text-purple-400">
                              Identity
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      {currentMapping && (
                        <Button
                          onClick={() => removeMapping(excelColumn)}
                          variant="ghost"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <Separator />

            {/* Mapping Summary */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-400">
                {Object.keys(customMapping).length} of{" "}
                {aiMappingData.all_excel_columns.length} columns mapped
              </div>
              <Button
                onClick={() => setStep("confirm")}
                disabled={Object.keys(customMapping).length === 0}
                className="bg-green-600 hover:bg-green-700"
              >
                Continue to Import
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Confirmation */}
      {step === "confirm" && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <CheckCircle className="h-5 w-5" />
              Step 3: Confirm Import
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-400">File</Label>
                <p className="text-white">{selectedFile?.name}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-400">Target Table</Label>
                <p className="text-white">{selectedTableData?.table_name}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-400">Mapped Columns</Label>
                <p className="text-white">
                  {Object.keys(customMapping).length}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-400">Skip Headers</Label>
                <p className="text-white">{skipFirstRow ? "Yes" : "No"}</p>
              </div>
            </div>

            {isLoading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Upload Progress</span>
                  <span className="text-white">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={() => setStep("mapping")}
                variant="outline"
                disabled={isLoading}
              >
                Back to Mapping
              </Button>
              <Button
                onClick={handlePushData}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 flex-1"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Import Data to Database
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Complete */}
      {step === "complete" && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-8 pb-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              Import Completed Successfully!
            </h3>
            <p className="text-slate-400 mb-6">
              Your Excel data has been successfully imported to the database.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={handleReset} variant="outline">
                Import Another File
              </Button>
              <Button
                onClick={() => onViewTableData?.(selectedTable)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Database className="h-4 w-4 mr-2" />
                View Table Data
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
