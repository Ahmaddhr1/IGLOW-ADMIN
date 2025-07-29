import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/connectDb";
import Customer from "@/models/Customers";

export async function GET() {
  try {
    await connectToDB();

    // Aggregate total debt from all customers
    const totalDebtResult = await Customer.aggregate([
      {
        $group: {
          _id: null,
          totalDebt: { $sum: "$debt" },
        },
      },
    ]);

    const totalDebt = totalDebtResult[0]?.totalDebt || 0;

    return NextResponse.json({
      success: true,
      totalDebt,
    });
  } catch (error) {
    console.error("Error fetching total debts:", error);
    return NextResponse.json(
      { success: false, message: "Failed to calculate debts" },
      { status: 500 }
    );
  }
}
