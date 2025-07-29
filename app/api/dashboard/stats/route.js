import { NextResponse } from "next/server"; 
import { connectToDB } from "@/lib/connectDb";
import Product from "@/models/Products";
import Order from "@/models/Orders";
import Customer from "@/models/Customers";
import Category from "@/models/Category";

export async function GET() {
  try {
    await connectToDB();

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Calculate time periods (consistent with profit route)
    const startOfLastWeek = new Date(now);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7 - startOfLastWeek.getDay() + 1);
    startOfLastWeek.setHours(0, 0, 0, 0);

    const endOfLastWeek = new Date(startOfLastWeek);
    endOfLastWeek.setDate(endOfLastWeek.getDate() + 6);
    endOfLastWeek.setHours(23, 59, 59, 999);

    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    endOfLastMonth.setHours(23, 59, 59, 999);

    // Get monthly data (last 6 months)
    const monthlyData = await Order.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 6 }
    ]);

    // Fetch all counts in parallel
    const [
      allProducts, 
      allOrders, 
      allCategories, 
      allCustomers,
      todayOrders, 
      lastWeekOrders,
      lastMonthOrders,
      todayCustomers, 
      lastWeekCustomers,
      lastMonthCustomers,
      todayProducts,
      lastWeekProducts,
      lastMonthProducts
    ] = await Promise.all([
      // All-time counts
      Product.countDocuments(),
      Order.countDocuments(),
      Category.countDocuments(),
      Customer.countDocuments(),
      
      // Today counts
      Order.countDocuments({ createdAt: { $gte: startOfToday } }),
      // Last week counts
      Order.countDocuments({ 
        createdAt: { 
          $gte: startOfLastWeek,
          $lte: endOfLastWeek 
        } 
      }),
      // Last month counts
      Order.countDocuments({
        createdAt: {
          $gte: startOfLastMonth,
          $lte: endOfLastMonth
        }
      }),
      
      // Customer counts
      Customer.countDocuments({ createdAt: { $gte: startOfToday } }),
      Customer.countDocuments({ 
        createdAt: { 
          $gte: startOfLastWeek,
          $lte: endOfLastWeek 
        } 
      }),
      Customer.countDocuments({
        createdAt: {
          $gte: startOfLastMonth,
          $lte: endOfLastMonth
        }
      }),
      
      // Product counts (optional)
      Product.countDocuments({ createdAt: { $gte: startOfToday } }),
      Product.countDocuments({ 
        createdAt: { 
          $gte: startOfLastWeek,
          $lte: endOfLastWeek 
        } 
      }),
      Product.countDocuments({
        createdAt: {
          $gte: startOfLastMonth,
          $lte: endOfLastMonth
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      counts: {
        products: {
          allTime: allProducts,
          today: todayProducts,
          lastWeek: lastWeekProducts,
          lastMonth: lastMonthProducts
        },
        categories: allCategories,
        customers: {
          allTime: allCustomers,
          today: todayCustomers,
          lastWeek: lastWeekCustomers,
          lastMonth: lastMonthCustomers
        },
        orders: {
          allTime: allOrders,
          today: todayOrders,
          lastWeek: lastWeekOrders,
          lastMonth: lastMonthOrders,
          monthly: monthlyData.reverse(),
        },
      },
    });
  } catch (error) {
    console.error("Error in dashboard stats:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}