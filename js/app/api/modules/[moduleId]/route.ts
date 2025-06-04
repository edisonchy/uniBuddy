import { createClient } from "@/lib/server";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { moduleId: string } }
) {
  try {
    const { moduleId } = params;
    if (!moduleId) {
      return NextResponse.json(
        { error: "Module ID is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    const { error: countError } = await supabase
      .from("Modules")
      .select("*", { count: "exact", head: true })
      .eq("module_id", moduleId);

    if (countError) {
      console.error("Error fetching count:", countError);
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    // Then, perform the delete operation
    const { error: deleteError } = await supabase
      .from("Modules")
      .delete()
      .eq("module_id", moduleId);

    if (deleteError) {
      console.error("Error deleting module:", deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
      // Handle error accordingly
    }

    return NextResponse.json(
      { message: "Module deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting module:", error);
    return NextResponse.json(
      { error: "Failed to delete module" },
      { status: 500 }
    );
  }
}
