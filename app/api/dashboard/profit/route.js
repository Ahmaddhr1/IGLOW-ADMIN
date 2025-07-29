import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/connectDb";
import Order from "@/models/Orders";

export async function GET() {
  try {
    await connectToDB();

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Calculate time periods
    const startOfLastWeek = new Date(now);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7 - startOfLastWeek.getDay() + 1);
    startOfLastWeek.setHours(0, 0, 0, 0);

    const endOfLastWeek = new Date(startOfLastWeek);
    endOfLastWeek.setDate(endOfLastWeek.getDate() + 6);
    endOfLastWeek.setHours(23, 59, 59, 999);

    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    endOfLastMonth.setHours(23, 59, 59, 999);

    // Get all orders once
    const allOrders = await Order.find({}).lean();

    // Initialize all required variables
    const timePeriods = {
      today: initStats(),
      lastWeek: initStats(),
      lastMonth: initStats(),
      allTime: initStats()
    };

    // Process all orders
    allOrders.forEach((order) => {
      const { status, profit, amountpaid, total, remainingBalance, createdAt } = order;
      const isToday = createdAt >= startOfToday;
      const isLastWeek = createdAt >= startOfLastWeek && createdAt <= endOfLastWeek;
      const isLastMonth = createdAt >= startOfLastMonth && createdAt <= endOfLastMonth;

      // Process based on status
      if (status === "paid") {
        updateStats(timePeriods.allTime, {
          realProfit: profit,
          paidOrdersTotal: total,
          paidOrdersCount: 1
        });

        if (isToday) updateStats(timePeriods.today, {
          realProfit: profit,
          paidOrdersTotal: total,
          paidOrdersCount: 1
        });
        if (isLastWeek) updateStats(timePeriods.lastWeek, {
          realProfit: profit,
          paidOrdersTotal: total,
          paidOrdersCount: 1
        });
        if (isLastMonth) updateStats(timePeriods.lastMonth, {
          realProfit: profit,
          paidOrdersTotal: total,
          paidOrdersCount: 1
        });
      } 
      else if (status === "pending") {
        updateStats(timePeriods.allTime, {
          expectedProfit: profit,
          pendingOrdersTotal: total,
          pendingOrdersCount: 1
        });

        if (isToday) updateStats(timePeriods.today, {
          expectedProfit: profit,
          pendingOrdersTotal: total,
          pendingOrdersCount: 1
        });
        if (isLastWeek) updateStats(timePeriods.lastWeek, {
          expectedProfit: profit,
          pendingOrdersTotal: total,
          pendingOrdersCount: 1
        });
        if (isLastMonth) updateStats(timePeriods.lastMonth, {
          expectedProfit: profit,
          pendingOrdersTotal: total,
          pendingOrdersCount: 1
        });
      } 
      else if (status === "partiallyPaid") {
        // For partially paid, real profit is based on paid ratio
        const paidRatio = total > 0 ? amountpaid / total : 0;
        const realizedProfit = profit * paidRatio;
        const expectedProfit = profit - realizedProfit;

        updateStats(timePeriods.allTime, {
          realProfit: realizedProfit,
          expectedProfit: expectedProfit,
          partialOrdersTotal: total,
          partialPaidAmount: amountpaid,
          partialOrdersCount: 1
        });

        if (isToday) updateStats(timePeriods.today, {
          realProfit: realizedProfit,
          expectedProfit: expectedProfit,
          partialOrdersTotal: total,
          partialPaidAmount: amountpaid,
          partialOrdersCount: 1
        });
        if (isLastWeek) updateStats(timePeriods.lastWeek, {
          realProfit: realizedProfit,
          expectedProfit: expectedProfit,
          partialOrdersTotal: total,
          partialPaidAmount: amountpaid,
          partialOrdersCount: 1
        });
        if (isLastMonth) updateStats(timePeriods.lastMonth, {
          realProfit: realizedProfit,
          expectedProfit: expectedProfit,
          partialOrdersTotal: total,
          partialPaidAmount: amountpaid,
          partialOrdersCount: 1
        });
      }
    });

    // Calculate derived values
    calculateDerivedStats(timePeriods.allTime);
    calculateDerivedStats(timePeriods.today);
    calculateDerivedStats(timePeriods.lastWeek);
    calculateDerivedStats(timePeriods.lastMonth);

    return NextResponse.json({
      success: true,
      data: timePeriods
    });

  } catch (error) {
    console.error("Error in profit dashboard:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch profit statistics" },
      { status: 500 }
    );
  }
}

// Helper functions
function initStats() {
  return {
    // Profit
    realProfit: 0,
    expectedProfit: 0,
    
    // Paid orders
    paidOrdersTotal: 0,
    paidOrdersCount: 0,
    
    // Pending orders
    pendingOrdersTotal: 0,
    pendingOrdersCount: 0,
    
    // Partially paid orders
    partialOrdersTotal: 0,
    partialPaidAmount: 0,
    partialOrdersCount: 0,
    
    // Calculated fields (will be added later)
    totalAllOrders: 0,
    totalAllOrdersValue: 0,
    totalReceivedAmount: 0,
    totalPendingAmount: 0
  };
}

function updateStats(stats, updates) {
  Object.keys(updates).forEach(key => {
    stats[key] += updates[key];
  });
}

function calculateDerivedStats(stats) {
  stats.totalAllOrders = stats.paidOrdersCount + stats.pendingOrdersCount + stats.partialOrdersCount;
  stats.totalAllOrdersValue = stats.paidOrdersTotal + stats.pendingOrdersTotal + stats.partialOrdersTotal;
  stats.totalReceivedAmount = stats.paidOrdersTotal + stats.partialPaidAmount;
  stats.totalPendingAmount = stats.pendingOrdersTotal + (stats.partialOrdersTotal - stats.partialPaidAmount);
}