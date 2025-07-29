import { connectToDB } from "@/lib/connectDb";
import Customer from "@/models/Customers";
import Order from "@/models/Orders";
import { NextResponse } from "next/server";

// GET one customer
export async function GET(req, { params }) {
  await connectToDB();
  try {
    const id = params.id;
    const customer = await Customer.findById(id).populate({
      path: "orders",
      select:"total createdAt status profit",
      populate: {
        path: "products",
        select: "name price ",
      },
    });
    if (!customer) {
      return NextResponse.json(
        { message: "Customer not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(customer, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching customer", error: error.message },
      { status: 500 }
    );
  }
}
// UPDATE customer
export async function PUT(req, { params }) {
  await connectToDB();
  try {
    const id = params.id;
    const body = await req.json();
    const updatedCustomer = await Customer.findByIdAndUpdate(id, body, {
      new: true,
    });
    if (!updatedCustomer) {
      return NextResponse.json(
        { message: "Customer not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Customer updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating customer", error: error.message },
      { status: 500 }
    );
  }
}

// DELETE customer
export async function DELETE(req, { params }) {
  await connectToDB();
  try {
    const id = params.id;
    const deletedCustomer = await Customer.findByIdAndDelete(id);
    if (!deletedCustomer) {
      return NextResponse.json(
        { message: "Customer not found" },
        { status: 404 }
      );
    }
    await Order.deleteMany({ customer: id });
    return NextResponse.json(
      { message: "Customer deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error deleting customer", error: error.message },
      { status: 500 }
    );
  }
}
