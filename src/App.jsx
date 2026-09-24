import React from 'react';
import { useStore } from './context/StoreContext';
import AuthPage from './components/AuthPage';
import AnalyticsView from './components/AnalyticsView';
import ProductInventory from './components/ProductInventory';
import OrderManager from './components/OrderManager';
import CustomerStore from './components/CustomerStore';
import AccountMenu from './components/AccountMenu';
import ProfilePage from './components/ProfilePage';

function App() {
  const { activeTab, setActiveTab, user, handleLogout, deleteAccount, updateProfile, theme, toggleTheme } = useStore();
``
  if (!user) {
    return <AuthPage />;
  }

  if (user.role === 'customer') {
    return <CustomerStore />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'Dashboard': return <AnalyticsView />;
      case 'Products': return <ProductInventory />;
      case 'Orders': return <OrderManager />;
      case 'Profile': return <ProfilePage user={user} updateProfile={updateProfile} setActiveTab={setActiveTab} />;
      default: return <AnalyticsView />;
    }
  };
  const navItems = [
    { name: 'Dashboard', icon: '📊' },
    { name: 'Products', icon: '📦' },
    { name: 'Orders', icon: '🧾' },
  ];

  return (
    <div data-theme={theme} className="futuristic-shell min-h-screen h-screen flex overflow-hidden antialiased">
      
      {/* Structural Desktop Sidebar Panel */}
      <aside className="merchant-sidebar w-64 flex flex-col fixed h-full z-20">
        <div className="merchant-brand h-16 px-6 flex items-center gap-3">
          <span className="brand-mark">SM</span>
          <span className="font-bold text-lg text-white tracking-wider">ShopMetrics</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {navItems.map((item) => {
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`merchant-nav-button w-full flex items-center gap-3.5 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-150 ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                    : 'hover:bg-slate-800/60 hover:text-slate-100 text-slate-400'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.name}
              </button>
            );
          })}
        </nav>
        
        {/* Interactive Logout Interface Control Widget */}
        <div className="merchant-logout p-4 space-y-3">
          <button 
            onClick={handleLogout}
            className="w-full bg-slate-950 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-900 text-xs py-2 px-3 rounded-lg font-medium transition-all text-left flex items-center justify-between"
          >
            <span>Exit Merchant Portal</span>
            <span>🚪</span>
          </button>
        </div>
      </aside>

      {/* Main Administrative Context Panel */}
      <main className="merchant-main flex-1 ml-64 min-h-screen flex flex-col">
        <header className="merchant-header h-16 px-8 flex items-center justify-between sticky top-0 z-10">
          <AccountMenu user={user} handleLogout={handleLogout} deleteAccount={deleteAccount} onEditProfile={() => setActiveTab('Profile')} />
          <button type="button" onClick={toggleTheme} className="theme-toggle bulb-button" aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} title="Toggle theme">
            {theme === 'dark' ? '☀' : '☾'}
          </button>
        </header>

        {/* Content Render Mount Area */}
        <section className="merchant-content p-8 max-w-7xl w-full mx-auto flex-1 overflow-y-auto h-[calc(100vh-64px)]">
          {renderActiveView()}
        </section>
      </main>
    </div>
  );
}
export default App