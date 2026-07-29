'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/CartProvider';
import { useLocale } from '@/components/LocaleProvider';
import { COUNTRIES, getStatesForCountry } from '@/lib/countries';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const { formatPrice, t } = useLocale();
  const [form, setForm] = useState({ email:'',phone:'',firstName:'',lastName:'',address:'',apartment:'',city:'',state:'',zip:'',country:'US' });
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [placing, setPlacing] = useState(false);
  const [done, setDone] = useState(false);
  const [orderNum, setOrderNum] = useState('');

  useEffect(() => { if (items.length === 0 && !done) router.push('/cart'); }, [items, done, router]);

  const shipping = subtotal >= 50 ? 0 : 5.99;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = Math.round((subtotal + shipping + tax) * 100) / 100;
  const hasStates = getStatesForCountry(form.country).length > 0;

  const validate = () => {
    const errs: Record<string,string> = {};
    if (!form.email) errs.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email';
    if (!form.firstName) errs.firstName = 'Required';
    if (!form.lastName) errs.lastName = 'Required';
    if (!form.address) errs.address = 'Required';
    if (!form.city) errs.city = 'Required';
    if (!form.state) errs.state = 'Required';
    if (!form.zip) errs.zip = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const clearError = (field: string) => setErrors(p => { const n={...p}; delete n[field]; return n; });
  const update = (field: string, value: string) => { setForm(p=>({...p,[field]:value})); if (errors[field]) clearError(field); };

  const placeOrder = async () => {
    if (!validate()) return;
    setPlacing(true);
    const res = await fetch('/api/checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items,idempotencyToken:crypto.randomUUID(),customer:{name:form.firstName+' '+form.lastName,email:form.email,phone:form.phone,address_line1:form.address+(form.apartment?', '+form.apartment:''),city:form.city,state:form.state,postal_code:form.zip,country:form.country}})});
    const data = await res.json();
    if (data.error) { setErrors({general:data.error}); setPlacing(false); return; }
    setOrderNum(data.orderNumber); setDone(true); clearCart();
    localStorage.setItem('user',JSON.stringify({email:form.email,name:form.firstName}));
  };

  const baseInput: React.CSSProperties = { width:'100%',padding:'14px 16px',borderWidth:1,borderStyle:'solid',borderColor:'#d1d5db',borderRadius:6,fontSize:15,outline:'none',background:'#fff',boxSizing:'border-box' };
  const errInput = (field:string): React.CSSProperties => errors[field] ? {...baseInput,borderColor:'#dc2626',background:'#fef2f2'} : baseInput;
  const F = ({l,field,c,required}:{l:string;field:string;c:React.ReactNode;required?:boolean}) => (
    <div style={{marginBottom:20}}>
      <label style={{fontSize:13,fontWeight:500,color:'#374151',marginBottom:6,display:'block'}}>{l}{required?' *':''}</label>
      {c}
      {errors[field] && <p style={{color:'#dc2626',fontSize:12,margin:'4px 0 0'}}>{errors[field]}</p>}
    </div>
  );

  if (done) {
    return (
      <div style={{background:'#f5f1ea',minHeight:'100vh'}}>
        
        <div style={{maxWidth:560,margin:'0 auto',padding:'120px 24px',textAlign:'center'}}>
          <span style={{fontSize:64}}>✅</span>
          <h1 style={{fontSize:28,fontWeight:300,color:'#14140f',margin:'16px 0 8px'}}>{t('order_confirmed','Order Confirmed!')}</h1>
          <p style={{color:'#77736b',marginBottom:8}}>{t('thank_you','Thank you for your order.')}</p>
          <p style={{color:'#77736b',marginBottom:24}}>{t('order_number','Order')}: <code style={{fontWeight:600,color:'#14140f',fontSize:16}}>{orderNum}</code></p>
          <Link href="/products" style={{color:'#D63F1C',fontSize:14,fontWeight:500,textDecoration:'none'}}>{t('continue_shopping','Continue Shopping')} →</Link>
          <div style={{marginTop:32,background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,padding:28,textAlign:'left'}}>
            <h3 style={{fontSize:16,fontWeight:500,marginBottom:12}}>What's next?</h3>
            <p style={{fontSize:14,color:'#6b7280',marginBottom:10}}>• Check your email for order confirmation</p>
            <p style={{fontSize:14,color:'#6b7280',marginBottom:10}}>• Track your order: <Link href="/track" style={{color:'#D63F1C'}}>Track Order</Link></p>
            <p style={{fontSize:14,color:'#6b7280'}}>• View all orders: <Link href="/account" style={{color:'#D63F1C'}}>My Account</Link></p>
          </div>
        </div>
        
      </div>
    );
  }

  return (
    <div style={{background:'#fff',minHeight:'100vh'}}>
      
      <div style={{maxWidth:1100,margin:'0 auto',padding:'100px 48px 80px'}}>
        <Link href="/cart" style={{fontSize:13,color:'#D63F1C',textDecoration:'none',display:'inline-block',marginBottom:8}}>← Cart</Link>
        <h1 style={{fontSize:28,fontWeight:400,color:'#14140f',marginBottom:40}}>Checkout</h1>
        {errors.general && <div style={{background:'#fef2f2',border:'1px solid #fecaca',padding:'14px 18px',marginBottom:24,fontSize:14,color:'#b32d2e',borderRadius:8}}>{errors.general}</div>}

        <div style={{display:'grid',gridTemplateColumns:'1fr 400px',gap:56,alignItems:'start'}}>
          <div>
            <div style={{marginBottom:40}}>
              <h2 style={{fontSize:18,fontWeight:500,color:'#14140f',marginBottom:20}}>Contact</h2>
              {F({l:'Email',field:'email',required:true,c:<input type="email" value={form.email} onChange={e=>update('email',e.target.value)} placeholder="you@email.com" style={errInput('email')} />})}
              {F({l:'Phone',field:'phone',c:<input type="tel" value={form.phone} onChange={e=>update('phone',e.target.value)} placeholder="+1 (555) 000-0000" style={baseInput} />})}
            </div>

            <div style={{marginBottom:40}}>
              <h2 style={{fontSize:18,fontWeight:500,color:'#14140f',marginBottom:20}}>{t('shipping_info','Shipping Information')}</h2>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
                {F({l:'First Name',field:'firstName',required:true,c:<input value={form.firstName} onChange={e=>update('firstName',e.target.value)} style={errInput('firstName')} />})}
                {F({l:'Last Name',field:'lastName',required:true,c:<input value={form.lastName} onChange={e=>update('lastName',e.target.value)} style={errInput('lastName')} />})}
              </div>
              {F({l:'Country / Region',field:'country',required:true,c:<select value={form.country} onChange={e=>{setForm({...form,country:e.target.value,state:'',city:''});clearError('country');}} style={{...baseInput,cursor:'pointer'}}>{COUNTRIES.map(c=><option key={c.code} value={c.code}>{c.name}</option>)}</select>})}
              {F({l:'Address',field:'address',required:true,c:<input value={form.address} onChange={e=>update('address',e.target.value)} placeholder="Street address" style={errInput('address')} />})}
              {F({l:'Apartment, suite, etc.',field:'apartment',c:<input value={form.apartment} onChange={e=>update('apartment',e.target.value)} placeholder="Apartment or suite number" style={baseInput} />})}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:20}}>
                {F({l:'City',field:'city',required:true,c:<input value={form.city} onChange={e=>update('city',e.target.value)} style={errInput('city')} />})}
                {F({l:'State / Province',field:'state',required:true,c: hasStates ? <select value={form.state} onChange={e=>update('state',e.target.value)} style={errInput('state')}><option value="">— Select —</option>{getStatesForCountry(form.country).map(s=><option key={s} value={s}>{s}</option>)}</select> : <input value={form.state} onChange={e=>update('state',e.target.value)} style={errInput('state')} />})}
                {F({l:'ZIP / Postal Code',field:'zip',required:true,c:<input value={form.zip} onChange={e=>update('zip',e.target.value)} style={errInput('zip')} />})}
              </div>
            </div>

            <div style={{marginBottom:40,padding:'24px 28px',border:'1px dashed #d1d5db',borderRadius:8,background:'#f9fafb'}}>
              <h2 style={{fontSize:18,fontWeight:500,color:'#14140f',marginBottom:8}}>Payment</h2>
              <p style={{fontSize:14,color:'#6b7280',margin:0}}>Payment will be collected after order confirmation. We will contact you to arrange payment.</p>
            </div>

            <button onClick={placeOrder} disabled={placing}
              style={{width:'100%',padding:'18px 0',background:placing?'#e5e7eb':'#D63F1C',color:placing?'#9a978d':'#fff',border:'none',borderRadius:8,fontSize:16,fontWeight:600,cursor:placing?'not-allowed':'pointer'}}>
              {placing ? 'Placing Order...' : 'Complete Order — ' + formatPrice(total)}
            </button>
          </div>

          <div style={{background:'#f9fafb',border:'1px solid #e5e7eb',borderRadius:12,padding:28,position:'sticky',top:100}}>
            <h2 style={{fontSize:18,fontWeight:500,color:'#14140f',marginBottom:24}}>{t('order_summary','Order Summary')}</h2>
            {items.map((item, idx)=>{
              const imgs = item.sku_images || (typeof item.product.images==='string' ? JSON.parse(item.product.images||'[]') : (item.product.images||[]));
              const itemPrice = item.sku_price || item.product.price;
              const itemCompare = item.sku_compare_at_price || item.product.compare_at_price;
              const hasSale = itemCompare && itemCompare > itemPrice;
              return (
                <div key={`${item.product.id}-${item.sku_value||'default'}-${idx}`} style={{display:'flex',gap:14,marginBottom:16,paddingBottom:16,borderBottom:'1px solid #e5e7eb'}}>
                  <div style={{width:64,height:64,background:'#f5f1ea',borderRadius:6,flexShrink:0,overflow:'hidden',position:'relative'}}>
                    {imgs[0] && <Image src={imgs[0]} alt="" fill style={{objectFit:'cover'}} />}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:14,fontWeight:500,color:'#14140f',margin:'0 0 4px'}}>{item.product.name}</p>
                    {item.sku_value && item.sku_value !== 'Default' && <p style={{fontSize:11,color:'#6b7280',margin:'0 0 4px'}}>{item.sku_value}</p>}
                    <p style={{fontSize:13,color:'#6b7280',margin:0}}>Qty: {item.quantity}</p>
                    <div style={{display:'flex',alignItems:'baseline',gap:6,marginTop:4}}>
                      <span style={{fontSize:13,fontWeight:600,color:hasSale?'#D63F1C':'#14140f'}}>{formatPrice(itemPrice)}</span>
                      {hasSale && <span style={{fontSize:12,color:'#9ca3af',textDecoration:'line-through'}}>{formatPrice(itemCompare!)}</span>}
                    </div>
                  </div>
                  <span style={{fontSize:14,fontWeight:600,color:'#14140f'}}>{formatPrice(itemPrice * item.quantity)}</span>
                </div>
              );
            })}
            <div style={{fontSize:14,color:'#4b5563'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}><span>Shipping</span><span>{shipping===0?'Free':formatPrice(shipping)}</span></div>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}><span>Tax (est. 8%)</span><span>{formatPrice(tax)}</span></div>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',paddingTop:16,borderTop:'2px solid #e5e7eb',marginTop:12,fontWeight:600,color:'#14140f',fontSize:18}}><span>Total</span><span style={{fontSize:20}}>{formatPrice(total)}</span></div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
