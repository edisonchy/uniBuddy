import { connectMongoClient } from "@/lib/db";
import { NextResponse } from "next/server";
import { Db, Collection } from "mongodb";

export async function DELETE(
  req: Request,
  { params }: { params: { moduleId: string } }
) {
  try {
    const { moduleId } = params;

    // Validate moduleId
    if (!moduleId) {
      return NextResponse.json(
        { error: "Module ID is required" },
        { status: 400 }
      );
    }

    const client = await connectMongoClient();
    const db: Db = client.db("unibuddy");
    const modulesCollection: Collection = db.collection("modules");

    // Delete the module
    const result = await modulesCollection.deleteOne({
      id: moduleId,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
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
