import { useMemo, useState } from 'react';
import { useStore } from '../context/useStore';

const blank = { code: '', discountType: 'percent', discountValue: '', minimumOrder: '0', usageLimit: '', expiresAt: '' };

export default function MerchantPromotions() {
  const { promotions, addPromotion, updatePromotion, deletePromotion } = useStore();
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const activeCount = promotions.filter(item => item.active && (!item.expiresAt || new Date(`${item.expiresAt}T23:59:59`) >= new Date()) && (!item.usageLimit || item.usedCount < item.usageLimit)).length;
  const redemptions = promotions.reduce((sum, item) => sum + (Number(item.usedCount) || 0), 0);
  const sorted = useMemo(() => [...promotions].sort((a, b) => Number(b.active) - Number(a.active) || a.code.localeCompare(b.code)), [promotions]);
  const change = (key, value) => { setForm(previous => ({ ...previous, [key]: value })); setError(''); setMessage(''); };
  const reset = () => { setForm(blank); setEditingId(''); setError(''); };
  const edit = item => {
    setEditingId(item.id);
    setForm({ code: item.code, discountType: item.discountType, discountValue: String(item.discountValue), minimumOrder: String(item.minimumOrder || 0), usageLimit: item.usageLimit ? String(item.usageLimit) : '', expiresAt: item.expiresAt || '' });
    setError(''); setMessage('');
    document.getElementById('promotion-editor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const save = event => {
    event.preventDefault();
    const code = form.code.trim().toUpperCase();
    const value = Number(form.discountValue);
    const minimum = Number(form.minimumOrder || 0);
    const limit = form.usageLimit ? Number(form.usageLimit) : null;
    if (!/^[A-Z0-9_-]{3,20}$/.test(code)) return setError('Use 3–20 letters, numbers, hyphens, or underscores.');
    if (promotions.some(item => item.code.toUpperCase() === code && item.id !== editingId)) return setError('That code is already in use.');
    if (!Number.isFinite(value) || value <= 0 || (form.discountType === 'percent' && value > 100)) return setError('Enter a valid discount amount. Percentage discounts can’t exceed 100%.');
    if (!Number.isFinite(minimum) || minimum < 0 || (limit !== null && (!Number.isInteger(limit) || limit < 1))) return setError('Check the minimum order and redemption limit.');
    if (form.expiresAt && form.expiresAt < today) return setError('Choose an end date that is today or later.');
    const next = { code, discountType: form.discountType, discountValue: value, minimumOrder: minimum, usageLimit: limit, expiresAt: form.expiresAt || '', active: editingId ? promotions.find(item => item.id === editingId)?.active ?? true : true };
    if (editingId) updatePromotion(editingId, next); else addPromotion(next);
    setMessage(editingId ? `${code} updated` : `${code} is live at checkout`);
    reset();
  };

  return <div className="merchant-promotion-page animate-fadeIn">
    <header className="promotion-page-heading">
      <div><p className="eyebrow">GROW YOUR STORE</p><h1>Promotions</h1><p>Give shoppers a reason to come back. Every code works at customer checkout.</p></div>
      <a className="primary-action" href="#promotion-editor"><span aria-hidden="true">＋</span> Create promotion</a>
    </header>

    <section className="promotion-metrics" aria-label="Promotion overview">
      <article><span className="promotion-metric-icon">↗</span><div><small>Live promotions</small><strong>{activeCount}</strong></div><em>Ready for checkout</em></article>
      <article><span className="promotion-metric-icon promotion-metric-icon--blue">✓</span><div><small>Code redemptions</small><strong>{redemptions}</strong></div><em>Across all campaigns</em></article>
      <article><span className="promotion-metric-icon promotion-metric-icon--gold">％</span><div><small>All campaigns</small><strong>{promotions.length}</strong></div><em>Created in this store</em></article>
    </section>

    <div className="promotion-workspace">
      <section className="promotion-campaigns">
        <header className="promotion-section-heading"><div><p className="eyebrow">CAMPAIGN MANAGER</p><h2>Your promotions</h2></div><span>{promotions.length} total</span></header>
        {sorted.length ? <div className="promotion-card-grid">{sorted.map(item => {
          const expired = item.expiresAt && new Date(`${item.expiresAt}T23:59:59`) < new Date();
          const exhausted = item.usageLimit && item.usedCount >= item.usageLimit;
          const live = item.active && !expired && !exhausted;
          const ratio = item.usageLimit ? Math.min(100, Number(item.usedCount || 0) / item.usageLimit * 100) : 0;
          return <article className={`promotion-card ${live ? 'is-live' : ''}`} key={item.id}>
            <div className="promotion-card__top"><span className="promotion-code"><i aria-hidden="true">%</i>{item.code}</span><span className={`promotion-state ${live ? 'is-live' : ''}`}><i />{!item.active ? 'Paused' : expired ? 'Expired' : exhausted ? 'Limit reached' : 'Live'}</span></div>
            <div className="promotion-offer">{item.discountType === 'percent' ? `${item.discountValue}%` : `$${Number(item.discountValue).toFixed(2)}`}<span>off</span></div>
            <div className="promotion-card__conditions"><span>{Number(item.minimumOrder) > 0 ? `Min. order $${Number(item.minimumOrder).toFixed(2)}` : 'No minimum spend'}</span><span>{item.expiresAt ? `Ends ${new Date(`${item.expiresAt}T00:00:00`).toLocaleDateString()}` : 'No expiry date'}</span></div>
            <div className="promotion-usage"><div><span>Redemptions</span><strong>{item.usedCount || 0}{item.usageLimit ? ` / ${item.usageLimit}` : ' / Unlimited'}</strong></div><div className="promotion-usage__track"><i style={{ width: `${ratio}%` }} /></div></div>
            <footer className="promotion-card__actions"><button type="button" onClick={() => edit(item)}>Edit details</button><button type="button" onClick={() => updatePromotion(item.id, { active: !item.active })}>{item.active ? 'Pause' : 'Resume'}</button><button type="button" className="is-danger" onClick={() => { if (window.confirm(`Delete ${item.code}?`)) deletePromotion(item.id); }}>Delete</button></footer>
          </article>;
        })}</div> : <div className="promotion-empty"><span aria-hidden="true">％</span><h3>Your next campaign starts here</h3><p>Create a discount code to show shoppers a clear, useful offer at checkout.</p><a href="#promotion-editor">Create your first promotion <span aria-hidden="true">→</span></a></div>}
      </section>

      <form className="promotion-editor" id="promotion-editor" onSubmit={save}>
        <header><span className="promotion-editor__icon">✦</span><div><p className="eyebrow">{editingId ? 'EDIT CAMPAIGN' : 'NEW CAMPAIGN'}</p><h2>{editingId ? 'Update promotion' : 'Build an offer'}</h2></div>{editingId && <button type="button" className="promotion-cancel-edit" onClick={reset}>Cancel</button>}</header>
        <p className="promotion-editor__intro">Set the code shoppers enter at checkout and choose when it applies.</p>
        <label>Promo code<div className="promotion-code-input"><span>％</span><input required maxLength="20" value={form.code} onChange={event => change('code', event.target.value.toUpperCase())} placeholder="WELCOME15" autoComplete="off" /></div><small>3–20 characters · Letters and numbers</small></label>
        <fieldset className="promotion-discount"><legend>Discount</legend><div className="promotion-form-row"><label>Offer type<select value={form.discountType} onChange={event => change('discountType', event.target.value)}><option value="percent">Percentage</option><option value="fixed">Fixed amount</option></select></label><label>Amount<div className="promotion-number-input"><span>{form.discountType === 'percent' ? '%' : '$'}</span><input required type="number" min="0.01" max={form.discountType === 'percent' ? 100 : undefined} step="0.01" value={form.discountValue} onChange={event => change('discountValue', event.target.value)} placeholder={form.discountType === 'percent' ? '15' : '10.00'} /></div></label></div></fieldset>
        <div className="promotion-form-row"><label>Minimum order ($)<input type="number" min="0" step="0.01" value={form.minimumOrder} onChange={event => change('minimumOrder', event.target.value)} /></label><label>Redemption limit<input type="number" min="1" step="1" value={form.usageLimit} onChange={event => change('usageLimit', event.target.value)} placeholder="Unlimited" /></label></div>
        <label><span className="promotion-date-label">End date <em>Optional</em></span><input type="date" min={today} value={form.expiresAt} onChange={event => change('expiresAt', event.target.value)} /></label>
        <div className="promotion-live-note"><span aria-hidden="true">✓</span><p>Offer is checked again when the order is placed, including expiry and usage limit.</p></div>
        {error && <p className="promotion-error" role="alert">{error}</p>}{message && <p className="promotion-success" role="status">{message}</p>}
        <button type="submit" className="primary-action promotion-submit">{editingId ? 'Save changes' : 'Launch promotion'} <span aria-hidden="true">→</span></button>
      </form>
    </div>
  </div>;
}
