"use client";

import { useParams } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react"; // Added useEffect for scrollIntoView
import { useDropzone, FileRejection } from "react-dropzone";
import { toast } from "sonner";

import TopicHeader from "@/app/(pages)/modules/[module]/topic/[topic]/components/topicHeader";
import TopicContentSection from "@/app/(pages)/modules/[module]/topic/[topic]/components/topicContentSection";
import TopicUploadCard from "@/app/(pages)/modules/[module]/topic/[topic]/components/topicUploadCard";

import { supabase } from "@/lib/client";

// Define interface for chat messages
type ChatMessage = {
  role: "user" | "system";
  text: string;
};

export default function TopicPage() {
  const params = useParams();
  const moduleId = params.module as string;
  const rawTopic = params.topic as string;
  const topic = decodeURIComponent(rawTopic);

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState<string>("");
  const [isSendingMessage, setIsSendingMessage] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null); 

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [initialLoadError, setInitialLoadError] = useState<string | null>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [slideUrl, setSlideUrl] = useState<string | null>(null);

  const fetchAndSetSlides = useCallback(async () => {
    setIsInitialLoading(true);
    setInitialLoadError(null);
    setSlideUrl(null);

    const filePath = `${moduleId}/${topic}.pdf`;

    try {
      const { data, error } = await supabase.storage
        .from("ppt")
        .createSignedUrl(filePath, 60 * 60); // valid for 1 hour

      if (error) {
        // If error is 'Object not found', we assume no slide was uploaded yet
        if (error.message.includes("Object not found")) {
          console.info(
            "[fetchAndSetSlides] Slide not found — awaiting upload."
          );
          setSlideUrl(null); // explicitly no file found
        } else {
          throw new Error(error.message);
        }
      } else if (data?.signedUrl) {
        setSlideUrl(data.signedUrl);
      }
    } catch (err) {
      console.error("[fetchAndSetSlides] Unexpected error:", err);
      setInitialLoadError("Unexpected error while loading slides.");
    } finally {
      setIsInitialLoading(false);
    }
  }, [moduleId, topic]);

  useEffect(() => {
    fetchAndSetSlides();
  }, [moduleId, topic, fetchAndSetSlides]);

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
    if (files.length === 0) return;

    setIsUploading(true);
    const file = files[0];

    const formData = new FormData();
    formData.append("file", file);
    formData.append("moduleId", moduleId);
    formData.append("topic", topic);

    try {
      const response = await fetch("/api/uploadppt", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        setUploadError(errorData.message || "Upload failed.");
        toast.error("Upload failed.");
      } else {
        toast.success("Slide uploaded successfully!");
        fetchAndSetSlides(); // refresh the view
        setFiles([]);
      }
    } catch (err) {
      console.error(err);
      setUploadError("Unexpected error occurred.");
      toast.error("Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  ///////////////llm stuff/////////////////
  // Auto-scroll to the latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleSendMessage = async () => {
    if (currentMessage.trim() === "") return;

    const userMessage: ChatMessage = {
      role: "user",
      text: currentMessage.trim(),
    };
    setChatHistory((prev) => [...prev, userMessage]);
    setCurrentMessage("");
    setIsSendingMessage(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.text,
          topic,
          moduleId,
          chatHistory, 
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || response.statusText);
      }

      const data = await response.json();
      const aiText = data.answer ?? "🤖 Sorry, I couldn't generate a response.";
      setChatHistory((prev) => [
        ...prev,
        {
          role: "system",
          text: aiText,
        },
      ])
    } catch (e: any) {
      console.error("AI chat error:", e);
      setChatHistory((prev) => [
        ...prev,
        {
          role: "system",
          text: "⚠️ Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isSendingMessage) {
      handleSendMessage();
    }
  };

  return (
    <main className="... flex flex-col">
      <TopicHeader moduleId={moduleId} topic={topic} />

      {isInitialLoading ? (
        // Show loading UI (add back a loading div if needed)
        <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
          Loading topic content...
        </div>
      ) : initialLoadError ? (
        <div className="flex-1 flex items-center justify-center text-red-600 dark:text-red-400">
          Error loading topic. Please try again later.
        </div>
      ) : slideUrl ? (
        <TopicContentSection
          topic={topic}
          slideUrl={slideUrl}
          chatHistory={chatHistory}
          isSendingMessage={isSendingMessage}
          currentMessage={currentMessage}
          setCurrentMessage={setCurrentMessage}
          handleSendMessage={handleSendMessage}
          handleKeyPress={handleKeyPress}
        />
      ) : (
        <TopicUploadCard
          files={files}
          isUploading={isUploading}
          uploadError={uploadError || initialLoadError}
          handleUpload={handleUpload}
          getRootProps={getRootProps}
          getInputProps={getInputProps}
          isDragActive={isDragActive}
        />
      )}
    </main>
  );
}
