"use client";

import { useState, useCallback } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import FileIcon from "@/app/(pages)/modules/[module]/components/fileIcon";

export default function FileUploadCard() {
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) {
      // No files were accepted; this case is handled by onDropRejected
      return;
    }

    // Proceed with processing the accepted PDF file
    setFiles(acceptedFiles);
    toast.success("PDF file ready for upload.");
  }, []);

  const onDropRejected = useCallback((fileRejections: FileRejection[]) => {
    fileRejections.forEach((rejection) => {
      rejection.errors.forEach((error) => {
        if (error.code === "file-invalid-type") {
          toast.error("Only PDF files are allowed.");
        } else {
          toast.error(error.message);
        }
      });
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  });

  const handleUpload = () => {
    if (files.length === 0) {
      toast.error("No file selected for upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", files[0]);

    // Replace with your actual upload endpoint
    fetch("/api/upload", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (response.ok) {
          toast.success("File uploaded successfully!");
          setFiles([]);
        } else {
          toast.error("File upload failed.");
        }
      })
      .catch(() => {
        toast.error("An error occurred during file upload.");
      });
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
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 bg-white"
          }`}
        >
          <input {...getInputProps()} />
          <FileIcon className="w-12 h-12 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">
            {isDragActive
              ? "Drop the file here..."
              : "Drag and drop a file here, or click to select one"}
          </p>
          <p className="text-xs text-gray-400 mt-1">Accepted format: PDF</p>
        </div>
        {files.length > 0 && (
          <div className="text-sm text-gray-700">
            <p>Selected file:</p>
            <ul className="list-disc list-inside">
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
        <Button size="lg" className="w-full cursor-pointer" onClick={handleUpload}>
          Upload
        </Button>
      </CardFooter>
    </Card>
  );
}
