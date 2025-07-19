"use client";

import React, { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import { Pen, Trash2, Loader2 } from "lucide-react";

const Page = () => {
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const queryClient = useQueryClient();

  const {
    data: products = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await axios.get("/api/products");
      return data;
    },
  });

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await axios.delete(`/api/products/${id}`);
      toast.success("Product deleted");
      queryClient.invalidateQueries(["products"]);
    } catch (error) {
      toast.error("Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="section">
      <header className="flex items-center justify-between mb-4">
        <h1 className="header">Products</h1>
        <Link href="/dashboard/products/add">
          <Button>+ Add Product</Button>
        </Link>
      </header>

      <Input
        placeholder="Search products..."
        className="mb-4 max-w-md"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <Table>
        <TableCaption>A list of your products</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Updated At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6}>Loading...</TableCell>
            </TableRow>
          ) : isError ? (
            <TableRow>
              <TableCell colSpan={6}>Failed to load products.</TableCell>
            </TableRow>
          ) : filteredProducts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6}>No products found.</TableCell>
            </TableRow>
          ) : (
            filteredProducts.map((product) => (
              <TableRow key={product._id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.quantity}</TableCell>
                <TableCell>${parseFloat(product.price).toFixed(2)}</TableCell>
                <TableCell>
                  {format(new Date(product.createdAt), "yyyy-MM-dd HH:mm")}
                </TableCell>
                <TableCell>
                  {format(new Date(product.updatedAt), "yyyy-MM-dd HH:mm")}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Link href={`/dashboard/products/${product._id}`}>
                    <Button variant="outline" className="cursor-pointer">
                      <Pen className="mr-1 h-4 w-4" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(product._id)}
                    className="cursor-pointer"
                    disabled={deletingId === product._id}
                  >
                    {deletingId === product._id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-1 h-4 w-4" />
                        Delete
                      </>
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </section>
  );
};

export default Page;
