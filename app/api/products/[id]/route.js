import { connectToDB } from "@/lib/connectDb";
import Product from "@/models/Products";
import Category from "@/models/Category"; // import your Category model
import { NextResponse } from "next/server";

// GET a product by ID
export async function GET(_, { params }) {
  await connectToDB();
  try {
    const id = params.id;
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { error: "Product not found!" },
        { status: 404 }
      );
    }
    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching product" },
      { status: 500 }
    );
  }
}

// UPDATE a product by ID
export async function PUT(req, { params }) {
  await connectToDB();
  try {
    const id = params.id;
    const body = await req.json();
    console.log(body);
    if (body.price < body.initialPrice) {
      return NextResponse.json(
        { error: "Cost Price can't be bigger than the selling price" },
        { status: 400 }
      );
    }
    const updatedProduct = await Product.findByIdAndUpdate(id, body, {
      new: true,
    });

    if (!updatedProduct) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating product", error: error.message },
      { status: 500 }
    );
  }
}

// DELETE a product by ID
export async function DELETE(req, { params }) {
  await connectToDB();
  try {
    const id = params.id;

    // Find the product before deleting to get its category
    const productToDelete = await Product.findById(id);
    if (!productToDelete) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    // Delete the product
    await Product.findByIdAndDelete(id);

    // Remove product ID from category's products array if category exists
    if (productToDelete.category) {
      await Category.findByIdAndUpdate(productToDelete.category, {
        $pull: { products: id },
      });
    }

    return NextResponse.json(
      { message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error deleting product", error: error.message },
      { status: 500 }
    );
  }
}
