import { useStore } from '../context/useStore';
import RevenueChart from './RevenueChart';

export default function AnalyticsView({ onShowLowStock }) {
  const { financialMetrics, orders, products, setActiveTab, user } = useStore();
  const lowStockProducts = products.filter(product => !product.isArchived && (product.stock <= 0 || product.stock < (product.lowStockThreshold ?? 15))).sort((a, b) => a.stock - b.stock).slice(0, 5);
  const bestSellers = [...products].filter(product => !product.isArchived).sort((a, b) => b.salesCount - a.salesCount).slice(0, 5);

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="merchant-dashboard-intro">
        <div><p className="eyebrow">YOUR BUSINESS AT A GLANCE</p>
          <h1 className="text-2xl font-bold text-slate-800">Welcome back, {user.name}</h1>
          <p className="text-sm text-slate-500">Here is what is happening in your store today.</p>
        </div>
        <div className="merchant-dashboard-intro__actions"><button type="button" className="secondary-action" onClick={() => setActiveTab('Orders')}>Review orders</button><button type="button" className="primary-action" onClick={() => setActiveTab('Products')}>Manage products <span aria-hidden="true">→</span></button></div>
      </div>

      {/* Metric Cards Grid */}
      <div className="merchant-metrics-grid grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="holo-card metric-card merchant-metric-card bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Revenue</div>
          <div className="mt-2 text-2xl font-bold text-slate-800">${financialMetrics.totalRevenue.toLocaleString()}</div>
          <div className="mt-1 text-xs text-slate-500 font-medium">From non-cancelled orders</div>
        </div>
        <button type="button" onClick={() => setActiveTab('Orders')} className="holo-card metric-card merchant-metric-card w-full text-left bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-indigo-200">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Non-cancelled orders</div>
          <div className="mt-2 text-2xl font-bold text-slate-800">{financialMetrics.totalOrdersCount}</div>
          <div className="mt-1 text-xs text-slate-500">Total volume transactions</div>
        </button>
        <div className="holo-card metric-card merchant-metric-card bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Order Value</div>
          <div className="mt-2 text-2xl font-bold text-slate-800">${financialMetrics.averageOrderValue}</div>
          <div className="mt-1 text-xs text-slate-500 font-medium">Based on current order volume</div>
        </div>
        <button type="button" onClick={() => { onShowLowStock?.(); setActiveTab('Products'); }} className="holo-card metric-card merchant-metric-card w-full text-left bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden hover:border-indigo-300 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-indigo-200">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Low Stock Warnings</div>
          <div className="mt-2 text-2xl font-bold text-slate-800">{financialMetrics.lowStockCount} Items</div>
          <div className={`mt-1 text-xs font-semibold ${financialMetrics.lowStockCount > 0 ? 'text-amber-600' : 'text-slate-500'}`}>
            {financialMetrics.lowStockCount > 0 ? 'Immediate restock required' : 'Inventory optimal'}
          </div>
        </button>
      </div>

      <RevenueChart chartData={financialMetrics.chartData} />

      <div className="merchant-dashboard-grid">
        <section className="merchant-data-panel bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="merchant-data-panel__heading"><div><p className="eyebrow">Fulfillment</p><h2>Recent orders</h2></div><button type="button" className="secondary-action" onClick={() => setActiveTab('Orders')}>View all orders</button></div>
          {orders.length ? <div className="merchant-activity-list">
            {orders.slice(0, 5).map(order => <article key={order.id} className="merchant-activity-row">
              <span className="merchant-order-avatar" aria-hidden="true">{(order.customerName || 'C').charAt(0).toUpperCase()}</span>
              <div className="merchant-activity-row__copy"><strong>{order.customerName}</strong><span>{order.productName}</span><small>{order.date}</small></div>
              <div className="merchant-activity-row__meta"><strong>${Number(order.totalAmount).toLocaleString()}</strong><span className={`merchant-status merchant-status--${String(order.status).toLowerCase()}`}>{order.status}</span></div>
            </article>)}
          </div> : <div className="merchant-dashboard-empty"><strong>No orders yet</strong><span>Customer purchases will appear here as they come in.</span></div>}
        </section>

        <aside className="merchant-ops-column">
          <section className="merchant-data-panel merchant-stock-panel bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="merchant-data-panel__heading"><div><p className="eyebrow">Attention required</p><h2>Stock watch</h2></div><button type="button" className="merchant-text-action" onClick={() => { onShowLowStock?.(); setActiveTab('Products'); }}>Manage</button></div>
            {lowStockProducts.length ? <div className="merchant-stock-list">{lowStockProducts.map(product => <button type="button" key={product.id} onClick={() => { onShowLowStock?.(); setActiveTab('Products'); }}><span><strong>{product.name}</strong><small>{product.category}</small></span><b className={product.stock <= 5 ? 'is-critical' : ''}>{product.stock} left</b></button>)}</div> : <div className="merchant-dashboard-empty"><strong>All stocked up</strong><span>No products are below the restock threshold.</span></div>}
          </section>
          <section className="merchant-data-panel merchant-best-panel bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="merchant-data-panel__heading"><div><p className="eyebrow">Customer favorites</p><h2>Best sellers</h2></div></div>
            <div className="merchant-stock-list">{bestSellers.map((product, index) => <div className="merchant-best-row" key={product.id}><span className="merchant-best-rank">{String(index + 1).padStart(2, '0')}</span><span><strong>{product.name}</strong><small>{product.salesCount} units sold</small></span><b>${Number(product.price).toLocaleString()}</b></div>)}</div>
          </section>
        </aside>
      </div>
    </div>
  );
}
