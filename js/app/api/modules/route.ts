// app/api/modules/route.ts
import { NextResponse } from "next/server";
import { connectMongoClient } from "@/lib/db";
import { Db, Collection } from "mongodb";

export async function GET() {
  try {
    const client = await connectMongoClient();
    const db: Db = client.db("unibuddy");
    const modulesCollection: Collection = db.collection("modules");

    const modules = await modulesCollection.find({}).toArray();
    return NextResponse.json({ modules });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, name, year, term } = body;
    if (!id || !name || !year || !term) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    const client = await connectMongoClient();
    const db: Db = client.db("unibuddy");
    const modulesCollection: Collection = db.collection("modules");

    const newModule = { id, name, year, term };
    await modulesCollection.insertOne(newModule);

    return NextResponse.json(
      { message: "Module added", module: newModule },
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