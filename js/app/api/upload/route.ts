// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/server"; // Adjust the import path as needed

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const filePath = `uploads/${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("outlines")
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 }
      );
    }

    const { data } = supabase.storage
      .from("outlines") // Replace with your actual bucket name
      .getPublicUrl(filePath);

    return NextResponse.json(
      { message: "File uploaded successfully", url: data.publicUrl },
      { status: 200 }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
