import { useStore } from '../context/StoreContext';
import RevenueChart from './RevenueChart';

export default function AnalyticsView() {
  const { financialMetrics, orders, setActiveTab } = useStore();

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <p className="eyebrow">Overview</p>
        <h1 className="text-2xl font-bold text-slate-800">Business performance</h1>
        <p className="text-sm text-slate-500">A live summary of revenue, orders, and inventory health.</p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="holo-card metric-card bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Revenue</div>
          <div className="mt-2 text-2xl font-bold text-slate-800">${financialMetrics.totalRevenue.toLocaleString()}</div>
          <div className="mt-1 text-xs text-slate-500 font-medium">From non-cancelled orders</div>
        </div>
        <button type="button" onClick={() => setActiveTab('Orders')} className="holo-card metric-card w-full text-left bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-indigo-200">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active orders</div>
          <div className="mt-2 text-2xl font-bold text-slate-800">{financialMetrics.totalOrdersCount}</div>
          <div className="mt-1 text-xs text-slate-500">Total volume transactions</div>
        </button>
        <div className="holo-card metric-card bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Order Value</div>
          <div className="mt-2 text-2xl font-bold text-slate-800">${financialMetrics.averageOrderValue}</div>
          <div className="mt-1 text-xs text-slate-500 font-medium">Based on current order volume</div>
        </div>
        <button type="button" onClick={() => setActiveTab('Products')} className="holo-card metric-card w-full text-left bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden hover:border-indigo-300 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-indigo-200">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Low Stock Warnings</div>
          <div className="mt-2 text-2xl font-bold text-slate-800">{financialMetrics.lowStockCount} Items</div>
          <div className={`mt-1 text-xs font-semibold ${financialMetrics.lowStockCount > 0 ? 'text-amber-600' : 'text-slate-500'}`}>
            {financialMetrics.lowStockCount > 0 ? 'Immediate restock required' : 'Inventory optimal'}
          </div>
        </button>
      </div>

      <RevenueChart chartData={financialMetrics.chartData} />

      {/* Quick Logs Feed */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700">Recent orders</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {orders.slice(0, 4).map((order) => (
            <div key={order.id} className="px-6 py-3.5 flex items-center justify-between text-sm">
              <div>
                <span className="font-semibold text-slate-700">{order.customerName}</span> purchased <span className="text-slate-600 font-medium">{order.productName}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-slate-500">{order.date}</span>
                <span className="font-bold text-slate-800">${order.totalAmount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
