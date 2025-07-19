import { connectToDB } from "@/lib/connectDb";
import Product from "@/models/Products";
import { NextResponse } from "next/server";

// UPDATE a product
export async function GET(_, { params }) {
  await connectToDB();
  try {
    
    const id = params.id;  
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found!" }, { status: 404 });
    }
    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "error fetching product" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  await connectToDB();
  try {
    await params;
    const id = params.id; 
    const body = await req.json();
    const updatedProduct = await Product.findByIdAndUpdate(id, body, { new: true });

    if (!updatedProduct) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating product", error: error.message },
      { status: 500 }
    );
  }
}

// DELETE a product
export async function DELETE(req, { params }) {
  await connectToDB();
  try {
    const id = params.id; // <-- no await here
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Product deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error deleting product", error: error.message },
      { status: 500 }
    );
  }
}
