// app/api/modules/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: modules, error } = await supabase.from("Modules").select("*");

    if (error) {
      console.error("Supabase fetch error:", error);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ modules });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { moduleId, name, year, term } = body;
    if (!moduleId || !name || !year || !term) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("Modules")
      .insert([{ module_id: moduleId, name, year, term }])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: "Module added", module: data },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding module:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
