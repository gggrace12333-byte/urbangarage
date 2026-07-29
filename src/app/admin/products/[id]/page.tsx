'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const TAG_OPTIONS = ['sale', 'hot', 'limited', 'new'];

export default function EditProduct() {
  const params = useParams(); const router = useRouter(); const fileRef = useRef<HTMLInputElement>(null);
  const [product, setProduct] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [saving, setSaving] = useState(false); const [uploading, setUploading] = useState({ sku: -1, section: '', active: false });
  const [form, setForm] = useState({
    name: '', description: '', category_id: '', featured: false, active: true, tags: '',
    spec_dimensions: '', spec_scale: '', spec_power: '', spec_lighting: '',
    description_images: [] as string[],
    features: '' as string,
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [skus, setSkus] = useState<any[]>([]);
  const [deletedSkuIds, setDeletedSkuIds] = useState<number[]>([]);

  useEffect(() => {
    fetch('/api/admin/categories').then(r => r.json()).then(setCategories);
    fetch('/api/admin/products').then(r => r.json()).then((all: any[]) => {
      const p = all.find((x: any) => String(x.id) === params.id);
      if (!p) return;
      setProduct(p);
      setForm({
        name: p.name, description: p.description || '', category_id: p.category_id ? String(p.category_id) : '',
        featured: !!p.featured, active: !!p.active, tags: p.tags || '',
        spec_dimensions: p.spec_dimensions || '', spec_scale: p.spec_scale || '',
        spec_power: p.spec_power, features: p.features || '', spec_lighting: p.spec_lighting || '',
        description_images: typeof p.description_images === 'string' ? JSON.parse(p.description_images || '[]') : (p.description_images || [])
      });
      setSelectedTags((p.tags || '').split(',').map((t: string) => t.trim()).filter(Boolean));
      fetch(`/api/admin/variants?product_id=${p.id}`).then(r => r.json()).then((v: any[]) => {
        if (v && v.length > 0) {
          setSkus(v.map((x: any) => ({
            ...x,
            images: typeof x.images === 'string' ? JSON.parse(x.images || '[]') : (x.images || []),
            price: x.price || x.price_adjustment || 0,
          })));
        } else {
          const imgs = typeof p.images === 'string' ? JSON.parse(p.images || '[]') : (p.images || []);
          setSkus([{ id: null, name: p.name, value: 'Default', price: p.price || 0, compare_at_price: p.compare_at_price || null, inventory: p.inventory || 0, images: imgs, image: imgs[0] || '', sort_order: 0 }]);
        }
      });
    });
  }, [params.id]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => {
      const next = prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag];
      setForm(f => ({ ...f, tags: next.join(',') }));
      return next;
    });
  };

  const uploadImage = async (target: { sku: number } | { section: string }, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading({ ...('sku' in target ? { sku: target.sku, section: '' } : { sku: -1, section: target.section }), active: true });
    const fd = new FormData(); fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (data.url) {
      if ('sku' in target) {
        setSkus(prev => prev.map((s, i) => i === target.sku ? { ...s, images: [...s.images, data.url], image: s.image || data.url } : s));
      } else if (target.section === 'description') {
        setForm(f => ({ ...f, description_images: [...f.description_images, data.url] }));
      }
    }
    setUploading({ sku: -1, section: '', active: false });
    if (fileRef.current) fileRef.current.value = '';
  };

  const removeImage = (type: 'sku' | 'desc', skuIdx: number, imgIdx: number) => {
    if (type === 'desc') {
      setForm(f => ({ ...f, description_images: f.description_images.filter((_, j) => j !== imgIdx) }));
    } else {
      setSkus(prev => prev.map((s, i) => {
        if (i !== skuIdx) return s;
        const newImgs = s.images.filter((_: any, j: number) => j !== imgIdx);
        return { ...s, images: newImgs, image: newImgs[0] || '' };
      }));
    }
  };

  const updateSku = (i: number, field: string, val: any) => {
    setSkus(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s));
  };

  const addSku = () => setSkus(prev => [...prev, { id: null, name: '', value: '', price: 0, compare_at_price: null, inventory: 0, images: [], image: '', sort_order: prev.length }]);
  const removeSku = (i: number) => { const sku = skus[i]; if (sku.id) setDeletedSkuIds(prev => [...prev, sku.id]); setSkus(prev => prev.filter((_, idx) => idx !== i)); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    await fetch(`/api/admin/products/${product.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form, category_id: form.category_id ? parseInt(form.category_id) : null,
        price: skus[0]?.price || 0, compare_at_price: skus[0]?.compare_at_price || null,
        inventory: skus.reduce((sum, s) => sum + (s.inventory || 0), 0),
        images: skus[0]?.images || [], sku: skus[0]?.name || '',
      })
    });
    for (const id of deletedSkuIds) await fetch('/api/admin/variants', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    for (const sku of skus) {
      const payload = { product_id: product.id, name: sku.name, value: sku.value || sku.name, price: sku.price || 0, compare_at_price: sku.compare_at_price || null, inventory: sku.inventory || 0, images: sku.images, image: sku.images[0] || '', sort_order: sku.sort_order || 0 };
      if (sku.id) await fetch('/api/admin/variants', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, id: sku.id }) });
      else await fetch('/api/admin/variants', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    }
    router.push('/admin/products'); setSaving(false);
  };

  if (!product) return <p style={{ padding: 40, color: '#646970' }}>Loading...</p>;
  const fld = (l: string, c: React.ReactNode) => <div style={{ marginBottom: 16 }}><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>{l}</label>{c}</div>;

  return (
    <div style={{ maxWidth: 1100 }}>
      <Link href="/admin/products" style={{ display: 'inline-block', marginBottom: 20, color: '#646970', fontSize: 14 }}>← Back to Products</Link>
      <div className="wp-card"><h2>Edit: {product.name}</h2>
        <form onSubmit={submit}>

          {/* Product Info */}
          <h3 style={{ fontSize: 15, marginTop: 24, marginBottom: 12, borderBottom: '1px solid #e0e0e0', paddingBottom: 8 }}>📋 Product Info</h3>
          {fld('Product Name *', <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />)}
          {fld('Category', <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}><option value="">— None —</option>{categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>)}
          {fld('Tags', <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{TAG_OPTIONS.map(tag => <label key={tag} style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', padding: '6px 12px', border: '1px solid ' + (selectedTags.includes(tag) ? '#2271b1' : '#c3c4c7'), borderRadius: 3, fontSize: 12, fontWeight: 500, background: selectedTags.includes(tag) ? '#f0f6fc' : '#fff' }}><input type="checkbox" checked={selectedTags.includes(tag)} onChange={() => toggleTag(tag)} style={{ width: 'auto' }} />{tag.toUpperCase()}</label>)}</div>)}
          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 400 }}><input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} style={{ width: 'auto' }} /> ⭐ Featured</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 400 }}><input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} style={{ width: 'auto' }} /> Active</label>
          </div>

          {/* --- Section 1: DESCRIPTION --- */}
          <h3 style={{ fontSize: 15, marginTop: 32, marginBottom: 12, borderBottom: '1px solid #e0e0e0', paddingBottom: 8 }}>📝 DESCRIPTION</h3>
          {fld('Description Text', <textarea rows={5} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Product description text..." />)}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Description Images</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              {form.description_images.map((img: string, j: number) => (
                <div key={j} style={{ position: 'relative', width: 80, height: 80, background: '#f0f0f0', borderRadius: 4, overflow: 'hidden', border: '1px solid #ddd' }}>
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button type="button" onClick={() => removeImage('desc', -1, j)} style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: 12, lineHeight: '17px', padding: 0 }}>×</button>
                </div>
              ))}
              <button type="button" onClick={() => { fileRef.current?.click(); fileRef.current?.setAttribute('data-section', 'description'); }} style={{ width: 80, height: 80, border: '2px dashed #c3c4c7', borderRadius: 4, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#646970', fontSize: 20 }}>
                {uploading.section === 'description' && uploading.active ? '...' : '+'}
              </button>
            </div>
          </div>

          {/* --- Section 2: PRODUCT SPECIFICATIONS --- */}
          <h3 style={{ fontSize: 15, marginTop: 32, marginBottom: 12, borderBottom: '1px solid #e0e0e0', paddingBottom: 8 }}>📐 PRODUCT SPECIFICATIONS</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {fld('Dimensions', <input value={form.spec_dimensions} onChange={e => setForm({ ...form, spec_dimensions: e.target.value })} placeholder="e.g. 15cm × 10cm × 8cm (L×W×H)" />)}
            {fld('Scale', <input value={form.spec_scale} onChange={e => setForm({ ...form, spec_scale: e.target.value })} placeholder="e.g. 1:64" />)}
            {fld('Power', <input value={form.spec_power} onChange={e => setForm({ ...form, spec_power: e.target.value })} placeholder="e.g. 2 × AA batteries (not included)" />)}
            {fld('Lighting', <input value={form.spec_lighting} onChange={e => setForm({ ...form, spec_lighting: e.target.value })} placeholder="e.g. LED ambient lighting" />)}
          </div>

          {/* --- Section 3: FEATURES --- */}
          <h3 style={{ fontSize: 15, marginTop: 32, marginBottom: 12, borderBottom: '1px solid #e0e0e0', paddingBottom: 8 }}>✨ FEATURES</h3>
          {fld('Features (one per line)', <textarea rows={6} value={form.features} onChange={e => setForm({ ...form, features: e.target.value })} placeholder={`Battery-powered — completely cordless, works anywhere\nWhisper-quiet motor — no distracting noise on your desk\nUniversal 1:64 compatibility`} />)}

          {/* --- SKUs --- */}
          <h3 style={{ fontSize: 15, marginTop: 32, marginBottom: 12, borderBottom: '1px solid #e0e0e0', paddingBottom: 8 }}>📦 SKUs / Variants</h3>
          <p style={{ fontSize: 12, color: '#646970', marginBottom: 16 }}>Each SKU represents a different version of this product (e.g. different colors, sizes).</p>
          {skus.map((sku, i) => (
            <div key={i} style={{ marginBottom: 20, padding: 16, border: '1px solid #c3c4c7', borderRadius: 6, background: '#fafafa' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <strong style={{ fontSize: 14 }}>SKU #{i + 1}{sku.name ? ` — ${sku.name}` : ''}</strong>
                {skus.length > 1 && <button type="button" onClick={() => removeSku(i)} style={{ background: 'none', border: '1px solid #b32d2e', color: '#b32d2e', cursor: 'pointer', fontSize: 12, padding: '4px 10px', borderRadius: 3 }}>Remove</button>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div><label style={{ fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 2 }}>SKU Name *</label><input required value={sku.name} onChange={e => updateSku(i, 'name', e.target.value)} placeholder={i === 0 ? form.name || 'Product name' : 'e.g. Red Version'} /></div>
                <div><label style={{ fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 2 }}>Value / Option Label</label><input value={sku.value || ''} onChange={e => updateSku(i, 'value', e.target.value)} placeholder="e.g. Red, Blue, Large" /></div>
                <div><label style={{ fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 2 }}>Price *</label><input type="number" step="0.01" required value={sku.price} onChange={e => updateSku(i, 'price', parseFloat(e.target.value) || 0)} /></div>
                <div><label style={{ fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 2 }}>Compare-at Price</label><input type="number" step="0.01" value={sku.compare_at_price || ''} onChange={e => updateSku(i, 'compare_at_price', e.target.value ? parseFloat(e.target.value) : null)} /></div>
                <div><label style={{ fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 2 }}>Inventory</label><input type="number" value={sku.inventory} onChange={e => updateSku(i, 'inventory', parseInt(e.target.value) || 0)} /></div>
              </div>
              <div style={{ marginTop: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4 }}>Images</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                  {sku.images.map((img: string, j: number) => (
                    <div key={j} style={{ position: 'relative', width: 80, height: 80, background: '#f0f0f0', borderRadius: 4, overflow: 'hidden', border: '1px solid #ddd' }}>
                      <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button type="button" onClick={() => removeImage('sku', i, j)} style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: 12, lineHeight: '17px', padding: 0 }}>×</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => { fileRef.current?.click(); fileRef.current?.setAttribute('data-sku-index', String(i)); fileRef.current?.removeAttribute('data-section'); }} style={{ width: 80, height: 80, border: '2px dashed #c3c4c7', borderRadius: 4, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#646970', fontSize: 20 }}>
                    {uploading.sku === i && uploading.active ? '...' : '+'}
                  </button>
                </div>
              </div>
            </div>
          ))}
          <input ref={fileRef} type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={(e) => {
            const section = fileRef.current?.getAttribute('data-section');
            if (section === 'description') { uploadImage({ section: 'description' }, e); }
            else { const idx = parseInt(fileRef.current?.getAttribute('data-sku-index') || '0'); uploadImage({ sku: idx }, e); }
          }} />
          <button type="button" onClick={addSku} className="wp-btn wp-btn-outline" style={{ fontSize: 13, marginBottom: 24 }}>+ Add Another SKU</button>

          <div style={{ display: 'flex', gap: 8, marginTop: 24, paddingTop: 16, borderTop: '1px solid #e0e0e0' }}>
            <button type="submit" disabled={saving} className="wp-btn wp-btn-primary">{saving ? 'Saving...' : 'Update Product'}</button>
            <Link href="/admin/products" className="wp-btn wp-btn-outline">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
