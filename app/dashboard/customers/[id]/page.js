"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import Loading from "@/components/Loading";
import { Label } from "@/components/ui/label";
import Link from "next/link";

const EditCustomerPage = () => {
  const router = useRouter();
  const { id } = useParams();
  const [actionLoading, setActionLoading] = useState(false);
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    fullName: "",
    phoneNumber: "",
    debt: "",
    orders: [],
  });

  // Fetch existing customer data (including orders)
  const { data, isLoading, isError } = useQuery({
    queryKey: ["customer", id],
    queryFn: async () => {
      const res = await axios.get(`/api/customers/${id}`);
      console.log(res.data);
      return res.data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (data) {
      setForm({
        fullName: data.fullName || "",
        phoneNumber: data.phoneNumber || "",
        debt: data.debt?.toFixed(2) || "",
        orders: data?.orders || [],
      });
    }
    if (isError) {
      toast.error("Failed to fetch customer.");
    }
    console.log("Foormmmmmm",form)
  }, [data, isError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numericFields = ["phoneNumber", "debt"];
    const cleanValue = numericFields.includes(name)
      ? value.replace(/\D/g, "")
      : value;
    setForm((prev) => ({ ...prev, [name]: cleanValue }));
  };

  // Mutation for updating customer info
  const mutation = useMutation({
    mutationFn: async (updatedData) => {
      const res = await axios.put(`/api/customers/${id}`, updatedData);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Customer updated successfully!");
      router.replace("/dashboard/customers");
    },
    onError: (error) => {
      const message =
        error.response?.data?.error || "Failed to update customer.";
      toast.error(message);
    },
  });

  // Mutation for marking order as paid
  const markPaidMutation = useMutation({
    mutationFn: async (orderId) => {
      const res = await axios.put(`/api/orders/${orderId}/markpaid`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Order marked as paid!");
      queryClient.invalidateQueries(["customer", id]);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.error || "Failed to mark order as paid."
      );
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  return (
    <section className="section">
      <header className="mb-3 flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="header">Edit Customer {form.fullName}</h1>
          <a
            className="text-green-500 underline"
            href={`https://wa.me/${form.phoneNumber}`}
            target="_blank"
          >
            Call him
          </a>
          {form.orders.length=== 0 ? (
            <div className="text-orange-600 bg-orange-200 p-2 rounded-md">
              Customer has No Orders
            </div>
          ) : (
            <Link href={`/dashboard/customers/${id}/orders`}>
              <Button variant="outline">
                <Eye />
                View Orders
              </Button>
            </Link>
          )}
        </div>

        <Link href={`/dashboard/customers/${id}/addorder`}>
          <Button>+ Create Order</Button>
        </Link>
      </header>

      {isLoading ? (
        <Loading />
      ) : (
        <>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 max-w-md mb-10"
          >
            <Label>Name </Label>
            <Input
              type="text"
              placeholder="Full Name"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              className="mb-4"
            />
            <Label>Phone Number </Label>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="Phone Number"
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              className="mb-4"
            />
            <Label>Debt </Label>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="Debt"
              name="debt"
              value={form.debt}
              onChange={handleChange}
              className="mb-4"
            />
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin h-4 w-4" />
                  Updating...
                </span>
              ) : (
                "Update Customer"
              )}
            </Button>
          </form>
        </>
      )}
    </section>
  );
};

export default EditCustomerPage;
