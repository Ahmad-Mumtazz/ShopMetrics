import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import Pagination from './Pagination';

export default function OrderManager() {
  const { orders, updateOrderStatus } = useStore();
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const pageCount = Math.max(1, Math.ceil(orders.length / pageSize));
  const visibleOrders = orders.slice((page - 1) * pageSize, page * pageSize);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Processing': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Shipped': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Cancelled': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Order Management Core</h1>
        <p className="text-sm text-slate-500">Track and alter transaction workflows in real-time across the client state stack.</p>
      </div>

      <div className="responsive-data-table order-table-shell bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
              <th className="px-6 py-4">Transaction hash</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Item Dispatched</th>
              <th className="px-6 py-4 text-center">Fulfillment Lifecycle</th>
              <th className="px-6 py-4 text-right">Gross total</th>
              <th className="px-6 py-4 text-center">Lifecycle Operations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
            {visibleOrders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                <td data-label="Transaction" className="px-6 py-4 font-mono font-semibold text-slate-500 text-xs">{order.id}</td>
                <td data-label="Customer" className="px-6 py-4 font-bold text-slate-800">{order.customerName}</td>
                <td data-label="Item" className="px-6 py-4">
                  <div className="font-medium text-slate-700">{order.productName}</div>
                  <div className="text-slate-400 text-xs">Qty: {order.quantity} · {order.date}</div>
                </td>
                <td data-label="Status" className="px-6 py-4 text-center">
                  <span className={`px-2.5 py-1 text-xs border rounded-md font-medium ${getStatusStyle(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td data-label="Gross total" className="px-6 py-4 text-right font-bold text-slate-800">${order.totalAmount}</td>
                <td data-label="Update status" className="px-6 py-4 text-center">
                  <select 
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    className="border border-slate-200 bg-slate-50 text-slate-600 text-xs px-2 py-1 rounded-md focus:outline-none focus:border-indigo-500 focus:bg-white transition-all cursor-pointer font-medium"
                  >
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} pageCount={pageCount} totalItems={orders.length} pageSize={pageSize} onPageChange={setPage} />
    </div>
  );
}
