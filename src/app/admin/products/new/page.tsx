'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const TAG_OPTIONS = ['sale', 'hot', 'limited', 'new'];

export default function NewProduct() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', description: '', price: '0', category_id: '', featured: false, active: true, tags: '', slug: '' });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => { fetch('/api/admin/categories').then(r => r.json()).then(setCategories); }, []);

  const genSlug = (n: string) => n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const toggleTag = (tag: string) => setSelectedTags(prev => { const next = prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]; setForm(f => ({ ...f, tags: next.join(',') })); return next; });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    await fetch('/api/admin/products', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        price: 0, // Price comes from SKUs
        category_id: form.category_id ? parseInt(form.category_id) : null,
        inventory: 0, // Inventory is sum of SKUs
        slug: form.slug || undefined,
        images: [], // Images come from SKUs
      })
    });
    router.push('/admin/products');
  };

  const f = (l: string, c: React.ReactNode) => <div style={{ marginBottom: 16 }}><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>{l}</label>{c}</div>;

  return (
    <div style={{ maxWidth: 1100 }}>
      <Link href="/admin/products" style={{ display: 'inline-block', marginBottom: 20, color: '#646970', fontSize: 14 }}>← Back to Products</Link>
      <div className="wp-card"><h2>Add New Product</h2>
        <form onSubmit={submit}>
          {f('Product Name *', <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="7/11 DRIFTPAD" />)}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {f('Category', <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}><option value="">— None —</option>{categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>)}
            {f('Slug (URL)', <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><input value={form.slug || genSlug(form.name)} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder={genSlug(form.name)} style={{ flex: 1 }} /><small style={{ color: '#646970', fontSize: 11, whiteSpace: 'nowrap' }}>/products/<strong>{form.slug || genSlug(form.name)}</strong></small></div>)}
          </div>
          {f('Tags', <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{TAG_OPTIONS.map(tag => <label key={tag} style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', padding: '6px 12px', border: '1px solid ' + (selectedTags.includes(tag) ? '#2271b1' : '#c3c4c7'), borderRadius: 3, fontSize: 12, fontWeight: 500, background: selectedTags.includes(tag) ? '#f0f6fc' : '#fff' }}><input type="checkbox" checked={selectedTags.includes(tag)} onChange={() => toggleTag(tag)} style={{ width: 'auto' }} />{tag.toUpperCase()}</label>)}</div>)}
          {f('Description', <textarea rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Product description..." />)}
          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 400 }}><input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} style={{ width: 'auto' }} /> ⭐ Featured</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 400 }}><input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} style={{ width: 'auto' }} /> Active</label>
          </div>
          <p style={{ fontSize: 12, color: '#646970', marginBottom: 16 }}>After saving, edit the product to add SKUs with prices, inventory, and images.</p>
          <div style={{ display: 'flex', gap: 8 }}><button type="submit" disabled={saving} className="wp-btn wp-btn-primary">{saving ? 'Saving...' : 'Save Product'}</button><Link href="/admin/products" className="wp-btn wp-btn-outline">Cancel</Link></div>
        </form>
      </div>
    </div>
  );
}
