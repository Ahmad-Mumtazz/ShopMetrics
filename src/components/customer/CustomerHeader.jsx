import { useState } from 'react';
import AccountMenu from '../AccountMenu';
import BrandLogo from '../BrandLogo';

export default function CustomerHeader({ user, setActiveView, handleLogout, deleteAccount, cartCount, savedCount, theme, toggleTheme, categories, selectedCategory, onSelectCategory, searchTerm, onSearchChange }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigateTo = (view) => {
    setActiveView(view);
    setIsMenuOpen(false);
  };

  const chooseCategory = (category) => {
    onSelectCategory(category);
    navigateTo('Shop');
  };

  return (
    <header className="market-header">
      <div className="market-header__main">
        <button type="button" className="market-brand" onClick={() => navigateTo('Shop')} aria-label="ShopMetrics Market home">
          <BrandLogo size={40} />
          <span><strong>ShopMetrics</strong><small>MARKET</small></span>
        </button>

        <form className="market-search" role="search" onSubmit={event => { event.preventDefault(); navigateTo('Shop'); }}>
          <label className="sr-only" htmlFor="market-search-input">Search products</label>
          <input id="market-search-input" type="search" value={searchTerm} onChange={event => onSearchChange(event.target.value)} placeholder="Search products, categories, and more" />
          <button type="submit" aria-label="Search">Search</button>
        </form>

        <button type="button" className="market-menu-toggle" aria-expanded={isMenuOpen} aria-controls="market-actions" onClick={() => setIsMenuOpen(open => !open)}>{isMenuOpen ? 'Close' : 'Menu'}</button>
        <nav id="market-actions" className={`market-actions ${isMenuOpen ? 'is-open' : ''}`} aria-label="Account and shopping">
          <button type="button" onClick={() => navigateTo('Orders')} className="market-action">Orders</button>
          <button type="button" onClick={() => navigateTo('Wishlist')} className="market-action">Saved <span>{savedCount}</span></button>
          <button type="button" onClick={() => navigateTo('Cart')} className="market-cart" aria-label={`Shopping cart, ${cartCount} items`}><span aria-hidden="true">Cart</span><b>{cartCount}</b></button>
          <button type="button" onClick={toggleTheme} className="market-theme" aria-label={`Theme (currently ${theme})`} title={`Theme: ${theme}`}>Theme</button>
          <AccountMenu user={user} handleLogout={handleLogout} deleteAccount={deleteAccount} onEditProfile={() => navigateTo('Profile')} />
        </nav>
      </div>
      <div className="market-category-bar">
        <nav aria-label="Shop by category">
          {categories.map(category => <button type="button" key={category} className={category === selectedCategory ? 'is-active' : ''} onClick={() => chooseCategory(category)}>{category}</button>)}
        </nav>
      </div>
    </header>
  );
}
