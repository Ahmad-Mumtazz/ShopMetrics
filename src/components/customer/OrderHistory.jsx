import { useState } from 'react';

export default function OrderHistory({ orders, onCancelOrder }) {
  const [message, setMessage] = useState('');
  const cancelOrder = order => {
    if (!window.confirm(`Cancel ${order.id}? This will return its items to inventory.`)) return;
    const result = onCancelOrder(order.id, 'Cancelled');
    setMessage(result.success ? `${order.id} was cancelled.` : result.error);
  };

  return (
    <section className="holo-panel order-history">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Transaction archive</p>
          <h2>Your order history</h2>
        </div>
        <span className="counter-chip">{orders.length}</span>
      </div>
      {message && <p className="order-action-message" role="status">{message}</p>}
      {orders.length === 0 ? <p className="empty-state">No transactions detected yet.</p> : (
        <div className="order-history__list">
          {orders.map(order => (
            <div key={order.id} className="order-row">
              <div>
                <p className="order-row__title">{order.productName}</p>
                <p className="order-row__meta">{order.id} / {order.date} / {order.quantity} items</p>
                {order.shippingAddress && <p className="order-row__meta">Deliver to: {order.shippingAddress.recipientName}, {order.shippingAddress.streetAddress}, {order.shippingAddress.city}, {order.shippingAddress.region} {order.shippingAddress.postalCode}</p>}
                {order.trackingNumber && <p className="order-row__tracking">{order.carrier || 'Carrier'} tracking: <strong>{order.trackingNumber}</strong></p>}
                {order.merchantNote && <p className="order-row__note">Store update: {order.merchantNote}</p>}
                {order.status !== 'Cancelled' && <div className={`customer-order-progress customer-order-progress--${String(order.status).toLowerCase()}`} aria-label={`Order status: ${order.status}`}><span>Placed</span><i /><span>Shipped</span><i /><span>Delivered</span></div>}
              </div>
              <div className="order-row__value"><strong>${Number(order.totalAmount).toLocaleString()}</strong><span className={`customer-order-status customer-order-status--${String(order.status).toLowerCase()}`}>{order.status}</span>{order.status === 'Processing' && <button type="button" className="customer-cancel-order" onClick={() => cancelOrder(order)}>Cancel order</button>}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
