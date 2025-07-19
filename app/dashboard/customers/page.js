"use client";

import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Search, Trash2 } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const fetchCustomers = async () => {
  const { data } = await axios.get("/api/customers");
  return Array.isArray(data) ? data : [];
};

const CustomersPage = () => {
  const queryClient = useQueryClient();

  const {
    data: customers = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryFn: fetchCustomers,
    queryKey: ["customers"],
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

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isError) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to load customers. Please try again."
      );
    }
  }, [isError, error]);

  const filteredCustomers = customers.filter((customer) =>
    customer.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id, e) => {
    e.preventDefault(); // Prevent Link navigation
    if (confirm("Are you sure you want to delete this customer?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <section className="section ">
      <header className="flex justify-between items-center mb-4">
        <h1 className="header text-xl font-bold">Customers</h1>
        <Link href="/dashboard/customers/create">
          <Button>+ Add Customer</Button>
        </Link>
      </header>

      <div className="mb-4 flex items-center py-1 relative">
        <Search className="text-gray-500 absolute top-1/2 left-3 -translate-y-1/2" size="18px" />
        <Input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading && <Loading />}

      {!isLoading && filteredCustomers.length === 0 && (
        <h1 className="text-gray-600">No customers found.</h1>
      )}

      {!isLoading && filteredCustomers.length > 0 && (
        <ul className="grid md:grid-cols-3 w-full gap-4">
          {filteredCustomers.map((customer) => (
            <Link
              href={`/dashboard/customers/${customer._id}`}
              key={customer._id}
              className="flex items-center justify-between border rounded-md p-2 hover:shadow-md transition"
            >
              <h1 className="font-semibold">{customer.fullName}</h1>
              <Button
                variant="destructive"
                size="sm"
                onClick={(e) => handleDelete(customer._id, e)}
                disabled={deleteMutation.isLoading}
              >
                <Trash2 className="mr-1" /> Delete
              </Button>
            </Link>
          ))}
        </ul>
      )}
    </section>
  );
};

export default CustomersPage;
