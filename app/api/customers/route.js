import { connectToDB } from "@/lib/connectDb";
import Customer from "@/models/Customers";
import { NextResponse } from "next/server";

export async function GET() {
  await connectToDB();
  try {
    const customers = await Customer.find().select("fullName");
    return NextResponse.json(customers, { status: 200 });
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { message: "Failed to fetch customers", error: error.message },
      { status: 500 }
    );
  }
}
