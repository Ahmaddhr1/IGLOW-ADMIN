import { connectToDB } from "@/lib/connectDb";
import Category from "@/models/Category";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectToDB();

    const body = await req.json();
    const { name, img } = body;

    if (!name || !img) {
      return NextResponse.json(
        { error: "Name and image are required." },
        { status: 400 }
      );
    }

    const existing = await Category.findOne({ name });
    if (existing) {
      return NextResponse.json(
        { error: "Category already exists." },
        { status: 409 }
      );
    }

    const category = await Category.create({ name, img });

    return NextResponse.json(category, { status: 201 });
  } catch (err) {
    console.error("Category creation error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectToDB();

    const categories = await Category.find().sort({ createdAt: -1 }); // Newest first

    return NextResponse.json(categories, { status: 200 });
  } catch (err) {
    console.error("Error fetching categories:", err);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
