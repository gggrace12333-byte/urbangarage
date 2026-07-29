'use client';

import { useState } from 'react';

export default function TrackPage() {
  const [email, setEmail] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true); setError('');
    const res = await fetch(`/api/admin/orders?email=${encodeURIComponent(email)}`);
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      setOrders(data);
      setSearched(true);
    } else {
      setError('No orders found for this email.');
      setOrders([]);
      setSearched(true);
    }
    setLoading(false);
  };

  return (
    <div style={{background:'#fff',minHeight:'100vh'}}>
      
      <div style={{maxWidth:640,margin:'0 auto',padding:'100px 24px 80px'}}>
        <h1 style={{fontSize:28,fontWeight:300,color:'#14140f',marginBottom:8}}>Track Your Order</h1>
        <p style={{color:'#77736b',marginBottom:32}}>Enter your email to find your orders.</p>

        {!searched && (
          <form onSubmit={lookup} style={{background:'#f9fafb',border:'1px solid #e5e7eb',borderRadius:12,padding:32}}>
            <div style={{marginBottom:24}}>
              <label style={{fontSize:13,fontWeight:500,color:'#374151',marginBottom:6,display:'block'}}>Email</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="you@email.com" style={{width:'100%',padding:'14px 16px',border:'1px solid #d1d5db',borderRadius:8,fontSize:15,outline:'none'}} />
            </div>
            {error && <p style={{color:'#b32d2e',fontSize:14,marginBottom:16}}>{error}</p>}
            <button type="submit" disabled={loading} style={{width:'100%',padding:'16px 0',background:'#D63F1C',color:'#fff',border:'none',borderRadius:8,fontSize:16,fontWeight:600,cursor:'pointer'}}>
              {loading ? 'Searching...' : 'Find Orders'}
            </button>
          </form>
        )}

        {searched && orders.length > 0 && (
          <div>
            <p style={{color:'#77736b',marginBottom:24}}>Found {orders.length} order{orders.length>1?'s':''} for <strong>{email}</strong></p>
            {orders.map((order:any) => {
              const step = ['pending','paid','shipped','delivered'].indexOf(order.status);
              return (
                <div key={order.id} style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,padding:28,marginBottom:16}}>
                  <div style={{display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:16,marginBottom:20}}>
                    <div>
                      <h3 style={{fontSize:16,fontWeight:600,color:'#14140f',margin:'0 0 4px'}}>Order {order.order_number}</h3>
                      <p style={{fontSize:13,color:'#6b7280',margin:0}}>{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <span style={{display:'inline-block',padding:'4px 12px',borderRadius:20,fontSize:12,fontWeight:600,textTransform:'capitalize',
                        background:order.status==='delivered'?'#dcfce7':order.status==='shipped'?'#dbeafe':order.status==='paid'?'#fef3c7':'#f3f4f6',
                        color:order.status==='delivered'?'#16a34a':order.status==='shipped'?'#2563eb':order.status==='paid'?'#d97706':'#6b7280'
                      }}>{order.status}</span>
                      <p style={{fontSize:20,fontWeight:700,margin:'8px 0 0'}}>${order.total.toFixed(2)}</p>
                    </div>
                  </div>

                  <div style={{display:'flex',position:'relative',marginBottom:20,paddingTop:8}}>
                    <div style={{position:'absolute',top:14,left:'12%',right:'12%',height:2,background:'#e5e7eb'}}/>
                    <div style={{position:'absolute',top:14,left:'12%',height:2,background:'#D63F1C',width:`${Math.max(0,step)*25}%`}}/>
                    {['Placed','Paid','Shipped','Delivered'].map((s,i)=><div key={s} style={{textAlign:'center',zIndex:1,flex:1}}><div style={{width:12,height:12,borderRadius:'50%',background:i<=step?'#D63F1C':'#e5e7eb',margin:'0 auto 4px'}}/><span style={{fontSize:9,color:i<=step?'#14140f':'#9ca3af'}}>{s}</span></div>)}
                  </div>

                  <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:order.tracking_number?12:0}}>
                    {order.items?.map((item:any,i:number)=><span key={i} style={{fontSize:12,background:'#f3f4f6',padding:'4px 10px',borderRadius:4,color:'#374151'}}>{item.product_name}×{item.quantity}</span>)}
                  </div>

                  {order.tracking_number && (
                    <div style={{paddingTop:12,borderTop:'1px solid #e5e7eb'}}>
                      <span style={{fontSize:12,color:'#6b7280'}}>📦 {order.tracking_number}</span>
                      {order.tracking_url && <a href={order.tracking_url} target="_blank" rel="noopener" style={{marginLeft:12,color:'#D63F1C',fontSize:13,textDecoration:'none'}}>Track →</a>}
                    </div>
                  )}
                </div>
              );
            })}
            <button onClick={()=>{setSearched(false);setEmail('');setOrders([]);}} style={{marginTop:16,background:'none',border:'none',color:'#D63F1C',fontSize:14,cursor:'pointer'}}>← Search another email</button>
          </div>
        )}

        {searched && orders.length === 0 && !error && (
          <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,padding:48,textAlign:'center'}}>
            <p style={{color:'#6b7280',marginBottom:16}}>No orders found for {email}.</p>
            <button onClick={()=>{setSearched(false);setEmail('');}} style={{color:'#D63F1C',fontSize:14,background:'none',border:'none',cursor:'pointer'}}>Try another email →</button>
          </div>
        )}
      </div>
      
    </div>
  );
}
