import { useState } from 'react';
import AccountMenu from '../AccountMenu';

export default function CustomerHeader({ user, setActiveView, handleLogout, deleteAccount, cartCount, theme, toggleTheme }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigateTo = (view) => {
    setActiveView(view);
    setIsMenuOpen(false);
  };

  return (
    <header className="customer-header">
      <div className="customer-header__inner">
        <div className="brand-lockup">
          <span className="brand-mark">SM</span>
          <div>
            <p className="eyebrow">ShopMetrics / Market</p>
            <h1>Consumer command deck</h1>
          </div>
        </div>
        <button type="button" className="customer-menu-toggle" aria-expanded={isMenuOpen} aria-label="Toggle customer navigation" onClick={() => setIsMenuOpen(open => !open)}>☰</button>
        <div className={`customer-header__actions ${isMenuOpen ? 'is-open' : ''}`}>
          <AccountMenu user={user} handleLogout={handleLogout} deleteAccount={deleteAccount} onEditProfile={() => navigateTo('Profile')} />
          <button type="button" onClick={() => navigateTo('Shop')} className="hud-button">Shop</button>
          <button type="button" onClick={() => navigateTo('Cart')} className="hud-button cart-link">Cart {cartCount > 0 && <span className="cart-dot" aria-label={`${cartCount} items`} />}</button>
          <button type="button" onClick={() => navigateTo('Orders')} className="hud-button">Orders</button>
          <button type="button" onClick={toggleTheme} className="hud-button bulb-button" aria-label="Toggle theme" title="Toggle theme">{theme === 'dark' ? '☀' : '☾'}</button>
        </div>
      </div>
    </header>
  );
}
