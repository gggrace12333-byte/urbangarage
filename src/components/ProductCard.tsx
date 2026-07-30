'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/types';
import { useCart } from '@/components/CartProvider';
import { useLocale } from '@/components/LocaleProvider';
import { ShoppingBag } from 'lucide-react';
import { useState } from 'react';

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { formatPrice, t } = useLocale();
  const [hover, setHover] = useState(false);
  const images: string[] = typeof product.images === 'string' ? JSON.parse(product.images || '[]') : (product.images || []);
  const tags = (product as any).tags ? (product as any).tags.split(',').map((t:string)=>t.trim()).filter(Boolean) : [];
  const hasSale = product.compare_at_price && product.compare_at_price > product.price;
  const isSoldOut = (product.inventory ?? 0) <= 0;
  const tagToShow = isSoldOut ? 'sold_out' : (tags[0] || '');

  return (
    <div onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}>
      <Link href={`/products/${product.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
        <div style={{ position: 'relative', aspectRatio: '4/5', background: '#f5f1ea', overflow: 'hidden', borderRadius: 2, marginBottom: 12 }}>
          {images[0] ? <Image src={images[0]} alt={product.name} fill style={{ objectFit: 'cover', opacity: isSoldOut ? 0.5 : 1, transition: 'transform 0.7s', transform: hover && !isSoldOut ? 'scale(1.05)' : 'scale(1)' }} sizes="33vw" /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9a978d', fontSize: 14 }}>No image</div>}
          {isSoldOut && (
            <span style={{ position: 'absolute', top: 12, left: 12, background: '#14140f', color: '#fff', fontSize: 10, fontWeight: 600, padding: '3px 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('sold_out', 'SOLD OUT')}</span>
          )}
          {!isSoldOut && tagToShow && (
            <span style={{ position: 'absolute', top: 12, left: 12, background: tagToShow === 'sale' ? '#D63F1C' : tagToShow === 'limited' ? '#14140f' : tagToShow === 'hot' ? '#f97316' : tagToShow === 'new' ? '#16a34a' : '#14140f', color: '#fff', fontSize: 10, fontWeight: 600, padding: '3px 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t(tagToShow, tagToShow.toUpperCase())}</span>
          )}
        </div>
        <h3 style={{ fontSize: 14, fontWeight: 500, color: '#14140f', margin: 0, lineHeight: 1.4 }}>{product.name}</h3>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: isSoldOut ? '#9a978d' : '#14140f' }}>{formatPrice(product.price)}</span>
          {hasSale && !isSoldOut && <span style={{ fontSize: 13, color: '#9a978d', textDecoration: 'line-through' }}>{formatPrice(product.compare_at_price!)}</span>}
        </div>
      </Link>
      <button
        onClick={() => !isSoldOut && addItem(product)}
        style={{
          width: '100%', marginTop: 10, padding: '12px 0',
          background: isSoldOut ? '#dcdcde' : '#D63F1C',
          color: isSoldOut ? '#9a978d' : '#fff', border: 'none',
          fontSize: 13, fontWeight: 600,
          cursor: isSoldOut ? 'not-allowed' : 'pointer',
          textTransform: 'uppercase', letterSpacing: '0.05em',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
        }}
      >
        <ShoppingBag size={14} /> {isSoldOut ? t('sold_out', 'SOLD OUT') : t('add_to_cart', 'ADD TO CART')}
      </button>
    </div>
  );
}
