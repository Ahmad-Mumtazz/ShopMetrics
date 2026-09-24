import { useState } from 'react';

export default function RevenueChart({ chartData }) {
  const [view, setView] = useState('bars');
  const [selectedMonth, setSelectedMonth] = useState(chartData.at(-1)?.name || '');
  const maxRevenue = Math.max(...chartData.map(item => item.Revenue), 1);
  const selectedData = chartData.find(item => item.name === selectedMonth) || chartData.at(-1);
  const points = chartData.map((item, index) => {
    const x = chartData.length === 1 ? 50 : (index / (chartData.length - 1)) * 100;
    const y = 92 - (item.Revenue / maxRevenue) * 78;
    return `${x},${y}`;
  }).join(' ');

  return (
    <section className="revenue-panel holo-panel">
      <div className="revenue-panel__header">
        <div>
          <p className="eyebrow">Performance telemetry</p>
          <h2>Revenue trajectory map</h2>
          <p className="revenue-panel__summary">Select a month to inspect the signal. Showing {chartData.length} reporting periods.</p>
        </div>
        <div className="chart-toggle" role="group" aria-label="Chart view">
          <button type="button" onClick={() => setView('bars')} className={view === 'bars' ? 'is-active' : ''}>Bars</button>
          <button type="button" onClick={() => setView('trend')} className={view === 'trend' ? 'is-active' : ''}>Trend</button>
        </div>
      </div>

      <div className="revenue-chart" aria-label="Revenue by month">
        <div className="chart-y-axis"><span>${maxRevenue.toLocaleString()}</span><span>${Math.round(maxRevenue / 2).toLocaleString()}</span><span>$0</span></div>
        <div className="chart-canvas">
          <div className="chart-grid-lines"><i /><i /><i /></div>
          {view === 'bars' ? (
            <div className="chart-bars">
              {chartData.map(item => {
                const isSelected = item.name === selectedMonth;
                return <button type="button" key={item.name} onClick={() => setSelectedMonth(item.name)} className={`chart-bar ${isSelected ? 'is-selected' : ''}`} style={{ height: `${Math.max((item.Revenue / maxRevenue) * 100, 3)}%` }} aria-label={`${item.name}: $${item.Revenue.toLocaleString()}`}><span>${item.Revenue.toLocaleString()}</span></button>;
              })}
            </div>
          ) : (
            <svg className="chart-line" viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Revenue trend line">
              <polyline points={`0,92 ${points} 100,92`} className="chart-area" />
              <polyline points={points} className="chart-path" />
              {chartData.map((item, index) => {
                const x = chartData.length === 1 ? 50 : (index / (chartData.length - 1)) * 100;
                const y = 92 - (item.Revenue / maxRevenue) * 78;
                return <circle key={item.name} cx={x} cy={y} r={item.name === selectedMonth ? 2.4 : 1.5} onClick={() => setSelectedMonth(item.name)} className={item.name === selectedMonth ? 'is-selected' : ''} />;
              })}
            </svg>
          )}
          <div className="chart-x-axis">{chartData.map(item => <button type="button" key={item.name} onClick={() => setSelectedMonth(item.name)} className={item.name === selectedMonth ? 'is-selected' : ''}>{item.name}</button>)}</div>
        </div>
      </div>
      {selectedData && <div className="chart-readout"><span>{selectedData.name} signal</span><strong>${selectedData.Revenue.toLocaleString()}</strong><small>Revenue recorded</small></div>}
    </section>
  );
}
