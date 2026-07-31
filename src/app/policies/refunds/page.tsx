'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';

export default function RefundsPage() {
  const [s, setS] = useState<Record<string,string>>({});
  useEffect(() => { fetch('/api/admin/settings').then(r => r.json()).then(setS); }, []);
  return <><main style={{maxWidth:800,margin:'0 auto',padding:'120px 48px 80px'}}><h1 style={{fontSize:32,fontWeight:200,color:'#14140f',marginBottom:32}}>Cancellations & Refunds</h1><div style={{fontSize:16,color:'#77736b',lineHeight:1.8,whiteSpace:'pre-wrap'}}>{s['policy_refunds']||'Loading...'}</div></main></>;
}
