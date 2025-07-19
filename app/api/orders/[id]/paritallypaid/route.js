import { NextResponse } from "next/server";
import Order from "@/models/Orders";
import Customer from "@/models/Customers";
import { connectToDB } from "@/lib/connectDb";

export async function PUT(req, { params }) {
  await connectToDB();
  const { id } = await params;
  const { amountpaid } = await req.json();

  try {
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    if (order.status === "paid") {
      return NextResponse.json({ error: "Order is already fully paid." }, { status: 400 });
    }

    const previousAmountPaid = order.amountpaid || 0;
    const previousRemaining = order.remainingBalance ?? (order.total - previousAmountPaid);

    // Validate payment amount
    if (
      !amountpaid ||
      amountpaid <= 0 ||
      amountpaid > previousRemaining
    ) {
      return NextResponse.json(
        { error: `Invalid payment. You can only pay up to ${previousRemaining.toFixed(2)}.` },
        { status: 400 }
      );
    }

    // Get current customer debt
    const customer = await Customer.findById(order.customer);
    if (!customer) {
      return NextResponse.json({ error: "Customer not found." }, { status: 404 });
    }

    // Calculate how much we can actually deduct from debt (can't go below 0)
    const maxAllowedPayment = Math.min(amountpaid, customer.debt);
    const actualDebtReduction = -maxAllowedPayment; // Negative because it reduces debt
    const newDebtValue = Math.max(0, customer.debt + actualDebtReduction);

    // Calculate new values
    const newAmountPaid = previousAmountPaid + amountpaid;
    const newRemaining = order.total - newAmountPaid;

    // Update order
    order.amountpaid = newAmountPaid;
    order.remainingBalance = newRemaining;
    order.status = newRemaining === 0 ? "paid" : "partiallyPaid";
    await order.save();

    // Update customer debt - use either $inc or $set, not both
    await Customer.findByIdAndUpdate(order.customer, {
      $set: { debt: newDebtValue }
    });

    return NextResponse.json({
      message: `Payment of ${amountpaid.toFixed(2)} applied successfully. ${newRemaining > 0 ? `Remaining balance: ${newRemaining.toFixed(2)}` : 'Order fully paid!'}`,
      paymentDetails: {
        amountPaid: amountpaid,
        debtReduction: maxAllowedPayment,
        previousDebt: customer.debt,
        newDebt: newDebtValue
      },
      updatedOrder: {
        amountpaid: newAmountPaid,
        remainingBalance: newRemaining,
        status: order.status
      }
    });
  } catch (error) {
    console.error("Payment update error:", error.message);
    return NextResponse.json(
      { error: "Failed to update payment.", details: error.message }, 
      { status: 500 }
    );
  }
}