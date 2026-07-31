'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (data.success) {
      localStorage.setItem('admin_auth', 'true');
      router.push('/admin');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f1' }}>
      <div style={{ background: '#fff', padding: 40, borderRadius: 4, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', width: 360 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8, textAlign: 'center' }}>Urban Garage</h1>
        <p style={{ color: '#646970', textAlign: 'center', marginBottom: 24 }}>Administration</p>
        {error && <p style={{ color: '#b32d2e', fontSize: 13, marginBottom: 16, textAlign: 'center' }}>{error}</p>}
        <form onSubmit={submit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 500 }}>Username</label>
            <input value={username} onChange={e => setUsername(e.target.value)} required style={{ width: '100%', padding: 8, border: '1px solid #8c8f94', fontSize: 14, marginTop: 4 }} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, fontWeight: 500 }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: 8, border: '1px solid #8c8f94', fontSize: 14, marginTop: 4 }} />
          </div>
          <button type="submit" style={{ width: '100%', padding: 10, background: '#2271b1', color: '#fff', border: 'none', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Log In</button>
        </form>
      </div>
    </div>
  );
}
