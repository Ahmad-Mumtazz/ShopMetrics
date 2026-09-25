import { useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '../context/useStore';
import CartPage from './customer/CartPage';
import CustomerHeader from './customer/CustomerHeader';
import OrderHistory from './customer/OrderHistory';
import ProductCard from './customer/ProductCard';
import { catalogCategories, categoryImages } from '../data/catalog';
import Pagination from './Pagination';
import ProductDetail from './customer/ProductDetail';
import ProfilePage from './ProfilePage';
import CustomerFooter from './customer/CustomerFooter';
import CustomerHub, { CustomerSidebar } from './customer/CustomerHub';

const categories = ['All', ...catalogCategories];
const routeNames = new Set(['Shop', 'Deals', 'Buy Again', 'Wishlist', 'Compare', 'Orders', 'Returns', 'Addresses', 'Support', 'Profile', 'Cart']);
const routeToView = () => {
  const pathRoute = decodeURIComponent(window.location.pathname.replace(/\/$/, '').split('/').pop() || '');
  const legacyHashRoute = decodeURIComponent(window.location.hash.replace(/^#\/?/, '')).split('?')[0];
  const route = pathRoute || legacyHashRoute;
  const match = [...routeNames].find(view => view.toLowerCase().replaceAll(' ', '-') === route.toLowerCase());
  return match || 'Shop';
};

export default function CustomerStore() {
  const { products, orders, user, returnRequests, supportTickets, placeOrder, getCouponQuote, updateOrderStatus, handleLogout, deleteAccount, addProductReview, updateProfile, theme, toggleTheme } = useStore();
  const [activeView, setActiveView] = useState(routeToView);
  const previousView = useRef(activeView);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [category, setCategory] = useState('All');
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`sm_cart_${user.email}`) || '[]'); }
    catch { return []; }
  });
  const [wishlist, setWishlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`sm_wishlist_${user.email}`) || '[]'); }
    catch { return []; }
  });
  const [compareIds, setCompareIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`sm_compare_${user.email}`) || '[]').slice(0, 4); }
    catch { return []; }
  });
  const [checkoutMessage, setCheckoutMessage] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [addresses, setAddresses] = useState(() => { try { return JSON.parse(localStorage.getItem(`sm_addresses_${user.email}`) || '[]'); } catch { return []; } });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState(() => {
    const emptyAddress = { recipientName: user.name || '', phone: '', streetAddress: '', city: '', region: '', postalCode: '' };
    try {
      return { ...emptyAddress, ...JSON.parse(localStorage.getItem(`sm_delivery_${user.email}`) || '{}') };
    } catch {
      return emptyAddress;
    }
  });

  const filteredProducts = useMemo(() => products.filter(product => {
    if (product.isArchived) return false;
    if (activeView === 'Wishlist' && !wishlist.includes(product.id)) return false;
    if (showInStockOnly && product.stock <= 0) return false;
    const matchesSearch = `${product.name} ${product.category}`.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && (category === 'All' || product.category === category);
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'top-rated') return (b.reviews?.reduce((sum, review) => sum + review.rating, 0) / (b.reviews?.length || 1)) - (a.reviews?.reduce((sum, review) => sum + review.rating, 0) / (a.reviews?.length || 1));
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return b.salesCount - a.salesCount;
  }), [products, searchTerm, category, sortBy, activeView, wishlist, showInStockOnly]);

  useEffect(() => { localStorage.setItem(`sm_cart_${user.email}`, JSON.stringify(cart)); }, [cart, user.email]);
  useEffect(() => { localStorage.setItem(`sm_wishlist_${user.email}`, JSON.stringify(wishlist)); }, [wishlist, user.email]);
  useEffect(() => { localStorage.setItem(`sm_compare_${user.email}`, JSON.stringify(compareIds)); }, [compareIds, user.email]);
  useEffect(() => { localStorage.setItem(`sm_addresses_${user.email}`, JSON.stringify(addresses)); }, [addresses, user.email]);
  useEffect(() => {
    const restoreRoute = () => setActiveView(routeToView());
    window.addEventListener('popstate', restoreRoute);
    window.addEventListener('hashchange', restoreRoute);
    return () => { window.removeEventListener('popstate', restoreRoute); window.removeEventListener('hashchange', restoreRoute); };
  }, []);

  const currentCart = cart.map(item => {
    const currentProduct = products.find(product => product.id === item.id);
    return currentProduct ? { ...item, ...currentProduct, quantity: item.quantity } : item;
  });
  const cartTotal = currentCart.reduce((total, item) => total + Number(item.price) * Number(item.quantity), 0);
  const currentCouponQuote = couponCode ? getCouponQuote(couponCode, cartTotal) : null;
  const effectiveCouponDiscount = couponDiscount > 0 && currentCouponQuote?.success ? currentCouponQuote.discountAmount : 0;
  useEffect(() => {
    const enteringCart = activeView === 'Cart' && previousView.current !== 'Cart';
    previousView.current = activeView;
    if (!enteringCart || !couponCode) return;
    const quote = getCouponQuote(couponCode, cartTotal);
    setCouponMessage(quote.success ? `${quote.promotion?.code || couponCode} applied successfully.` : quote.error);
    setCouponDiscount(quote.success ? quote.discountAmount : 0);
  }, [activeView, couponCode, cartTotal, getCouponQuote]);
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const customerOrders = orders.filter(order => order.customerEmail === user.email);
  const pageSize = 12;
  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const visibleProducts = filteredProducts.slice((page - 1) * pageSize, page * pageSize);
  const compareProducts = compareIds.map(id => products.find(product => product.id === id)).filter(product => product && !product.isArchived);
  const featuredProduct = [...products].sort((a, b) => b.salesCount - a.salesCount)[0];

  const selectCategory = (nextCategory) => {
    setCategory(nextCategory);
    setPage(1);
    setSelectedProduct(null);
    navigateToView('Shop');
  };

  const addToCart = (product, requestedQuantity = 1) => {
    if (product.stock <= 0) return;
    setCheckoutMessage('');
    const quantity = Math.max(1, Math.min(product.stock, Math.floor(Number(requestedQuantity) || 1)));
    setCart(previousCart => {
      const existingItem = previousCart.find(item => item.id === product.id);
      if (existingItem) {
        return previousCart.map(item => item.id === product.id
          ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
          : item
        );
      }
      return [...previousCart, { ...product, quantity }];
    });
  };

  const toggleWishlist = (productId) => {
    setWishlist(previousWishlist => {
      const nextWishlist = previousWishlist.includes(productId)
        ? previousWishlist.filter(id => id !== productId)
        : [...previousWishlist, productId];
      localStorage.setItem(`sm_wishlist_${user.email}`, JSON.stringify(nextWishlist));
      return nextWishlist;
    });
  };

  const navigateToView = (view) => {
    if (view !== 'Shop') setSelectedProduct(null);
    if (view === 'Wishlist') setPage(1);
    setActiveView(view);
    const route = view.toLowerCase().replaceAll(' ', '-');
    if (window.location.pathname !== `/${route}` || window.location.hash) window.history.pushState(null, '', `/${route}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleCompare = (productId) => {
    if (compareIds.includes(productId)) {
      setCompareIds(current => current.filter(id => id !== productId));
      return;
    }
    if (compareIds.length >= 4) {
      setCheckoutMessage('Compare up to four products at a time. Remove one to add another.');
      return;
    }
    setCompareIds(current => [...current, productId]);
  };

  const openProduct = (product) => {
    setSelectedProduct(product);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateDeliveryAddress = (field, value) => {
    const nextAddress = { ...deliveryAddress, [field]: value };
    setDeliveryAddress(nextAddress);
    localStorage.setItem(`sm_delivery_${user.email}`, JSON.stringify(nextAddress));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) {
      setCart(previousCart => previousCart.filter(item => item.id !== productId));
      return;
    }
    const availableStock = products.find(product => product.id === productId)?.stock || 0;
    if (quantity > availableStock) quantity = availableStock;
    if (quantity < 1) {
      setCart(previousCart => previousCart.filter(item => item.id !== productId));
      return;
    }
    setCart(previousCart => previousCart.map(item => item.id === productId ? { ...item, quantity } : item));
  };

  const checkout = (event) => {
    event.preventDefault();
    const result = placeOrder(currentCart, deliveryAddress, couponCode);
    if (!result.success) {
      setCheckoutMessage(result.error);
      return;
    }
    setCart([]);
    setCouponCode(''); setCouponDiscount(0); setCouponMessage('');
    setCheckoutMessage('Order transmitted successfully.');
    setSelectedProduct(null);
    navigateToView('Orders');
  };

  return (
    <div id="top" data-theme={theme} className="customer-app grid-background">
      <CustomerHeader user={user} setActiveView={navigateToView} handleLogout={handleLogout} deleteAccount={deleteAccount} cartCount={cartCount} savedCount={wishlist.length} theme={theme} toggleTheme={toggleTheme} categories={categories} selectedCategory={category} onSelectCategory={selectCategory} searchTerm={searchTerm} onSearchChange={value => { setSearchTerm(value); setPage(1); }} />
      <div className="market-layout"><CustomerSidebar view={activeView==='Shop'?'Shop':activeView} navigate={navigateToView} count={cartCount} compareCount={compareIds.length} orderCount={customerOrders.length} returnCount={returnRequests.filter(item=>item.customerEmail===user.email&&['Requested','Approved'].includes(item.status)).length} ticketCount={supportTickets.filter(item=>item.customerEmail===user.email&&item.status!=='Resolved').length} /><main className="customer-main">
        {activeView === 'Shop' && !selectedProduct && <section className="market-hero">
          <div className="market-hero__copy"><p className="market-hero__eyebrow">Thoughtful finds for everyday life</p><h1>Good things.<br /><span>Better found.</span></h1><p>Explore customer-loved picks across home, style, technology, and more.</p><button type="button" onClick={() => document.getElementById('market-catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>Explore the collection <span aria-hidden="true">→</span></button><div className="market-hero__benefits"><span>✓ Live stock levels</span><span>✓ Simple checkout</span><span>✓ Order updates</span></div></div>
          {featuredProduct && <div className="market-hero__visual"><img src={featuredProduct.image} alt={`${featuredProduct.name}, featured in the ShopMetrics collection`} loading="eager" fetchPriority="high" decoding="async" onError={event => { const image = event.currentTarget; if (image.dataset.fallbackApplied) return; image.dataset.fallbackApplied = 'true'; const images = categoryImages[featuredProduct.category] || categoryImages.Electronics; const index = Number(featuredProduct.id?.match(/\d+$/)?.[0]) || 1; image.src = images[(index - 1) % images.length]; }} /><span className="market-hero__visual-label">Popular in the market</span></div>}
        </section>}

        {activeView === 'Shop' && selectedProduct ? (
          <ProductDetail product={products.find(product => product.id === selectedProduct.id) || selectedProduct} onBack={() => setSelectedProduct(null)} addToCart={addToCart} addReview={addProductReview} user={user} />
        ) : activeView === 'Shop' || activeView === 'Wishlist' ? <section className="market-catalog" id="market-catalog">
          <div className="market-catalog__heading"><div><p className="market-catalog__eyebrow">{activeView === 'Wishlist' ? 'Your collection' : category === 'All' ? 'The marketplace' : 'Browse category'}</p><h2>{activeView === 'Wishlist' ? 'Saved for later' : category === 'All' ? 'Popular right now' : category}</h2><p>{filteredProducts.length} items selected from {products.length} products</p></div><span className="market-catalog__count">{filteredProducts.length} results</span></div>
          <div className="market-filters"><label>Sort by<select value={sortBy} onChange={event => setSortBy(event.target.value)}><option value="featured">Popular</option><option value="top-rated">Top rated</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="name">Name</option></select></label><label className="market-stock-filter"><input type="checkbox" checked={showInStockOnly} onChange={event => { setShowInStockOnly(event.target.checked); setPage(1); }} /> In stock only</label></div>
          {filteredProducts.length === 0 ? <div className="market-empty"><span aria-hidden="true">{activeView === 'Wishlist' ? '♡' : '⌕'}</span><h3>{activeView === 'Wishlist' ? 'Nothing saved just yet' : 'No products found'}</h3><p>{activeView === 'Wishlist' ? 'Save items you love and they will be waiting here.' : 'Try another search, category, or stock filter.'}</p><button type="button" onClick={() => { setSearchTerm(''); setCategory('All'); setShowInStockOnly(false); setPage(1); if (activeView === 'Wishlist') navigateToView('Shop'); }}>Continue browsing</button></div> : <div className="product-grid">{visibleProducts.map(product => <ProductCard key={product.id} product={product} onOpen={openProduct} onAddToCart={addToCart} isSaved={wishlist.includes(product.id)} onToggleSaved={toggleWishlist} isCompared={compareIds.includes(product.id)} onToggleCompare={toggleCompare} />)}</div>}
          {filteredProducts.length > pageSize && <Pagination page={page} pageCount={pageCount} totalItems={filteredProducts.length} pageSize={pageSize} onPageChange={setPage} />}
        </section> : activeView === 'Compare' ? <section className="hub-page compare-page"><div className="page-heading"><div><p className="eyebrow">SHOPPING TOOL</p><h1>Compare products</h1><p>Review prices, availability, ratings, and details side by side.</p></div><button type="button" className="secondary-action" onClick={() => navigateToView('Shop')}>Add products</button></div>{compareProducts.length ? <div className="compare-table-wrap"><table className="compare-table"><thead><tr><th>Product</th>{compareProducts.map(product=><th key={product.id}><img src={product.image} alt=""/><strong>{product.name}</strong><button type="button" onClick={()=>toggleCompare(product.id)}>Remove</button></th>)}</tr></thead><tbody><tr><th>Price</th>{compareProducts.map(product=><td key={product.id}>${Number(product.price).toFixed(2)}</td>)}</tr><tr><th>Category</th>{compareProducts.map(product=><td key={product.id}>{product.category}</td>)}</tr><tr><th>Rating</th>{compareProducts.map(product=>{const reviews=product.reviews||[];const rating=reviews.length?reviews.reduce((sum,review)=>sum+Number(review.rating||0),0)/reviews.length:0;return <td key={product.id}>{rating.toFixed(1)} / 5 ({reviews.length})</td>;})}</tr><tr><th>Availability</th>{compareProducts.map(product=><td key={product.id}>{product.stock>0?`${product.stock} in stock`:'Sold out'}</td>)}</tr><tr><th>Actions</th>{compareProducts.map(product=><td key={product.id}><button type="button" className="primary-action" onClick={()=>addToCart(product)} disabled={product.stock<=0}>{product.stock>0?'Add to cart':'Sold out'}</button><button type="button" className="compare-details" onClick={()=>{navigateToView('Shop');openProduct(product);}}>Details</button></td>)}</tr></tbody></table></div> : <div className="hub-empty"><h2>No products selected</h2><p>Choose Compare on up to four product cards to view them side by side.</p><button type="button" className="primary-action" onClick={()=>navigateToView('Shop')}>Browse products</button></div>}</section> : activeView === 'Cart' ? <CartPage cart={currentCart} cartTotal={cartTotal} checkoutMessage={checkoutMessage} updateQuantity={updateQuantity} checkout={checkout} setActiveView={navigateToView} deliveryAddress={deliveryAddress} onDeliveryAddressChange={updateDeliveryAddress} couponCode={couponCode} setCouponCode={setCouponCode} couponMessage={couponMessage} couponDiscount={effectiveCouponDiscount} applyCoupon={()=>{const quote=getCouponQuote(couponCode,cartTotal);setCouponMessage(quote.success?(quote.promotion?`${quote.promotion.code} applied successfully.`:'Enter a promotion code.') :quote.error);setCouponDiscount(quote.success?quote.discountAmount:0);}} addresses={addresses} onChooseAddress={address=>{setDeliveryAddress(address);localStorage.setItem(`sm_delivery_${user.email}`,JSON.stringify(address));}} /> : activeView === 'Profile' ? <ProfilePage user={user} updateProfile={updateProfile} setActiveTab={navigateToView} /> : activeView === 'Orders' ? <OrderHistory orders={customerOrders} onCancelOrder={updateOrderStatus} /> : <CustomerHub view={activeView} orders={customerOrders} user={user} addresses={addresses} setAddresses={setAddresses} openProduct={openProduct} addToCart={addToCart} toggleWishlist={toggleWishlist} wishlist={wishlist} setCouponCode={setCouponCode} navigate={navigateToView} />}
      </main></div>
      <CustomerFooter user={user} products={products} setActiveView={navigateToView} />
    </div>
  );
}
