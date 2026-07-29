'use client';

import { useEffect, useState, memo } from 'react';

const Field = memo(function Field({ k, label, ta, value, onChange }: { k: string; label: string; ta?: boolean; ph?: string; value: string; onChange: (k: string, v: string) => void }) {
  return <div style={{marginBottom:14}}><label style={{fontSize:13,fontWeight:600}}>{label}</label>{ta?<textarea rows={6} value={value} onChange={e=>onChange(k,e.target.value)} />:<input value={value} onChange={e=>onChange(k,e.target.value)} />}</div>;
});

export default function EmailTemplatesPage() {
  const [s,setS]=useState<Record<string,string>>({}); const [saving,setSaving]=useState(false); const [toast,setToast]=useState('');
  useEffect(()=>{fetch('/api/admin/settings').then(r=>r.json()).then(setS);},[]);
  const update=(k:string,v:string)=>setS(p=>({...p,[k]:v}));
  const save=async()=>{setSaving(true);await fetch('/api/admin/settings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(s)});setSaving(false);setToast('✅ Saved!');setTimeout(()=>setToast(''),2500);};

  const defaultSubject = `Order Confirmed — {{order_number}}`;

  return (
    <div style={{maxWidth:1000}}>
      {toast&&<div style={{position:'fixed',bottom:24,left:'50%',transform:'translateX(-50%)',background:'#00a32a',color:'#fff',padding:'12px 28px',fontSize:14,fontWeight:600,zIndex:200,borderRadius:4}}>{toast}</div>}
      <div className="wp-card" style={{marginBottom:24}}>
        <h2>📧 Order Confirmation Email</h2>
        <p style={{fontSize:12,color:'#646970',marginBottom:16}}>Sent to customer when they place an order. Use {'{{'} order_number {'}}'}, {'{{'} customer_name {'}}'}, {'{{'} items_list {'}}'}, {'{{'} total {'}}'} as placeholders.</p>
        <Field k="email_subject" label="Subject" value={s['email_subject']||''} onChange={update} ph={defaultSubject} />
        <Field k="email_heading" label="Heading" value={s['email_heading']||''} onChange={update} ph="Thank you for your order!" />
        <Field k="email_body" label="Body Text (above order details)" ta value={s['email_body']||''} onChange={update} ph="Your order has been confirmed..." />
        <Field k="email_footer" label="Footer Text" ta value={s['email_footer']||''} onChange={update} ph="If you have any questions, reply to this email." />
      </div>
      <button onClick={save} disabled={saving} className="wp-btn wp-btn-primary">{saving?'Saving...':'Save'}</button>
    </div>
  );
}
