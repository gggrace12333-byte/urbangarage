'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    const res = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'login', email, password }) });
    const data = await res.json();
    if (data.error) { setError(data.error); return; }
    localStorage.setItem('user', JSON.stringify(data.user));
    router.push('/account');
  };

  return (
    <div style={{ background: '#f5f1ea', minHeight: '100vh' }}>
      
      <div style={{ maxWidth: 440, margin: '0 auto', padding: '120px 24px' }}>
        <h1 style={{ fontSize: 32, fontWeight: 200, color: '#14140f', marginBottom: 8 }}>Log in</h1>
        <p style={{ color: '#77736b', marginBottom: 32 }}>Welcome back to Urban Garage.</p>
        {error && <p style={{ color: '#b32d2e', fontSize: 14, marginBottom: 16, background: '#fef2f2', padding: '10px 14px' }}>{error}</p>}
        <form onSubmit={submit}>
          <div style={{ marginBottom: 16 }}><label style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, display: 'block' }}>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: '10px 12px', border: '1px solid #dfdfdf', fontSize: 14, outline: 'none' }} /></div>
          <div style={{ marginBottom: 24 }}><label style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, display: 'block' }}>Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: '10px 12px', border: '1px solid #dfdfdf', fontSize: 14, outline: 'none' }} /></div>
          <button type="submit" style={{ width: '100%', padding: '14px 0', background: '#D63F1C', color: '#fff', border: 'none', fontSize: 16, fontWeight: 500, cursor: 'pointer' }}>Log in</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#77736b' }}>
          Don&apos;t have an account? <Link href="/register" style={{ color: '#D63F1C', textDecoration: 'none' }}>Create one</Link>
        </p>
      </div>
      
    </div>
  );
}
