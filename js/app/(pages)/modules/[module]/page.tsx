// app/(pages)/modules/[module]/page.tsx
"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, useCallback } from "react";
import {
  useDropzone,
  FileRejection,
} from "react-dropzone";
import { toast } from "sonner";

// Import the FileUploadCard component
import FileUploadCard from "@/app/(pages)/modules/[module]/components/fileUploadCard";

// Define the interface for your processed data
interface ProcessedData {
  course_outline: string;
  lecturers: { name: string; email: string }[];
  topics: string[];
  assessment: any[];
  learning_outcomes: string[];
  textbook: {
    title: string;
    edition: string;
    authors: string;
    publisher: string;
    year: string;
  };
}

export default function OutlinePage() {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const pathSegments = pathname.split("/");
  const moduleId = pathSegments[pathSegments.length - 1];
  const name = searchParams.get("name");
  const year = searchParams.get("year");
  const term = searchParams.get("term");

  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [processedContent, setProcessedContent] =
    useState<ProcessedData | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) {
      return;
    }
    setFiles(acceptedFiles.slice(0, 1));
    setUploadError(null);
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
        setUploadError(error.message);
      });
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
    maxSize: 10 * 1024 * 1024,
    minSize: 10 * 1024,
  });

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("No file selected for upload.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setProcessedContent(null);

    const formData = new FormData();
    formData.append("file", files[0]);
    formData.append("moduleId", moduleId);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage =
          errorData.error || "File upload failed. Please try again.";
        toast.error(errorMessage);
        setUploadError(errorMessage);
        setIsUploading(false);
        return;
      }

      const successData = await response.json();
      console.log("Upload successful:", successData);

      if (
        successData.outlineProcessed === "success" &&
        successData.processedData
      ) {
        setProcessedContent(successData.processedData);
        toast.success("Outline processed successfully!");
        setFiles([]);
      } else {
        const errorMessage =
          successData.error ||
          "Upload successful, but no processed outline data received.";
        setUploadError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("An error occurred during file upload:", error);
      const errorMessage =
        "An unexpected error occurred during upload. Check console for details.";
      setUploadError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setProcessedContent(null);
    setFiles([]);
    setUploadError(null);
  };

  return (
    <main className="min-h-screen p-8 sm:p-20 bg-white text-black dark:bg-[#0a0a0a] dark:text-white">
      <section className="mb-6">
        <Link
          href="/modules"
          className="inline-block mb-4 text-blue-600 dark:text-blue-400 hover:underline text-sm"
        >
          ← Back to Modules
        </Link>

        <div className="flex items-end gap-6 mb-10">
          <h1 className="text-3xl sm:text-5xl font-bold">
            📘 {moduleId} - {name}
          </h1>
          <div className="pb-1 text-md text-gray-600 dark:text-gray-400">
            {year} {term}
          </div>
        </div>

        {processedContent ? (
          <div className="bg-gray-100 dark:bg-gray-900 p-6 rounded-lg shadow-md max-w-md mx-auto">
            <h2 className="text-xl font-semibold mb-4 text-center">
              Processed Course Outline
            </h2>
            {uploadError && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
                role="alert"
              >
                {uploadError}
              </div>
            )}
            <pre className="whitespace-pre-wrap break-words bg-gray-200 dark:bg-gray-800 p-4 rounded text-sm overflow-auto text-gray-800 dark:text-gray-200">
              {JSON.stringify(processedContent, null, 2)}
            </pre>
            <div className="mt-4">
              <h3 className="font-bold text-lg mb-2">Details:</h3>
              <p>
                <strong>Course Outline:</strong>{" "}
                {processedContent.course_outline}
              </p>
              {processedContent.lecturers &&
                processedContent.lecturers.length > 0 && (
                  <>
                    <h4 className="font-semibold mt-2">Lecturers:</h4>
                    <ul className="list-disc list-inside ml-4">
                      {processedContent.lecturers.map((lec, index) => (
                        <li key={index}>
                          {lec.name} ({lec.email})
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              {processedContent.topics &&
                processedContent.topics.length > 0 && (
                  <>
                    <h4 className="font-semibold mt-2">Topics:</h4>
                    <ul className="list-disc list-inside ml-4">
                      {processedContent.topics.map((topic, index) => (
                        <li key={index}>{topic}</li>
                      ))}
                    </ul>
                  </>
                )}
            </div>
            <button
              onClick={handleReset}
              className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Upload Another File
            </button>
          </div>
        ) : (
          <FileUploadCard
            files={files}
            isUploading={isUploading}
            uploadError={uploadError}
            handleUpload={handleUpload}
            getRootProps={getRootProps}
            getInputProps={getInputProps}
            isDragActive={isDragActive}
          />
        )}
      </section>
    </main>
  );
}