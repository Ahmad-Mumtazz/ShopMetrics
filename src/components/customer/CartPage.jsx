export default function CartPage({ cart, cartTotal, checkoutMessage, updateQuantity, checkout, setActiveView }) {
  return (
    <section className="cart-page holo-panel">
      <div className="cart-page__heading">
        <div>
          <p className="eyebrow">Checkout workspace</p>
          <h2>Your cart</h2>
          <p>Review quantities before sending the order to the merchant.</p>
        </div>
        <span className="counter-chip">{cart.length} products</span>
      </div>

      {cart.length === 0 ? (
        <div className="empty-state cart-page__empty">
          <p>Your cart is empty.</p>
          <button type="button" onClick={() => setActiveView('Shop')} className="neon-button">Continue shopping</button>
        </div>
      ) : (
        <>
          <div className="cart-page__items">
            {cart.map(item => (
              <div key={item.id} className="cart-page__item">
                <img src={item.image} alt="" />
                <div className="cart-page__item-info"><p>{item.name}</p><span>{item.category} / ${item.price}</span></div>
                <div className="quantity-control"><button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button><span>{item.quantity}</span><button type="button" disabled={item.quantity >= item.stock} onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button></div>
                <strong>${item.price * item.quantity}</strong>
                <button type="button" onClick={() => updateQuantity(item.id, 0)} className="remove-button">Remove</button>
              </div>
            ))}
          </div>
          <div className="cart-page__footer"><div><span>Total</span><strong>${cartTotal.toLocaleString()}</strong></div><div className="cart-page__actions"><button type="button" onClick={() => setActiveView('Shop')} className="hud-button">Continue shopping</button><button type="button" onClick={checkout} className="neon-button">Authorize purchase</button></div></div>
          {checkoutMessage && <p className="checkout-message">{checkoutMessage}</p>}
        </>
      )}
    </section>
  );
}
