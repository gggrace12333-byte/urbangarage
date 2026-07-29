'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (data.success) {
      document.cookie = 'admin_auth=true; path=/; max-age=86400';
      router.push('/admin');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f1' }}>
      <div style={{ background: '#fff', padding: '48px 40px', borderRadius: 4, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', width: 360, maxWidth: '90vw' }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: '#1d2327', textAlign: 'center', marginBottom: 8 }}>Urban Garage</h1>
        <p style={{ fontSize: 14, color: '#646970', textAlign: 'center', marginBottom: 32 }}>Admin Login</p>
        {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '10px 14px', marginBottom: 20, fontSize: 13, color: '#b32d2e', borderRadius: 4 }}>{error}</div>}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} autoFocus style={{ width: '100%', padding: '10px 12px', border: '1px solid #8c8f94', borderRadius: 4, fontSize: 14 }} required />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #8c8f94', borderRadius: 4, fontSize: 14 }} required />
          </div>
          <button type="submit" style={{ width: '100%', padding: '12px 0', background: '#2271b1', color: '#fff', border: 'none', borderRadius: 4, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Log In</button>
        </form>
      </div>
    </div>
  );
}
