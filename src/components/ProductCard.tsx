'use client';

import Link from 'next/link';
import { useCart } from '@/components/CartProvider';
import { useLocale } from '@/components/LocaleProvider';
import { ShoppingBag } from 'lucide-react';

export default function ProductCard({ product }: { product: any }) {
  const { addItem } = useCart();
  const { formatPrice, t } = useLocale();
  const images = typeof product.images === 'string' ? JSON.parse(product.images || '[]') : (product.images || []);
  const hasSale = product.compare_at_price && product.compare_at_price > product.price;
  const isSoldOut = (product.inventory ?? 0) <= 0;

  return (
    <div className="product-card" style={{ position: 'relative', overflow: 'hidden' }}>
      <Link href={`/products/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
        <div style={{ background: '#e8e3da', aspectRatio: '1/1', overflow: 'hidden', position: 'relative' }}>
          {images[0] ? (
            <img src={images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9a978d', fontSize: 14 }}>{t('no_image', 'No image')}</div>
          )}
          {isSoldOut && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ background: '#000', color: '#fff', padding: '6px 16px', fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{t('sold_out','Sold Out')}</span></div>}
          {hasSale && !isSoldOut && <span style={{ position: 'absolute', top: 8, left: 8, background: '#D63F1C', color: '#fff', padding: '2px 8px', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em' }}>SALE</span>}
        </div>
        <div style={{ padding: '16px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
            <h3 style={{ fontSize: 14, fontWeight: 500, color: '#14140f', margin: 0, lineHeight: 1.3, flex: 1 }}>{product.name}</h3>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#14140f' }}>{formatPrice(product.price)}</div>
              {hasSale && <div style={{ fontSize: 13, color: '#9a978d', textDecoration: 'line-through' }}>{formatPrice(product.compare_at_price)}</div>}
            </div>
          </div>
        </div>
      </Link>
      {!isSoldOut && (
        <button onClick={() => addItem(product, 1)} style={{ width: '100%', padding: '12px 0', background: '#D63F1C', color: '#fff', border: 'none', fontSize: 14, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <ShoppingBag size={16} />{t('add_to_cart','Add to Cart')}
        </button>
      )}
    </div>
  );
}
