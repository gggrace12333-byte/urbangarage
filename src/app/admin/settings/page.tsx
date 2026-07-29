'use client';

import { useEffect, useState, memo, useRef } from 'react';

const Field = memo(function Field({ k, label, ta, ph, value, onChange, hasUpload }: { k: string; label: string; ta?: boolean | number; ph?: string; value: string; onChange: (k: string, v: string) => void; hasUpload?: boolean }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const isVideo = (url: string) => /\.(mp4|webm|ogg)$/i.test(url);
  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    const fd = new FormData(); fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (data.url) onChange(k, data.url);
    setUploading(false);
  };
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 13, fontWeight: 600 }}>{label}</label>
      {ta ? <textarea rows={8} style={{minHeight:180,height:'auto'}} value={value} onChange={e => onChange(k, e.target.value)} placeholder={ph} /> : (
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={value} onChange={e => onChange(k, e.target.value)} placeholder={ph} style={{ flex: 1 }} />
          {hasUpload && <><input ref={fileRef} type="file" accept="image/*,video/*" onChange={upload} style={{ display: 'none' }} /><button type="button" onClick={() => fileRef.current?.click()} className="wp-btn wp-btn-outline" disabled={uploading} style={{ fontSize: 12, whiteSpace: 'nowrap' }}>📷</button></>}
        </div>
      )}
      {hasUpload && value && <div style={{ marginTop: 8, width: 320, height: 60, background: '#f0f0f1', overflow: 'hidden', borderRadius: 2, border: '1px solid #dcdcde' }}>{isVideo(value) ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', fontSize: 48 }}>🎬</span> : <img src={value} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />}</div>}
    </div>
  );
});

