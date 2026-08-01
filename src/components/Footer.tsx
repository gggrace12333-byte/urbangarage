'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const sections = {
  Navigate: [{href:'/products',label:'All Products'},{href:'/about',label:'About Us'},{href:'/contact',label:'Contact'},{href:'/cart',label:'Cart'}],
  Official: [{href:'/policies/privacy',label:'Privacy Policy'},{href:'/policies/terms',label:'Terms & Conditions'},{href:'/policies/shipping',label:'Shipping Policy'},{href:'/policies/refunds',label:'Cancellations & Refunds'}],
};

const socialIcons: Record<string, string> = {
  social_instagram: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5"/></svg>',
  social_facebook: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>',
  social_youtube: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29.94 29.94 0 0 0 1 12a29.94 29.94 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29.94 29.94 0 0 0 23 12a29.94 29.94 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>',
  social_tiktok: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>',
};

const socialLabels: Record<string, string> = {
  social_instagram: 'Instagram', social_facebook: 'Facebook', social_youtube: 'YouTube', social_tiktok: 'TikTok'
};

export default function Footer() {
  const [settings, setSettings] = useState<Record<string,string>>({'social_instagram':'https://instagram.com','social_facebook':'https://facebook.com','social_youtube':'https://youtube.com','social_tiktok':'https://tiktok.com','social_instagram_show':'1','social_facebook_show':'1','social_youtube_show':'1','social_tiktok_show':'1'});
  useEffect(() => { fetch('/api/admin/settings').then(r=>r.json()).then(setSettings); }, []);

  const logoUrl = settings['site_logo'] || '';
  const footerDesc = settings['footer_desc'] || 'Premium motorised drifting displays for 1:64 diecast collectors.';

  const visibleSocials = ['social_instagram','social_facebook','social_youtube','social_tiktok'].filter(k => {
    const showKey = k + '_show';
    return settings[showKey] !== '0' && settings[k];
  });

  return (
    <footer style={{ background: '#000', color: '#fff', padding: '80px 0 0' }}>
      <div className="ft-container" style={{ maxWidth: 1400, margin: '0 auto', padding: '0 48px' }}>
        <div className="ft-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 48, marginBottom: 64 }}>
          <div>
            <Link href="/" style={{ textDecoration: 'none' }}>
              {logoUrl ? <img src={logoUrl} alt="Logo" style={{ height: 42, width: 'auto' }} /> : <span style={{ fontSize: 20, fontWeight: 600, color: '#fff', letterSpacing: '-0.01em' }}>URBAN<span style={{ color: '#D63F1C', fontWeight: 300 }}>GARAGE</span></span>}
            </Link>
            <p style={{ fontSize: 13, color: '#77736b', lineHeight: 1.7, marginTop: 16, maxWidth: 240 }}>{footerDesc}</p>
          </div>
          {Object.entries(sections).map(([title, links]) => (
            <div key={title}>
              <h4 style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 20 }}>{title}</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {links.map(link => <li key={link.href} style={{ marginBottom: 10 }}><Link href={link.href} style={{ fontSize: 13, color: '#77736b', textDecoration: 'none' }}>{link.label}</Link></li>)}
              </ul>
            </div>
          ))}
          <div>
            <h4 style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 20 }}>Social</h4>
            <div style={{ display: 'flex', gap: 12 }}>
              {visibleSocials.map(k => (
                <a key={k} href={settings[k]} target="_blank" rel="noopener noreferrer" title={socialLabels[k]} style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#77736b', textDecoration: 'none', transition: 'all 0.2s' }}
                  dangerouslySetInnerHTML={{ __html: socialIcons[k] }} />
              ))}
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '24px 0', textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: '#555', margin: 0 }}>&copy; {new Date().getFullYear()} Urban Garage. All rights reserved.</p>
        </div>
      </div>

    <style jsx>{`
      @media (max-width: 768px) {
        footer { padding: 40px 16px !important; }
        .ft-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 24px !important; }
        .ft-container { padding: 0 !important; }
      }
    `}</style>
    </footer>
  );
}
