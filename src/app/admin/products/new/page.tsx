'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const TAG_OPTIONS = ['sale', 'hot', 'limited', 'new'];

export default function NewProduct() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false); const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({ name:'',description:'',price:'',compare_at_price:'',category_id:'',inventory:'100',featured:false,active:true,images:'',tags:'',slug:'' });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => { fetch('/api/admin/categories').then(r=>r.json()).then(setCategories); }, []);

    const genSlug = (n: string) => n.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const toggleTag = (tag: string) => setSelectedTags(prev => { const next = prev.includes(tag) ? prev.filter(t=>t!==tag) : [...prev,tag]; setForm(f=>({...f,tags:next.join(',')})); return next; });

  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if(!file)return; setUploading(true);
    const fd = new FormData(); fd.append('file',file);
    const res = await fetch('/api/upload',{method:'POST',body:fd}); const data = await res.json();
    if(data.url) setForm(f=>({...f,images:f.images?f.images+'\n'+data.url:data.url}));
    setUploading(false);
  };

  const submit = async (e: React.FormEvent) => { e.preventDefault(); setSaving(true);
    await fetch('/api/admin/products',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...form,price:parseFloat(form.price)||0,compare_at_price:form.compare_at_price?parseFloat(form.compare_at_price):null,slug:form.slug||undefined,category_id:form.category_id?parseInt(form.category_id):null,inventory:parseInt(form.inventory)||0,images:form.images.split('\n').map(s=>s.trim()).filter(Boolean)})});
    router.push('/admin/products');
  };

  const f=(l:string,c:React.ReactNode)=><div style={{marginBottom:16}}><label style={{fontSize:13,fontWeight:600}}>{l}</label>{c}</div>;

  return (
    <div style={{maxWidth:1100}}>
      <Link href="/admin/products" style={{display:'inline-block',marginBottom:20,color:'#646970',fontSize:14}}>← Back to Products</Link>
      <div className="wp-card"><h2>Add New Product</h2>
        <form onSubmit={submit}>
          {f('Product Name *',<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="7/11 DRIFTPAD" />)}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            {f('Price *',<input type="number" step="0.01" required value={form.price} onChange={e=>setForm({...form,price:e.target.value})} placeholder="39.99" />)}
            {f('Compare-at Price',<input type="number" step="0.01" value={form.compare_at_price} onChange={e=>setForm({...form,compare_at_price:e.target.value})} placeholder="49.99" />)}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            {f('Category',<select value={form.category_id} onChange={e=>setForm({...form,category_id:e.target.value})}><option value="">— None —</option>{categories.map((c:any)=><option key={c.id} value={c.id}>{c.name}</option>)}</select>)}
            {f('Inventory',<input type="number" value={form.inventory} onChange={e=>setForm({...form,inventory:e.target.value})} />)}
          </div>
          

          {f('Tags',<div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{TAG_OPTIONS.map(tag=><label key={tag} style={{display:'flex',alignItems:'center',gap:4,cursor:'pointer',padding:'6px 12px',border:'1px solid '+(selectedTags.includes(tag)?'#2271b1':'#c3c4c7'),borderRadius:3,fontSize:12,fontWeight:500,background:selectedTags.includes(tag)?'#f0f6fc':'#fff'}}><input type="checkbox" checked={selectedTags.includes(tag)} onChange={()=>toggleTag(tag)} style={{width:'auto'}} />{tag.toUpperCase()}</label>)}</div>)}
          {f('Slug (URL)',<div style={{display:'flex',gap:8,alignItems:'center'}}><input value={form.slug || genSlug(form.name)} onChange={e=>setForm({...form,slug:e.target.value})} placeholder={genSlug(form.name)} style={{flex:1}} /><small style={{color:'#646970',fontSize:11,whiteSpace:'nowrap'}}>/products/<strong>{form.slug || genSlug(form.name)}</strong></small></div>)}
          {f('Description',<textarea rows={4} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Product description..." />)}
          {f('Images',<>
            <textarea rows={3} value={form.images} onChange={e=>setForm({...form,images:e.target.value})} placeholder="One image URL per line, or use upload" style={{marginBottom:8}} />
            <input ref={fileRef} type="file" accept="image/*,video/*" onChange={uploadImage} style={{display:'none'}} />
            <button type="button" onClick={()=>fileRef.current?.click()} className="wp-btn wp-btn-outline" disabled={uploading} style={{fontSize:12}}>{uploading?'Uploading...':'📷 Upload Image'}</button>
          </>)}
          <div style={{display:'flex',gap:16,marginBottom:16,marginTop:16}}>
            <label style={{display:'flex',alignItems:'center',gap:6,fontWeight:400}}><input type="checkbox" checked={form.featured} onChange={e=>setForm({...form,featured:e.target.checked})} style={{width:'auto'}} /> ⭐ Featured</label>
            <label style={{display:'flex',alignItems:'center',gap:6,fontWeight:400}}><input type="checkbox" checked={form.active} onChange={e=>setForm({...form,active:e.target.checked})} style={{width:'auto'}} /> Active</label>
          </div>
          <div style={{display:'flex',gap:8}}><button type="submit" disabled={saving} className="wp-btn wp-btn-primary">{saving?'Saving...':'Save Product'}</button><Link href="/admin/products" className="wp-btn wp-btn-outline">Cancel</Link></div>
        </form>
      </div>
    </div>
  );
}