export default function SettingsPage() {
  const [s, setS] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  useEffect(() => { fetch('/api/admin/settings').then(r => r.json()).then(setS); }, []);
  const update = (k: string, v: string) => setS(p => ({ ...p, [k]: v }));
  const save = async () => { setSaving(true); await fetch('/api/admin/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(s) }); setSaving(false); setToast('✅ Saved!'); setTimeout(() => setToast(''), 2500); };

  const socialPlatforms = [
    { key: 'social_instagram', label: 'Instagram', icon: '📷' },
    { key: 'social_facebook', label: 'Facebook', icon: '📘' },
    { key: 'social_youtube', label: 'YouTube', icon: '▶️' },
    { key: 'social_tiktok', label: 'TikTok', icon: '🎵' },
  ];

  return (
    <div style={{ maxWidth: 1200 }}>
      {toast && <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#00a32a', color: '#fff', padding: '12px 28px', fontSize: 14, fontWeight: 600, zIndex: 200, borderRadius: 4 }}>{toast}</div>}

      
      <div className="wp-card" style={{ marginBottom: 24 }}>
        <h2>🔧 Section Toggles</h2>
        <p style={{ fontSize: 12, color: '#646970', marginBottom: 12 }}>Show or hide each homepage section.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {[{k:'show_marquee',l:'Marquee'},{k:'show_how',l:'How It Works'},{k:'show_featured',l:'Featured'},{k:'show_products',l:'Products'},{k:'show_story',l:'Story'},{k:'show_voices',l:'Voices'}].map(t => (
            <label key={t.k} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" checked={s[t.k] !== '0'} onChange={e => update(t.k, e.target.checked ? '1' : '0')} style={{ width: 'auto' }} /> {t.l}
            </label>
          ))}
        </div>
      </div>

<div className="wp-card" style={{ marginBottom: 24 }}><h2>📝 Homepage Content</h2><Field k="marquee_text" label="Marquee Text" value={s['marquee_text'] || ''} onChange={update} /><Field k="how_title" label="How It Works Title" value={s['how_title'] || ''} onChange={update} /><Field k="how_desc" label="How It Works Description" ta value={s['how_desc'] || ''} onChange={update} />
      <div style={{marginTop:8,padding:'12px 14px',background:'#f9f9f9',borderRadius:4}}>
        <p style={{fontSize:12,fontWeight:600,marginBottom:8}}>Step 1</p>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <Field k="step1_title" label="Title" value={s['step1_title']||''} onChange={update} ph="Plug it in" />
          <Field k="step1_desc" label="Description" value={s['step1_desc']||''} onChange={update} ph="Simple USB power connection." />
        </div>
      </div>
      <div style={{marginTop:8,padding:'12px 14px',background:'#f9f9f9',borderRadius:4}}>
        <p style={{fontSize:12,fontWeight:600,marginBottom:8}}>Step 2</p>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <Field k="step2_title" label="Title" value={s['step2_title']||''} onChange={update} ph="Place your car" />
          <Field k="step2_desc" label="Description" value={s['step2_desc']||''} onChange={update} ph="Works with all 1:64 scale cars." />
        </div>
      </div>
      <div style={{marginTop:8,padding:'12px 14px',background:'#f9f9f9',borderRadius:4}}>
        <p style={{fontSize:12,fontWeight:600,marginBottom:8}}>Step 3</p>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <Field k="step3_title" label="Title" value={s['step3_title']||''} onChange={update} ph="Enjoy the drift" />
          <Field k="step3_desc" label="Description" value={s['step3_desc']||''} onChange={update} ph="Smooth 360° drifting experience." />
        </div>
      </div><Field k="featured_title" label="Featured Section Title" value={s['featured_title'] || ''} onChange={update} /><Field k="featured_subtitle" label="Featured Section Subtitle" value={s['featured_subtitle'] || ''} onChange={update} /><Field k="story_text" label="Story Text" ta value={s['story_text'] || ''} onChange={update} /><Field k="story_founder" label="Story Founder" value={s['story_founder'] || ''} onChange={update} /><Field k="story_video" label="Story Video (optional)" value={s['story_video'] || ''} onChange={update} hasUpload /></div>

      
      <div className="wp-card" style={{ marginBottom: 24 }}>
        <h2>🏢 About Us Page</h2>
        <p style={{ fontSize: 12, color: '#646970', marginBottom: 12 }}>Content for the About page.</p>
        <Field k="about_hero_title" label="Hero Heading" value={s['about_hero_title'] || ''} onChange={update} ph="We make things that work better and last longer." />
        <Field k="about_intro" label="Introduction" ta value={s['about_intro'] || ''} onChange={update} ph="Urban Garage was founded..." />
        <Field k="about_body" label="Body Text" ta value={s['about_body'] || ''} onChange={update} />
        <Field k="about_quote" label="Quote" value={s['about_quote'] || ''} onChange={update} ph="We believe great products..." />
        <Field k="about_quote_author" label="Quote Author" value={s['about_quote_author'] || ''} onChange={update} ph="Urban Garage Team" />
        <Field k="about_bg_image" label="Hero Background Image" value={s['about_bg_image'] || ''} onChange={update} hasUpload /><Field k="about_image" label="Body Image" value={s['about_image'] || ''} onChange={update} hasUpload />
        <Field k="about_stat1_num" label="Stat 1 Number" value={s['about_stat1_num'] || ''} onChange={update} ph="5,000+" />
        <Field k="about_stat1_label" label="Stat 1 Label" value={s['about_stat1_label'] || ''} onChange={update} ph="Happy Customers" />
        <Field k="about_stat2_num" label="Stat 2 Number" value={s['about_stat2_num'] || ''} onChange={update} ph="30-Day" />
        <Field k="about_stat2_label" label="Stat 2 Label" value={s['about_stat2_label'] || ''} onChange={update} ph="Money Back" />
        <Field k="about_stat3_num" label="Stat 3 Number" value={s['about_stat3_num'] || ''} onChange={update} ph="Free" />
        <Field k="about_stat3_label" label="Stat 3 Label" value={s['about_stat3_label'] || ''} onChange={update} ph="US Shipping $50+" />
      </div>

<div className="wp-card" style={{ marginBottom: 24 }}><h2>🎨 Branding</h2><p style={{ fontSize: 12, color: '#646970', marginBottom: 12 }}>Logo and footer text.</p><Field k="site_logo" label="Logo Image (PNG, ~200×40px)" value={s['site_logo'] || ''} onChange={update} hasUpload /><Field k="footer_desc" label="Footer Description" ta value={s['footer_desc'] || ''} onChange={update} ph="Premium motorised drifting displays..." /></div>

      <div className="wp-card" style={{ marginBottom: 24 }}><h2>📢 Top Announcement Bar</h2><p style={{ fontSize: 12, color: '#646970', marginBottom: 12 }}>Text shown in the black bar at the very top of the website.</p><Field k="announcement_left" label="Left Text" value={s['announcement_left'] || ''} onChange={update} ph="Free US Shipping on Every Order" /><Field k="announcement_right" label="Right Text" value={s['announcement_right'] || ''} onChange={update} ph="30-Day Money Back Guarantee" /></div>

      
      <div className="wp-card" style={{ marginBottom: 24 }}>
        <h2>🗣️ Voices of Our Customers</h2>
        <p style={{ fontSize: 12, color: '#646970', marginBottom: 12 }}>Customer testimonials with images/videos.</p>
        <Field k="voices_title" label="Section Title" value={s['voices_title'] || ''} onChange={update} ph="VOICES OF OUR CUSTOMERS" />
        {[1,2,3].map(n => (
          <div key={n} style={{ marginBottom: 12, padding: '10px 14px', background: '#f9f9f9', borderRadius: 4 }}>
            <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Testimonial {n}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field k={`voice${n}_name`} label="Name" value={s[`voice${n}_name`] || ''} onChange={update} ph="Alex M." />
              <Field k={`voice${n}_media`} label="Image/Video" value={s[`voice${n}_media`] || ''} onChange={update} hasUpload />
            </div>
            <Field k={`voice${n}_text`} label="Quote" ta value={s[`voice${n}_text`] || ''} onChange={update} ph="Amazing product!..." />
          </div>
        ))}
      </div>

<div className="wp-card" style={{ marginBottom: 24 }}><h2>📄 Official Pages</h2><Field k="policy_privacy" ta={8} label="Privacy Policy" value={s['policy_privacy'] || ''} onChange={update} /><Field k="policy_terms" ta={8} label="Terms & Conditions" value={s['policy_terms'] || ''} onChange={update} /><Field k="policy_shipping" ta={8} label="Shipping Policy" value={s['policy_shipping'] || ''} onChange={update} /><Field k="policy_refunds" ta={8} label="Cancellations & Refunds" value={s['policy_refunds'] || ''} onChange={update} /></div>

      <div className="wp-card" style={{ marginBottom: 24 }}>
        <h2>🔗 Social Media</h2>
        <p style={{ fontSize: 12, color: '#646970', marginBottom: 16 }}>Fill in the URL and toggle Show/Hide for each platform.</p>
        {socialPlatforms.map(p => {
          const showKey = p.key + '_show';
          return (
            <div key={p.key} style={{ marginBottom: 14, padding: '10px 14px', background: '#f9f9f9', borderRadius: 4, display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ fontSize: 20, width: 30 }}>{p.icon}</span>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{p.label} URL</label>
                <input value={s[p.key] || ''} onChange={e => update(p.key, e.target.value)} placeholder={`https://${p.label.toLowerCase()}.com/yourhandle`} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                <input type="checkbox" checked={s[showKey] !== '0'} onChange={e => update(showKey, e.target.checked ? '1' : '0')} style={{ width: 'auto' }} /> Show
              </label>
            </div>
          );
        })}
      </div>

      <div className="wp-card" style={{ marginBottom: 24 }}>
        <h2>📧 Contact</h2>
        <Field k="contact_email" label="Contact Email" value={s['contact_email'] || ''} onChange={update} />
      </div>

      
      <div className="wp-card" style={{ marginBottom: 24 }}>
        <h2>📧 Email (SMTP) Settings</h2>
        <p style={{ fontSize: 12, color: '#646970', marginBottom: 12 }}>Configure outgoing email for order confirmations.</p>
        <Field k="smtp_host" label="SMTP Host" value={s['smtp_host'] || ''} onChange={update} ph="smtp.gmail.com" />
        <Field k="smtp_port" label="SMTP Port" value={s['smtp_port'] || ''} onChange={update} ph="587" />
        <Field k="smtp_user" label="Email Address" value={s['smtp_user'] || ''} onChange={update} ph="you@email.com" />
        <Field k="smtp_pass" label="App Password" value={s['smtp_pass'] || ''} onChange={update} ph="your-app-password" />
      </div>

      <button onClick={save} disabled={saving} className="wp-btn wp-btn-primary" style={{ marginTop: 16, fontSize: 14, padding: '10px 32px' }}>{saving ? 'Saving...' : 'Save All Settings'}</button>
    </div>
  );
}
