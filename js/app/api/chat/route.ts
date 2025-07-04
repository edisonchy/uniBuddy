import { NextResponse } from "next/server";

const backendUrl = process.env.FLASK_BACKEND_URL || "http://localhost:8888";

export async function POST(req: Request) {
  const { message, topic, moduleId, chatHistory } = await req.json();
  if (!message || !topic || !moduleId || !chatHistory) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  try {
    const resp = await fetch(`${backendUrl}/process-chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, topic, moduleId, chatHistory }),
    });
    const data = await resp.json();
    if (!resp.ok) {
      return NextResponse.json({ error: data.error || "Flask error" }, { status: resp.status });
    }
    return NextResponse.json({ answer: data.answer });
  } catch (e: any) {
    console.error("Proxy error:", e);
    return NextResponse.json({ error: "Cannot reach Flask backend" }, { status: 502 });
  }
}