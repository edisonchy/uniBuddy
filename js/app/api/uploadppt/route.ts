// app/api/uploadppt/route.ts
import { NextRequest, NextResponse } from "next/server";

interface BackendErrorResponse {
  error: string;
}

export async function POST(req: NextRequest) {
  const FLASK_BACKEND_URL = process.env.FLASK_BACKEND_URL || "http://localhost:8888";
  const uploadEndpoint = `${FLASK_BACKEND_URL}/process-ppt`;
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const moduleId = formData.get("moduleId");
    const topic = formData.get("topic");

    // Validate input
    if (
      !file ||
      typeof file === "string" ||
      !moduleId ||
      typeof moduleId !== "string" ||
      !topic ||
      typeof topic !== "string"
    ) {
      return NextResponse.json(
        {
          error: "Invalid input. Ensure 'file' is a File and both 'moduleId' and 'topic' are strings.",
        },
        { status: 400 }
      );
    }

    // Optional: enforce file type
    if (!file.type.includes("application/")) {
      return NextResponse.json(
        { error: "Invalid file type. Must be a document or presentation." },
        { status: 400 }
      );
    }

    // Prepare form data for Flask
    const flaskFormData = new FormData();
    flaskFormData.append("file", file);
    flaskFormData.append("moduleId", moduleId);
    flaskFormData.append("topic", topic);

    // Send to Flask backend
    const flaskResponse = await fetch(uploadEndpoint, {
      method: "POST",
      body: flaskFormData,
    });

    if (!flaskResponse.ok) {
      const status = flaskResponse.status;
      let errorResponse: BackendErrorResponse = {
        error: "Failed to upload file to backend",
      };

      try {
        const responseText = await flaskResponse.text();
        const parsed = JSON.parse(responseText);
        if (parsed && typeof parsed === "object" && "error" in parsed) {
          errorResponse = parsed as BackendErrorResponse;
        } else {
          errorResponse.error = `Unexpected response format from backend. Status: ${status}`;
        }
      } catch (e) {
        errorResponse.error = `Flask server error (status: ${status}). Could not parse response.`;
      }

      return NextResponse.json(errorResponse, { status });
    }

    const successData = await flaskResponse.json();
    return NextResponse.json(successData, { status: flaskResponse.status });
  } catch (error) {
    console.error("Unexpected server error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? `Internal error: ${error.message}`
            : "Unexpected internal error",
      },
      { status: 500 }
    );
  }
}