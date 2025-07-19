import { connectToDB } from "@/lib/connectDb";
import Customer from "@/models/Customers";
import { NextResponse } from "next/server";

export async function POST(req) {
  await connectToDB();
  try {
    const { fullName, phoneNumber, debt, smallBottlesDebt, bigBottlesDebt } =
      await req.json();

    if (!fullName || !phoneNumber) {
      return NextResponse.json(
        { error: "Full Name and phone Number are required" },
        { status: 400 }
      );
    }

    const existingPhoneNumber = await Customer.findOne({ phoneNumber });
    if (existingPhoneNumber) {
      return NextResponse.json(
        { error: "Phone Number already exists" },
        { status: 400 }
      );
    }
    const newCustomer = await new Customer({
      fullName,
      phoneNumber,
      debt,
      smallBottlesDebt,
      bigBottlesDebt,
    });
    await newCustomer.save();
    return NextResponse.json(
      { message: "Customer created successfully" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Error occured while creating customer",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
