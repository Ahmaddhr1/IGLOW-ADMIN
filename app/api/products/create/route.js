import { connectToDB } from "@/lib/connectDb";
import Product from "@/models/Products";
import { NextResponse } from "next/server";

// CREATE a new product
export async function POST(req) {
  await connectToDB();
  try {
    const { name, quantity, price } = await req.json();

    if (!name || price == null) {
      return NextResponse.json(
        { error: "Name and price are required." },
        { status: 400 }
      );
    }
    if(price <0 || quantity<0) {
      return NextResponse.json(
        { error: "price and quantity cant be less than 0" },
        { status: 400 }
      );
    }

    const product = new Product({ name, quantity, price });
    await product.save();

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error creating product", error: error.message },
      { status: 500 }
    );
  }
}
