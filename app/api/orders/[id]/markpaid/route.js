import { NextResponse } from "next/server";
import Order from "@/models/Orders";
import Customer from "@/models/Customers";
import { connectToDB } from "@/lib/connectDb";

export async function PUT(req, { params }) {
  await connectToDB();
  const { id } = await params;

  try {
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    if (order.status === "paid") {
      return NextResponse.json(
        { message: "Order is already marked as paid." },
        { status: 200 }
      );
    }

    // Calculate how much is left to pay
    const previouslyPaid = order.amountpaid || 0;
    const remainingToPay = order.total - previouslyPaid;

    // Get current customer debt
    const customer = await Customer.findById(order.customer);
    if (!customer) {
      return NextResponse.json({ error: "Customer not found." }, { status: 404 });
    }

    // Calculate new debt value
    const newDebt = customer.debt - remainingToPay;
    
    // Prevent debt from going below 0
    const actualDebtReduction = Math.min(remainingToPay, customer.debt);
    const finalDebt = Math.max(0, newDebt);

    // Update order payment status
    order.amountpaid = order.total;
    order.remainingBalance = 0;
    order.status = "paid";
    order.paymentDate = new Date();
    await order.save();

    // Update customer's debt
    await Customer.findByIdAndUpdate(
      order.customer,
      { $set: { debt: finalDebt } },
      { new: true }
    );

    return NextResponse.json(
      { 
        message: "Order marked as fully paid.",
        details: {
          orderId: order._id,
          totalAmount: order.total,
          amountPaid: order.amountpaid,
          debtReduction: actualDebtReduction,
          newDebt: finalDebt
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error marking order as paid:", error);
    return NextResponse.json(
      { 
        error: "Failed to mark order as paid.",
        details: error.message 
      },
      { status: 500 }
    );
  }
}
