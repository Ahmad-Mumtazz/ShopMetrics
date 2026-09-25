import { useMemo, useState } from 'react';
import { useStore } from '../context/useStore';
import Pagination from './Pagination';
import { downloadCsv } from '../utils/csv';

export default function OrderManager() {
  const { orders, updateOrderStatus, updateOrder } = useStore();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [carrier, setCarrier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [merchantNote, setMerchantNote] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const filteredOrders = useMemo(() => orders.filter(order => {
    const query = search.trim().toLowerCase();
    const matchesQuery = !query || [order.id, order.customerName, order.productName, order.customerEmail, order.trackingNumber, order.carrier].some(value => value?.toLowerCase().includes(query));
    return matchesQuery && (statusFilter === 'All' || order.status === statusFilter);
  }).sort((a, b) => {
    if (sortBy === 'oldest') return new Date(a.date) - new Date(b.date);
    if (sortBy === 'amount-high') return Number(b.totalAmount) - Number(a.totalAmount);
    if (sortBy === 'amount-low') return Number(a.totalAmount) - Number(b.totalAmount);
    return new Date(b.date) - new Date(a.date);
  }), [orders, search, statusFilter, sortBy]);
  const pageSize = 10;
  const pageCount = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleOrders = filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const openOrder = order => {
    setSelectedOrder(order);
    setCarrier(order.carrier || '');
    setTrackingNumber(order.trackingNumber || '');
    setMerchantNote(order.merchantNote || '');
    setActionMessage('');
  };
  const saveOrderDetails = event => {
    event.preventDefault();
    updateOrder(selectedOrder.id, { carrier: carrier.trim(), trackingNumber: trackingNumber.trim(), merchantNote: merchantNote.trim() });
    setActionMessage('Delivery details saved and shared with the customer.');
    setSelectedOrder({ ...selectedOrder, carrier: carrier.trim(), trackingNumber: trackingNumber.trim(), merchantNote: merchantNote.trim() });
  };
  const moveOrderForward = order => {
    const nextStatus = order.status === 'Processing' ? 'Shipped' : order.status === 'Shipped' ? 'Delivered' : null;
    if (!nextStatus) return;
    const result = updateOrderStatus(order.id, nextStatus);
    setActionMessage(result.success ? `${order.id} moved to ${nextStatus}.` : result.error);
  };
  const cancelOrder = order => {
    if (!window.confirm(`Cancel order ${order.id}? This status cannot be reversed.`)) return;
    const result = updateOrderStatus(order.id, 'Cancelled');
    setActionMessage(result.success ? `${order.id} cancelled.` : result.error);
  };

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
      <div className="page-heading">
        <div>
          <p className="eyebrow">Operations</p>
          <h1 className="text-2xl font-bold text-slate-800">Orders</h1>
          <p className="text-sm text-slate-500">Search orders and keep fulfillment status up to date.</p>
        </div>
        <button type="button" className="secondary-action" onClick={() => downloadCsv('shopmetrics-orders.csv', [['Order ID', 'Customer', 'Email', 'Items', 'Quantity', 'Recipient', 'Phone', 'Street address', 'City', 'Region', 'Postal code', 'Status', 'Carrier', 'Tracking number', 'Customer note', 'Total', 'Date'], ...filteredOrders.map(order => [order.id, order.customerName, order.customerEmail, order.productName, order.quantity, order.shippingAddress?.recipientName || '', order.shippingAddress?.phone || '', order.shippingAddress?.streetAddress || '', order.shippingAddress?.city || '', order.shippingAddress?.region || '', order.shippingAddress?.postalCode || '', order.status, order.carrier || '', order.trackingNumber || '', order.merchantNote || '', order.totalAmount, order.date])])} disabled={!filteredOrders.length}>Export {filteredOrders.length} orders</button>
      </div>

      <div className="order-status-summary"><div><span>Awaiting fulfillment</span><strong>{orders.filter(order => order.status === 'Processing').length}</strong></div><div><span>In transit</span><strong>{orders.filter(order => order.status === 'Shipped').length}</strong></div><div><span>Delivered</span><strong>{orders.filter(order => order.status === 'Delivered').length}</strong></div><div><span>Cancelled</span><strong>{orders.filter(order => order.status === 'Cancelled').length}</strong></div></div>
      {actionMessage && !selectedOrder && <p className="order-action-message" role="status">{actionMessage}</p>}

      <div className="list-toolbar order-list-toolbar">
        <label className="list-search"><span>Search orders</span><input type="search" value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} placeholder="Order number, customer, or item" /></label>
        <label className="list-filter"><span>Status</span><select value={statusFilter} onChange={event => { setStatusFilter(event.target.value); setPage(1); }}><option>All</option><option>Processing</option><option>Shipped</option><option>Delivered</option><option>Cancelled</option></select></label>
        <label className="list-filter order-sort-filter"><span>Sort orders</span><select value={sortBy} onChange={event => { setSortBy(event.target.value); setPage(1); }}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="amount-high">Highest total</option><option value="amount-low">Lowest total</option></select></label>
        <span className="list-result-count">{filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}</span>
      </div>

      <div className="responsive-data-table order-table-shell bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
              <th className="px-6 py-4">Transaction hash</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Item Dispatched</th>
              <th className="px-6 py-4">Delivery address</th>
              <th className="px-6 py-4 text-center">Fulfillment Lifecycle</th>
              <th className="px-6 py-4 text-right">Gross total</th>
              <th className="px-6 py-4 text-center">Order actions</th>
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
                <td data-label="Delivery address" className="px-6 py-4">
                  {order.shippingAddress ? <><div className="font-medium text-slate-700">{order.shippingAddress.recipientName} · {order.shippingAddress.phone}</div><div className="text-slate-400 text-xs">{order.shippingAddress.streetAddress}, {order.shippingAddress.city}, {order.shippingAddress.region} {order.shippingAddress.postalCode}</div></> : <span className="text-slate-400">No address provided</span>}
                </td>
                <td data-label="Status" className="px-6 py-4 text-center">
                  <span className={`px-2.5 py-1 text-xs border rounded-md font-medium ${getStatusStyle(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td data-label="Gross total" className="px-6 py-4 text-right font-bold text-slate-800">${order.totalAmount}</td>
                <td data-label="Update status" className="px-6 py-4 text-center">
                  <div className="order-actions-cell">
                    {(order.status === 'Processing' || order.status === 'Shipped') && <button type="button" className="order-advance-button" onClick={() => moveOrderForward(order)}>{order.status === 'Processing' ? 'Mark shipped' : 'Mark delivered'}</button>}
                    {order.status === 'Processing' && <button type="button" className="order-cancel-button" onClick={() => cancelOrder(order)}>Cancel</button>}
                    <button type="button" className="order-details-button" onClick={() => openOrder(order)}>Details</button>
                  </div>
                </td>
              </tr>
            ))}
            {visibleOrders.length === 0 && <tr><td colSpan="7" className="list-empty">No orders match these filters.</td></tr>}
          </tbody>
        </table>
      </div>
      <Pagination page={currentPage} pageCount={pageCount} totalItems={filteredOrders.length} pageSize={pageSize} onPageChange={setPage} />

      {selectedOrder && <div className="order-detail-backdrop" role="presentation" onClick={() => setSelectedOrder(null)}><section className="order-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="order-detail-title" onClick={event => event.stopPropagation()}>
        <header className="order-detail-dialog__header"><div><p className="eyebrow">FULFILLMENT RECORD</p><h2 id="order-detail-title">{selectedOrder.id}</h2></div><button type="button" onClick={() => setSelectedOrder(null)} aria-label="Close order details">Close</button></header>
        <div className="order-detail-summary"><div><span>Customer</span><strong>{selectedOrder.customerName}</strong><small>{selectedOrder.customerEmail}</small></div><div><span>Order total</span><strong>${Number(selectedOrder.totalAmount).toLocaleString()}</strong><small>{selectedOrder.quantity} item(s) · {selectedOrder.date}</small></div></div>
        <div className="order-detail-address"><p className="eyebrow">DELIVER TO</p>{selectedOrder.shippingAddress ? <p><strong>{selectedOrder.shippingAddress.recipientName}</strong><br />{selectedOrder.shippingAddress.streetAddress}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.region} {selectedOrder.shippingAddress.postalCode}<br />{selectedOrder.shippingAddress.phone}</p> : <p>No delivery address was recorded for this order.</p>}</div>
        <form className="order-detail-form" onSubmit={saveOrderDetails}><h3>Shipment and customer note</h3><div className="order-detail-form__grid"><label>Carrier<input value={carrier} onChange={event => setCarrier(event.target.value)} placeholder="e.g. DHL, FedEx" /></label><label>Tracking number<input value={trackingNumber} onChange={event => setTrackingNumber(event.target.value)} placeholder="Enter shipment tracking code" /></label><label className="order-detail-form__wide">Note for customer<textarea rows="3" value={merchantNote} onChange={event => setMerchantNote(event.target.value)} placeholder="Add delivery instructions or an update" /></label></div><div className="order-detail-form__footer"><span role="status">{actionMessage}</span><button type="submit" className="primary-action">Save and share update</button></div></form>
      </section></div>}
    </div>
  );
}
