import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const moduleId = formData.get("moduleId") as string;


    if (!file || !moduleId) {
      return NextResponse.json({ error: "No file or module ID uploaded" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const filePath = `${moduleId}/${Date.now()}-${file.name}`;

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
      .from("outlines") 
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
