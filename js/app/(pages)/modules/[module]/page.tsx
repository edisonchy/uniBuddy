// app/(pages)/modules/[module]/page.tsx
"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { toast } from "sonner";
import { PostgrestError } from "@supabase/supabase-js";

// Import your Supabase client
import { supabase } from "@/lib/client";

// Import the FileUploadCard component
import FileUploadCard from "@/app/(pages)/modules/[module]/components/fileUploadCard";
import Header from "@/app/(pages)/modules/[module]/components/header";

interface ProcessedData {
  course_outline: string;
  lecturers: { name: string; email: string }[];
  topics: string[];
  assessment: {
    method: string;
    weighting: number;
  }[];
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

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [initialLoadError, setInitialLoadError] = useState<string | null>(null);

  const fetchAndSetOutline = useCallback(async () => {
    setIsInitialLoading(true);
    setInitialLoadError(null);
    setProcessedContent(null);

    console.log(
      `[fetchAndSetOutline] Attempting to fetch for moduleId: ${moduleId}`
    );
    try {
      const { data, error } = await supabase
        .from("Outlines")
        .select("content")
        .eq("module_id", moduleId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("[fetchAndSetOutline] Error:", error);
        setInitialLoadError(error.message || "Failed to load outline.");
        setProcessedContent(null);
        return null;
      }

      if (data) {
        console.log("[fetchAndSetOutline] Data found.");
        setProcessedContent(data.content as ProcessedData);
      } else {
        // If no matching data is returned (e.g., moduleId not found), explicitly clear processed content to avoid showing stale data.
        console.log("[fetchAndSetOutline] No data found (PGRST116).");
        setProcessedContent(null);
      }
    } catch (err: unknown) {
      const supaError = err as PostgrestError;
      console.error("[fetchAndSetOutline] Unexpected error:", supaError);
      setInitialLoadError(
        supaError?.message ?? "An unexpected error occurred during fetch."
      );
      setProcessedContent(null);
    } finally {
      setIsInitialLoading(false);
      console.log(
        "[fetchAndSetOutline] Finished. isInitialLoading set to false."
      );
    }
  }, [moduleId]);

  useEffect(() => {
    fetchAndSetOutline();
    return () => {
      setProcessedContent(null);
      setInitialLoadError(null);
      setIsInitialLoading(true);
    };
  }, [moduleId, fetchAndSetOutline]);

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
        return;
      }

      const successData = await response.json();
      console.log("Upload successful response from API:", successData);

      if (successData.outlineProcessed === "success") {
        toast.success("Outline uploaded and processed successfully!");
        setFiles([]);
        console.log(
          "[handleUpload] Upload reported success. Re-fetching outline data..."
        );
        await fetchAndSetOutline();
      } else {
        const errorMessage =
          successData.error ||
          "Upload successful, but processing failed. Please try again.";
        setUploadError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error(
        "[handleUpload] An error occurred during file upload:",
        error
      );
      const errorMessage =
        "An unexpected error occurred during upload. Check console for details.";
      setUploadError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
      console.log("[handleUpload] Upload process finished.");
    }
  };

  const handleReset = () => {
    console.log("reset");
    // setProcessedContent(null);
    // setFiles([]);
    // setUploadError(null);
    // setInitialLoadError(null);
    // setIsInitialLoading(true);
    // fetchAndSetOutline();
  };

  return (
    <main className="min-h-screen p-8 sm:p-20 bg-white text-black dark:bg-[#0a0a0a] dark:text-white">
      <section className="mb-6">
        <Header moduleId={moduleId} name={name} year={year} term={term} />

        {isInitialLoading ? (
          <div className="text-center py-12 text-gray-600 dark:text-gray-400">
            Loading outline...
          </div>
        ) : processedContent ? (
          <div className="max-w-3xl mx-auto">
            {(uploadError || initialLoadError) && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
                role="alert"
              >
                {uploadError || initialLoadError}
              </div>
            )}

            {/* General Course Info Box */}
            <div className="bg-gray-100 dark:bg-gray-900 p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-xl font-semibold mb-4">Course Details</h2>
              <p className="text-md font-medium mb-2">
                <strong>Outline:</strong> {processedContent.course_outline}
              </p>

              {processedContent.lecturers &&
                processedContent.lecturers.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-lg mb-2">Lecturers:</h3>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      {processedContent.lecturers.map((lec, index) => (
                        <li key={index}>
                          {lec.name} ({lec.email})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {processedContent.textbook && (
                <div className="mb-4">
                  <h3 className="font-semibold text-lg mb-2">Textbook:</h3>
                  <p className="text-sm">
                    <strong>Title:</strong> {processedContent.textbook.title}
                  </p>
                  <p className="text-sm">
                    <strong>Authors:</strong>{" "}
                    {processedContent.textbook.authors}
                  </p>
                  <p className="text-sm">
                    <strong>Edition:</strong>{" "}
                    {processedContent.textbook.edition}
                  </p>
                  <p className="text-sm">
                    <strong>Publisher:</strong>{" "}
                    {processedContent.textbook.publisher}
                  </p>
                  <p className="text-sm">
                    <strong>Year:</strong> {processedContent.textbook.year}
                  </p>
                </div>
              )}

              {processedContent.learning_outcomes &&
                processedContent.learning_outcomes.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-lg mb-2">
                      Learning Outcomes:
                    </h3>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      {processedContent.learning_outcomes.map(
                        (outcome, index) => (
                          <li key={index}>{outcome}</li>
                        )
                      )}
                    </ul>
                  </div>
                )}

              {processedContent.assessment &&
                processedContent.assessment.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Assessments:</h3>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      {processedContent.assessment.map((item, index) => (
                        <li key={index}>
                          <strong>{item.method}:</strong> {item.weighting}%
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>

            {/* Topics Section */}
            {processedContent.topics && processedContent.topics.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-xl font-semibold mb-2">Topics Covered</h2>
                {processedContent.topics.map((topic, index) => (
                  // Use Link to make the entire box clickable
                  <Link
                    key={index} // Using index as key is okay here if topics don't reorder
                    href={`/modules/${moduleId}/topic/${encodeURIComponent(
                      topic
                    )}`}
                    className="block border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm hover:shadow-md transition duration-200 bg-white dark:bg-gray-800 cursor-pointer"
                  >
                    <h3 className="text-lg font-semibold">📝 {topic}</h3>
                    {/* Optionally, add a smaller "View Summary" within the box if preferred */}
                    {/* <span className="inline-block text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2">
                      View Summary →
                    </span> */}
                  </Link>
                ))}
              </section>
            )}

            <button
              onClick={handleReset}
              className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors w-full max-w-sm mx-auto block"
            >
              Upload Another File
            </button>
          </div>
        ) : (
          // --- Show File Upload Card ---
          <FileUploadCard
            files={files}
            isUploading={isUploading}
            uploadError={uploadError || initialLoadError}
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
