'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null); // null = loading
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Check auth on mount
  useEffect(() => {
    fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'check' }),
    })
      .then(r => r.json())
      .then(d => setAuthenticated(d.authenticated === true))
      .catch(() => setAuthenticated(false));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: loginUser, password: loginPass, action: 'login' }),
    });
    const data = await res.json();
    if (data.success) {
      setAuthenticated(true);
    } else {
      setLoginError(data.error || 'Invalid credentials');
    }
    setLoginLoading(false);
  };

  const handleLogout = async () => {
    await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    });
    setAuthenticated(false);
    router.push('/admin');
  };

  // Loading state
  if (authenticated === null) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f0f0f1' }}>
        <p style={{ color: '#646970', fontSize: 14 }}>Loading...</p>
      </div>
    );
  }

  // Login form
  if (!authenticated) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f0f0f1' }}>
        <div style={{ background: '#fff', padding: 40, borderRadius: 4, boxShadow: '0 1px 3px rgba(0,0,0,0.13)', width: 360, maxWidth: '90vw' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: '#1d2327', marginBottom: 4 }}>Urban Garage</h1>
            <p style={{ fontSize: 13, color: '#646970' }}>Administration</p>
          </div>
          <form onSubmit={handleLogin}>
            {loginError && (
              <div style={{ background: '#fcf0f1', border: '1px solid #ffabaf', padding: '8px 12px', marginBottom: 16, fontSize: 13, color: '#d63638', borderRadius: 4 }}>
                {loginError}
              </div>
            )}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#1d2327', marginBottom: 6 }}>Username</label>
              <input
                type="text"
                value={loginUser}
                onChange={e => setLoginUser(e.target.value)}
                required
                autoFocus
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #8c8f94', borderRadius: 4, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#1d2327', marginBottom: 6 }}>Password</label>
              <input
                type="password"
                value={loginPass}
                onChange={e => setLoginPass(e.target.value)}
                required
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #8c8f94', borderRadius: 4, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <button
              type="submit"
              disabled={loginLoading}
              style={{ width: '100%', padding: '10px 0', background: '#2271b1', color: '#fff', border: 'none', borderRadius: 4, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
            >
              {loginLoading ? 'Logging in...' : 'Log In'}
            </button>
          </form>
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Link href="/" style={{ fontSize: 12, color: '#2271b1', textDecoration: 'none' }}>← Back to Store</Link>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated — show admin shell
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
        <div style={{ padding: 12, borderTop: '1px solid #2c3338', display: 'flex', gap: 8 }}>
          <Link href="/" target="_blank" style={{ color: '#a7aaad', fontSize: 12, textDecoration: 'none' }}>🌐 View Store</Link>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#a7aaad', fontSize: 12, cursor: 'pointer', marginLeft: 'auto' }}>Logout</button>
        </div>
      </aside>
      <div style={{ flex: 1, minWidth: 0 }}>
        <header style={{ background: '#fff', borderBottom: '1px solid #c3c4c7', padding: '8px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>
            {items.find(i => pathname === i.href || (i.href !== '/admin' && pathname?.startsWith(i.href)))?.label || 'Admin'}
          </h1>
          <span style={{ fontSize: 13, color: '#646970' }}>Howdy, Admin</span>
        </header>
        <div style={{ padding: 24, maxWidth: 1600 }}>{children}</div>
      </div>
    </div>
  );
}
