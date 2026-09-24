import { useMemo } from 'react';

export default function CustomerFooter({ user, products, setActiveView }) {
  const merchantEmail = user.merchantEmail || '';
  const merchant = useMemo(() => {
    if (!merchantEmail) return null;
    try {
      return JSON.parse(localStorage.getItem('sm_registered_users') || '[]')
        .find(account => account.email === merchantEmail) || null;
    } catch {
      return null;
    }
  }, [merchantEmail]);

  const ownerName = merchant?.name || (merchantEmail === 'admin@shop.com' ? 'Demo Owner' : 'Store owner');
  const storeName = merchant?.shopName?.trim() || 'ShopMetrics Market';
  const sinceYear = merchant?.createdAt ? new Date(merchant.createdAt).getFullYear() : null;
  const contactHref = merchantEmail ? `mailto:${merchantEmail}?subject=${encodeURIComponent(`Question for ${storeName}`)}` : null;
  const categoryCount = new Set(products.map(product => product.category)).size;

  return (
    <footer className="store-footer">
      <div className="store-footer__inner">
        <section className="store-footer__brand">
          <a className="store-footer__lockup" href="#top" aria-label={`${storeName}, back to top`}>
            <span className="brand-mark">SM</span>
            <span><strong>{storeName}</strong><small>Browse the collection and manage your orders.</small></span>
          </a>
          <p>{products.length} products across {categoryCount} {categoryCount === 1 ? 'category' : 'categories'}.</p>
        </section>

        <nav className="store-footer__links" aria-label="Footer navigation">
          <h2>Explore</h2>
          <button type="button" onClick={() => setActiveView('Shop')}>Shop products</button>
          <button type="button" onClick={() => setActiveView('Orders')}>Order history</button>
          <button type="button" onClick={() => setActiveView('Cart')}>Your cart</button>
          <a href="#top">Back to top</a>
        </nav>

        <section className="store-footer__contact">
          <h2>Store information</h2>
          <p>Managed by <strong>{ownerName}</strong></p>
          {sinceYear && <p>Store member since {sinceYear}</p>}
          {contactHref ? <a href={contactHref}>{merchantEmail} <span aria-hidden="true">↗</span></a> : <p>Contact details are not available.</p>}
          <small>Secure checkout · Order updates in your account</small>
        </section>
      </div>
      <div className="store-footer__bottom"><span>© {new Date().getFullYear()} {storeName}</span><span>Powered by ShopMetrics</span></div>
    </footer>
  );
}
