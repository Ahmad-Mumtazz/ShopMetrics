import { useMemo, useState } from 'react';
import { useStore } from '../context/StoreContext';
import CartPage from './customer/CartPage';
import CustomerHeader from './customer/CustomerHeader';
import OrderHistory from './customer/OrderHistory';
import ProductCard from './customer/ProductCard';
import CategoryMenu from './customer/CategoryMenu';
import { catalogCategories } from '../data/catalog';
import Pagination from './Pagination';
import ProductDetail from './customer/ProductDetail';
import ProfilePage from './ProfilePage';
import CustomerFooter from './customer/CustomerFooter';

const categories = ['All', ...catalogCategories];

export default function CustomerStore() {
  const { products, orders, user, placeOrder, handleLogout, deleteAccount, addProductReview, updateProfile, theme, toggleTheme } = useStore();
  const [activeView, setActiveView] = useState('Shop');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [category, setCategory] = useState('All');
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [cart, setCart] = useState([]);
  const [checkoutMessage, setCheckoutMessage] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const filteredProducts = useMemo(() => products.filter(product => {
    const matchesSearch = `${product.name} ${product.category}`.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && (category === 'All' || product.category === category);
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  }), [products, searchTerm, category, sortBy]);

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const customerOrders = orders.filter(order => order.customerEmail === user.email);
  const pageSize = 12;
  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const visibleProducts = filteredProducts.slice((page - 1) * pageSize, page * pageSize);

  const selectCategory = (nextCategory) => {
    setCategory(nextCategory);
    setPage(1);
    setIsCategoryMenuOpen(false);
  };

  const addToCart = (product) => {
    setCheckoutMessage('');
    setCart(previousCart => {
      const existingItem = previousCart.find(item => item.id === product.id);
      if (existingItem) {
        return previousCart.map(item => item.id === product.id
          ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
          : item
        );
      }
      return [...previousCart, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) {
      setCart(previousCart => previousCart.filter(item => item.id !== productId));
      return;
    }
    setCart(previousCart => previousCart.map(item => item.id === productId ? { ...item, quantity } : item));
  };

  const checkout = () => {
    const result = placeOrder(cart);
    if (!result.success) {
      setCheckoutMessage(result.error);
      return;
    }
    setCart([]);
    setCheckoutMessage('Order transmitted successfully.');
    setActiveView('Orders');
  };

  return (
    <div data-theme={theme} className="customer-app grid-background">
      <CustomerHeader user={user} setActiveView={setActiveView} handleLogout={handleLogout} deleteAccount={deleteAccount} cartCount={cart.length} theme={theme} toggleTheme={toggleTheme} />
      <main className="customer-main">
        <section className="customer-hero">
          <div>
            <h2>Find your next <span>upgrade.</span></h2>
            <br />
          </div>
          <div className="hero-orbit" aria-hidden="true"><span /><span /><span /></div>
        </section>

        <div className="view-switcher">
          <button type="button" onClick={() => setActiveView('Shop')} className={activeView === 'Shop' ? 'is-active' : ''}>Shop feed</button>
          <button type="button" onClick={() => setActiveView('Cart')} className={activeView === 'Cart' ? 'is-active' : ''}>Cart</button>
          <button type="button" onClick={() => setActiveView('Orders')} className={activeView === 'Orders' ? 'is-active' : ''}>Order archive</button>
        </div>

        {activeView === 'Shop' ? (
          <div className="customer-layout customer-layout--single">
            <section className="catalog-section">
              <div className="catalog-toolbar holo-panel">
                <input type="search" value={searchTerm} onChange={(event) => { setSearchTerm(event.target.value); setPage(1); }} placeholder="Search products or categories" />
                <CategoryMenu categories={categories} selectedCategory={category} isOpen={isCategoryMenuOpen} onToggle={() => setIsCategoryMenuOpen(open => !open)} onSelect={selectCategory} />
                <label className="catalog-sort"><span>Sort by</span><select value={sortBy} onChange={event => setSortBy(event.target.value)}><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="name">Name</option></select></label>
              </div>
              {filteredProducts.length === 0 ? <div className="holo-panel empty-state">No products match the current scan.</div> : <div className="product-grid">{visibleProducts.map(product => <ProductCard key={product.id} product={product} addToCart={addToCart} onOpen={setSelectedProduct} />)}</div>}
              <Pagination page={page} pageCount={pageCount} totalItems={filteredProducts.length} pageSize={pageSize} onPageChange={setPage} />
            </section>
          </div>
        ) : activeView === 'Cart' ? <CartPage cart={cart} cartTotal={cartTotal} checkoutMessage={checkoutMessage} updateQuantity={updateQuantity} checkout={checkout} setActiveView={setActiveView} /> : activeView === 'Profile' ? <ProfilePage user={user} updateProfile={updateProfile} setActiveTab={setActiveView} /> : <OrderHistory orders={customerOrders} />}
      </main>
      <CustomerFooter user={user} products={products} setActiveView={setActiveView} />
      {selectedProduct && <ProductDetail product={products.find(product => product.id === selectedProduct.id) || selectedProduct} onClose={() => setSelectedProduct(null)} addToCart={addToCart} addReview={addProductReview} user={user} />}
    </div>
  );
}
