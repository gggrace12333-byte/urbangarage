'use client';

import { useEffect, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend, PointElement, LineElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend, PointElement, LineElement);

interface Analytics { totalVisits: number; cartAdds: number; orders: number; refunds: number; revenue: number; countries: { country: string; count: number }[]; trend: { date: string; event: string; count: number }[] }

const PERIODS = [{ label: '7 Days', days: 7 },{ label: '30 Days', days: 30 },{ label: '90 Days', days: 90 }];

export default function Dashboard() {
  const [data, setData] = useState<Analytics | null>(null);
  const [days, setDays] = useState(30);

  useEffect(() => { fetch(`/api/analytics?days=${days}`).then(r => r.json()).then(d => setData({ totalVisits:0, cartAdds:0, orders:0, refunds:0, revenue:0, countries:[], trend:[], ...(d || {}) })).catch(() => setData({ totalVisits:0, cartAdds:0, orders:0, refunds:0, revenue:0, countries:[], trend:[] })); }, [days]);

  if (!data || !Array.isArray(data.trend) || !Array.isArray(data.countries)) return <div style={{ padding: 40, textAlign: 'center', color: '#646970' }}>Loading analytics...</div>;

  const trendData = {
    labels: [...new Set(data.trend.map(t => t.date))].sort(),
    datasets: [
      { label: 'Page Views', data: [...new Set(data.trend.map(t => t.date))].sort().map(d => data.trend.filter(t => t.date === d && t.event === 'pageview').reduce((s, t) => s + t.count, 0)), backgroundColor: '#2271b1', borderRadius: 4 },
      { label: 'Cart Adds', data: [...new Set(data.trend.map(t => t.date))].sort().map(d => data.trend.filter(t => t.date === d && t.event === 'add_to_cart').reduce((s, t) => s + t.count, 0)), backgroundColor: '#D63F1C', borderRadius: 4 },
    ],
  };

  const countryData = {
    labels: data.countries.map(c => c.country),
    datasets: [{ data: data.countries.map(c => c.count), backgroundColor: ['#2271b1','#D63F1C','#00a32a','#f0c33c','#6d3c8c','#b32d2e','#72aee6','#f97316','#8b5cf6','#ec4899'] }],
  };

  const conversionRate = data.totalVisits > 0 ? ((data.orders / data.totalVisits) * 100).toFixed(1) : '0';
  const cartRate = data.totalVisits > 0 ? ((data.cartAdds / data.totalVisits) * 100).toFixed(1) : '0';

  return (
    <div>
      {/* Period selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {PERIODS.map(p => (
          <button key={p.days} onClick={() => setDays(p.days)} className={`wp-btn ${days === p.days ? 'wp-btn-primary' : 'wp-btn-outline'}`} style={{ fontSize: 12, padding: '4px 16px' }}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Page Views', value: data.totalVisits.toLocaleString(), icon: '👁️', color: '#2271b1' },
          { label: 'Cart Adds', value: data.cartAdds.toLocaleString(), icon: '🛒', color: '#D63F1C' },
          { label: 'Orders', value: data.orders.toLocaleString(), icon: '📦', color: '#00a32a' },
          { label: 'Revenue', value: `$${data.revenue.toLocaleString()}`, icon: '💰', color: '#6d3c8c' },
          { label: 'Refunds/Cancels', value: data.refunds.toLocaleString(), icon: '↩️', color: '#b32d2e' },
          { label: 'Conversion', value: `${conversionRate}%`, icon: '📈', color: '#f97316' },
          { label: 'Cart Rate', value: `${cartRate}%`, icon: '🛍️', color: '#8b5cf6' },
        ].map(card => (
          <div key={card.label} className="wp-card" style={{ borderLeft: `4px solid ${card.color}`, padding: 16 }}>
            <div style={{ fontSize: 13, color: '#646970', marginBottom: 4 }}>{card.label}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 24 }}>{card.icon}</span>
              <span style={{ fontSize: 28, fontWeight: 700, color: '#1d2327' }}>{card.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Trend chart */}
        <div className="wp-card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Traffic Trend</h2>
          <Bar data={trendData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }} />
        </div>
        {/* Country chart */}
        <div className="wp-card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Visitors by Country</h2>
          {data.countries.length > 0 ? <Doughnut data={countryData} options={{ responsive: true, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } } }} /> : <p style={{ color: '#646970', textAlign: 'center', padding: 40 }}>No country data yet</p>}
        </div>
      </div>

      {/* Recent orders summary */}
      <div className="wp-card">
        <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Summary</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, fontSize: 13, color: '#646970' }}>
          <div><strong>{data.totalVisits.toLocaleString()}</strong> total page views</div>
          <div><strong>{data.cartAdds.toLocaleString()}</strong> items added to cart</div>
          <div><strong>{data.orders.toLocaleString()}</strong> orders placed</div>
          <div><strong>{conversionRate}%</strong> conversion rate</div>
          <div><strong>${data.revenue.toLocaleString()}</strong> total revenue</div>
          <div><strong>{data.refunds.toLocaleString()}</strong> cancellations</div>
        </div>
      </div>
    </div>
  );
}
