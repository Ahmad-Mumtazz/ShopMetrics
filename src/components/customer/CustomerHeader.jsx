import { useState } from 'react';
import AccountMenu from '../AccountMenu';
import BrandLogo from '../BrandLogo';

export default function CustomerHeader({ user, setActiveView, handleLogout, deleteAccount, cartCount, theme, toggleTheme }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigateTo = (view) => {
    setActiveView(view);
    setIsMenuOpen(false);
  };

  return (
    <header id="top" className="customer-header">
      <div className="customer-header__inner">
        <div className="brand-lockup">
          <BrandLogo size={38} />
          <div>
            <p className="eyebrow">ShopMetrics / Market</p>
            <h1>Consumer command deck</h1>
          </div>
        </div>
        <button type="button" className="customer-menu-toggle" aria-expanded={isMenuOpen} aria-controls="customer-navigation" aria-label={isMenuOpen ? 'Close customer navigation' : 'Open customer navigation'} onClick={() => setIsMenuOpen(open => !open)}><span className="customer-menu-toggle__icon" aria-hidden="true" /><span className="customer-menu-toggle__label">Menu</span></button>
        {isMenuOpen && <button type="button" className="customer-nav-backdrop" aria-label="Close customer navigation" onClick={() => setIsMenuOpen(false)} />}
        <nav id="customer-navigation" aria-label="Customer navigation" className={`customer-header__actions ${isMenuOpen ? 'is-open' : ''}`}>
          <AccountMenu user={user} handleLogout={handleLogout} deleteAccount={deleteAccount} onEditProfile={() => navigateTo('Profile')} />
          <button type="button" onClick={() => navigateTo('Shop')} className="hud-button">Shop</button>
          <button type="button" onClick={() => navigateTo('Cart')} className="hud-button cart-link">Cart {cartCount > 0 && <span className="cart-dot" aria-label={`${cartCount} items`} />}</button>
          <button type="button" onClick={() => navigateTo('Orders')} className="hud-button">Orders</button>
          <button type="button" onClick={toggleTheme} className="hud-button bulb-button" aria-label="Toggle theme" title="Toggle theme">{theme === 'dark' ? '☀' : '☾'}</button>
        </nav>
      </div>
   