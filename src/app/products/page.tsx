'use client';

import { Suspense, useEffect, useState } from 'react';
import { useIsMobile } from '@/lib/useIsMobile';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/lib/types';
import { useSearchParams, useRouter } from 'next/navigation';

function ProductsContent() {
  const isMobile = useIsMobile();
  const sp = useSearchParams();
  const router = useRouter();
  const cat = sp.get('category');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [sort, setSort] = useState('default');

  useEffect(() => {
    fetch('/api/admin/categories').then(r => { if (!r.ok) throw new Error("API error"); return r.json(); }).then(d => setCategories(Array.isArray(d) ? d : []));
  }, []);

  useEffect(() => {
    const url = cat ? `/api/products?category=${encodeURIComponent(cat)}` : '/api/products';
    fetch(url).then(r => { if (!r.ok) throw new Error("API error"); return r.json(); }).then(d => setProducts(Array.isArray(d) ? d : []));
  }, [cat]);

  let sorted = [...products];
  if (sort === 'price-low') sorted.sort((a,b) => a.price - b.price);
  if (sort === 'price-high') sorted.sort((a,b) => b.price - a.price);
  if (sort === 'name') sorted.sort((a,b) => a.name.localeCompare(b.name));

  return (
    <>
      <div style={{ borderBottom: '1px solid #dfdfdf', background: '#fff' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '60px 48px 40px' }}>
          <h1 style={{ fontSize: 48, fontWeight: 200, color: '#14140f', margin: 0 }}>{cat || 'All Products'}</h1>
          
          {/* Category filter tabs */}
          <div style={{ display: 'flex', gap: 8, marginTop: 24, flexWrap: 'wrap' }}>
            <button onClick={() => router.push('/products')} style={{
              padding: '8px 20px', border: cat ? '1px solid #dfdfdf' : '1px solid #14140f',
              background: cat ? '#fff' : '#14140f', color: cat ? '#14140f' : '#fff',
              fontSize: 13, fontWeight: 500, cursor: 'pointer', borderRadius: 2
            }}>All</button>
            {categories.map((c: any) => (
              <button key={c.id} onClick={() => router.push(`/products?category=${encodeURIComponent(c.slug)}`)} style={{
                padding: '8px 20px', border: cat === c.slug ? '1px solid #14140f' : '1px solid #dfdfdf',
                background: cat === c.slug ? '#14140f' : '#fff', color: cat === c.slug ? '#fff' : '#14140f',
                fontSize: 13, fontWeight: 500, cursor: 'pointer', borderRadius: 2
              }}>{c.name}</button>
            ))}
          </div>

          {/* Sort */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16 }}>
            <span style={{ fontSize: 13, color: '#77736b' }}>Sort:</span>
            {[{v:'default',l:'Default'},{v:'price-low',l:'Price: Low-High'},{v:'price-high',l:'Price: High-Low'},{v:'name',l:'Name: A-Z'}].map(o => (
              <button key={o.v} onClick={() => setSort(o.v)} style={{
                padding: '4px 12px', border: 'none', background: 'none',
                color: sort === o.v ? '#D63F1C' : '#77736b', fontSize: 13, cursor: 'pointer', fontWeight: sort === o.v ? 600 : 400
              }}>{o.l}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: '#f5f1ea', padding: '48px 0 80px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: isMobile ? '0 16px' : '0 48px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: isMobile ? 12 : 32 }}>
            {sorted.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </div>
    </>
  );
}

export default function ProductsPage() {
  const isMobile = useIsMobile();
  return (
    <div style={{ background: '#fff' }}>
      
      <Suspense fallback={<div style={{padding:'120px 0',textAlign:'center',color:'#77736b'}}>Loading...</div>}>
        <ProductsContent />
      </Suspense>
      
    </div>
  );
}
