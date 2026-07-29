'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AccountPage() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'guest'|'login'|'orders'>('guest');
  const [error, setError] = useState('');

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) {
      const parsed = JSON.parse(u);
      if (parsed.id) { setUser(parsed); loadOrders(parsed.email); setMode('orders'); }
      else { setEmail(parsed.email||''); setMode('guest'); }
    }
  }, []);

  const loadOrders = (e: string) => {
    fetch(`/api/admin/orders?email=${encodeURIComponent(e)}`)
      .then(r=>r.json()).then(d=>setOrders(Array.isArray(d)?d:[]));
  };

  const guestLookup = async (e: React.FormEvent) => {
    e.preventDefault(); if(!email)return;
    const res = await fetch(`/api/admin/orders?email=${encodeURIComponent(email)}`);
    const data = await res.json();
    if (Array.isArray(data) && data.length>0) { setOrders(data); setMode('orders'); localStorage.setItem('user',JSON.stringify({email,name:email.split('@')[0]})); }
    else setError('No orders found for this email.');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    const res = await fetch('/api/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'login',email,password})});
    const data = await res.json();
    if (data.error) { setError(data.error); return; }
    localStorage.setItem('user',JSON.stringify(data.user));
    setUser(data.user); loadOrders(data.user.email); setMode('orders');
  };

  const logout = () => { localStorage.removeItem('user'); setUser(null); setOrders([]); setMode('guest'); setEmail(''); setPassword(''); };

  const inputS: React.CSSProperties = {width:'100%',padding:'14px 16px',border:'1px solid #d1d5db',borderRadius:8,fontSize:15,outline:'none',marginBottom:16};
  const btnS: React.CSSProperties = {width:'100%',padding:'14px 0',border:'none',borderRadius:8,fontSize:16,fontWeight:600,cursor:'pointer'};

  return (<div style={{background:'#f5f1ea',minHeight:'100vh'}}>
    <div style={{maxWidth:500,margin:'0 auto',padding:'100px 24px 80px'}}>

      {mode === 'guest' && (<>
        <h1 style={{fontSize:28,fontWeight:300,color:'#14140f',marginBottom:8}}>My Account</h1>
        <p style={{color:'#77736b',marginBottom:32}}>View your orders by entering your email.</p>
        
        <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,padding:28,marginBottom:24}}>
          <h3 style={{fontSize:15,fontWeight:500,marginBottom:16}}>Quick Lookup</h3>
          <form onSubmit={guestLookup}>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@email.com" required style={inputS} />
            {error && <p style={{color:'#dc2626',fontSize:13,marginBottom:12}}>{error}</p>}
            <button type="submit" style={{...btnS,background:'#D63F1C',color:'#fff'}}>View Orders</button>
          </form>
        </div>

        <div style={{textAlign:'center'}}>
          <button onClick={()=>setMode('login')} style={{...btnS,background:'#14140f',color:'#fff',marginBottom:12}}>Log In with Password</button>
          <p style={{fontSize:13,color:'#77736b'}}>Don't have an account? <Link href="/register" style={{color:'#D63F1C',textDecoration:'none'}}>Create one</Link></p>
        </div>
      </>)}

      {mode === 'login' && (<>
        <h1 style={{fontSize:28,fontWeight:300,color:'#14140f',marginBottom:8}}>Log In</h1>
        <p style={{color:'#77736b',marginBottom:24}}>Welcome back.</p>
        <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,padding:28}}>
          <form onSubmit={handleLogin}>
            <label style={{fontSize:13,fontWeight:500,display:'block',marginBottom:4}}>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required style={inputS} />
            <label style={{fontSize:13,fontWeight:500,display:'block',marginBottom:4}}>Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required style={inputS} />
            {error && <p style={{color:'#dc2626',fontSize:13,marginBottom:12}}>{error}</p>}
            <button type="submit" style={{...btnS,background:'#D63F1C',color:'#fff',marginBottom:12}}>Log In</button>
          </form>
          <button onClick={()=>{setMode('guest');setError('');}} style={{...btnS,background:'transparent',color:'#6b7280',border:'1px solid #d1d5db'}}>← Back</button>
        </div>
      </>)}

      {mode === 'orders' && (<div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:32}}>
          <h1 style={{fontSize:28,fontWeight:300,color:'#14140f',margin:0}}>My Orders</h1>
          <button onClick={logout} style={{background:'none',border:'1px solid #d1d5db',padding:'8px 20px',borderRadius:6,fontSize:13,color:'#6b7280',cursor:'pointer'}}>Log out</button>
        </div>
        <p style={{color:'#77736b',marginBottom:32,fontSize:14}}>{user?.email || email}</p>
        {orders.length===0?<div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,padding:48,textAlign:'center'}}><p style={{color:'#6b7280'}}>No orders yet.</p><Link href="/products" style={{color:'#D63F1C',fontSize:14,textDecoration:'none',marginTop:12,display:'inline-block'}}>Start Shopping →</Link></div>:
          orders.map((order:any)=>{const step=['pending','paid','shipped','delivered'].indexOf(order.status);return(
            <div key={order.id} style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,padding:28,marginBottom:16}}>
              <div style={{display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:16,marginBottom:20}}>
                <div><h3 style={{fontSize:16,fontWeight:600,color:'#14140f',margin:'0 0 4px'}}>{order.order_number}</h3><p style={{fontSize:13,color:'#6b7280',margin:0}}>{new Date(order.created_at).toLocaleDateString()}</p></div>
                <div style={{textAlign:'right'}}>
                  <span style={{display:'inline-block',padding:'4px 12px',borderRadius:20,fontSize:12,fontWeight:600,textTransform:'capitalize',background:order.status==='delivered'?'#dcfce7':order.status==='shipped'?'#dbeafe':order.status==='paid'?'#fef3c7':'#f3f4f6',color:order.status==='delivered'?'#16a34a':order.status==='shipped'?'#2563eb':order.status==='paid'?'#d97706':'#6b7280'}}>{order.status}</span>
                  <p style={{fontSize:20,fontWeight:700,margin:'8px 0 0'}}>${order.total.toFixed(2)}</p>
                </div>
              </div>
              <div style={{display:'flex',position:'relative',marginBottom:20,paddingTop:8}}>
                <div style={{position:'absolute',top:14,left:'12%',right:'12%',height:2,background:'#e5e7eb'}}/><div style={{position:'absolute',top:14,left:'12%',height:2,background:'#D63F1C',width:`${Math.max(0,step)*25}%`}}/>
                {['Placed','Paid','Shipped','Delivered'].map((s,i)=><div key={s} style={{textAlign:'center',zIndex:1,flex:1}}><div style={{width:12,height:12,borderRadius:'50%',background:i<=step?'#D63F1C':'#e5e7eb',margin:'0 auto 4px'}}/><span style={{fontSize:9,color:i<=step?'#14140f':'#9ca3af'}}>{s}</span></div>)}
              </div>
              <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:order.tracking_number?12:0}}>{order.items?.map((item:any,i:number)=><span key={i} style={{fontSize:12,background:'#f3f4f6',padding:'4px 10px',borderRadius:4,color:'#374151'}}>{item.product_name}×{item.quantity}</span>)}</div>
              {order.tracking_number&&<div style={{paddingTop:12,borderTop:'1px solid #e5e7eb'}}><span style={{fontSize:12,color:'#6b7280'}}>📦 {order.tracking_number}</span>{order.tracking_url&&<a href={order.tracking_url} target="_blank" rel="noopener" style={{marginLeft:12,color:'#D63F1C',fontSize:13,textDecoration:'none'}}>Track →</a>}</div>}
            </div>
          )})
        }
      </div>)}

    </div>
  </div>);
}
