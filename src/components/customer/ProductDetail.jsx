import { useState } from 'react';
import { createProductDescription } from '../../data/productDescriptions';
import { categoryImages } from '../../data/catalog';

const renderStars = (rating) => `${'\u2605'.repeat(rating)}${'\u2606'.repeat(5 - rating)}`;

export default function ProductDetail({ product, onBack, addToCart, addReview, user }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [cartMessage, setCartMessage] = useState('');
  const [showAllReviews, setShowAllReviews] = useState(false);
  const description = product.descriptionDeleted ? '' : product.description?.trim() || createProductDescription(product);

  const submitReview = (event) => {
    event.preventDefault();
    if (!comment.trim()) return;
    addReview(product.id, { customerName: user.name, rating, comment: comment.trim() });
    setComment('');
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setCartMessage(`${quantity} ${quantity === 1 ? 'item' : 'items'} added to your cart.`);
  };

  const renderReview = (review, index) => <article key={review.id || `${review.customerName}-${index}`} className="review-row"><div><strong>{review.customerName}</strong><span>{renderStars(review.rating)}</span></div><p>{review.comment}</p></article>;

  return (
    <section className="product-detail-page holo-panel" aria-labelledby="product-detail-title">
      <button type="button" className="hud-button product-detail__back" onClick={onBack}>Back to products</button>
      <div className="product-detail__hero">
        <img src={product.image} alt={product.name} loading="eager" fetchPriority="high" decoding="async" onError={event => { const image = event.currentTarget; if (image.dataset.fallbackApplied) return; image.dataset.fallbackApplied = 'true'; const images = categoryImages[product.category] || categoryImages.Electronics; const index = Number(product.id?.match(/\d+$/)?.[0]) || 1; image.src = images[(index - 1) % images.length]; }} />
        <div>
          <p className="eyebrow">{product.category}</p>
          <h1 id="product-detail-title">{product.name}</h1>
          <p className="product-detail__price">${product.price}</p>
          <p className="product-detail__availability">{product.stock} units available / {product.salesCount} sold</p>
          {product.stock > 0 ? <>
            <label className="product-detail__quantity">Quantity
              <span className="quantity-control">
                <button type="button" aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity(value => Math.max(1, value - 1))}>-</button>
                <input aria-label="Quantity" type="number" min="1" max={product.stock} value={quantity} onChange={event => setQuantity(Math.max(1, Math.min(product.stock, Number(event.target.value) || 1)))} />
                <button type="button" aria-label="Increase quantity" disabled={quantity >= product.stock} onClick={() => setQuantity(value => Math.min(product.stock, value + 1))}>+</button>
              </span>
            </label>
            <p className="product-detail__subtotal">Subtotal: <strong>${(product.price * quantity).toLocaleString()}</strong></p>
            <button type="button" className="neon-button" onClick={handleAddToCart}>Add to cart</button>
            {cartMessage && <p className="checkout-message" role="status">{cartMessage}</p>}
          </> : <p className="product-detail__availability">Sold out</p>}
        </div>
      </div>
      <section className="product-detail__description" aria-labelledby="product-description-title">
        <p className="eyebrow">Product overview</p>
        <h2 id="product-description-title">About this product</h2>
        {description ? description.split(/\n\n+/).map((paragraph, index) => <p key={index}>{paragraph}</p>) : <p>The store has not added a description for this product yet.</p>}
      </section>
      <div className="product-detail__reviews">
        <div className="panel-heading"><div><p className="eyebrow">Customer signal</p><h2>Reviews ({product.reviews?.length || 0})</h2></div></div>
        {product.reviews?.length ? <>
          {product.reviews.slice(0, 4).map(renderReview)}
          {product.reviews.length > 4 && <button type="button" className="product-detail__show-more" onClick={() => setShowAllReviews(true)}>Show more reviews ({product.reviews.length})</button>}
        </> : <p className="empty-state">No reviews yet. Be the first to share your experience.</p>}
      </div>
      <form className="review-form" onSubmit={submitReview}>
        <label>Rate this product<select value={rating} onChange={event => setRating(Number(event.target.value))}><option value="5">5 / Excellent</option><option value="4">4 / Good</option><option value="3">3 / Average</option><option value="2">2 / Poor</option><option value="1">1 / Bad</option></select></label>
        <label>Your review<textarea value={comment} onChange={event => setComment(event.target.value)} placeholder="What should another customer know?" rows="3" /></label>
        <button type="submit" className="hud-button">Publish review</button>
      </form>
      {showAllReviews && <div className="reviews-dialog-backdrop" role="presentation" onClick={() => setShowAllReviews(false)}>
        <section className="reviews-dialog holo-panel" role="dialog" aria-modal="true" aria-labelledby="all-reviews-title" onClick={event => event.stopPropagation()}>
          <div className="reviews-dialog__heading"><div><p className="eyebrow">Customer feedback</p><h2 id="all-reviews-title">All reviews for {product.name}</h2><p>{product.reviews?.length || 0} customer reviews</p></div><button type="button" className="hud-button" onClick={() => setShowAllReviews(false)}>Close</button></div>
          <div className="reviews-dialog__list">{product.reviews.map(renderReview)}</div>
        </section>
      </div>}
    </section>
  );
}
