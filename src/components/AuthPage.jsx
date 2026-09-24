import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import BrandLogo from './BrandLogo';

export default function AuthPage() {
  const { handleLogin, handleRegister, theme, toggleTheme } = useStore();
  const [isLoginView, setIsLoginView] = useState(true);
  const [accountType, setAccountType] = useState('merchant');
  const [error, setError] = useState('');
  
  // Field States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submitForm = (e) => {
    e.preventDefault();
    setError('');

    if (isLoginView) {
      const response = handleLogin(email, password, accountType);
      if (!response.success) setError(response.error);
    } else {
      if (!name) return setError('Name assignment required.');
      const response = handleRegister(name, email, password, accountType);
      if (!response.success) setError(response.error);
    }
  };

  return (
    <div data-theme={theme} className="auth-screen flex items-center justify-center p-4">
      <div className="auth-panel rounded-2xl max-w-md w-full p-8 space-y-6">
      <button type="button" onClick={toggleTheme} className="theme-toggle theme-toggle--auth bulb-button" aria-label="Toggle theme" title="Toggle theme">{theme === 'dark' ? '☀' : '☾'}</button>
        <div className="text-center space-y-2">
          <BrandLogo size={56} />
          <h2 className="text-2xl font-bold text-white tracking-tight">ShopMetrics</h2>
          <p className="text-xs text-slate-400">
            {isLoginView ? 'Sign in to your workspace' : 'Create your ShopMetrics account'}
          </p>
        </div>

        <div className="grid grid-cols-2 rounded-xl bg-slate-950 p-1">
          <button type="button" onClick={() => { setAccountType('merchant'); setError(''); }} className={`rounded-lg px-3 py-2 text-xs font-bold ${accountType === 'merchant' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>Merchant</button>
          <button type="button" onClick={() => { setAccountType('customer'); setError(''); }} className={`rounded-lg px-3 py-2 text-xs font-bold ${accountType === 'customer' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>Customer</button>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs px-4 py-2.5 rounded-lg text-center font-medium">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={submitForm} className="space-y-4">
          {!isLoginView && (
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">Full Name</label>
              <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all" placeholder="John Doe"/>
            </div>
          )}
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">Email Address</label>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all" placeholder={accountType === 'merchant' ? 'merchant@example.com' : 'customer@example.com'}/>
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">Security Password</label>
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all" placeholder="••••••••"/>
          </div>

          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/10 mt-2 text-sm">
            {isLoginView ? `Sign in as ${accountType}` : `Create ${accountType} account`}
          </button>
        </form>

        <div className="pt-2 text-center text-xs border-t border-slate-700/50">
          <button onClick={() => { setIsLoginView(!isLoginView); setError(''); }} className="text-indigo-400 font-semibold hover:underline">
            {isLoginView ? "Don't have an account? Register profile" : 'Already possess profile? Initialize Login'}
          </button>
        </div>

        {isLoginView && accountType === 'merchant' && (
          <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700/30 text-[11px] text-center text-slate-500 font-mono">
            Quick Pass: <span className="text-slate-400">admin@shop.com</span> / <span className="text-slate-400">admin123</span>
          </div>
        )}
      </div>
    </div>
  );
}
