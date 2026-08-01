'use client';

import { Suspense, useEffect, useState } from 'react';
import { useIsMobile } from '@/lib/useIsMobile';
import Image from 'next/image';

function AboutContent() {
  const [s, setS] = useState<Record<string,string>>({});
  useEffect(() => { fetch('/api/admin/settings').then(r=>r.json()).then(setS); }, []);

  const heroTitle = s['about_hero_title'] || 'We make things that work better and last longer.';
  const intro = s['about_intro'] || 'Urban Garage was founded with a simple mission.';
  const body = s['about_body'] || 'Our flagship product, the Parking Garage, was born from a passion for car culture.';
  const quote = s['about_quote'] || 'We believe great products don\'t need to be complicated.';
  const author = s['about_quote_author'] || 'Urban Garage Team';
  const img = s['about_image'] || '/products/7-11-driftpad-1.jpg';
  const bgImg = s['about_bg_image'] || '/products/collection-bg.jpg';

  return (
    <div style={{ background: '#fff' }}>
      <div style={{ background: '#000', padding: '120px 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(' + bgImg + ')', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.3 }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1400, margin: '0 auto', padding: isMobile ? '0 16px' : '0 48px' }}>
          <p style={{ fontSize: 12, letterSpacing: '0.2em', color: '#D63F1C', fontWeight: 500, textTransform: 'uppercase', marginBottom: 12 }}>ABOUT US</p>
          <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 200, color: '#fff', lineHeight: 1.15, maxWidth: 700 }}>{heroTitle}</h1>
        </div>
      </div>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '80px 48px' }}>
        <p style={{ fontSize: 18, color: '#4a4a40', lineHeight: 1.8, marginBottom: 32 }}>{intro}</p>
        <p style={{ fontSize: 16, color: '#77736b', lineHeight: 1.8, marginBottom: 32 }}>{body}</p>
        {img && <div style={{ background: '#f5f1ea', aspectRatio: '16/9', marginBottom: 64, overflow: 'hidden' }}><Image src={img} alt="About" width={1200} height={675} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
        <div style={{ borderLeft: '4px solid #D63F1C', paddingLeft: 32, marginBottom: 64 }}>
          <p style={{ fontSize: 20, color: '#14140f', lineHeight: 1.7, fontStyle: 'italic', marginBottom: 16 }}>&ldquo;{quote}&rdquo;</p>
          <p style={{ fontSize: 14, color: '#9a978d' }}>— {author}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: isMobile ? 12 : 32 }}>
          {[[s['about_stat1_num']||'5,000+',s['about_stat1_label']||'Happy Customers'],[s['about_stat2_num']||'30-Day',s['about_stat2_label']||'Money Back'],[s['about_stat3_num']||'Free',s['about_stat3_label']||'US Shipping $50+']].map(([num,label])=><div key={label} style={{textAlign:'center',padding:'40px 20px',background:'#f5f1ea'}}><p style={{fontSize:28,fontWeight:600,color:'#D63F1C',marginBottom:8}}>{num}</p><p style={{fontSize:14,color:'#77736b'}}>{label}</p></div>)}
        </div>
      </div>
    </div>
  );
}

export default function AboutPage() {
  const isMobile = useIsMobile();
  return <><Suspense fallback={null}></Suspense><AboutContent /></>;
}
