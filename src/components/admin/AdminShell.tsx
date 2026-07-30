'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const items = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/products', label: 'Products', icon: '📦' },
    { href: '/admin/categories', label: 'Categories', icon: '📁' },
    { href: '/admin/orders', label: 'Orders', icon: '📋' },
    { href: '/admin/reviews', label: 'Reviews', icon: '⭐' },
    { href: '/admin/email', label: 'Emails', icon: '📧' },
    { href: '/admin/banners', label: 'Banners', icon: '🖼️' },
    { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: 220, background: '#1d2327', color: '#c3c4c7', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 12px', borderBottom: '1px solid #2c3338' }}>
          <Link href="/admin" style={{ color: '#fff', fontSize: 18, fontWeight: 600, textDecoration: 'none' }}>Urban Garage</Link>
          <div style={{ fontSize: 11, color: '#646970', marginTop: 4 }}>Administration</div>
        </div>
        <nav style={{ padding: '8px 0', flex: 1 }}>
          {items.map(item => {
            const active = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
            return <Link key={item.href} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', color: active ? '#fff' : '#a7aaad', background: active ? '#2271b1' : 'transparent', fontWeight: active ? 600 : 400, textDecoration: 'none', fontSize: 14, borderLeft: active ? '4px solid #72aee6' : '4px solid transparent' }}><span>{item.icon}</span>{item.label}</Link>;
          })}
        </nav>
        <div style={{ padding: 12, borderTop: '1px solid #2c3338' }}><Link href="/" target="_blank" style={{ color: '#a7aaad', fontSize: 12, textDecoration: 'none' }}>🌐 View Store</Link></div>
      </aside>
      <div style={{ flex: 1, minWidth: 0 }}>
        <header style={{ background: '#fff', borderBottom: '1px solid #c3c4c7', padding: '8px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: 18, fontWeight: 600 }}>{items.find(i => pathname === i.href || (i.href !== '/admin' && pathname?.startsWith(i.href)))?.label || 'Admin'}</h1>
          <span style={{ fontSize: 13, color: '#646970' }}>Howdy, Admin</span>
        </header>
        <div style={{ padding: 24, maxWidth: 1600 }}>{children}</div>
      </div>
    </div>
  );
}
