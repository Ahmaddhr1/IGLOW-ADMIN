"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const MakeOrderPage = () => {
  const { id: customerId } = useParams();
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [rows, setRows] = useState([
    { id: Date.now(), name: "", product: null, quantity: 1, price: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    axios
      .get("/api/products")
      .then((res) => setProducts(res.data))
      .catch(() => toast.error("Failed to load products"));
  }, []);

  const handleRowChange = (id, field, value) => {
    setRows((prevRows) =>
      prevRows.map((row) => {
        if (row.id !== id) return row;

        const updatedRow = { ...row };

        if (field === "name") {
          const matchedProduct = products.find(
            (p) => p.name.toLowerCase() === value.toLowerCase()
          );
          updatedRow.name = value;
          updatedRow.product = matchedProduct || null;
          updatedRow.price = matchedProduct?.price?.toString() || "";
        } 
        else if (field === "quantity") {
          const cleanValue = value.replace(/\D/g, "");
          updatedRow.quantity = cleanValue ? parseInt(cleanValue, 10) : 0;
        } 
        else if (field === "price") {
          const cleanPrice = value.replace(/[^0-9.]/g, "");
          updatedRow.price = cleanPrice;
        }

        return updatedRow;
      })
    );
  };

  const addRow = () => {
    setRows((prevRows) => [
      ...prevRows,
      { id: Date.now(), name: "", product: null, quantity: 1, price: "" },
    ]);
  };

  const removeRow = (id) => {
    if (rows.length > 1) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  const calculateTotal = () => {
    return rows.reduce((total, row) => {
      const price = parseFloat(row.price) || 0;
      const quantity = row.quantity || 0;
      return total + price * quantity;
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!customerId) {
      toast.error("Customer ID is missing.");
      return;
    }

    // Validate all rows
    for (const row of rows) {
      if (!row.product) {
        toast.error(`Please select a valid product for row ${rows.indexOf(row) + 1}`);
        return;
      }
      if (!row.quantity || row.quantity <= 0) {
        toast.error(`Quantity must be greater than zero for ${row.name}`);
        return;
      }
      if (!row.price || isNaN(row.price) || parseFloat(row.price) <= 0) {
        toast.error(`Invalid price for ${row.name}`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const orderProducts = rows.map((row) => ({
        productId: row.product._id,
        quantity: row.quantity,
        price: parseFloat(row.price),
      }));

      const total = calculateTotal().toFixed(2);

      await axios.post(`/api/orders/${customerId}`, {
        products: orderProducts,
        total,
      });

      toast.success("Order created successfully!");
      router.replace(`/dashboard/customers/${customerId}`);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to create order";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="section max-w-3xl">
      <header className="mb-6">
        <h1 className="header">Make Order</h1>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {rows.map((row, index) => (
          <div key={row.id} className="grid grid-cols-12 gap-3 items-end">
            <div className="col-span-5">
              <label className="block font-semibold mb-1">Product</label>
              <input
                list="products-list"
                className="input w-full"
                value={row.name}
                onChange={(e) => handleRowChange(row.id, "name", e.target.value)}
                placeholder="Select product"
                required
              />
              <datalist id="products-list">
                {products.map((p) => (
                  <option key={p._id} value={p.name} />
                ))}
              </datalist>
            </div>

            <div className="col-span-2">
              <label className="block font-semibold mb-1">Price</label>
              <input
                type="text"
                className="input w-full"
                value={row.price}
                onChange={(e) => handleRowChange(row.id, "price", e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block font-semibold mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                className="input w-full"
                value={row.quantity}
                onChange={(e) => handleRowChange(row.id, "quantity", e.target.value)}
                required
              />
            </div>

            <div className="col-span-2">
              <Button
                type="button"
                variant="destructive"
                onClick={() => removeRow(row.id)}
                disabled={rows.length <= 1}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}

        <div className="flex justify-between items-center">
          <Button type="button" onClick={addRow} variant="outline">
            + Add Product
          </Button>
          
          <div className="font-semibold text-xl">
            Total: ${calculateTotal().toFixed(2)}
          </div>
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 animate-spin" /> Creating Order...
            </>
          ) : (
            "Create Order"
          )}
        </Button>
      </form>
    </section>
  );
};

export default MakeOrderPage;