"use client";

import React, { useState } from "react";
import {
  Table,
  TableCaption,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function CustomerOrdersTable() {
  const router = useRouter();
  const { id } = useParams();
  const queryClient = useQueryClient();

  const [actionLoading, setActionLoading] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["customer", id],
    queryFn: async () => {
      const res = await axios.get(`/api/customers/${id}`);
      console.log(res.data); 
      return res.data;
    },
    enabled: !!id,
  });

  const handleAction = async (action, orderId) => {
    try {
      setActionLoading(true);

      if (action === "print") {
        const res = await axios.get(`http://localhost:3001/print/${orderId}`);
        console.log(res+" Triggereddddddddddddddd")
        toast.success(res.data?.message || "Print triggered!");
      } else if (action === "delete") {
        const res = await axios.delete(`/api/orders/${orderId}`);
        toast.success(res.data?.message || "Order reverted.");
        queryClient.invalidateQueries(["customer", id]);
      } else if (action === "markPaid") {
        await axios.put(`/api/orders/${orderId}/markpaid`);
        toast.success("Order marked as paid!");
        queryClient.invalidateQueries(["customer", id]);
      } else if (action === "edit") {
        router.push(`/dashboard/orders/${orderId}`);
      } else if (action === "view") {
        router.push(`/dashboard/invoices/${orderId}`);
      }
    } catch {
      toast.error("Action failed.");
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="animate-spin h-6 w-6" />
      </div>
    );

  if (isError)
    return (
      <div className="text-center py-10 text-red-600">
        Failed to load orders.
      </div>
    );

  const orders = data?.orders || [];

  return (
    <section className="section">
      <div className="text-lg font-semibold">Orders for {data?.fullName}</div>
      <Table>
        <TableCaption>Recent orders placed by this customer.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Order #</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            {/* <TableHead>Profit</TableHead> */}
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6">
                No orders found.
              </TableCell>
            </TableRow>
          ) : (
            [...orders].reverse().map((order, index) => (
              <TableRow key={order._id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>${Number(order.total).toFixed(2)}</TableCell>
                <TableCell>
                  {format(new Date(order.createdAt), "yyyy-MM-dd HH:mm")}
                </TableCell>
                <TableCell>
                  <span
                    className={`font-medium ${
                      order.status === "paid"
                        ? "text-green-600"
                        : order.status === "partiallyPaid"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {order.status === "paid"
                      ? "Paid"
                      : order.status === "partiallyPaid"
                      ? "Partially Paid"
                      : "Pending"}
                  </span>
                </TableCell>
                {/* <TableCell>{order.profit}</TableCell> */}
                <TableCell className="text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" disabled={actionLoading}>
                        <span className="sr-only">Open menu</span>⋯
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleAction("view", order._id)}>
                        View Invoice
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction("print", order._id)}>
                        {actionLoading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                        Print
                      </DropdownMenuItem>
                      {order.status !== "paid" && (
                        <>
                          <DropdownMenuItem onClick={() => handleAction("delete", order._id)}>
                            {actionLoading && (
                              <Loader2 className="animate-spin h-4 w-4 mr-2" />
                            )}
                            Undo Order
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction("markPaid", order._id)}>
                            {actionLoading && (
                              <Loader2 className="animate-spin h-4 w-4 mr-2" />
                            )}
                            Mark as Paid
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuItem onClick={() => handleAction("edit", order._id)}>
                        Edit Order
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </section>
  );
}
