"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const queryClient = useQueryClient();
  const [amountPaid, setAmountPaid] = useState("");
  const router = useRouter();

  const {
    data: order,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const res = await axios.get(`/api/orders/${orderId}`);
      return res.data;
    },
    enabled: !!orderId,
  });

  const mutation = useMutation({
    mutationFn: async (amountpaid) => {
      const res = await axios.put(`/api/orders/${orderId}/paritallypaid`, {
        amountpaid: Number(amountpaid),
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Partial payment updated");
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      setAmountPaid("");
      router.replace("/dashboard/customers/" + order?.customer?._id);
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || "Failed to update payment");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amountPaid) return toast.error("Please enter an amount");
    mutation.mutate(amountPaid);
  };

  if (isLoading) return <p className="text-center mt-10">Loading...</p>;
  if (error)
    return (
      <p className="text-center text-red-500 mt-10">Error loading order</p>
    );

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-center">
        Edit Payment for Order #{orderId}
      </h1>

      <Card>
        <CardContent className="space-y-4 py-6">
          <div className="space-y-1">
            <p>
              <span className="font-medium">Customer:</span>{" "}
              {order.customer?.fullName || "N/A"}
            </p>
            <p>
              <span className="font-medium">Total:</span> $
              {order.total.toFixed(2)}
            </p>
            <p>
              <span className="font-medium">Paid:</span> $
              {order.amountpaid?.toFixed(2) || 0}
            </p>
            <p>
              <span className="font-medium">Remaining:</span> $
              {order.remainingBalance?.toFixed(2) ||
                order.total - (order.amountpaid || 0)}
            </p>
            <p>
              <span className="font-medium">Status:</span>
              <span
                className={`ml-1 px-2 py-1 rounded-full text-sm ${
                  order.status === "paid"
                    ? "bg-green-100 text-green-700"
                    : order.status === "partiallyPaid"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {order.status}
              </span>
            </p>
          </div>

          {order.status !== "paid" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="number"
                placeholder="Enter amount to add"
                value={amountPaid}
                onChange={(e) => {
                  // Allow decimal values with up to 2 decimal places
                  const value = e.target.value;
                  if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
                    setAmountPaid(value);
                  }
                }}
                min="0"
                max={order?.total || 0}
                step="0.01" // This allows decimal values with 2 decimal places
              />
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="w-full"
              >
                {mutation.isPending ? "Updating..." : "Submit Partial Payment"}
              </Button>
            </form>
          )}

          {order.status === "paid" && (
            <p className="text-green-600 font-medium text-center mt-4">
              Order is fully paid.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
