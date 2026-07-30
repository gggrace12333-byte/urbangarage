'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const TAG_OPTIONS = ['sale', 'hot', 'limited', 'new'];

export default function EditProduct() {
  const params = useParams(); const router = useRouter(); const fileRef = useRef<HTMLInputElement>(null);
  const [product, setProduct] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [saving, setSaving] = useState(false); const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ name:'',description:'',price:'',compare_at_price:'',category_id:'',inventory:'',featured:false,active:true,images:'',tags:'',sku:'',variants:[] as any[] });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/admin/categories').then(r=>r.json()).then(setCategories);
    fetch('/api/admin/products').then(r=>r.json()).then((all:any[])=>{
      const p = all.find((x:any)=>String(x.id)===params.id);
      if (!p) return;
      setProduct(p);
      const imgs = typeof p.images==='string'?JSON.parse(p.images||'[]'):(p.images||[]);
      setForm({name:p.name,description:p.description||'',price:String(p.price),compare_at_price:p.compare_at_price?String(p.compare_at_price):'',category_id:p.category_id?String(p.category_id):'',inventory:String(p.inventory||0),featured:!!p.featured,active:!!p.active,images:imgs.join('\n'),tags:p.tags||'',sku:p.sku||'',variants:[]});
      setSelectedTags((p.tags||'').split(',').map((t:string)=>t.trim()).filter(Boolean));
      fetch(`/api/admin/variants?product_id=${p.id}`).then(r=>r.json()).then(v=>setForm(f=>({...f,variants:v||[]})));
    });
  }, [params.id]);

  const toggleTag = (tag: string) => { setSelectedTags(prev => { const next = prev.includes(tag) ? prev.filter(t=>t!==tag) : [...prev, tag]; setForm(f=>({...f, tags: next.join(',')})); return next; }); };

  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if(!file)return; setUploading(true);
    const fd = new FormData(); fd.append('file',file);
    const res = await fetch('/api/upload',{method:'POST',body:fd}); const data = await res.json();
    if(data.url) setForm(f=>({...f,images:f.images?f.images+'\n'+data.url:data.url}));
    setUploading(false);
  };

  const addVariant = () => setForm(f=>({...f,variants:[...f.variants,{name:'',value:'',image:'',price_adjustment:0,inventory:0}]}));
  const updateVariant = (i:number, field:string, val:any) => { const v=[...form.variants]; v[i]={...v[i],[field]:val}; setForm(f=>({...f,variants:v})); };
  const removeVariant = (i:number) => setForm(f=>({...f,variants:f.variants.filter((_:any,j:number)=>j!==i)}));

  const submit = async (e: React.FormEvent) => { e.preventDefault(); setSaving(true);
    await fetch(`/api/admin/products/${product.id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({...form,price:parseFloat(form.price)||0,compare_at_price:form.compare_at_price?parseFloat(form.compare_at_price):null,category_id:form.category_id?parseInt(form.category_id):null,inventory:parseInt(form.inventory)||0,images:form.images.split('\n').map((s:string)=>s.trim()).filter(Boolean)})});
    for (const v of form.variants) {
      if (v.id) await fetch('/api/admin/variants',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({...v,product_id:product.id})});
      else if (v.name) await fetch('/api/admin/variants',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...v,product_id:product.id})});
    }
    router.push('/admin/products');
  };

  if(!product) return <p>Loading...</p>;
  const f=(l:string,c:React.ReactNode)=><div style={{marginBottom:16}}><label style={{fontSize:13,fontWeight:600}}>{l}</label>{c}</div>;

  return (
    <div style={{maxWidth:1100}}>
      <Link href="/admin/products" style={{display:'inline-block',marginBottom:20,color:'#646970',fontSize:14}}>← Back to Products</Link>
      <div className="wp-card"><h2>Edit: {product.name}</h2>
        <form onSubmit={submit}>
          {f('Product Name *',<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />)}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            {f('SKU',<input value={form.sku} onChange={e=>setForm({...form,sku:e.target.value})} placeholder="UG-001" />)}
            {f('Price *',<input type="number" step="0.01" required value={form.price} onChange={e=>setForm({...form,price:e.target.value})} />)}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:16}}>
            {f('Compare-at Price',<input type="number" step="0.01" value={form.compare_at_price} onChange={e=>setForm({...form,compare_at_price:e.target.value})} />)}
            {f('Category',<select value={form.category_id} onChange={e=>setForm({...form,category_id:e.target.value})}><option value="">— None —</option>{categories.map((c:any)=><option key={c.id} value={c.id}>{c.name}</option>)}</select>)}
            {f('Inventory',<input type="number" value={form.inventory} onChange={e=>setForm({...form,inventory:e.target.value})} />)}
          </div>
          {f('Tags',<div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{TAG_OPTIONS.map(tag=><label key={tag} style={{display:'flex',alignItems:'center',gap:4,cursor:'pointer',padding:'6px 12px',border:'1px solid '+(selectedTags.includes(tag)?'#2271b1':'#c3c4c7'),borderRadius:3,fontSize:12,fontWeight:500,background:selectedTags.includes(tag)?'#f0f6fc':'#fff'}}><input type="checkbox" checked={selectedTags.includes(tag)} onChange={()=>toggleTag(tag)} style={{width:'auto'}} />{tag.toUpperCase()}</label>)}</div>)}
          {f('Description',<textarea rows={4} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Product description..." />)}

          {/* Variants */}
          <div className="wp-card" style={{marginBottom:16,padding:16}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <h3 style={{margin:0,fontSize:14}}>📦 Variants (e.g. colors, sizes)</h3>
              <button type="button" onClick={addVariant} className="wp-btn wp-btn-outline" style={{fontSize:12}}>+ Add Variant</button>
            </div>
            {form.variants.length === 0 && <p style={{color:'#646970',fontSize:13}}>No variants yet.</p>}
            {form.variants.map((v:any,i:number)=>
              <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 100px 80px 40px',gap:8,marginBottom:8,padding:8,background:'#f9f9f9',borderRadius:4,alignItems:'end'}}>
                <div><label style={{fontSize:11}}>Name</label><input value={v.name} onChange={e=>updateVariant(i,'name',e.target.value)} placeholder="Color" /></div>
                <div><label style={{fontSize:11}}>Value</label><input value={v.value} onChange={e=>updateVariant(i,'value',e.target.value)} placeholder="Red" /></div>
                <div><label style={{fontSize:11}}>Image URL</label><input value={v.image||''} onChange={e=>updateVariant(i,'image',e.target.value)} placeholder="/uploads/red.jpg" /></div>
                <div><label style={{fontSize:11}}>Price +/-</label><input type="number" step="0.01" value={v.price_adjustment} onChange={e=>updateVariant(i,'price_adjustment',parseFloat(e.target.value)||0)} /></div>
                <div><label style={{fontSize:11}}>Stock</label><input type="number" value={v.inventory} onChange={e=>updateVariant(i,'inventory',parseInt(e.target.value)||0)} /></div>
                <button type="button" onClick={()=>removeVariant(i)} style={{background:'none',border:'none',color:'#b32d2e',cursor:'pointer',fontSize:18,padding:0}}>✕</button>
              </div>
            )}
          </div>

          {f('Images',<>
            <textarea rows={3} value={form.images} onChange={e=>setForm({...form,images:e.target.value})} placeholder="One image URL per line" style={{marginBottom:8}} />
            <input ref={fileRef} type="file" accept="image/*,video/*" onChange={uploadImage} style={{display:'none'}} />
            <button type="button" onClick={()=>fileRef.current?.click()} className="wp-btn wp-btn-outline" disabled={uploading} style={{fontSize:12}}>{uploading?'Uploading...':'📷 Upload Image'}</button>
          </>)}
          <div style={{display:'flex',gap:16,marginBottom:16,marginTop:16}}>
            <label style={{display:'flex',alignItems:'center',gap:6,fontWeight:400}}><input type="checkbox" checked={form.featured} onChange={e=>setForm({...form,featured:e.target.checked})} style={{width:'auto'}} /> ⭐ Featured</label>
            <label style={{display:'flex',alignItems:'center',gap:6,fontWeight:400}}><input type="checkbox" checked={form.active} onChange={e=>setForm({...form,active:e.target.checked})} style={{width:'auto'}} /> Active</label>
          </div>
          <div style={{display:'flex',gap:8}}><button type="submit" disabled={saving} className="wp-btn wp-btn-primary">{saving?'Saving...':'Update Product'}</button><Link href="/admin/products" className="wp-btn wp-btn-outline">Cancel</Link></div>
        </form>
      </div>
    </div>
  );
}
