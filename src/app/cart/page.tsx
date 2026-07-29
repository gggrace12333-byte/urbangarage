'use client';

import Image from 'next/image';
import { useCart } from '@/components/CartProvider';
import { useLocale } from '@/components/LocaleProvider';
import Link from 'next/link';

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, itemCount } = useCart();
  const { formatPrice, t } = useLocale();
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = Math.round((subtotal + shipping + tax) * 100) / 100;

  const getItemPrice = (item: any) => item.sku_price || item.product.price;
  const getCompareAt = (item: any) => item.sku_compare_at_price || item.product.compare_at_price;
  const getImages = (item: any) => item.sku_images || (typeof item.product.images === 'string' ? JSON.parse(item.product.images || '[]') : (item.product.images || []));

  return (
    <div style={{ background: '#f5f1ea', minHeight: '100vh' }}>
      
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '120px 48px 80px' }}>
        <h1 style={{ fontSize: 36, fontWeight: 200, color: '#14140f', marginBottom: 4 }}>YOUR BAG</h1>
        <p style={{ fontSize: 14, color: '#77736b', marginBottom: 48 }}>{itemCount} item{itemCount !== 1 ? 's' : ''} in your cart</p>
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', background: '#fff', border: '1px solid #dfdfdf' }}>
            <p style={{ fontSize: 48, marginBottom: 16 }}>🛍️</p>
            <p style={{ color: '#77736b', marginBottom: 24 }}>Your cart is empty.</p>
            <Link href="/products" style={{ color: '#D63F1C', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>Continue Shopping →</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 48, alignItems: 'start' }}>
            <div>
              {items.map((item, idx) => {
                const imgs = getImages(item);
                const price = getItemPrice(item);
                const compareAt = getCompareAt(item);
                const hasSale = compareAt && compareAt > price;
                return (
                  <div key={`${item.product.id}-${item.sku_value || 'default'}-${idx}`} style={{ display: 'flex', gap: 24, background: '#fff', padding: 20, marginBottom: 12, border: '1px solid #dfdfdf' }}>
                    <div style={{ width: 100, height: 100, background: '#f5f1ea', flexShrink: 0, overflow: 'hidden' }}>
                      {imgs[0] && <Image src={imgs[0]} alt={item.product.name} width={100} height={100} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                          <Link href={`/products/${item.product.slug}`} style={{ fontSize: 14, fontWeight: 500, color: '#14140f', textDecoration: 'none' }}>{item.product.name}</Link>
                          {item.sku_value && item.sku_value !== 'Default' && <p style={{ fontSize: 12, color: '#77736b', margin: '2px 0 0' }}>{item.sku_value}</p>}
                        </div>
                        <button onClick={() => removeItem(idx)} style={{ background: 'none', border: 'none', color: '#9a978d', cursor: 'pointer', fontSize: 18 }}>×</button>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: hasSale ? '#D63F1C' : '#14140f' }}>{formatPrice(price)}</span>
                        {hasSale && <span style={{ fontSize: 12, color: '#9a978d', textDecoration: 'line-through' }}>{formatPrice(compareAt!)}</span>}
                        {hasSale && <span style={{ fontSize: 12, color: '#16a34a' }}>Save {formatPrice(compareAt! - price)}</span>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12 }}>
                        <div style={{ display: 'flex', border: '1px solid #dfdfdf' }}>
                          <button onClick={() => updateQuantity(idx, item.quantity - 1)} style={{ padding: '4px 12px', border: 'none', background: 'none', cursor: 'pointer', color: '#77736b' }}>−</button>
                          <span style={{ padding: '4px 12px', fontSize: 13, borderLeft: '1px solid #dfdfdf', borderRight: '1px solid #dfdfdf' }}>{item.quantity}</span>
                          <button onClick={() => updateQuantity(idx, item.quantity + 1)} style={{ padding: '4px 12px', border: 'none', background: 'none', cursor: 'pointer', color: '#77736b' }}>+</button>
                        </div>
                        <span style={{ fontSize: 13, color: '#77736b' }}>{formatPrice(price * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ background: '#fff', border: '1px solid #dfdfdf', padding: 32, position: 'sticky', top: 100 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#14140f', marginBottom: 24 }}>Order Summary</h3>
              <div style={{ fontSize: 14, color: '#77736b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span>Shipping</span><span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span>Tax</span><span>{formatPrice(tax)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid #dfdfdf', marginTop: 8, fontWeight: 600, color: '#14140f', fontSize: 16 }}><span>Total</span><span>{formatPrice(total)}</span></div>
              </div>
              <Link href="/checkout" style={{ display: 'block', textAlign: 'center', marginTop: 24, padding: '14px 0', background: '#D63F1C', color: '#fff', border: 'none', fontSize: 16, fontWeight: 500, textDecoration: 'none' }}>Proceed to Checkout</Link>
              {subtotal > 0 && subtotal < 50 && <p style={{ fontSize: 12, color: '#9a978d', textAlign: 'center', marginTop: 12 }}>Add {formatPrice(50 - subtotal)} more for free shipping</p>}
            </div>
          </div>
        )}
      </div>
      
    </div>
  );
}
