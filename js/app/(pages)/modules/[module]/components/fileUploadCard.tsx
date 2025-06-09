"use client";

import { useState, useCallback } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import FileIcon from "@/app/(pages)/modules/[module]/components/fileIcon"; // Assuming this path is correct

type FileUploadCardProps = {
  moduleId: string;
};

export default function FileUploadCard({ moduleId }: FileUploadCardProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false); // New loading state

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) {
      // No files were accepted; this case is handled by onDropRejected
      return;
    }

    // Only allow one file, replace if new file is dropped
    setFiles(acceptedFiles.slice(0, 1)); // Ensure only one file is kept
    toast.success("PDF file ready for upload.");
  }, []);

  const onDropRejected = useCallback((fileRejections: FileRejection[]) => {
    fileRejections.forEach((rejection) => {
      rejection.errors.forEach((error) => {
        if (error.code === "file-invalid-type") {
          toast.error("Only PDF files are allowed.");
        } else if (error.code === "file-too-large") {
          toast.error(`File is too large: ${error.message}`);
        } else if (error.code === "file-too-small") {
          toast.error(`File is too small: ${error.message}`);
        } else {
          toast.error(`Error: ${error.message}`);
        }
      });
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: { "application/pdf": [".pdf"] },
    multiple: false, // Ensure only one file can be dropped
    maxSize: 10 * 1024 * 1024, // Example: 10MB limit
    minSize: 10 * 1024, // Example: 10KB minimum
  });

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("No file selected for upload.");
      return;
    }

    setIsUploading(true); // Set loading state
    const formData = new FormData();
    formData.append("file", files[0]);
    formData.append("moduleId", moduleId);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        toast.success("File uploaded successfully!");
        setFiles([]); // Clear selected files on successful upload
      } else {
        const errorData = await response.json(); // Attempt to read error message from response
        toast.error(errorData.error || "File upload failed. Please try again.");
      }
    } catch (error) {
      console.error("An error occurred during file upload:", error);
      toast.error("An error occurred during file upload. Check console for details.");
    } finally {
      setIsUploading(false); // Reset loading state
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardContent className="p-6 space-y-4">
        <h2 className="text-xl font-semibold text-center mb-4">
          Upload Module Outline
        </h2>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-blue-500 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20" // Added dark mode styles
              : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50" // Added dark mode styles
          }`}
        >
          <input {...getInputProps()} />
          <FileIcon className="w-12 h-12 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isDragActive
              ? "Drop the file here..."
              : "Drag and drop a PDF here, or click to select one"}
          </p>
          <p className="text-xs text-gray-400 mt-1 dark:text-gray-500">Accepted format: PDF (Max 10MB)</p>
        </div>
        {files.length > 0 && (
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <p className="font-medium">Selected file:</p>
            <ul className="list-disc list-inside mt-1">
              {files.map((file) => (
                <li key={file.name}>
                  {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          size="lg"
          className="w-full cursor-pointer"
          onClick={handleUpload}
          disabled={files.length === 0 || isUploading} // Disable button if no file or uploading
        >
          {isUploading ? "Uploading..." : "Upload"}
        </Button>
      </CardFooter>
    </Card>
  );
}