export default function OrderHistory({ orders }) {
  return (
    <section className="holo-panel order-history">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Transaction archive</p>
          <h2>Your order history</h2>
        </div>
        <span className="counter-chip">{orders.length}</span>
      </div>
      {orders.length === 0 ? <p className="empty-state">No transactions detected yet.</p> : (
        <div className="order-history__list">
          {orders.map(order => (
            <div key={order.id} className="order-row">
              <div>
                <p className="order-row__title">{order.productName}</p>
                <p className="order-row__meta">{order.id} / {order.date} / {order.quantity} items</p>
              </div>
              <div className="order-row__value"><strong>${order.totalAmount}</strong><span>{order.status}</span></div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
