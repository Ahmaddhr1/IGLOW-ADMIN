"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import React, { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { UploadButton } from "@uploadthing/react";
import Image from "next/image";

export default function Page() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [img, setImg] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      if (!name.trim()) {
        toast.error("Name is required");
        // Returning a rejected Promise to prevent mutation from continuing
        return Promise.reject(new Error("Name is required"));
      }
      const payload = { name, img };
      const { data } = await axios.post("/api/categories", payload);
      return data;
    },
    mutationKey: ["createcategory"],
    onSuccess: () => {
      toast.success("Category created successfully");
      setName("");
      setImg("");
      router.replace("/dashboard/categories");
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || error.message || "Error creating category");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <section className="section max-w-md mx-auto">
      <header className="flex items-center justify-between mb-4">
        <h1 className="header">Add Category</h1>
      </header>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          placeholder="Category Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div>
          <p className="mb-2 font-semibold">Upload Category Image</p>
          <UploadButton
            endpoint="imageUploader"
            className="uploadthing-upload-button"
            onClientUploadComplete={(res) => {
              if (res && res[0]) {
                setImg(res[0].url);
                toast.success("Image uploaded!");
              }
            }}
            onUploadError={(error) => {
              toast.error(`Upload failed: ${error.message}`);
            }}
          />
        </div>

        {img && (
          <div className="mt-2">
            <p className="mb-1 font-semibold">Image Preview:</p>
            <img
              src={img}
              alt="Category Image"
              className="w-32 h-32 object-cover rounded border"
            />
          </div>
        )}

        <Button type="submit" disabled={mutation.isPending || !img}>
          {mutation.isPending ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </section>
  );
}
