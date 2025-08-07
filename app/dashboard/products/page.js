"use client";

import React, { useState, useEffect } from "react";
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
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["products", page, search],
    queryFn: async () => {
      const res = await axios.get(`/api/products/get`, {
        params: { page, limit: 20, search },
      });
      return res.data;
    },
    keepPreviousData: true,
  });

  const products = data?.products || [];
  const totalPages = data?.totalPages || 1;
  const totalCount = data?.total || 0;

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

  // Refetch when search changes
  useEffect(() => {
    const delay = setTimeout(() => {
      refetch();
    }, 300); // debounce

    return () => clearTimeout(delay);
  }, [search, page]);

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
        className="mb-2 max-w-md"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1); // reset to page 1 when searching
        }}
      />

      <p className="mb-4">
        Showing {products.length} of {totalCount} products
      </p>

      <Table>
        <TableCaption>A list of your products</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
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
              <TableCell colSpan={7}>Loading...</TableCell>
            </TableRow>
          ) : isError ? (
            <TableRow>
              <TableCell colSpan={7}>Failed to load products.</TableCell>
            </TableRow>
          ) : products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7}>No products found.</TableCell>
            </TableRow>
          ) : (
            products.map((product, index) => (
              <TableRow key={product._id}>
                <TableCell>{(page - 1) * 20 + index + 1}</TableCell>
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
                    <Button variant="outline">
                      <Pen className="mr-1 h-4 w-4" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(product._id)}
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

      <div className="flex items-center justify-center gap-2 mt-6">
        <Button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          variant="outline"
        >
          Previous
        </Button>
        <span>
          Page {page} of {totalPages}
        </span>
        <Button
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages}
          variant="outline"
        >
          Next
        </Button>
      </div>
    </section>
  );
};

export default Page;
