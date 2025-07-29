"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import DashboardCard from "@/components/dashboard/DashboardCard";
import ChartCard from "@/components/dashboard/ChartCard";
import {
  LineChart,
  BarChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

const fetchDashboardData = async () => {
  const [profit, stats] = await Promise.all([
    axios.get("/api/dashboard/profit").then((res) => res.data),
    axios.get("/api/dashboard/stats").then((res) => res.data),
  ]);
  return { profit, stats };
};

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboardData,
  });

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        Error loading dashboard data. Please try again later.
      </div>
    );
  }

  const profitData = data?.profit?.data || {};
  const stats = data?.stats || {};

  // Format profit data for charts
  const profitTrendData = [
    { period: "Today", profit: profitData?.today?.realProfit || 0 },
    { period: "Last Week", profit: profitData?.lastWeek?.realProfit || 0 },
    { period: "Last Month", profit: profitData?.lastMonth?.realProfit || 0 },
  ];

  const expectedProfitData = [
    { period: "Today", profit: profitData?.today?.expectedProfit || 0 },
    { period: "Last Week", profit: profitData?.lastWeek?.expectedProfit || 0 },
    {
      period: "Last Month",
      profit: profitData?.lastMonth?.expectedProfit || 0,
    },
  ];

  // Order activity data
  const orderActivityData = [
    { period: "Today", orders: stats?.counts?.orders?.today || 0 },
    { period: "Last Week", orders: stats?.counts?.orders?.lastWeek || 0 },
    { period: "All Time", orders: stats?.counts?.orders?.allTime || 0 },
  ];

  // Customer growth data
  const customerGrowthData = [
    { period: "Today", customers: stats?.counts?.customers?.today || 0 },
    { period: "Last Week", customers: stats?.counts?.customers?.lastWeek || 0 },
    { period: "All Time", customers: stats?.counts?.customers?.allTime || 0 },
  ];

  // Monthly orders data
  const monthlyOrdersData = (stats?.counts?.orders?.monthly || []).map(
    (item) => ({
      month: `${new Date(item._id.year, item._id.month - 1)?.toLocaleString(
        "default",
        {
          month: "short",
        }
      )}`,
      orders: item.count,
    })
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Business Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {isLoading ? (
          Array(4)
            .fill(0)
            .map((_, i) => <Skeleton key={i} className="h-32 rounded-lg" />)
        ) : (
          <>
            <DashboardCard
              title="Real Profit"
              value={`$${(
                profitData?.allTime?.realProfit || 0
              ).toLocaleString()}`}
              icon="💰"
            />
            <DashboardCard
              title="Expected Profit"
              value={`$${(
                profitData?.allTime?.expectedProfit || 0
              ).toLocaleString()}`}
              icon="📈"
            />
            <DashboardCard
              title="Total Orders"
              value={(
                profitData?.allTime?.totalAllOrders || 0
              ).toLocaleString()}
              icon="📦"
            />
            <DashboardCard
              title="Total Revenue"
              value={`$${(
                profitData?.allTime?.totalAllOrdersValue || 0
              ).toLocaleString()}`}
              icon="💵"
            />
          </>
        )}
      </div>

      {/* Orders Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {isLoading ? (
          Array(3)
            .fill(0)
            .map((_, i) => <Skeleton key={i} className="h-32 rounded-lg" />)
        ) : (
          <>
            <DashboardCard
              title="Paid Orders"
              value={(
                profitData?.allTime?.paidOrdersCount || 0
              ).toLocaleString()}
              icon="✅"
              subtitle={`$${(
                profitData?.allTime?.paidOrdersTotal || 0
              ).toLocaleString()}`}
            />
            <DashboardCard
              title="Pending Orders"
              value={(
                profitData?.allTime?.pendingOrdersCount || 0
              ).toLocaleString()}
              icon="⏳"
              subtitle={`$${(
                profitData?.allTime?.pendingOrdersTotal || 0
              ).toLocaleString()}`}
            />
            <DashboardCard
              title="Partial Orders"
              value={(
                profitData?.allTime?.partialOrdersCount || 0
              ).toLocaleString()}
              icon="⚡"
              subtitle={`$${(
                profitData?.allTime?.partialOrdersTotal || 0
              ).toLocaleString()}`}
            />
          </>
        )}
      </div>
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <ChartCard title="Profit Trends" isLoading={isLoading}>
          {!isLoading && (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={profitTrendData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, "Profit"]} />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#4ade80"
                  strokeWidth={2}
                  name="Real Profit"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Expected Profit Trends" isLoading={isLoading}>
          {!isLoading && (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={expectedProfitData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`$${value}`, "Expected Profit"]}
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="Expected Profit"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Order Activity" isLoading={isLoading}>
          {!isLoading && (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={orderActivityData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="#60a5fa" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Customer Growth" isLoading={isLoading}>
          {!isLoading && (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={customerGrowthData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="customers" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Monthly Orders */}
      <ChartCard title="Monthly Order Volume" isLoading={isLoading}>
        {!isLoading && (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={monthlyOrdersData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="orders" fill="#a78bfa" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  );
}
