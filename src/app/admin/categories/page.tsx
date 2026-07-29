'use client';

import { useEffect, useState } from 'react';

interface Cat { id: number; name: string; slug: string; description: string; sort_order: number }

export default function CategoriesPage() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [editing, setEditing] = useState<Cat|null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [desc, setDesc] = useState('');
  const [order, setOrder] = useState(0);

  const load = () => fetch('/api/admin/categories').then(r=>r.json()).then(setCats);
  useEffect(()=>{load();},[]);

  const reset = () => { setEditing(null); setName(''); setSlug(''); setDesc(''); setOrder(0); };
  const edit = (c:Cat) => { setEditing(c); setName(c.name); setSlug(c.slug); setDesc(c.description); setOrder(c.sort_order); };

  const save = async () => {
    if (!name) return;
    const method = editing ? 'PUT' : 'POST';
    const body = editing ? { id: editing.id, name, slug: slug || undefined, description: desc, sort_order: order } : { name, description: desc, sort_order: order };
    await fetch('/api/admin/categories', { method, headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
    reset(); load();
  };

  const del = async (id:number) => {
    if (!confirm('Delete?')) return;
    await fetch('/api/admin/categories', { method:'DELETE', headers:{'Content-Type':'application/json'}, body: JSON.stringify({id}) });
    load();
  };

  return (
    <div>
      <div className="wp-card" style={{maxWidth:1000}}>
        <h2>{editing?'Edit':'Add'} Category</h2>
        <div style={{marginBottom:12}}><label>Name</label><input value={name} onChange={e=>setName(e.target.value)} /></div>
        <div style={{marginBottom:12}}><label>Slug (URL name)</label><input value={slug} onChange={e=>setSlug(e.target.value)} placeholder={name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')} /></div>
        <div style={{marginBottom:12}}><label>Description</label><input value={desc} onChange={e=>setDesc(e.target.value)} /></div>
        <div style={{marginBottom:12}}><label>Order</label><input type="number" value={order} onChange={e=>setOrder(parseInt(e.target.value)||0)} /></div>
        <div style={{display:'flex',gap:8}}>
          <button onClick={save} className="wp-btn wp-btn-primary">{editing?'Update':'Add'}</button>
          {editing && <button onClick={reset} className="wp-btn wp-btn-outline">Cancel</button>}
        </div>
      </div>
      <table className="wp-table">
        <thead><tr><th>Name</th><th>Slug</th><th>Order</th><th>Actions</th></tr></thead>
        <tbody>
          {cats.map(c=><tr key={c.id}><td><strong>{c.name}</strong></td><td><code style={{fontSize:12}}>{c.slug}</code></td><td>{c.sort_order}</td>
            <td><div style={{display:'flex',gap:4}}><button onClick={()=>edit(c)} className="wp-btn wp-btn-outline" style={{padding:'4px 10px',fontSize:12}}>Edit</button><button onClick={()=>del(c.id)} className="wp-btn wp-btn-danger" style={{padding:'4px 10px',fontSize:12}}>Delete</button></div></td>
          </tr>)}
        </tbody>
      </table>
    </div>
  );
}
