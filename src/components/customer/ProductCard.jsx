import HoloCard from '../ui/HoloCard';

export default function ProductCard({ product, addToCart, onOpen }) {
  return (
    <HoloCard className="product-card" onClick={() => onOpen(product)}>
      <div className="product-card__image-wrap">
        <img src={product.image} alt={product.name} className="product-card__image" onError={(event) => { event.currentTarget.src = 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=900&q=82'; }} />
        <span className="product-card__tag">{product.category}</span>
      </div>
      <div className="product-card__body">
        <div className="product-card__title-row">
          <div>
            <p className="product-card__code">{product.id}</p>
            <h3>{product.name}</h3>
          </div>
          <strong>${product.price}</strong>
        </div>
        <div className="product-card__meta">
          <span>{product.stock} units available</span>
          <span>{product.salesCount} sold</span>
        </div>
        <button type="button" disabled={product.stock === 0} onClick={(event) => { event.stopPropagation(); addToCart(product); }} className="neon-button">
          {product.stock === 0 ? 'Out of stock' : 'Add to cart'}
        </button>
      </div>
    </HoloCard>
  );
}
