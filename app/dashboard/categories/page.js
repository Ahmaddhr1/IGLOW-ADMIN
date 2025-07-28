"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ArrowRight, Loader2 } from "lucide-react";
import React from "react";

const fetchCategories = async () => {
  const { data } = await axios.get("/api/categories");
  return data;
};

const Page = () => {
  const { data: categories = [], isLoading, isError } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  return (
    <section className="section">
      <header className="flex items-center justify-between mb-4">
        <h1 className="header">Categories</h1>
        <Link href="/dashboard/categories/add">
          <Button>+ Add Categories</Button>
        </Link>
      </header>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
        </div>
      ) : isError ? (
        <p className="text-red-600">Failed to load categories.</p>
      ) : (
        <div className="flex flex-wrap gap-6">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              href={`/dashboard/categories/${cat._id}`}
              className="w-48 cursor-pointer group"
            >
              <div className="overflow-hidden rounded-xl border shadow-sm w-full h-36">
                <img
                  src={cat.img}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <div className="flex items-center justify-between mt-2 font-medium text-sm">
                <span>{cat.name}</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};

export default Page;
