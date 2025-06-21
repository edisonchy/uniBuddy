import { NextRequest, NextResponse } from "next/server";

// Define a type for a common error response structure (optional but good practice)
interface BackendErrorResponse {
  error: string;
  // Add other common fields if your backend returns them, e.g.,
  // code?: number;
  // details?: string;
}

export async function POST(req: NextRequest) {
  const FLASK_BACKEND_URL =
    process.env.FLASK_BACKEND_URL || "http://localhost:8888"; // Use environment variable
  const uploadEndpoint = `${FLASK_BACKEND_URL}/process-outline`; // Use consistent endpoint name

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const moduleId = formData.get("moduleId");

    // --- Input Validation ---
    if (
      !file ||
      typeof file === "string" ||
      !moduleId ||
      typeof moduleId !== "string"
    ) {
      // Ensure file is a File object, and moduleId is a string
      return NextResponse.json(
        {
          error:
            "Invalid file or module ID provided. Ensure file is a File and moduleId is a string.",
        },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    // --- Prepare FormData for Flask ---
    const flaskFormData = new FormData();
    flaskFormData.append("file", file); // file is already a File object
    flaskFormData.append("moduleId", moduleId);

    // --- Make Request to Flask Backend ---
    const flaskResponse = await fetch(uploadEndpoint, {
      method: "POST",
      body: flaskFormData,
      // You might want to add headers if your Flask app expects them, e.g.,
      // headers: { 'Content-Type': 'multipart/form-data' } - fetch sets this automatically for FormData
    });

    // --- Handle Flask Backend Response ---
    if (!flaskResponse.ok) {
      const status = flaskResponse.status;
      let errorResponse: BackendErrorResponse = {
        error: "Failed to upload file to backend",
      };
      let responseText = "";

      try {
        responseText = await flaskResponse.text(); // Get raw text first
        const parsedData = JSON.parse(responseText); // Attempt to parse
        if (
          parsedData &&
          typeof parsedData === "object" &&
          "error" in parsedData
        ) {
          errorResponse = parsedData as BackendErrorResponse; // Use type assertion
        } else {
          // If it's JSON but not the expected error format
          errorResponse.error = `Backend returned unexpected JSON format. Status: ${status}`;
          console.error("Flask returned unexpected JSON format:", parsedData);
        }
      } catch (e) {
        // If parsing as JSON failed, it's likely HTML or plain text
        console.error(
          "Failed to parse Flask response as JSON, got:",
          responseText.substring(0, 500),
          e
        );
        errorResponse.error = `Backend error (status: ${status}). Please check Flask logs.`;
        if (responseText.startsWith("<!doctype html>")) {
          errorResponse.error = `Backend returned an HTML error page (status: ${status}). Check Flask route or server status.`;
        }
      }

      // Return the error response to the client
      return NextResponse.json(errorResponse, { status });
    }

    // --- If Flask Response is OK ---
    // If Flask returns exactly what you want to send back, you can streamline:
    // return flaskResponse; // This directly proxies the Flask response (headers, status, body)

    // Alternatively, if you need to transform or ensure JSON:
    const successData = await flaskResponse.json();
    console.log("Flask response:", successData);
    return NextResponse.json(successData, { status: flaskResponse.status }); // Explicitly return with status
  } catch (error) {
    console.error("Next.js API route encountered an unexpected error:", error);
    // Differentiate between network errors and other errors
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    );
  }
}
