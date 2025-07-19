"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import Loading from "@/components/Loading";

const EditProductPage = () => {
  const router = useRouter();
  const { id } = useParams();

  const [form, setForm] = useState({
    name: "",
    price: "",
    quantity: "",
  });

  // Fetch product data
  const { data, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await axios.get(`/api/products/${id}`);
      return res.data;
    },
    enabled: !!id,
    onError: () => {
      toast.error("Failed to fetch product.");
    },
  });

  // Update form state when data changes
  useEffect(() => {
    if (data) {
      setForm({
        name: data.name || "",
        price: data.price?.toString() || "",
        quantity: data.quantity?.toString() || "",
      });
    }
  }, [data]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "price") {
      if (/^\d*\.?\d*$/.test(value)) {
        setForm((prev) => ({ ...prev, [name]: value }));
      }
    } else if (name === "quantity") {
      const cleanValue = value.replace(/\D/g, "");
      setForm((prev) => ({ ...prev, [name]: cleanValue }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Mutation for updating product
  const mutation = useMutation({
    mutationFn: async (updatedData) => {
      const payload = {
        ...updatedData,
        price: parseFloat(updatedData.price),
        quantity: parseInt(updatedData.quantity, 10),
      };
      const res = await axios.put(`/api/products/${id}`, payload);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Product updated successfully!");
      router.replace("/dashboard/products");
    },
    onError: (error) => {
      const message = error.response?.data?.error || "Failed to update product.";
      toast.error(message);
    },
  });

  // Form submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  return (
    <section className="section">
      <header className="mb-3 flex items-center justify-between">
        <h1 className="header">Edit Product</h1>
      </header>

      {isLoading ? (
        <Loading />
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-md">
          <Label>Name</Label>
          <Input
            type="text"
            placeholder="Product Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="mb-4"
          />

          <Label>Price</Label>
          <Input
            type="text"
            inputMode="decimal"
            placeholder="Price"
            name="price"
            value={form.price}
            onChange={handleChange}
            className="mb-4"
          />

          <Label>Quantity</Label>
          <Input
            type="text"
            inputMode="numeric"
            placeholder="Quantity"
            name="quantity"
            value={form.quantity}
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
              "Update Product"
            )}
          </Button>
        </form>
      )}
    </section>
  );
};

export default EditProductPage;
