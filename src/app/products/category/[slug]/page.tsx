'use client';

import { Suspense, useEffect, useState } from 'react';
import { useIsMobile } from '@/lib/useIsMobile';
import { useParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/lib/types';

function CategoryContent() {
  const isMobile = useIsMobile();
  const params = useParams();
  const slug = params.slug as string;
  const [products, setProducts] = useState<Product[]>([]);
  const [catName, setCatName] = useState('');

  useEffect(() => {
    fetch('/api/admin/categories').then(r => { if (!r.ok) throw new Error("API error"); return r.json(); }).then((cats: any[]) => {
      const cat = cats.find((c: any) => c.slug === slug);
      setCatName(cat?.name || slug);
    });
    fetch(`/api/products?category=${encodeURIComponent(slug)}`)
      .then(r => { if (!r.ok) throw new Error("API error"); return r.json(); })
      .then(d => setProducts(Array.isArray(d) ? d : []));
  }, [slug]);

  return (
    <>
      <div style={{ borderBottom: '1px solid #dfdfdf', background: '#fff' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: isMobile ? '40px 16px 20px' : '80px 48px 40px' }}>
          <h1 style={{ fontSize: 48, fontWeight: 200, color: '#14140f', margin: 0 }}>{catName}</h1>
        </div>
      </div>
      <div style={{ background: '#f5f1ea', padding: isMobile ? '32px 0' : '64px 0', minHeight: '50vh' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: isMobile ? '0 16px' : '0 48px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: isMobile ? 12 : 32 }}>
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </div>
    </>
  );
}

export default function CategoryPage() {
  const isMobile = useIsMobile();
  return (
    <div style={{ background: '#fff' }}>
      
      <Suspense fallback={<div style={{padding:'120px 0',textAlign:'center',color:'#77736b'}}>Loading...</div>}>
        <CategoryContent />
      </Suspense>
      
    </div>
  );
}
