'use client';

import { useEffect, useState } from 'react';
import { useIsMobile } from '@/lib/useIsMobile';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/components/CartProvider';
import { useLocale } from '@/components/LocaleProvider';

export default function ProductPage() {
  const isMobile = useIsMobile();
  const params = useParams();
  const { addItem } = useCart();
  const { formatPrice, t } = useLocale();
  const [product, setProduct] = useState<any>(null);
  const [qty, setQty] = useState(1);
  const [selImg, setSelImg] = useState(0);
  const [related, setRelated] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('description');
  const [variants, setVariants] = useState<any[]>([]);
  const [selVariant, setSelVariant] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/products?slug=${params.slug}`).then(r=>r.json()).then(d=>{
      setProduct(d);
      fetch(`/api/reviews?product_id=${d.id}`).then(r=>r.json()).then(rr=>setReviews(Array.isArray(rr)?rr:[]));
      fetch(`/api/admin/variants?product_id=${d.id}`).then(r=>r.json()).then(v=>setVariants(Array.isArray(v)?v:[]));
      if (d.category_name) {
        fetch(`/api/products?category=${encodeURIComponent(d.category_name)}`).then(r=>r.json()).then(arr=>{setRelated((Array.isArray(arr)?arr:[]).filter((p:any)=>p.id!==d.id).slice(0,3));});
      }
    });
  }, [params.slug]);

  if (!product) return <><div style={{minHeight:'60vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f5f1ea'}}><p style={{color:'#77736b'}}>Loading...</p></div></>;

  const images: string[] = typeof product.images==='string'?JSON.parse(product.images||'[]'):(product.images||[]);
  const tags: string[] = (product.tags||'').split(',').map((t:string)=>t.trim()).filter(Boolean);
  const hasSale = product.compare_at_price && product.compare_at_price > product.price;
  const isSoldOut = (product.inventory ?? 0) <= 0;

  const tabs = ['description','specifications','features'];

  return (
    <div style={{ background: '#fff' }}>
      
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '80px 48px 0' }}>
        {/* Top: Images + Info */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 64, alignItems: 'start', marginBottom: 80 }}>
          <div>
            <div style={{ aspectRatio: '1', background: '#f5f1ea', overflow: 'hidden', marginBottom: 12 }}>
              {(selVariant !== null && variants[selVariant]?.image) ? <Image src={variants[selVariant].image} alt={product.name} width={700} height={700} style={{width:'100%',height:'100%',objectFit:'cover'}} /> : images[selImg] ? <Image src={images[selImg]} alt={product.name} width={700} height={700} style={{width:'100%',height:'100%',objectFit:'cover'}} /> : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',color:'#9a978d'}}>Product image</div>}
            </div>
            {images.length>1 && <div style={{display:'flex',gap:8}}>{images.map((img:string,i:number)=><button key={i} onClick={()=>setSelImg(i)} style={{width:72,height:72,background:'#f5f1ea',border:i===selImg?'2px solid #D63F1C':'2px solid transparent',cursor:'pointer',padding:0,overflow:'hidden'}}><Image src={img} alt="" width={72} height={72} style={{width:'100%',height:'100%',objectFit:'cover'}} /></button>)}</div>}
          </div>

          <div>
            {product.category_name && <p style={{fontSize:12,letterSpacing:'0.2em',color:'#D63F1C',fontWeight:500,textTransform:'uppercase',marginBottom:8}}>{product.category_name}</p>}
            <h1 style={{fontSize:36,fontWeight:300,color:'#14140f',marginBottom:12,lineHeight:1.2}}>{product.name}</h1>
            {tags.length>0 && <div style={{display:'flex',gap:6,marginBottom:16}}>{tags.map((t:string)=><span key={t} style={{fontSize:10,fontWeight:600,padding:'3px 8px',background:t==='sale'?'#D63F1C':t==='limited'?'#14140f':t==='hot'?'#f97316':'#e5e7eb',color:'#fff',textTransform:'uppercase',letterSpacing:'0.05em'}}>{t}</span>)}</div>}
            {isSoldOut && <p style={{fontSize:14,fontWeight:600,color:'#b32d2e',marginBottom:16}}>{t('sold_out','SOLD OUT')}</p>}
            <div style={{display:'flex',gap:2,marginBottom:20}}>{[...Array(5)].map((_,i)=><span key={i} style={{color:i<4?'#D63F1C':'#dfdfdf',fontSize:16}}>{i<4?'★':'☆'}</span>)}<span style={{fontSize:14,color:'#77736b',marginLeft:8}}>128 {t('reviews','reviews')}</span></div>
            <div style={{display:'flex',alignItems:'baseline',gap:12,marginBottom:28}}>
              <span style={{fontSize:32,fontWeight:500,color:'#14140f'}}>{formatPrice(product.price + (selVariant !== null ? (variants[selVariant]?.price_adjustment || 0) : 0))}</span>
              {hasSale && <span style={{fontSize:18,color:'#9a978d',textDecoration:'line-through'}}>{formatPrice(product.compare_at_price)}</span>}
              {hasSale && <span style={{fontSize:13,color:'#16a34a',fontWeight:600}}>{t('you_save','Save')} {formatPrice(product.compare_at_price-product.price)}</span>}
            </div>
            {variants.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#14140f', marginBottom: 8 }}>
                  {variants[0].name || 'Option'}: <strong>{selVariant !== null ? variants[selVariant]?.value : 'Select'}</strong>
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {variants.map((v: any, i: number) => (
                    <button key={i} onClick={() => setSelVariant(i)} style={{
                      padding: '8px 16px', border: selVariant === i ? '2px solid #14140f' : '1px solid #dfdfdf',
                      background: selVariant === i ? '#14140f' : '#fff', color: selVariant === i ? '#fff' : '#14140f',
                      fontSize: 13, cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6
                    }}>
                      {v.image && <img src={v.image} alt="" style={{ width: 20, height: 20, objectFit: 'cover', borderRadius: 2 }} />}
                      {v.value}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {!isSoldOut && <>
              <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:20}}>
                <span style={{fontSize:14,color:'#77736b'}}>{t('quantity','Quantity')}</span>
                <div style={{display:'flex',border:'1px solid #dfdfdf'}}>
                  <button onClick={()=>setQty(Math.max(1,qty-1))} style={{padding:'8px 14px',border:'none',background:'none',cursor:'pointer',fontSize:16,color:'#77736b'}}>−</button>
                  <span style={{padding:'8px 20px',fontSize:14,fontWeight:500,color:'#14140f',borderLeft:'1px solid #dfdfdf',borderRight:'1px solid #dfdfdf'}}>{qty}</span>
                  <button onClick={()=>setQty(qty+1)} style={{padding:'8px 14px',border:'none',background:'none',cursor:'pointer',fontSize:16,color:'#77736b'}}>+</button>
                </div>
              </div>
              <button onClick={()=>addItem(product,qty)} style={{background:'#D63F1C',color:'#fff',border:'none',padding:'18px 0',fontSize:16,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:10,width:'100%',textTransform:'uppercase',letterSpacing:'0.05em'}}>{t('add_to_cart','Add to Cart')} — {formatPrice((product.price + (selVariant !== null ? (variants[selVariant]?.price_adjustment || 0) : 0))*qty)}</button>
            </>}
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginTop:40,paddingTop:28,borderTop:'1px solid #dfdfdf'}}>
              {['Secure Checkout','Free US Shipping $50+','30-Day Returns'].map(tx=><div key={tx} style={{fontSize:12,color:'#77736b',display:'flex',alignItems:'center',gap:8}}><span style={{color:'#D63F1C',fontSize:16}}>{tx.includes('Secure')?'🔒':tx.includes('Ship')?'📦':'↩️'}</span>{tx}</div>)}
            </div>
          </div>
        </div>

        {/* Module Tabs */}
        <div style={{ borderTop: '1px solid #dfdfdf', paddingTop: 64 }}>
          <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #dfdfdf', marginBottom: 40 }}>
            {tabs.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                padding: '16px 32px',
                fontSize: 13,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: activeTab === tab ? '#14140f' : '#9a978d',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid #D63F1C' : '2px solid transparent',
                cursor: 'pointer'
              }}>
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ maxWidth: 800 }}>
            {activeTab === 'description' && (
              <div style={{ fontSize: 15, color: '#4a4a40', lineHeight: 1.9 }}>
                <p style={{ marginBottom: 24 }}>{product.description}</p>
                <p style={{ marginBottom: 24 }}>The Urban Garage Parking Garage is a premium motorized rotating display designed for 1:64 scale diecast car collectors. Whether you are showcasing your favorite Hot Wheels, Matchbox, or Tomica models, this display brings your collection to life with smooth, continuous 360° rotation.</p>
                <p style={{ marginBottom: 24 }}>Built with high-quality materials and a whisper-quiet motor, the Parking Garage is the perfect centerpiece for any desk, shelf, or display case. Simply insert two AA batteries, place your car on the platform, and flip the switch — your car will glide in an endless, mesmerizing drift loop.</p>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div style={{ fontSize: 14, color: '#4a4a40', lineHeight: 1.9 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {[
                      ['Scale Compatibility','1:64 scale (Hot Wheels, Matchbox, Tomica, and more)'],
                      ['Power Source','2 × AA batteries (not included)'],
                      ['Motor Type','Ultra-quiet DC motor'],
                      ['Rotation Speed','Approximately 6 RPM'],
                      ['Rotation Direction','Clockwise, continuous 360°'],
                      ['Material','High-quality ABS plastic with metal bearings'],
                      ['Dimensions','Approximately 15cm × 10cm × 8cm (L×W×H)'],
                      ['Weight','Approximately 280g (without batteries)'],
                      ['Color Options','Black / Carbon Fiber / Street Style'],
                      ['Included','1 × Parking Garage unit, 1 × User manual'],
                    ].map(([label, value], i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f5f1ea' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: '#14140f', width: '40%' }}>{label}</td>
                        <td style={{ padding: '12px 16px', color: '#77736b' }}>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'features' && (
              <div style={{ fontSize: 14, color: '#4a4a40', lineHeight: 1.9 }}>
                <ul style={{ paddingLeft: 20 }}>
                  {[
                    'Battery-powered — completely cordless, works anywhere',
                    'Whisper-quiet motor — no distracting noise on your desk',
                    'Universal 1:64 compatibility — works with all major diecast brands',
                    'Smooth continuous rotation — creates an authentic drift effect',
                    'Premium build quality — ABS plastic body with metal bearings',
                    'Compact footprint — fits perfectly on any desk or shelf',
                    'Multiple color editions — match your style or collection',
                    'Easy setup — insert batteries, place car, flip the switch',
                    'Perfect gift for car enthusiasts and collectors',
                  ].map((f, i) => (
                    <li key={i} style={{ marginBottom: 12 }}>{f}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div style={{ marginTop: 80, paddingTop: 80, borderTop: '1px solid #dfdfdf' }}>
          <h2 style={{ fontSize: 22, fontWeight: 300, color: '#14140f', marginBottom: 32, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('customer_reviews','Customer Reviews')}</h2>
          {reviews.length === 0 ? (
            <p style={{ color: '#77736b' }}>{t('no_reviews','No reviews yet.')}</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
              {reviews.map((r: any) => (
                <div key={r.id} style={{ padding: 24, border: '1px solid #dfdfdf', background: '#fafaf8' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ fontSize: 14, fontWeight: 600, color: '#14140f' }}>{r.user_name}</span><span style={{ color: '#f0c33c', fontSize: 14 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</span></div>
                  <p style={{ fontSize: 14, color: '#77736b', lineHeight: 1.6 }}>{r.comment}</p>
                  <p style={{ fontSize: 12, color: '#9a978d', marginTop: 8 }}>{new Date(r.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div style={{ marginTop: 80, paddingTop: 80, borderTop: '1px solid #dfdfdf' }}>
            <h2 style={{ fontSize: 22, fontWeight: 300, color: '#14140f', marginBottom: 32, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('you_may_like','You May Also Like')}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: isMobile ? 12 : 32 }}>
              {related.map((p: any) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
      <div style={{ paddingBottom: 80 }} />
      
    </div>
  );
}
