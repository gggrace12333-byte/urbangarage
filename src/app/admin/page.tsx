'use client';

import { useEffect, useState } from 'react';

interface Analytics { totalVisits: number; cartAdds: number; orders: number; refunds: number; revenue: number; countries: { country: string; count: number }[]; trend: { date: string; event: string; count: number }[] }

const PERIODS = [{ label: '7 Days', days: 7 },{ label: '30 Days', days: 30 },{ label: '90 Days', days: 90 }];

export default function Dashboard() {
  const [data, setData] = useState<Analytics | null>(null);
  const [days, setDays] = useState(30);

  useEffect(() => { fetch(`/api/analytics?days=${days}`).then(r => r.json()).then(setData).catch(() => setData({ totalVisits:0, cartAdds:0, orders:0, refunds:0, revenue:0, countries:[], trend:[] })); }, [days]);

  if (!data) return <div style={{ padding: 40, textAlign: 'center', color: '#646970' }}>Loading analytics...</div>;

  const conversionRate = data.totalVisits > 0 ? ((data.orders / data.totalVisits) * 100).toFixed(1) : '0';
  const cartRate = data.totalVisits > 0 ? ((data.cartAdds / data.totalVisits) * 100).toFixed(1) : '0';

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {PERIODS.map(p => (
          <button key={p.days} onClick={() => setDays(p.days)} className={`wp-btn ${days === p.days ? 'wp-btn-primary' : 'wp-btn-outline'}`} style={{ fontSize: 12, padding: '4px 16px' }}>
            {p.label}
          </button>
        ))}
      </div>

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
