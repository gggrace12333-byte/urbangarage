'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ProductsList() {
  const [products, setProducts] = useState<any[]>([]);
  const load = () => fetch('/api/admin/products').then(r=>r.json()).then(setProducts);
  useEffect(()=>{load();},[]);

  const del = async (id:number) => { if(!confirm('Delete?'))return; await fetch(`/api/admin/products/${id}`,{method:'DELETE'}); load(); };

  return (
    <div>
      <div style={{marginBottom:20}}><Link href="/admin/products/new" className="wp-btn wp-btn-primary">+ Add Product</Link></div>
      {products.length===0 ? <div className="wp-card"><p style={{color:'#646970',textAlign:'center',padding:40}}>No products. <Link href="/admin/products/new">Create one →</Link></p></div> :
        <table className="wp-table">
          <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Tags</th><th>Stock</th><th>Featured</th><th style={{width:120}}>Actions</th></tr></thead>
          <tbody>
            {products.map((p:any)=>(
              <tr key={p.id}>
                <td><strong>{p.name}</strong><br /><code style={{fontSize:11,color:'#646970'}}>{p.slug}</code></td>
                <td>{p.category_name || '—'}</td>
                <td>${p.price?.toFixed(2)}{p.compare_at_price && <span style={{color:'#b32d2e',marginLeft:8,textDecoration:'line-through',fontSize:12}}>${p.compare_at_price.toFixed(2)}</span>}</td>
                <td>{(p.tags||'').split(',').filter(Boolean).map((t:string)=><span key={t} style={{display:'inline-block',background:'#f0f0f1',padding:'2px 8px',borderRadius:3,fontSize:11,margin:'2px'}}>{t.trim()}</span>)}</td>
                <td style={{color:p.inventory>0?'#00a32a':'#b32d2e'}}>{p.inventory}</td>
                <td>{p.featured?'⭐':'—'}</td>
                <td><div style={{display:'flex',gap:4}}><Link href={`/admin/products/${p.id}`} className="wp-btn wp-btn-outline" style={{padding:'4px 10px',fontSize:12}}>Edit</Link><button onClick={()=>del(p.id)} className="wp-btn wp-btn-danger" style={{padding:'4px 10px',fontSize:12}}>Delete</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      }
    </div>
  );
}
