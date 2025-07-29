import { connectToDB } from "@/lib/connectDb";
import Customer from "@/models/Customers";
import Order from "@/models/Orders";
import Product from "@/models/Products";
import { NextResponse } from "next/server";

// GET one
export async function GET(_, { params }) {
  await connectToDB();
  try {
    
    const {id} = await params;
    const order = await Order.findById(id)
      .populate("customer")
      .populate("products");
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }
    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching order", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  await connectToDB();

  try {
    const { id } = params; 
    console.log("Deleting order with ID:", id);

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Only allow deleting pending orders
    if (order.status !== "pending") {
      return NextResponse.json(
        { message: "Only pending orders can be deleted" },
        { status: 400 }
      );
    }

    // Roll back product quantities and nbOfOrders
    for (const item of order.products) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: {
          quantity: item.quantity,
          nbOfOrders: -item.quantity,
        },
      });
    }

    // Decrease customer's debt by the total of the order
    await Customer.findByIdAndUpdate(order.customer, {
      $inc: {
        debt: -order.total,
      },
      $pull: {
        orders: order._id,
      },
    });

    // Delete the order itself
    await Order.findByIdAndDelete(id);

    return NextResponse.json(
      { message: "Order deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.log("ERROR deleting order:", error.message);
    return NextResponse.json(
      { message: "Error deleting order", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req, { params }) { 
  await connectToDB();

  try {
    const customerId = params.id;
    const { products, total } = await req.json();

    if (!products?.length) {
      return NextResponse.json(
        { message: "No products provided" },
        { status: 400 }
      );
    }

    const enrichedProducts = [];
    const productUpdates = [];
    let totalProfit = 0; // Track total profit

    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return NextResponse.json(
          { message: `Product with ID ${item.productId} not found.` },
          { status: 404 }
        );
      }

      // Validate price
      if (typeof item.price !== "number" || isNaN(item.price)) {
        return NextResponse.json(
          { message: `Invalid price for product ${product.name}` },
          { status: 400 }
        );
      }

      // Check stock
      if (product.quantity < item.quantity) {
        return NextResponse.json(
          {
            message: `Insufficient stock for "${product.name}". Available: ${product.quantity}, requested: ${item.quantity}`,
          },
          { status: 400 }
        );
      }

      // Calculate profit: If sent price differs from current product price
      let itemProfit = 0;
      if (item.price !== product.price) {
        // Subtract sent price from initial price * quantity
        itemProfit = (item.price - product.initialPrice) * item.quantity;
      } else {
        itemProfit = (product.price - product.initialPrice) * item.quantity;
      }
      totalProfit += itemProfit;

      enrichedProducts.push({
        productId: item.productId,
        name: product.name,
        quantity: item.quantity,
        price: item.price,
      });

      productUpdates.push({
        updateOne: {
          filter: { _id: product._id },
          update: {
            $inc: {
              quantity: -item.quantity,
              nbOfOrders: item.quantity,
            },
          },
        },
      });
    }

    const newOrder = await Order.create({
      customer: customerId,
      products: enrichedProducts,
      total,
      remainingBalance: total,
      profit: totalProfit, // store calculated profit
    });

    // Update product quantities
    await Product.bulkWrite(productUpdates);

    // Attach order to customer and update debt
    await Customer.findByIdAndUpdate(customerId, {
      $push: { orders: newOrder._id },
      $inc: { debt: newOrder.total },
    });

    return NextResponse.json(
      { message: "Order created successfully", order: newOrder },
      { status: 201 }
    );
  } catch (error) {
    console.log(error.message);
    return NextResponse.json(
      { message: "Error creating order", error: error.message },
      { status: 500 }
    );
  }
}

