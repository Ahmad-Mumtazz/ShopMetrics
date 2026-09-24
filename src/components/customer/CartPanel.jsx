export default function CartPanel({ cart, cartTotal, checkoutMessage, updateQuantity, checkout }) {
  return (
    <aside className="cart-panel holo-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Live basket</p>
          <h2>Purchase queue</h2>
        </div>
        <span className="counter-chip">{cart.length}</span>
      </div>
      <div className="cart-panel__items">
        {cart.length === 0 ? <p className="empty-state">Your basket is waiting for a signal.</p> : cart.map(item => (
          <div key={item.id} className="cart-item">
            <div className="cart-item__row">
              <span>{item.name}</span>
              <strong>${item.price * item.quantity}</strong>
            </div>
            <div className="cart-item__controls">
              <div className="quantity-control">
                <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                <span>{item.quantity}</span>
                <button type="button" disabled={item.quantity >= item.stock} onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
              </div>
              <button type="button" onClick={() => updateQuantity(item.id, 0)} className="remove-button">Remove</button>
            </div>
          </div>
        ))}
      </div>
      <div className="cart-panel__total"><span>Transmission total</span><strong>${cartTotal.toLocaleString()}</strong></div>
      {checkoutMessage && <p className="checkout-message">{checkoutMessage}</p>}
      <button type="button" disabled={cart.length === 0} onClick={checkout} className="neon-button neon-button--wide">Authorize purchase</button>
    </aside>
  );
}
