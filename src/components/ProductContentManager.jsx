import { useMemo, useState } from 'react';
import { useStore } from '../context/useStore';
import { createProductDescription } from '../data/productDescriptions';

const stars = rating => `${'\u2605'.repeat(rating)}${'\u2606'.repeat(5 - rating)}`;

function DescriptionEditor({ product, updateProduct }) {
  const [description, setDescription] = useState(product.description || '');
  const [message, setMessage] = useState('');
  const [showPreview, setShowPreview] = useState(true);
  const wordCount = description.trim() ? description.trim().split(/\s+/).length : 0;
  const readingMinutes = Math.max(1, Math.ceil(wordCount / 220));

  const saveDescription = () => {
    if (!description.trim()) return;
    if (description.trim().length > 5000) { setMessage('Keep product descriptions under 5,000 characters.'); return; }
    updateProduct({ ...product, description: description.trim(), descriptionDeleted: false });
    setMessage('Description saved.');
  };

  const restoreGenerated = () => {
    setDescription(createProductDescription(product));
    setMessage('Generated product copy loaded. Save it when you are ready to publish.');
  };

  const deleteDescription = () => {
    if (!window.confirm(`Delete the description for ${product.name}?`)) return;
    updateProduct({ ...product, description: '', descriptionDeleted: true });
    setDescription('');
    setMessage('Description deleted.');
  };

  return (
    <section className="content-editor holo-panel">
      <div className="panel-heading"><div><p className="eyebrow">Product description</p><h2>{product.name}</h2><p>Edit the copy customers see on the product page.</p></div><span className="counter-chip">{description.length} characters</span></div>
      <div className="description-editor-toolbar"><span>{wordCount} words <i /> About {readingMinutes} min read</span><div><button type="button" className="description-preview-toggle" aria-pressed={showPreview} onClick={() => setShowPreview(value => !value)}>{showPreview ? 'Hide preview' : 'Show preview'}</button><button type="button" className="description-preview-toggle" onClick={restoreGenerated}>Restore suggested copy</button></div></div>
      <label className="content-editor__label" htmlFor={`product-description-${product.id}`}>Description customers will see</label>
      <textarea id={`product-description-${product.id}`} maxLength={5000} value={description} onChange={event => { setDescription(event.target.value); setMessage(''); }} placeholder="Write a clear, helpful description for customers." rows="10" />
      <div className="description-character-count">{description.length} / 5,000 characters</div>
      {showPreview && <article className="description-live-preview"><p className="eyebrow">CUSTOMER PREVIEW</p><h3>{product.name}</h3>{description.trim() ? description.split(/\n\n+/).map((paragraph, index) => <p key={index}>{paragraph}</p>) : <p>Your description preview will appear here.</p>}</article>}
      <div className="content-editor__actions"><button type="button" className="secondary-action" disabled={!product.description} onClick={deleteDescription}>Delete description</button><button type="button" className="primary-action" disabled={!description.trim() || description.trim() === product.description} onClick={saveDescription}>Save and publish</button></div>
      {message && <p className="content-editor__message" role="status">{message}</p>}
    </section>
  );
}

function ProductNotifications({ product, deleteProductReview }) {
  const [message, setMessage] = useState('');
  const reviews = product.reviews || [];

  const removeReview = (review, index) => {
    if (!window.confirm(`Delete this review by ${review.customerName}?`)) return;
    deleteProductReview(product.id, review.id, index);
    setMessage('Review deleted.');
  };

  return (
    <section className="content-reviews holo-panel">
      <div className="panel-heading"><div><p className="eyebrow">Customer feedback</p><h2>Reviews for {product.name}</h2><p>Remove reviews that should no longer appear to customers.</p></div><span className="counter-chip">{reviews.length}</span></div>
      <div className="content-reviews__list">
        {reviews.length ? reviews.map((review, index) => <article className="content-review" key={review.id || `${review.customerName}-${index}`}>
          <div className="content-review__heading"><div><strong>{review.customerName}</strong><span>{stars(review.rating)}</span></div><button type="button" className="content-review__delete" onClick={() => removeReview(review, index)} aria-label={`Delete review by ${review.customerName}`}>Delete</button></div>
          <p>{review.comment}</p>
        </article>) : <p className="empty-state">This product has no reviews.</p>}
      </div>
      {message && <p className="content-editor__message" role="status">{message}</p>}
    </section>
  );
}

export default function ProductContentManager({ section }) {
  const isNotifications = section === 'reviews';
  const { products, updateProduct, deleteProductReview } = useStore();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(products[0]?.id || '');

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter(product => !query || `${product.name} ${product.category} ${product.id}`.toLowerCase().includes(query));
  }, [products, search]);
  const selectedProduct = filteredProducts.find(product => product.id === selectedId) || filteredProducts[0] || null;

  return (
    <div className="product-content-manager space-y-6 animate-fadeIn">
      <div className="page-heading">
        <div><p className="eyebrow">Catalog workspace</p><h1 className="text-2xl font-bold text-slate-800">{isNotifications ? 'Product reviews' : 'Description'}</h1><p className="text-sm text-slate-500">{isNotifications ? 'Review customer feedback across your products.' : 'Write and maintain the descriptions customers see on product pages.'}</p></div>
        <span className="counter-chip">{products.length} products</span>
      </div>
      <div className="product-content-manager__layout">
        <aside className="product-content-manager__catalog holo-panel">
          <label className="product-content-manager__search">Find a product<input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search name, category, or ID" /></label>
          <div className="product-content-manager__product-list">
            {filteredProducts.map(product => <button type="button" key={product.id} onClick={() => setSelectedId(product.id)} className={`product-content-manager__product ${selectedProduct?.id === product.id ? 'is-active' : ''}`}>
              <span><strong>{product.name}</strong><small>{product.category} / {product.id}</small></span>
              {isNotifications && <span className="product-content-manager__review-count">{product.reviews?.length || 0} reviews</span>}
            </button>)}
            {!filteredProducts.length && <p className="empty-state">No products match this search.</p>}
          </div>
        </aside>

        {selectedProduct ? <div className="product-content-manager__detail">
          {isNotifications
            ? <ProductNotifications key={selectedProduct.id} product={selectedProduct} deleteProductReview={deleteProductReview} />
            : <DescriptionEditor key={selectedProduct.id} product={selectedProduct} updateProduct={updateProduct} />}
        </div> : <div className="holo-panel empty-state">Select a product to manage its {isNotifications ? 'reviews' : 'description'}.</div>}
      </div>
    </div>
  );
}
