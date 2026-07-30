'use client';

import { useCart } from '@/components/CartProvider';
import { useLocale } from '@/components/LocaleProvider';
import Link from 'next/link';
import Image from 'next/image';
import { X, ShoppingBag, ArrowRight } from 'lucide-react';
import { useEffect } from 'react';

export default function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, removeItem, updateQuantity, subtotal } = useCart();
  const { formatPrice, t } = useLocale();

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const shipping = subtotal >= 50 ? 0 : 5.99;

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, opacity: open ? 1 : 0, visibility: open ? 'visible' : 'hidden', transition: 'opacity 0.3s, visibility 0.3s' }} />
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 420, maxWidth: '100vw', background: '#fff', zIndex: 101, boxShadow: '-4px 0 20px rgba(0,0,0,0.1)', transform: open ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.3s ease', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #dfdfdf' }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#14140f', margin: 0 }}>{t('your_bag')}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#77736b', padding: 4 }}><X size={20} /></button>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', paddingTop: 60 }}>
              <ShoppingBag size={40} color="#dfdfdf" />
              <p style={{ color: '#77736b', marginTop: 16, fontSize: 14 }}>{t('cart_empty')}</p>
              <button onClick={onClose} style={{ marginTop: 12, color: '#D63F1C', fontSize: 14, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>{t('continue_shopping')}</button>
            </div>
          ) : (
            items.map(item => {
              const imgs: string[] = typeof item.product.images === 'string' ? JSON.parse(item.product.images || '[]') : (item.product.images || []);
              return (
                <div key={item.product.id} style={{ display: 'flex', gap: 16, padding: '16px 0', borderBottom: '1px solid #f5f1ea' }}>
                  <div style={{ width: 80, height: 80, background: '#f5f1ea', flexShrink: 0, overflow: 'hidden' }}>{imgs[0] && <Image src={imgs[0]} alt="" width={80} height={80} style={{ objectFit: 'cover' }} />}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><p style={{ fontSize: 13, fontWeight: 500, color: '#14140f', margin: 0 }}>{item.product.name}</p><button onClick={() => removeItem(item.product.id)} style={{ background: 'none', border: 'none', color: '#9a978d', cursor: 'pointer', padding: '0 0 0 8px' }}><X size={14} /></button></div>
                    <p style={{ fontSize: 12, color: '#77736b', margin: '4px 0' }}>{formatPrice(item.product.price)}</p>
                    {item.product.compare_at_price && item.product.compare_at_price > item.product.price && <p style={{ fontSize: 11, color: '#9a978d', textDecoration: 'line-through', margin: '2px 0' }}>{formatPrice(item.product.compare_at_price)}</p>}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ display: 'flex', border: '1px solid #dfdfdf' }}><button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} style={{ padding: '3px 10px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, color: '#77736b' }}>−</button><span style={{ padding: '3px 10px', fontSize: 12, borderLeft: '1px solid #dfdfdf', borderRight: '1px solid #dfdfdf' }}>{item.quantity}</span><button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} style={{ padding: '3px 10px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, color: '#77736b' }}>+</button></div>
                      <span style={{ fontSize: 12, color: '#77736b', marginLeft: 'auto' }}>{formatPrice(item.product.price * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        {items.length > 0 && (
          <div style={{ borderTop: '1px solid #dfdfdf', padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 14, color: '#77736b' }}><span>{t('subtotal')}</span><span>{formatPrice(subtotal)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 14, color: '#77736b' }}><span>{t('shipping')}</span><span>{shipping === 0 ? t('free') : formatPrice(shipping)}</span></div>
            <Link href="/checkout" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#D63F1C', color: '#fff', padding: '14px 0', fontSize: 16, fontWeight: 500, textDecoration: 'none', width: '100%' }}>{t('checkout')} <ArrowRight size={18} /></Link>
            <Link href="/cart" onClick={onClose} style={{ display: 'block', textAlign: 'center', marginTop: 12, fontSize: 13, color: '#77736b', textDecoration: 'none' }}>{t('view_cart')}</Link>
          </div>
        )}
      </div>
    </>
  );
}
