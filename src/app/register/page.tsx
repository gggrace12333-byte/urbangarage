'use client';

import { useState } from 'react';
import { useIsMobile } from '@/lib/useIsMobile';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const isMobile = useIsMobile();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    const res = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'register', name, email, password }) });
    const data = await res.json();
    if (data.error) { setError(data.error); return; }
    router.push('/login');
  };

  return (
    <div style={{ background: '#f5f1ea', minHeight: '100vh' }}>
      
      <div style={{ maxWidth: 440, margin: '0 auto', padding: '120px 24px' }}>
        <h1 style={{ fontSize: 32, fontWeight: 200, color: '#14140f', marginBottom: 8 }}>Create Account</h1>
        <p style={{ color: '#77736b', marginBottom: 32 }}>Join Urban Garage.</p>
        {error && <p style={{ color: '#b32d2e', fontSize: 14, marginBottom: 16, background: '#fef2f2', padding: '10px 14px' }}>{error}</p>}
        <form onSubmit={submit}>
          <div style={{ marginBottom: 16 }}><label style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, display: 'block' }}>Name</label><input value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', padding: '10px 12px', border: '1px solid #dfdfdf', fontSize: 14, outline: 'none' }} /></div>
          <div style={{ marginBottom: 16 }}><label style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, display: 'block' }}>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: '10px 12px', border: '1px solid #dfdfdf', fontSize: 14, outline: 'none' }} /></div>
          <div style={{ marginBottom: 24 }}><label style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, display: 'block' }}>Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: '10px 12px', border: '1px solid #dfdfdf', fontSize: 14, outline: 'none' }} /></div>
          <button type="submit" style={{ width: '100%', padding: '14px 0', background: '#D63F1C', color: '#fff', border: 'none', fontSize: 16, fontWeight: 500, cursor: 'pointer' }}>Create Account</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#77736b' }}>
          Already have an account? <Link href="/login" style={{ color: '#D63F1C', textDecoration: 'none' }}>Log in</Link>
        </p>
      </div>
      
    </div>
  );
}
