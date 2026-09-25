import { createProductDescription } from '../../data/productDescriptions';
import { categoryImages } from '../../data/catalog';

export default function ProductCard({ product, onOpen, onAddToCart, isSaved, onToggleSaved, isCompared = false, onToggleCompare }) {
  const reviewCount = product.reviews?.length || 0;
  const rating = reviewCount ? product.reviews.reduce((total, review) => total + review.rating, 0) / reviewCount : 0;
  const stockLabel = product.stock <= 0 ? 'Sold out' : product.stock < 8 ? 'Only a few left' : 'In stock';
  const description = (product.descriptionDeleted ? 'Product information is temporarily unavailable' : product.description?.trim() || createProductDescription(product)).split(/[.!?]/)[0];

  return (
    <article className="market-product-card">
      <div className="market-product-card__media">
        <button type="button" className="market-product-card__image-button" onClick={() => onOpen(product)} aria-label={`View ${product.name}`}>
          <img src={product.image} alt={product.name} loading="lazy" decoding="async" fetchPriority="low" onError={event => { const image = event.currentTarget; if (image.dataset.fallbackApplied) return; image.dataset.fallbackApplied = 'true'; const images = categoryImages[product.category] || categoryImages.Electronics; const index = Number(product.id?.match(/\d+$/)?.[0]) || 1; image.src = images[(index - 1) % images.length]; }} />
        </button>
        <span className="market-product-card__category">{product.category}</span>
        {product.stock <= 0 && <span className="market-product-card__sold">Sold out</span>}
        <button type="button" className={`market-product-card__save ${isSaved ? 'is-saved' : ''}`} aria-pressed={isSaved} aria-label={isSaved ? `Remove ${product.name} from saved items` : `Save ${product.name}`} onClick={() => onToggleSaved(product.id)}>{isSaved ? '\u2665' : '\u2661'}</button>
      </div>
      <div className="market-product-card__body">
        <button type="button" className="market-product-card__title" onClick={() => onOpen(product)}>{product.name}</button>
        <div className="market-product-card__rating" aria-label={`${rating.toFixed(1)} out of 5 stars, ${reviewCount} reviews`}>
          <span aria-hidden="true">{'\u2605'.repeat(Math.round(rating))}{'\u2606'.repeat(5 - Math.round(rating))}</span>
          <small>{rating.toFixed(1)} <i>({reviewCount})</i></small>
        </div>
        <p className="market-product-card__description">{description}.</p>
        <div className="market-product-card__purchase">
          <strong><small>$</small>{Number(product.price).toLocaleString()}</strong>
          <span className={product.stock <= 0 ? 'is-sold' : product.stock < 8 ? 'is-low' : ''}>{stockLabel}</span>
        </div>
        <div className="market-product-card__actions">
          <button type="button" className="market-product-card__details" onClick={() => onOpen(product)}>View details</button>
          <button type="button" className="market-product-card__add" onClick={() => onAddToCart(product)} disabled={product.stock <= 0}>{product.stock <= 0 ? 'Sold out' : 'Add to cart'}</button>
        </div>
        {onToggleCompare && <button type="button" className={`market-product-card__compare ${isCompared ? 'is-compared' : ''}`} aria-pressed={isCompared} onClick={() => onToggleCompare(product.id)}>{isCompared ? '✓ Added to compare' : '⇄ Compare'}</button>}
      </div>
    </article>
  );
}
