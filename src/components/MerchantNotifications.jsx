import { useMemo, useState } from 'react';
import { useStore } from '../context/useStore';
import ProductContentManager from './ProductContentManager';

export default function MerchantNotifications({ onShowLowStock }) {
  const { user, products, orders, setActiveTab } = useStore();
  const storageKey = `sm_dismissed_alerts_${user.email}`;
  const [dismissed, setDismissed] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || '[]'); }
    catch { return []; }
  });
  const [view, setView] = useState('activity');
  const notifications = useMemo(() => {
    const stockAlerts = products.filter(product => !product.isArchived && (product.stock <= 0 || product.stock < (product.lowStockThreshold ?? 15))).map(product => ({
      id: `stock:${product.id}:${product.stock}`,
      kind: 'stock',
      title: product.stock <= 0 ? `${product.name} is out of stock` : `${product.name} is running low`,
      detail: `${product.stock} units remain. Restock alert is set at ${product.lowStockThreshold ?? 15}.`,
      action: 'Review inventory',
      time: 'Inventory alert'
    }));
    const orderAlerts = orders.filter(order => ['Processing', 'Shipped'].includes(order.status)).slice(0, 14).map(order => ({
      id: `order:${order.id}:${order.status}`,
      kind: 'order',
      title: order.status === 'Processing' ? `New order ${order.id} needs fulfillment` : `Shipment ${order.id} is in transit`,
      detail: `${order.customerName} · ${order.productName} · $${Number(order.totalAmount).toLocaleString()}`,
      action: 'Open order',
      orderId: order.id,
      time: order.date
    }));
    return [...stockAlerts, ...orderAlerts];
  }, [products, orders]);
  const visibleNotifications = notifications.filter(notification => !dismissed.includes(notification.id));

  const acknowledge = (id) => setDismissed(previous => {
    const next = [...new Set([...previous, id])];
    localStorage.setItem(storageKey, JSON.stringify(next));
    return next;
  });

  if (view === 'reviews') return <div className="merchant-notifications-page">
    <div className="page-heading"><div><p className="eyebrow">CUSTOMER VOICE</p><h1>Review moderation</h1><p className="text-sm text-slate-500">Read and manage reviews across your product catalog.</p></div><button type="button" className="secondary-action" onClick={() => setView('activity')}>Back to notifications</button></div>
    <ProductContentManager section="reviews" />
  </div>;

  return <div className="merchant-notifications-page space-y-6 animate-fadeIn">
    <div className="page-heading"><div><p className="eyebrow">STORE ACTIVITY</p><h1 className="text-2xl font-bold text-slate-800">Notifications</h1><p className="text-sm text-slate-500">Actionable updates from inventory and order fulfillment.</p></div><div className="page-heading__actions"><button type="button" className="secondary-action" onClick={() => setView('reviews')}>Manage product reviews</button>{visibleNotifications.length > 0 && <button type="button" className="secondary-action" onClick={() => { const next = [...new Set([...dismissed, ...visibleNotifications.map(item => item.id)])]; localStorage.setItem(storageKey, JSON.stringify(next)); setDismissed(next); }}>Mark all handled</button>}</div></div>
    <div className="notification-summary"><div><span>Needs attention</span><strong>{visibleNotifications.length}</strong></div><div><span>Inventory alerts</span><strong>{visibleNotifications.filter(item => item.kind === 'stock').length}</strong></div><div><span>Open orders</span><strong>{visibleNotifications.filter(item => item.kind === 'order').length}</strong></div></div>
    <section className="notification-list" aria-label="Store notifications">
      {visibleNotifications.length ? visibleNotifications.map(notification => <article className={`notification-card notification-card--${notification.kind}`} key={notification.id}>
        <span className="notification-card__icon" aria-hidden="true">{notification.kind === 'stock' ? '!' : '↗'}</span>
        <div className="notification-card__content"><div className="notification-card__meta"><span>{notification.kind === 'stock' ? 'INVENTORY' : 'FULFILLMENT'}</span><time>{notification.time}</time></div><h2>{notification.title}</h2><p>{notification.detail}</p></div>
        <div className="notification-card__actions"><button type="button" className="primary-action" onClick={() => { if (notification.kind === 'stock') onShowLowStock?.(); else setActiveTab('Orders'); }}>{notification.action}</button><button type="button" className="notification-dismiss" onClick={() => acknowledge(notification.id)}>Mark handled</button></div>
      </article>) : <div className="notification-empty"><span aria-hidden="true">✓</span><h2>You’re all caught up</h2><p>New order and low stock alerts will appear here.</p></div>}
    </section>
  </div>;
}
