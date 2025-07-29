"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadButton } from "@uploadthing/react";
import { Eye, Loader2, Pen, Trash2 } from "lucide-react";

import {
  Table,
  TableCaption,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from "@/components/ui/table"; // Adjust import path
import Link from "next/link";

const EditCategoryPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({ name: "", img: "" });
  const [showProducts, setShowProducts] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["category", id],
    queryFn: async () => {
      const res = await axios.get(`/api/categories/${id}`);
      return res.data;
    },
  });

  // Prefill form only once when data is fetched
  useEffect(() => {
    if (data) {
      setForm({ name: data.name, img: data.img });
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      return await axios.put(`/api/categories/${id}`, form);
    },
    onSuccess: () => {
      toast.success("Category updated");
      queryClient.invalidateQueries({ queryKey: ["category", id] });
      router.push("/dashboard/categories");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.error || "Failed to update");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await axios.delete(`/api/categories/${id}`);
    },
    onSuccess: () => {
      toast.success("Category deleted");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      router.push("/dashboard/categories");
    },
    onError: () => toast.error("Failed to delete category"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  const handleDelete = () => {
    if (confirm("Delete this category and all its products?")) {
      deleteMutation.mutate();
    }
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  const productsExist = data?.products && data.products.length > 0;

  return (
    <section className="section">
      <header className="flex items-center justify-between mb-4">
        <h1 className="header">Edit Category</h1>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
        >
          {deleteMutation.isPending ? (
            <Loader2 className="animate-spin w-4 h-4 mr-2" />
          ) : (
            <Trash2 className="w-4 h-4 mr-2" />
          )}
          Delete
        </Button>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md mb-8">
        <Input
          placeholder="Category Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <div>
          <p className="mb-2">Category Image</p>
          <UploadButton
            endpoint="imageUploader"
            className="uploadthing-upload-button"
            onClientUploadComplete={(res) => {
              if (res && res[0]) {
                setForm({ ...form, img: res[0].url });
                toast.success("Image uploaded!");
              }
            }}
            onUploadError={(error) => {
              toast.error(`Upload failed: ${error.message}`);
            }}
          />
        </div>

        {form.img && (
          <img
            src={form.img}
            className="w-48 h-48 object-cover rounded border"
            alt="Category"
          />
        )}

        <Button type="submit" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="animate-spin w-4 h-4" />
              Updating...
            </span>
          ) : (
            "Update Category"
          )}
        </Button>
      </form>

      {/* Products Section */}
      {!productsExist && (
        <p className="text-center text-red-600 font-semibold">
          No products found in this category.
        </p>
      )}

      {productsExist && (
        <div className="mb-4">
          <Button onClick={() => setShowProducts(!showProducts)} variant="outline">
            {showProducts ? "Hide Products" : "View Products"}
          </Button>
        </div>
      )}

      {showProducts && productsExist && (
  <Table>
    <TableCaption>Products in this category</TableCaption>
    <TableHeader>
      <TableRow>
        <TableHead>Image</TableHead>
        <TableHead>Name</TableHead>
        <TableHead>Price</TableHead>
        <TableHead className="text-right">Actions</TableHead> {/* Optional if you need actions */}
      </TableRow>
    </TableHeader>
    <TableBody>
      {data.products.length === 0 ? (
        <TableRow>
          <TableCell colSpan={4} className="text-center">
            No products found in this category
          </TableCell>
        </TableRow>
      ) : (
        data.products.map((product) => (
          <TableRow key={product._id}>
            <TableCell>
              {product.img?.length > 0 ? (
                <img
                  src={product.img[0]}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded"
                  loading="lazy"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-500">
                  No Image
                </div>
              )}
            </TableCell>
            <TableCell>{product.name}</TableCell>
            <TableCell>${product.price.toFixed(2)}</TableCell>
            <TableCell className="text-right space-x-2">
              <Link href={`/dashboard/products/${product._id}`}><Button variant="outline" size="sm" className="cursor-pointer">
                <Eye className="mr-1 h-4 w-4" />
                View
              </Button>
              </Link>
            </TableCell>
          </TableRow>
        ))
      )}
    </TableBody>
  </Table>
)}
    </section>
  );
};

export default EditCategoryPage;
