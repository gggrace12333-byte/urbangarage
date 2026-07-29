'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/components/CartProvider';
import { useLocale } from '@/components/LocaleProvider';

export default function ProductPage() {
  const params = useParams();
  const { addItem } = useCart();
  const { formatPrice, t } = useLocale();
  const [product, setProduct] = useState<any>(null);
  const [qty, setQty] = useState(1);
  const [related, setRelated] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('description');
  const [skus, setSkus] = useState<any[]>([]);
  const [selSku, setSelSku] = useState(0);

  useEffect(() => {
    fetch(`/api/products?slug=${params.slug}`).then(r => r.json()).then(d => {
      setProduct(d);
      fetch(`/api/reviews?product_id=${d.id}`).then(r => r.json()).then(rr => setReviews(Array.isArray(rr) ? rr : []));
      fetch(`/api/admin/variants?product_id=${d.id}`).then(r => r.json()).then((v: any[]) => {
        const parsed = (v || []).map((x: any) => ({
          ...x,
          images: typeof x.images === 'string' ? JSON.parse(x.images || '[]') : (x.images || []),
          price: x.price || 0,
        }));
        setSkus(parsed);
      });
      if (d.category_name) {
        fetch(`/api/products?category=${encodeURIComponent(d.category_name)}`).then(r => r.json()).then(arr => { setRelated((Array.isArray(arr) ? arr : []).filter((p: any) => p.id !== d.id).slice(0, 3)); });
      }
    });
  }, [params.slug]);

  if (!product) return <><div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f1ea' }}><p style={{ color: '#77736b' }}>Loading...</p></div></>;

  const currentSku = skus[selSku] || {};
  const skuImages: string[] = currentSku.images || [];
  const skuPrice = currentSku.price || product.price || 0;
  const skuCompareAt = currentSku.compare_at_price || product.compare_at_price || null;
  const skuInventory = currentSku.inventory ?? product.inventory ?? 0;
  const hasSale = skuCompareAt && skuCompareAt > skuPrice;
  const isSoldOut = skuInventory <= 0;

  const tags: string[] = (product.tags || '').split(',').map((t: string) => t.trim()).filter(Boolean);
  const descImages: string[] = typeof product.description_images === 'string' ? JSON.parse(product.description_images || '[]') : (product.description_images || []);
  const features: string[] = (product.features || '').split('\n').map((f: string) => f.trim()).filter(Boolean);

  return (
    <div style={{ background: '#fff' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '80px 48px 0' }}>
        {/* Top: Images + Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'start', marginBottom: 80 }}>
          <div>
            <div style={{ aspectRatio: '1', background: '#f5f1ea', overflow: 'hidden', marginBottom: 12, position: 'relative' }}>
              {skuImages[0] ? (
                <Image src={skuImages[0]} alt={currentSku.name || product.name} width={700} height={700} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9a978d' }}>Product image</div>
              )}
            </div>
            {skuImages.length > 1 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {skuImages.map((img: string, i: number) => (
                  <button key={i} onClick={() => {
                    const reordered = [...skuImages.slice(i), ...skuImages.slice(0, i)];
                    setSkus(prev => prev.map((s, idx) => idx === selSku ? { ...s, images: reordered, image: reordered[0] } : s));
                  }} style={{ width: 72, height: 72, background: '#f5f1ea', border: i === 0 ? '2px solid #D63F1C' : '1px solid #dfdfdf', cursor: 'pointer', padding: 0, overflow: 'hidden' }}>
                    <Image src={img} alt="" width={72} height={72} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            {product.category_name && <p style={{ fontSize: 12, letterSpacing: '0.2em', color: '#D63F1C', fontWeight: 500, textTransform: 'uppercase', marginBottom: 8 }}>{product.category_name}</p>}
            <h1 style={{ fontSize: 36, fontWeight: 300, color: '#14140f', marginBottom: 12, lineHeight: 1.2 }}>{product.name}</h1>
            {tags.length > 0 && <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>{tags.map((t: string) => <span key={t} style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', background: t === 'sale' ? '#D63F1C' : t === 'limited' ? '#14140f' : t === 'hot' ? '#f97316' : '#e5e7eb', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t}</span>)}</div>}
            {isSoldOut && <p style={{ fontSize: 14, fontWeight: 600, color: '#b32d2e', marginBottom: 16 }}>{t('sold_out', 'SOLD OUT')}</p>}
            <div style={{ display: 'flex', gap: 2, marginBottom: 20 }}>{[...Array(5)].map((_, i) => <span key={i} style={{ color: i < 4 ? '#D63F1C' : '#dfdfdf', fontSize: 16 }}>{i < 4 ? '★' : '☆'}</span>)}<span style={{ fontSize: 14, color: '#77736b', marginLeft: 8 }}>128 {t('reviews', 'reviews')}</span></div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 28 }}>
              <span style={{ fontSize: 32, fontWeight: 500, color: '#14140f' }}>{formatPrice(skuPrice)}</span>
              {hasSale && <span style={{ fontSize: 18, color: '#9a978d', textDecoration: 'line-through' }}>{formatPrice(skuCompareAt)}</span>}
              {hasSale && <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 600 }}>{t('you_save', 'Save')} {formatPrice(skuCompareAt - skuPrice)}</span>}
            </div>

            {skus.length > 1 && (
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#14140f', marginBottom: 8 }}>
                  {skus[0]?.name || 'Option'}: <strong>{currentSku.value || currentSku.name || 'Select'}</strong>
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {skus.map((sku: any, i: number) => (
                    <button key={i} onClick={() => setSelSku(i)} style={{
                      padding: '8px 16px', border: selSku === i ? '2px solid #14140f' : '1px solid #dfdfdf',
                      background: selSku === i ? '#14140f' : '#fff', color: selSku === i ? '#fff' : '#14140f',
                      fontSize: 13, cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                      {sku.images?.[0] && <img src={sku.images[0]} alt="" style={{ width: 20, height: 20, objectFit: 'cover', borderRadius: 2 }} />}
                      {sku.value || sku.name || `SKU #${i + 1}`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!isSoldOut && <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <span style={{ fontSize: 14, color: '#77736b' }}>{t('quantity', 'Quantity')}</span>
                <div style={{ display: 'flex', border: '1px solid #dfdfdf' }}>
                  <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ padding: '8px 14px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 16, color: '#77736b' }}>−</button>
                  <span style={{ padding: '8px 20px', fontSize: 14, fontWeight: 500, color: '#14140f', borderLeft: '1px solid #dfdfdf', borderRight: '1px solid #dfdfdf' }}>{qty}</span>
                  <button onClick={() => setQty(qty + 1)} style={{ padding: '8px 14px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 16, color: '#77736b' }}>+</button>
                </div>
              </div>
              <button onClick={() => addItem(product, qty, { name: currentSku.name, value: currentSku.value, price: skuPrice, compare_at_price: skuCompareAt, images: skuImages })} style={{ background: '#D63F1C', color: '#fff', border: 'none', padding: '18px 0', fontSize: 16, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('add_to_cart', 'Add to Cart')} — {formatPrice(skuPrice * qty)}</button>
            </>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 40, paddingTop: 28, borderTop: '1px solid #dfdfdf' }}>
              {['Secure Checkout', 'Free US Shipping $50+', '30-Day Returns'].map(tx => <div key={tx} style={{ fontSize: 12, color: '#77736b', display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ color: '#D63F1C', fontSize: 16 }}>{tx.includes('Secure') ? '🔒' : tx.includes('Ship') ? '📦' : '↩️'}</span>{tx}</div>)}
            </div>
          </div>
        </div>

        {/* Module Tabs */}
        <div style={{ borderTop: '1px solid #dfdfdf', paddingTop: 64 }}>
          <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #dfdfdf', marginBottom: 40 }}>
            {['DESCRIPTION', 'SPECIFICATIONS', 'FEATURES'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab.toLowerCase())} style={{
                padding: '16px 32px', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em',
                color: activeTab === tab.toLowerCase() ? '#14140f' : '#9a978d', background: 'none', border: 'none',
                borderBottom: activeTab === tab.toLowerCase() ? '2px solid #D63F1C' : '2px solid transparent', cursor: 'pointer'
              }}>
                {tab}
              </button>
            ))}
          </div>

          <div style={{ maxWidth: 800 }}>
            {/* DESCRIPTION */}
            {activeTab === 'description' && (
              <div style={{ fontSize: 15, color: '#4a4a40', lineHeight: 1.9 }}>
                <p style={{ marginBottom: 24 }}>{product.description || 'No description available.'}</p>
                {descImages.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginTop: 24 }}>
                    {descImages.map((img: string, i: number) => (
                      <div key={i} style={{ aspectRatio: '16/9', background: '#f5f1ea', overflow: 'hidden' }}>
                        <Image src={img} alt="" width={400} height={225} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SPECIFICATIONS */}
            {activeTab === 'specifications' && (
              <div style={{ fontSize: 14, color: '#4a4a40', lineHeight: 1.9 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {product.spec_dimensions && (
                      <tr style={{ borderBottom: '1px solid #f5f1ea' }}>
                        <td style={{ padding: '14px 16px', fontWeight: 600, color: '#14140f', width: '200px' }}>Dimensions</td>
                        <td style={{ padding: '14px 16px', color: '#77736b' }}>{product.spec_dimensions}</td>
                      </tr>
                    )}
                    {product.spec_scale && (
                      <tr style={{ borderBottom: '1px solid #f5f1ea' }}>
                        <td style={{ padding: '14px 16px', fontWeight: 600, color: '#14140f' }}>Scale</td>
                        <td style={{ padding: '14px 16px', color: '#77736b' }}>{product.spec_scale}</td>
                      </tr>
                    )}
                    {product.spec_power && (
                      <tr style={{ borderBottom: '1px solid #f5f1ea' }}>
                        <td style={{ padding: '14px 16px', fontWeight: 600, color: '#14140f' }}>Power</td>
                        <td style={{ padding: '14px 16px', color: '#77736b' }}>{product.spec_power}</td>
                      </tr>
                    )}
                    {product.spec_lighting && (
                      <tr style={{ borderBottom: '1px solid #f5f1ea' }}>
                        <td style={{ padding: '14px 16px', fontWeight: 600, color: '#14140f' }}>Lighting</td>
                        <td style={{ padding: '14px 16px', color: '#77736b' }}>{product.spec_lighting}</td>
                      </tr>
                    )}
                    {!product.spec_dimensions && !product.spec_scale && !product.spec_power && !product.spec_lighting && (
                      <tr><td colSpan={2} style={{ padding: '20px', color: '#9a978d', textAlign: 'center' }}>No specifications available.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* FEATURES */}
            {activeTab === 'features' && (
              <div style={{ fontSize: 14, color: '#4a4a40', lineHeight: 1.9 }}>
                {features.length > 0 ? (
                  <ul style={{ paddingLeft: 20 }}>
                    {features.map((f, i) => (
                      <li key={i} style={{ marginBottom: 12 }}>{f}</li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ color: '#9a978d' }}>No features listed.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div style={{ marginTop: 80, paddingTop: 80, borderTop: '1px solid #dfdfdf' }}>
          <h2 style={{ fontSize: 22, fontWeight: 300, color: '#14140f', marginBottom: 32, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('customer_reviews', 'Customer Reviews')}</h2>
          {reviews.length === 0 ? (
            <p style={{ color: '#77736b' }}>{t('no_reviews', 'No reviews yet.')}</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
              {reviews.map((r: any) => (
                <div key={r.id} style={{ padding: 24, border: '1px solid #dfdfdf', background: '#fafaf8' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ fontSize: 14, fontWeight: 600, color: '#14140f' }}>{r.user_name}</span><span style={{ color: '#f0c33c', fontSize: 14 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span></div>
                  <p style={{ fontSize: 14, color: '#77736b', lineHeight: 1.6 }}>{r.comment}</p>
                  {r.reply && (
                    <div style={{ marginTop: 12, padding: '12px 16px', background: '#f0f6fc', borderLeft: '3px solid #2271b1', borderRadius: '0 4px 4px 0' }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: '#2271b1', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Response from Urban Garage</p>
                      <p style={{ fontSize: 13, color: '#4a4a40', lineHeight: 1.5, margin: 0 }}>{r.reply}</p>
                    </div>
                  )}
                  <p style={{ fontSize: 12, color: '#9a978d', marginTop: 8 }}>{new Date(r.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div style={{ marginTop: 80, paddingTop: 80, borderTop: '1px solid #dfdfdf' }}>
            <h2 style={{ fontSize: 22, fontWeight: 300, color: '#14140f', marginBottom: 32, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('you_may_like', 'You May Also Like')}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
              {related.map((p: any) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
      <div style={{ paddingBottom: 80 }} />
    </div>
  );
}
