"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { UploadButton } from "@uploadthing/react";

const fetchCategories = async () => {
  const { data } = await axios.get("/api/categories");
  return data;
};

const Page = () => {
  const router = useRouter();

  const { data: categories, isLoading, isError } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const [form, setForm] = useState({
    name: "",
    quantity: "",
    price: "",
    initialPrice: "",
    gender: "",
    category: "",
    img: [],
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const price = parseFloat(form.price);
      const initialPrice = parseFloat(form.initialPrice);
      const profit = price - initialPrice;

      const payload = {
        name: form.name,
        quantity: parseInt(form.quantity, 10),
        price,
        initialPrice,
        profit,
        gender: form.gender,
        category: form.category,
        img: form.img,
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
        initialPrice: "",
        gender: "",
        category: "",
        img: [],
      });
      router.replace("/dashboard/products");
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

    if (name === "price" || name === "initialPrice") {
      cleanValue = value.replace(/[^0-9.]/g, "").replace(/(\..*?)\..*/g, "$1");
    }

    setForm((prev) => ({
      ...prev,
      [name]: cleanValue,
    }));
  };

  // Validate that all required fields are filled and at least one image uploaded
  const isFormValid =
    form.name.trim() !== "" &&
    form.quantity.trim() !== "" &&
    form.price.trim() !== "" &&
    form.initialPrice.trim() !== "" &&
    form.gender.trim() !== "" &&
    form.category.trim() !== "";

  return (
    <section className="section">
      <header className="flex items-center justify-between mb-4">
        <h1 className="header">Add Product</h1>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-md">
        <Input
          placeholder="Name"
          name="name"
          value={form.name}
          onChange={handleChange}
        />
        <Input
          placeholder="Quantity"
          name="quantity"
          value={form.quantity}
          onChange={handleChange}
          inputMode="numeric"
        />
        <Input
          placeholder="Selling Price"
          name="price"
          value={form.price}
          onChange={handleChange}
          inputMode="decimal"
        />
        <Input
          placeholder="Initial Cost Price"
          name="initialPrice"
          value={form.initialPrice}
          onChange={handleChange}
          inputMode="decimal"
        />

        <select
          name="gender"
          value={form.gender}
          onChange={handleChange}
          className="p-2 border rounded"
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="unisex">Uni-Sex</option>
        </select>

        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="p-2 border rounded"
          disabled={isLoading || isError}
        >
          <option value="">Select Category</option>
          {isLoading && <option>Loading categories...</option>}
          {isError && <option>Error loading categories</option>}
          {categories &&
            categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
        </select>

        {form.price && form.initialPrice && (
          <p className="text-sm text-green-600">
            Estimated Profit:{" "}
            {(parseFloat(form.price) - parseFloat(form.initialPrice)).toFixed(2)}$
          </p>
        )}

        <div>
          <p className="mb-2 font-semibold">Upload Images</p>
          <UploadButton
            endpoint="imageUploader"
            className="uploadthing-upload-button"
            onClientUploadComplete={(res) => {
              const urls = res.map((file) => file.url);
              setForm((prev) => ({ ...prev, img: [...prev.img, ...urls] }));
              toast.success("Images uploaded successfully");
            }}
            onUploadError={(error) => {
              toast.error(`Upload failed: ${error.message}`);
            }}
            multiple
            accept="image/*"
          />
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          {form.img.map((url, i) => (
            <img
              key={i}
              src={url}
              alt={`Uploaded ${i + 1}`}
              className="w-20 h-20 object-cover rounded border"
            />
          ))}
        </div>

        <Button type="submit" disabled={mutation.isPending || !isFormValid}>
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
