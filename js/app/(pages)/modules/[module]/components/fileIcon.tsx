"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function FileIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    </svg>
  );
}

export default function FileUploadCard() {
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
    toast.success("File(s) selected successfully!");
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
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
        <Button size="lg" className="w-full" onClick={handleUpload}>
          Upload
        </Button>
      </CardFooter>
    </Card>
  );
}
