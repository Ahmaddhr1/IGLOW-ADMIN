'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { format } from 'date-fns';

const fetchOrder = async (id) => {
  const res = await fetch(`/api/orders/${id}`);
  if (!res.ok) throw new Error('Failed to fetch order');
  return res.json();
};

const InvoicePrintPage = () => {
  const { id } = useParams();

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order', id],
    queryFn: () => fetchOrder(id),
    enabled: !!id,
  });

  useEffect(() => {
    if (order) {
      const timeout = setTimeout(() => {
        window.print();
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [order]);

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (isError || !order) return <div className="p-4 text-red-500">Error loading invoice</div>;

  const statusColor =
    order.status === 'paid'
      ? 'text-green-600'
      : order.status === 'partiallyPaid'
      ? 'text-yellow-600'
      : 'text-red-600';

  return (
    <div className="w-[58mm] text-[12px] font-mono p-3 print:w-[58mm] print:p-3">
      <div className="text-center">
        <h2 className="font-bold text-base">I GLOW</h2>
        <p>{format(new Date(order.createdAt), 'yyyy-MM-dd HH:mm')}</p>
      </div>

      <div className="border-t border-dashed my-2" />

      <p>
        <span className="font-semibold">Customer:</span>{' '}
        {order.customer?.fullName || 'N/A'}
      </p>

      <div className="border-t border-dashed my-2" />

      {order.products.map((item) => {
        const lineTotal = item.quantity * item.price;

        return (
          <div key={item.productId} className="mb-1">
            <div className="flex justify-between">
              <span>{item.name}</span>
              <span>${lineTotal.toFixed(2)}</span>
            </div>
            <div className="text-[10px]">
              {item.quantity} x ${item.price.toFixed(2)}
            </div>
          </div>
        );
      })}

      <div className="border-t border-dashed my-2" />

      <p className="flex justify-between">
        <span className="font-semibold">Total:</span>
        <span>${Number(order.total).toFixed(2)}</span>
      </p>

      <p className="flex justify-between">
        <span className="font-semibold">Amount Paid:</span>
        <span>${Number(order.amountpaid || 0).toFixed(2)}</span>
      </p>

      <p className="flex justify-between">
        <span className="font-semibold">Remaining:</span>
        <span>${Number(order.remainingBalance || 0).toFixed(2)}</span>
      </p>

      <p className="flex justify-between">
        <span className="font-semibold">Status:</span>
        <span className={statusColor}>
          {order.status === 'partiallyPaid'
            ? 'Partially Paid'
            : order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
      </p>

      <div className="text-center mt-4">
        <p>Thank you!</p>
        <p className="text-[11px]">Powered By Ahmad Daher (76-522837)</p>
      </div>
    </div>
  );
};

export default InvoicePrintPage;
