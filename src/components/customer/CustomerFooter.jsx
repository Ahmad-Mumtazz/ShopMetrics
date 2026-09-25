import { useEffect, useState } from 'react';
import BrandLogo from '../BrandLogo';

export default function CustomerFooter({ user, products, setActiveView }) {
  const merchantEmail = user.merchantEmail || '';
  const [ownerName, setOwnerName] = useState('Store owner');
  useEffect(() => {
    const refreshOwner = () => {
      if (!merchantEmail) {
        setOwnerName('Store owner');
        return;
      }
      const savedOwner = localStorage.getItem(`sm_merchant_owner_${merchantEmail}`);
      try {
        const merchants = JSON.parse(localStorage.getItem('sm_registered_users') || '[]');
        const merchant = merchants.find(account => account.email?.trim().toLowerCase() === merchantEmail.trim().toLowerCase());
        setOwnerName(merchant?.name || savedOwner || 'Store owner');
      } catch {
        setOwnerName(savedOwner || 'Store owner');
      }
    };

    refreshOwner();
    const handleStorage = (event) => {
      if (event.key === 'sm_registered_users' || event.key === `sm_merchant_owner_${merchantEmail}`) refreshOwner();
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [merchantEmail]);

  const merchant = (() => {
    if (!merchantEmail) return null;
    try {
      return JSON.parse(localStorage.getItem('sm_registered_users') || '[]')
        .find(account => account.email?.trim().toLowerCase() === merchantEmail.trim().toLowerCase()) || null;
    } catch {
      return null;
    }
  })();

  const storeName = merchant?.profile?.shopName?.trim() || merchant?.shopName?.trim() || 'ShopMetrics Market';
  const sinceYear = merchant?.createdAt ? new Date(merchant.createdAt).getFullYear() : null;
  const contactHref = merchantEmail ? `mailto:${merchantEmail}?subject=${encodeURIComponent(`Question for ${storeName}`)}` : null;
  const categoryCount = new Set(products.map(product => product.category)).size;
  const availableCount = products.filter(product => Number(product.stock) > 0).length;
  const soldOutCount = Math.max(0, products.length - availableCount);

  return (
    <footer className="store-footer" id="store-footer">
      <div className="store-footer__inner">
        <section className="store-footer__brand">
          <button type="button" className="store-footer__lockup" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label={`${storeName}, back to top`}>
            <BrandLogo size={40} />
            <span><strong>{storeName}</strong><small>Browse the collection and manage your orders.</small></span>
          </button>
          <p>A quick guide to the shop, your orders, and store contact details.</p>
          <div className="store-footer__stats" aria-label="Store catalogue summary">
            <span><strong>{products.length}</strong> products</span>
            <span><strong>{categoryCount}</strong> categories</span>
            <span><strong>{availableCount}</strong> available</span>
            {soldOutCount > 0 && <span><strong>{soldOutCount}</strong> sold out</span>}
          </div>
        </section>

        <nav className="store-footer__links" aria-label="Footer navigation">
          <h2>Your account</h2>
          <button type="button" onClick={() => setActiveView('Shop')}>Browse all products</button>
          <button type="button" onClick={() => setActiveView('Orders')}>Track and review orders</button>
          <button type="button" onClick={() => setActiveView('Cart')}>View your cart</button>
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Back to top</button>
        </nav>

        <section className="store-footer__contact">
          <h2>Store information</h2>
          <p>Managed by <strong>{ownerName}</strong></p>
          <p>{storeName}</p>
          {sinceYear && <p>Store member since {sinceYear}</p>}
          {contactHref ? <a href={contactHref}>{merchantEmail} <span aria-hidden="true">↗</span></a> : <p>Contact details are not available.</p>}
          <small>Secure checkout · Order updates in your account</small>
        </section>
      </div>
      <div className="store-footer__bottom"><span>© {new Date().getFullYear()} {storeName}</span><span>Powered by ShopMetrics</span></div>
    </footer>
  );
}
