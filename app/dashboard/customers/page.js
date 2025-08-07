"use client";

import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Search, Trash2, User } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const CustomersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["customers", page, searchTerm],
    queryFn: async () => {
      const res = await axios.get("/api/customers", {
        params: { page, limit: 20, search: searchTerm },
      });
      return res.data;
    },
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => axios.delete(`/api/customers/${id}`),
    onSuccess: () => {
      toast.success("Customer deleted successfully");
      queryClient.invalidateQueries(["customers"]);
    },
    onError: () => {
      toast.error("Failed to delete customer");
    },
  });

  const customers = data?.customers || [];
  const totalPages = data?.totalPages || 1;
  const totalCount = data?.total || 0;

  useEffect(() => {
    if (isError) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to load customers. Please try again."
      );
    }
  }, [isError, error]);

  useEffect(() => {
    const delay = setTimeout(() => {
      refetch();
    }, 300);
    return () => clearTimeout(delay);
  }, [searchTerm, page]);

  const handleDelete = (id, e) => {
    e.preventDefault();
    if (confirm("Are you sure you want to delete this customer?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <section className="section">
      <header className="flex justify-between items-center mb-4">
        <h1 className="header text-xl font-bold">Customers</h1>
        <Link href="/dashboard/customers/create">
          <Button>+ Add Customer</Button>
        </Link>
      </header>

      <div className="mb-4 flex items-center py-1 relative w-full max-w-md">
        <Search
          className="text-gray-500 absolute top-1/2 left-3 -translate-y-1/2"
          size="18px"
        />
        <Input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          className="pl-10"
        />
      </div>

      <p className="mb-6">
        Showing {customers.length} of {totalCount} customers
      </p>

      {isLoading && <Loading />}

      {!isLoading && customers.length === 0 && (
        <h1 className="text-gray-600 text-center text-lg font-medium mt-10">
          No customers found.
        </h1>
      )}

      {!isLoading && customers.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {customers.map((customer, index) => (
            <Link
              href={`/dashboard/customers/${customer._id}`}
              key={customer._id}
              className="flex flex-col items-center justify-between border rounded-xl p-4 hover:shadow-lg transition bg-white"
            >
              {/* Avatar */}
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-3">
                <User className="text-gray-500" size={28} />
              </div>

              {/* Customer Name + Index */}
              <h1 className="font-semibold text-center text-gray-800 mb-3">
                #{(page - 1) * 20 + index + 1} - {customer.fullName}
              </h1>

              {/* Delete Button */}
              <Button
                variant="destructive"
                size="sm"
                onClick={(e) => handleDelete(customer._id, e)}
                disabled={deleteMutation.isLoading}
                className="w-full"
              >
                <Trash2 className="mr-1 w-4 h-4" /> Delete
              </Button>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
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
      )}
    </section>
  );
};

export default CustomersPage;
