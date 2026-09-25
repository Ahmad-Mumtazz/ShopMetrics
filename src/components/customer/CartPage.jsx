export default function CartPage({ cart, cartTotal, checkoutMessage, updateQuantity, checkout, setActiveView, deliveryAddress, onDeliveryAddressChange, couponCode, setCouponCode, couponMessage, couponDiscount, applyCoupon, addresses = [], onChooseAddress }) {
  const unavailableItems = cart.filter(item => item.isArchived || item.stock <= 0 || item.quantity > item.stock);
  const itemCount = cart.reduce((total, item) => total + Number(item.quantity || 0), 0);

  return (
    <section className="cart-page holo-panel">
      <div className="cart-page__heading">
        <div>
          <p className="eyebrow">Checkout workspace</p>
          <h2>Your cart</h2>
          <p>Review quantities before sending the order to the merchant.</p>
        </div>
        <span className="counter-chip">{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
      </div>

      {cart.length === 0 ? (
        <div className="empty-state cart-page__empty">
          <p>Your cart is empty.</p>
          <button type="button" onClick={() => setActiveView('Shop')} className="neon-button">Continue shopping</button>
        </div>
      ) : (
        <form onSubmit={checkout}>
          <div className="cart-page__items">
            {cart.map(item => (
              <div key={item.id} className="cart-page__item">
                <img src={item.image} alt="" loading="lazy" decoding="async" />
                <div className="cart-page__item-info">
                  <p>{item.name}</p>
                  <span>{item.category} · ${Number(item.price).toFixed(2)} each</span>
                  {(item.isArchived || item.stock <= 0 || item.quantity > item.stock) && <span className="cart-item-warning" role="alert">{item.isArchived ? 'This item is no longer available.' : item.stock <= 0 ? 'Sold out. Remove this item to continue.' : `Only ${item.stock} available. Reduce the quantity to continue.`}</span>}
                </div>
                <div className="quantity-control">
                  <button type="button" aria-label={`Decrease ${item.name} quantity`} onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                  <span>{item.quantity}</span>
                  <button type="button" aria-label={`Increase ${item.name} quantity`} disabled={item.quantity >= item.stock || item.isArchived} onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                </div>
                <strong>${(Number(item.price) * item.quantity).toFixed(2)}</strong>
                <button type="button" onClick={() => updateQuantity(item.id, 0)} className="remove-button">Remove</button>
              </div>
            ))}
          </div>

          <section className="delivery-form">
            <div><p className="eyebrow">Delivery details</p><h3>Where should we send your parcel?</h3></div>
            {addresses.length > 0 && <label className="saved-address-select">Use a saved address<select defaultValue="" onChange={event => { const address = addresses.find(item => item.id === event.target.value); if (address) onChooseAddress(address); }}><option value="">Enter another address</option>{addresses.map(address => <option key={address.id} value={address.id}>{address.recipientName} · {address.city}{address.isDefault ? ' (Default)' : ''}</option>)}</select></label>}
            <p className="save-address-hint">Manage saved delivery locations in <button type="button" onClick={() => setActiveView('Addresses')}>Your addresses</button>.</p>
            <div className="delivery-form__grid">
              <label>Recipient name<input required autoComplete="name" value={deliveryAddress.recipientName} onChange={event => onDeliveryAddressChange('recipientName', event.target.value)} /></label>
              <label>Phone number<input required type="tel" autoComplete="tel" value={deliveryAddress.phone} onChange={event => onDeliveryAddressChange('phone', event.target.value)} /></label>
              <label className="delivery-form__wide">Street address<input required autoComplete="street-address" value={deliveryAddress.streetAddress} onChange={event => onDeliveryAddressChange('streetAddress', event.target.value)} placeholder="House, street, and area" /></label>
              <label>City<input required autoComplete="address-level2" value={deliveryAddress.city} onChange={event => onDeliveryAddressChange('city', event.target.value)} /></label>
              <label>State / province<input required autoComplete="address-level1" value={deliveryAddress.region} onChange={event => onDeliveryAddressChange('region', event.target.value)} /></label>
              <label>Postal code<input required autoComplete="postal-code" value={deliveryAddress.postalCode} onChange={event => onDeliveryAddressChange('postalCode', event.target.value)} /></label>
            </div>
          </section>

          <div className="cart-coupon">
            <label htmlFor="coupon-code">Promo code</label>
            <div><input id="coupon-code" value={couponCode} onChange={event => setCouponCode(event.target.value.toUpperCase())} placeholder="Enter code"/><button type="button" onClick={applyCoupon}>Apply</button></div>
            {couponMessage && <p role="status">{couponMessage}</p>}
          </div>

          <div className="cart-page__footer">
            <div className="cart-total-summary"><span>Subtotal</span><strong>${cartTotal.toFixed(2)}</strong>{couponDiscount > 0 && <><span>Coupon savings</span><strong className="coupon-savings">−${couponDiscount.toFixed(2)}</strong></>}<span>Estimated total</span><strong>${Math.max(0, cartTotal - couponDiscount).toFixed(2)}</strong></div>
            <div className="cart-page__actions"><button type="button" onClick={() => setActiveView('Shop')} className="hud-button">Continue shopping</button><button type="submit" className="neon-button" disabled={unavailableItems.length > 0}>Place order</button></div>
          </div>
          {unavailableItems.length > 0 && <p className="checkout-message" role="alert">Update or remove unavailable items before placing your order.</p>}
          {checkoutMessage && <p className="checkout-message" role="status">{checkoutMessage}</p>}
        </form>
      )}
    </section>
  );
}
