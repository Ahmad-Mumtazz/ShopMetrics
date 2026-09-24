import { useState } from 'react';

export default function ProductDetail({ product, onClose, addToCart, addReview, user }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const submitReview = (event) => {
    event.preventDefault();
    if (!comment.trim()) return;
    addReview(product.id, { customerName: user.name, rating, comment: comment.trim() });
    setComment('');
  };

  return (
    <div className="product-detail-backdrop" role="presentation" onClick={onClose}>
      <section className="product-detail holo-panel" role="dialog" aria-modal="true" aria-labelledby="product-detail-title" onClick={event => event.stopPropagation()}>
        <button type="button" className="product-detail__close" onClick={onClose} aria-label="Close product details">Close</button>
        <div className="product-detail__hero"><img src={product.image} alt={product.name} onError={(event) => { event.currentTarget.src = 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=900&q=82'; }} /><div><p className="eyebrow">{product.category}</p><h2 id="product-detail-title">{product.name}</h2><p className="product-detail__price">${product.price}</p><p className="product-detail__availability">{product.stock} units available / {product.salesCount} sold</p><button type="button" className="neon-button" disabled={!product.stock} onClick={() => addToCart(product)}>Add to cart</button></div></div>
        <div className="product-detail__reviews"><div className="panel-heading"><div><p className="eyebrow">Customer signal</p><h3>Reviews ({product.reviews?.length || 0})</h3></div></div>{product.reviews?.length ? product.reviews.map((review, index) => <article key={`${review.customerName}-${index}`} className="review-row"><div><strong>{review.customerName}</strong><span>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span></div><p>{review.comment}</p></article>) : <p className="empty-state">No reviews yet. Be the first to share your experience.</p>}</div>
        <form className="review-form" onSubmit={submitReview}><label>Rate this product<select value={rating} onChange={event => setRating(Number(event.target.value))}><option value="5">5 / Excellent</option><option value="4">4 / Good</option><option value="3">3 / Average</option><option value="2">2 / Poor</option><option value="1">1 / Bad</option></select></label><label>Your review<textarea value={comment} onChange={event => setComment(event.target.value)} placeholder="What should another customer know?" rows="3" /></label><button type="submit" className="hud-button">Publish review</button></form>
      </section>
    </div>
  );
}
