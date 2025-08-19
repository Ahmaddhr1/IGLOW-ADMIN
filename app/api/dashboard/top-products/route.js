import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/connectDb";
import Product from "@/models/Products";

export async function GET() {
  try {
    await connectToDB();

    // Find top 5 products sorted by nbOfOrders descending
    const topProducts = await Product.find({})
      .sort({ nbOfOrders: -1 })
      .limit(5)
      .select("name nbOfOrders price img");

    return NextResponse.json({
      success: true,
      topProducts,
    });
  } catch (error) {
    console.error("Error fetching top products:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch top products" },
      { status: 500 },
      headers: {
      "Access-Control-Allow-Origin": "*", // or "https://yourdomain.com"
      "Access-Control-Allow-Methods": "GET",
    },
    );
  }
}
