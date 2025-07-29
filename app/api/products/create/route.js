import { connectToDB } from "@/lib/connectDb";
import Product from "@/models/Products";
import Category from "@/models/Category"; // import category model
import { NextResponse } from "next/server";

export async function POST(req) {
  await connectToDB();

  try {
    const {
      name,
      quantity,
      price,
      initialPrice,
      profit,
      gender,
      category,
      img,
    } = await req.json();

    if (!name?.trim() || price == null || quantity == null ) {
      return NextResponse.json(
        { error: "Name, price, and quantity are required." },
        { status: 400 }
      );
    }

    const parsedQuantity = parseInt(quantity, 10);
    const parsedPrice = parseFloat(price);
    const parsedInitialPrice = parseFloat(initialPrice);
    const parsedProfit = parseFloat(profit);

    if (
      isNaN(parsedPrice) ||
      isNaN(parsedQuantity) ||
      isNaN(parsedInitialPrice) ||
      isNaN(parsedProfit)
    ) {
      return NextResponse.json(
        { error: "Numeric values are not valid." },
        { status: 400 }
      );
    }

    if (parsedPrice < 0 || parsedQuantity < 0 || parsedInitialPrice < 0) {
      return NextResponse.json(
        { error: "Price, quantity, and initial price must be ≥ 0." },
        { status: 400 }
      );
    }

    // Create the product
    const product = new Product({
      name: name.trim(),
      quantity: parsedQuantity,
      price: parsedPrice,
      initialPrice: parsedInitialPrice,
      profit: parsedProfit,
      gender,
      category,
      img,
    });

    await product.save();

    // If category is provided, push product._id to Category.products
    if (category) {
      await Category.findByIdAndUpdate(category, {
        $push: { products: product._id },
      });
    }

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error creating product", error: error.message },
      { status: 500 }
    );
  }
}
