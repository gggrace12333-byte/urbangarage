'use client';

import { useEffect, useState } from 'react';

interface Review { id: number; product_id: number; product_name: string; user_name: string; rating: number; comment: string; created_at: string }

const STARS = [5,4,3,2,1];

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [form, setForm] = useState({ product_id: '', user_name: '', rating: 5, comment: '' });

  const load = () => fetch('/api/reviews').then(r => r.json()).then(setReviews);
  useEffect(() => {
    load();
    fetch('/api/admin/products').then(r => r.json()).then(setProducts);
  }, []);

  const del = async (id: number) => {
    if (!confirm('Delete this review?')) return;
    await fetch('/api/reviews', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    load();
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.product_id || !form.user_name) return;
    await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setForm({ product_id: '', user_name: '', rating: 5, comment: '' });
    load();
  };

  return (
    <div>
      {/* Add Review Form */}
      <div className="wp-card" style={{ maxWidth: 500, marginBottom: 24 }}>
        <h2>Add Review</h2>
        <form onSubmit={add}>
          <div style={{ marginBottom: 12 }}>
            <label>Product</label>
            <select value={form.product_id} onChange={e => setForm({ ...form, product_id: e.target.value })} required>
              <option value="">— Select —</option>
              {products.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Customer Name</label>
            <input value={form.user_name} onChange={e => setForm({ ...form, user_name: e.target.value })} required placeholder="Alex M." />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Rating</label>
            <div style={{ display: 'flex', gap: 4 }}>
              {STARS.map(s => (
                <button type="button" key={s} onClick={() => setForm({ ...form, rating: s })}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, color: s <= form.rating ? '#f0c33c' : '#dcdcde', padding: 0 }}>
                  ★
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Comment</label>
            <textarea rows={3} value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} placeholder="Great product!" />
          </div>
          <button type="submit" className="wp-btn wp-btn-primary">Add Review</button>
        </form>
      </div>

      {/* Reviews List */}
      <table className="wp-table">
        <thead><tr><th>Product</th><th>Customer</th><th>Rating</th><th>Comment</th><th>Date</th><th style={{ width: 80 }}>Actions</th></tr></thead>
        <tbody>
          {reviews.map(r => (
            <tr key={r.id}>
              <td style={{ fontSize: 13 }}>{r.product_name || '—'}</td>
              <td style={{ fontSize: 13 }}>{r.user_name}</td>
              <td style={{ color: '#f0c33c' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</td>
              <td style={{ fontSize: 13, color: '#646970', maxWidth: 300 }}>{r.comment}</td>
              <td style={{ fontSize: 12, color: '#646970' }}>{new Date(r.created_at).toLocaleDateString()}</td>
              <td><button onClick={() => del(r.id)} className="wp-btn wp-btn-danger" style={{ padding: '4px 10px', fontSize: 12 }}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
