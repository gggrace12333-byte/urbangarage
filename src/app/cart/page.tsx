'use client';

import Image from 'next/image';
import { useCart } from '@/components/CartProvider';
import { useLocale } from '@/components/LocaleProvider';
import { useIsMobile } from '@/lib/useIsMobile';
import Link from 'next/link';

export default function CartPage() {
  const isMobile = useIsMobile();
  const { items, removeItem, updateQuantity, subtotal, itemCount } = useCart();
  const { formatPrice, t } = useLocale();
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = Math.round((subtotal + shipping + tax) * 100) / 100;

  const OrderSummary = () => (
    <div style={{ background: '#fff', border: '1px solid #dfdfdf', padding: 24 }}>
      <h3 style={{ fontSize: 16, fontWeight: 600, color: '#14140f', marginBottom: 16 }}>Order Summary</h3>
      <div style={{ fontSize: 14, color: '#77736b' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span>Shipping</span><span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span>Tax</span><span>{formatPrice(tax)}</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #dfdfdf', marginTop: 8, fontWeight: 600, color: '#14140f', fontSize: 16 }}><span>Total</span><span>{formatPrice(total)}</span></div>
      </div>
      <Link href="/checkout" style={{ display: 'block', textAlign: 'center', marginTop: 16, padding: '14px 0', background: '#D63F1C', color: '#fff', border: 'none', fontSize: 16, fontWeight: 500, textDecoration: 'none', borderRadius: isMobile ? 0 : undefined }}>Proceed to Checkout</Link>
    </div>
  );

  return (
    <div style={{ background: '#f5f1ea', minHeight: '100vh', paddingBottom: isMobile ? 80 : 0 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '80px 16px 20px' : '120px 48px 80px' }}>
        <h1 style={{ fontSize: isMobile ? 24 : 36, fontWeight: 200, color: '#14140f', marginBottom: 4 }}>YOUR BAG</h1>
        <p style={{ fontSize: 14, color: '#77736b', marginBottom: isMobile ? 24 : 48 }}>{itemCount} item{itemCount !== 1 ? 's' : ''} in your cart</p>
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', background: '#fff', border: '1px solid #dfdfdf' }}>
            <p style={{ fontSize: 48, marginBottom: 16 }}>🛍️</p>
            <p style={{ color: '#77736b', marginBottom: 24 }}>Your cart is empty.</p>
            <Link href="/products" style={{ color: '#D63F1C', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>Continue Shopping →</Link>
          </div>
        ) : isMobile ? (
          <>
            <div>
              {items.map(item => {
                const imgs: string[] = typeof item.product.images === 'string' ? JSON.parse(item.product.images || '[]') : (item.product.images || []);
                return (
                  <div key={item.product.id} style={{ display: 'flex', gap: 12, background: '#fff', padding: 12, marginBottom: 8 }}>
                    <div style={{ width: 80, height: 80, background: '#f5f1ea', flexShrink: 0 }}>
                      {imgs[0] && <Image src={imgs[0]} alt={item.product.name} width={80} height={80} style={{ objectFit: 'cover' }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link href={`/products/${item.product.slug}`} style={{ fontSize: 13, fontWeight: 500, color: '#14140f', textDecoration: 'none' }}>{item.product.name}</Link>
                      <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{formatPrice(item.product.price)}</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                        <div style={{ display: 'flex', border: '1px solid #dfdfdf' }}>
                          <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} style={{ padding: '2px 10px', border: 'none', background: 'none', cursor: 'pointer' }}>−</button>
                          <span style={{ padding: '2px 10px', fontSize: 13, borderLeft: '1px solid #dfdfdf', borderRight: '1px solid #dfdfdf' }}>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} style={{ padding: '2px 10px', border: 'none', background: 'none', cursor: 'pointer' }}>+</button>
                        </div>
                        <button onClick={() => removeItem(item.product.id)} style={{ background: 'none', border: 'none', color: '#9a978d', cursor: 'pointer', fontSize: 14 }}>🗑</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 16 }}><OrderSummary /></div>
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #dfdfdf', padding: '12px 16px', zIndex: 50, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><span style={{ fontSize: 12, color: '#77736b' }}>Total</span><div style={{ fontSize: 18, fontWeight: 700 }}>{formatPrice(total)}</div></div>
              <Link href="/checkout" style={{ padding: '12px 32px', background: '#D63F1C', color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>Checkout</Link>
            </div>
          </>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 48, alignItems: 'start' }}>
            <div>
              {items.map(item => {
                const imgs: string[] = typeof item.product.images === 'string' ? JSON.parse(item.product.images || '[]') : (item.product.images || []);
                return (
                  <div key={item.product.id} style={{ display: 'flex', gap: 24, background: '#fff', padding: 20, marginBottom: 12, border: '1px solid #dfdfdf' }}>
                    <div style={{ width: 100, height: 100, background: '#f5f1ea', flexShrink: 0 }}>
                      {imgs[0] && <Image src={imgs[0]} alt={item.product.name} width={100} height={100} style={{ objectFit: 'cover' }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Link href={`/products/${item.product.slug}`} style={{ fontSize: 14, fontWeight: 500, color: '#14140f', textDecoration: 'none' }}>{item.product.name}</Link>
                        <button onClick={() => removeItem(item.product.id)} style={{ background: 'none', border: 'none', color: '#9a978d', cursor: 'pointer', fontSize: 18 }}>×</button>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>{formatPrice(item.product.price)}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12 }}>
                        <div style={{ display: 'flex', border: '1px solid #dfdfdf' }}>
                          <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} style={{ padding: '4px 12px', border: 'none', background: 'none', cursor: 'pointer' }}>−</button>
                          <span style={{ padding: '4px 12px', fontSize: 13, borderLeft: '1px solid #dfdfdf', borderRight: '1px solid #dfdfdf' }}>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} style={{ padding: '4px 12px', border: 'none', background: 'none', cursor: 'pointer' }}>+</button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ position: 'sticky', top: 100 }}><OrderSummary /></div>
          </div>
        )}
      </div>
    </div>
  );
}
