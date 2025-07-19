"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";


export const Page = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    quantity: "",
    price: "",
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        quantity: parseInt(form.quantity, 10),
        price: parseFloat(form.price),
      };

      const { data } = await axios.post("/api/products/create", payload);
      return data;
    },
    mutationKey: ["createproduct"],
    onSuccess: () => {
      toast.success("Product created successfully");
      setForm({
        name: "",
        quantity: "",
        price: "",
      });
      router.replace("/dashboard/products")
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Error creating product");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    let cleanValue = value;

    if (name === "quantity") {
      cleanValue = value.replace(/\D/g, "");
    }

    if (name === "price") {
      cleanValue = value.replace(/[^0-9.]/g, "").replace(/(\..*?)\..*/g, "$1");
    }

    setForm((prev) => ({
      ...prev,
      [name]: cleanValue,
    }));
  };

  return (
    <section className="section">
      <header className="flex items-center justify-between mb-4">
        <h1 className="header">Add Product</h1>
      </header>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-md">
        <Input
          type="text"
          placeholder="Name"
          name="name"
          value={form.name}
          onChange={handleChange}
        />
        <Input
          type="text"
          inputMode="numeric"
          placeholder="Quantity"
          name="quantity"
          value={form.quantity}
          onChange={handleChange}
        />
        <Input
          type="text"
          inputMode="decimal"
          placeholder="Price"
          name="price"
          value={form.price}
          onChange={handleChange}
        />
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="animate-spin h-4 w-4" />
              Submitting...
            </span>
          ) : (
            "Submit"
          )}
        </Button>
      </form>
    </section>
  );
};

export default Page;
