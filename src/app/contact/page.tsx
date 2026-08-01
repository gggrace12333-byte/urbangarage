'use client';

import { useEffect, useState } from 'react';
import { useIsMobile } from '@/lib/useIsMobile';

export default function ContactPage() {
  const isMobile = useIsMobile();
  const [settings, setSettings] = useState<Record<string,string>>({});
  useEffect(() => { fetch('/api/admin/settings').then(r=>r.json()).then(setSettings); }, []);

  const email = settings['contact_email'] || 'support@urbantrackgarage.com';

  return (
    <div style={{ background: '#fff' }}>
      
      <div style={{ background: '#000', padding: '100px 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(/products/collection-bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.3 }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1400, margin: '0 auto', padding: isMobile ? '0 16px' : '0 48px' }}>
          <p style={{ fontSize: 12, letterSpacing: '0.2em', color: '#D63F1C', fontWeight: 500, textTransform: 'uppercase', marginBottom: 12 }}>CONTACT</p>
          <h1 style={{ fontSize: 'clamp(36px,5vw,56px)', fontWeight: 200, color: '#fff', lineHeight: 1.15 }}>Get in touch.</h1>
        </div>
      </div>
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '80px 48px' }}>
        <div style={{ marginBottom: 48 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: '#9a978d', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Email</h3>
          <a href={`mailto:${email}`} style={{ fontSize: 18, color: '#14140f', textDecoration: 'none', borderBottom: '1px solid #D63F1C' }}>{email}</a>
        </div>
        <p style={{ fontSize: 16, color: '#77736b', lineHeight: 1.8 }}>We typically respond within 24 hours. For order inquiries, please include your order number.</p>
      </div>
      
    </div>
  );
}
