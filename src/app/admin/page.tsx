'use client';

export default function Dashboard() {
  return (
    <div className="wp-card" style={{ padding: 40, textAlign: 'center' }}>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Dashboard</h2>
      <p style={{ color: '#646970', marginBottom: 24 }}>Your store is live at <a href="/" style={{ color: '#2271b1' }}>urban-garage.vercel.app</a></p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[
          { label: 'Products', href: '/admin/products', icon: '📦', desc: 'Manage your products' },
          { label: 'Orders', href: '/admin/orders', icon: '📋', desc: 'View and manage orders' },
          { label: 'Settings', href: '/admin/settings', icon: '⚙️', desc: 'Configure your store' },
          { label: 'Categories', href: '/admin/categories', icon: '📁', desc: 'Manage categories' },
          { label: 'Banners', href: '/admin/banners', icon: '🖼️', desc: 'Homepage banners' },
          { label: 'Reviews', href: '/admin/reviews', icon: '⭐', desc: 'Customer reviews' },
        ].map(item => (
          <a key={item.label} href={item.href} style={{ display: 'block', padding: 24, border: '1px solid #c3c4c7', borderRadius: 4, textDecoration: 'none', color: 'inherit', transition: 'border-color .2s' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>{item.icon}</div>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{item.label}</div>
            <div style={{ fontSize: 12, color: '#646970' }}>{item.desc}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
