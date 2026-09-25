import { useState } from 'react';
import { useStore } from './context/useStore';
import AuthPage from './components/AuthPage';
import AnalyticsView from './components/AnalyticsView';
import ProductInventory from './components/ProductInventory';
import ProductContentManager from './components/ProductContentManager';
import MerchantNotifications from './components/MerchantNotifications';
import OrderManager from './components/OrderManager';
import CustomerStore from './components/CustomerStore';
import AccountMenu from './components/AccountMenu';
import ProfilePage from './components/ProfilePage';
import BrandLogo from './components/BrandLogo';
import MerchantPromotions from './components/MerchantPromotions';
import ReturnManager from './components/ReturnManager';
import MerchantSupport from './components/MerchantSupport';

function App() {
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const { activeTab, setActiveTab, user, products, orders, returnRequests, supportTickets, handleLogout, deleteAccount, updateProfile, theme, toggleTheme } = useStore();
  if (!user) return <AuthPage />;
  if (user.role === 'customer') return <CustomerStore />;

  const renderActiveView = () => {
    switch (activeTab) {
      case 'Dashboard': return <AnalyticsView onShowLowStock={() => setShowLowStockOnly(true)} />;
      case 'Products': return <ProductInventory lowStockOnly={showLowStockOnly} onClearLowStockFilter={() => setShowLowStockOnly(false)} />;
      case 'Description': return <ProductContentManager section="description" />;
      case 'Notifications': return <MerchantNotifications onShowLowStock={() => { setShowLowStockOnly(true); setActiveTab('Products'); }} />;
      case 'Orders': return <OrderManager />;
      case 'Promotions': return <MerchantPromotions />;
      case 'Returns': return <ReturnManager />;
      case 'Support': return <MerchantSupport />;
      case 'Profile': return <ProfilePage user={user} updateProfile={updateProfile} setActiveTab={setActiveTab} />;
      default: return <AnalyticsView />;
    }
  };
  const navGroups = [
    { label: 'OPERATIONS', items: [{ name: 'Dashboard', icon: '▦' }, { name: 'Products', icon: '▣' }, { name: 'Orders', icon: '↗' }, { name: 'Returns', icon: '↩' }] },
    { label: 'GROWTH & SERVICE', items: [{ name: 'Promotions', icon: '%' }, { name: 'Description', icon: '≡' }, { name: 'Notifications', icon: '◎' }, { name: 'Support', icon: '?' }] },
  ];
  const lowStockCount = products.filter(product => !product.isArchived && (product.stock <= 0 || product.stock < (product.lowStockThreshold ?? 15))).length;
  const openOrderCount = orders.filter(order => ['Processing', 'Shipped'].includes(order.status)).length;
  const badgeFor = name => name === 'Products' ? lowStockCount : name === 'Orders' ? openOrderCount : name === 'Returns' ? returnRequests.filter(item => item.status === 'Requested').length : name === 'Support' ? supportTickets.filter(item => item.status !== 'Resolved').length : 0;

  return (
    <div data-theme={theme} className="futuristic-shell merchant-shell min-h-screen h-screen flex overflow-hidden antialiased">
      <aside className="merchant-sidebar w-64 flex flex-col fixed h-full z-20">
        <div className="merchant-brand h-16 px-6 flex items-center gap-3">
          <BrandLogo size={36} />
          <span className="merchant-brand__name"><strong>ShopMetrics</strong><small>SELLER STUDIO</small></span>
        </div>
        <nav className="merchant-workspace-nav flex-1" aria-label="Merchant workspace">
          {navGroups.map(group => <div className="merchant-nav-group" key={group.label}>
            <p className="merchant-nav-caption">{group.label}</p>
            {group.items.map(item => {
              const isActive = activeTab === item.name;
              return <button type="button" key={item.name} onClick={() => { if (item.name === 'Products') setShowLowStockOnly(false); setActiveTab(item.name); }} title={item.name} aria-label={item.name} aria-current={isActive ? 'page' : undefined} className={`merchant-nav-button ${isActive ? 'is-active' : ''}`}>
                <span className="merchant-nav-icon" aria-hidden="true">{item.icon}</span><span>{item.name}</span>{badgeFor(item.name) > 0 && <b className="merchant-nav-badge">{badgeFor(item.name) > 99 ? '99+' : badgeFor(item.name)}</b>}{isActive && <i aria-hidden="true" />}
              </button>;
            })}
          </div>)}
        </nav>
        <div className="merchant-sidebar__store"><span className="merchant-sidebar__store-icon">{(user.name || 'S').charAt(0).toUpperCase()}</span><span><strong>{user.name}</strong><small>Store owner</small></span></div>
        <div className="merchant-logout p-4">
          <button onClick={handleLogout} className="merchant-signout"><span>Sign out</span><span aria-hidden="true">↗</span></button>
        </div>
      </aside>

      <main className="merchant-main flex-1 ml-64 min-h-screen flex flex-col">
        <header className="merchant-header px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="merchant-header__context"><span>MERCHANT WORKSPACE</span><strong>{activeTab}</strong></div>
          <div className="merchant-header__tools"><strong className="merchant-owner-name" title={user.name} style={theme === 'dark' ? { color: '#f4fff8', backgroundColor: '#203d31' } : undefined}>{user.name}</strong><span className="merchant-live-pill"><i />Store active</span>
            <button type="button" onClick={toggleTheme} className="theme-toggle merchant-theme-button" aria-label={`Theme (currently ${theme})`} title={`Theme: ${theme}`}>Theme</button>
            <AccountMenu user={user} handleLogout={handleLogout} deleteAccount={deleteAccount} onEditProfile={() => setActiveTab('Profile')} />
          </div>
        </header>
        <section className="merchant-content p-8 max-w-7xl w-full mx-auto flex-1 overflow-y-auto h-[calc(100vh-64px)]">
          {renderActiveView()}
        </section>
      </main>
    </div>
  );
}

export default App;
