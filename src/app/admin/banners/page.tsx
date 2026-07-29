'use client';

import { useEffect, useState } from 'react';

interface Slide { id?: number; image: string; sort_order: number; active: boolean }

export default function BannersPage() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [overlay, setOverlay] = useState({ badge: '', heading: '', button_text: '', button_link: '/products' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const load = () => fetch('/api/admin/banners').then(r => r.json()).then(d => {
    const arr = Array.isArray(d) ? d : [];
    setSlides(arr.map((b: any) => ({ id: b.id, image: b.image, sort_order: b.sort_order || 0, active: !!b.active })));
    if (arr.length > 0) {
      setOverlay({
        badge: arr[0].title || '',
        heading: arr[0].subtitle || '',
        button_text: arr[0].button_text || '',
        button_link: arr[0].link || '/products'
      });
    }
  });
  useEffect(() => { load(); }, []);

  const addSlide = () => setSlides(prev => [...prev, { image: '', sort_order: prev.length + 1, active: true }]);

  const removeSlide = async (idx: number) => {
    const s = slides[idx];
    if (s.id) await fetch('/api/admin/banners', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: s.id }) });
    setSlides(prev => prev.filter((_, i) => i !== idx));
  };

  const updateSlide = (idx: number, image: string) => {
    setSlides(prev => prev.map((s, i) => i === idx ? { ...s, image } : s));
  };

  const uploadForSlide = async (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const fd = new FormData(); fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (data.url) updateSlide(idx, data.url);
  };

  const saveAll = async () => {
    setSaving(true);
    for (let i = 0; i < slides.length; i++) {
      const s = slides[i];
      const body = {
        image: s.image, sort_order: i + 1, active: s.active ? 1 : 0,
        title: overlay.badge, subtitle: overlay.heading,
        button_text: overlay.button_text, link: overlay.button_link
      };
      if (s.id) {
        await fetch('/api/admin/banners', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...body, id: s.id }) });
      } else {
        await fetch('/api/admin/banners', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      }
    }
    setSaving(false);
    setToast('✅ Saved!');
    setTimeout(() => setToast(''), 2500);
    load();
  };

  const isVideo = (url: string) => /\.(mp4|webm|ogg)$/i.test(url);
  const inputStyle: React.CSSProperties = { width: '100%', padding: '8px 10px', border: '1px solid #c3c4c7', fontSize: 13, borderRadius: 3 };

  return (
    <div style={{ maxWidth: 1000 }}>
      {toast && <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#00a32a', color: '#fff', padding: '12px 28px', fontSize: 14, fontWeight: 600, zIndex: 200, borderRadius: 4 }}>{toast}</div>}

      {/* Overlay text settings - set once for all slides */}
      <div className="wp-card" style={{ marginBottom: 24 }}>
        <h2>📝 Carousel Text Overlay</h2>
        <p style={{ fontSize: 12, color: '#646970', marginBottom: 16 }}>This text appears on ALL slides. Set once.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div><label style={{ fontSize: 13, fontWeight: 600 }}>Badge</label><input value={overlay.badge} onChange={e => setOverlay({ ...overlay, badge: e.target.value })} placeholder="SERIES 01 · 2026" style={inputStyle} /></div>
          <div><label style={{ fontSize: 13, fontWeight: 600 }}>Heading</label><input value={overlay.heading} onChange={e => setOverlay({ ...overlay, heading: e.target.value })} placeholder="FOR THE CARS" style={inputStyle} /></div>
          <div><label style={{ fontSize: 13, fontWeight: 600 }}>Button Text</label><input value={overlay.button_text} onChange={e => setOverlay({ ...overlay, button_text: e.target.value })} placeholder="Shop Now" style={inputStyle} /></div>
          <div><label style={{ fontSize: 13, fontWeight: 600 }}>Button Link</label><input value={overlay.button_link} onChange={e => setOverlay({ ...overlay, button_link: e.target.value })} placeholder="/products" style={inputStyle} /></div>
        </div>
      </div>

      {/* Slides - just images/videos */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>🖼️ Carousel Slides ({slides.length})</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={addSlide} className="wp-btn wp-btn-outline">+ Add Image/Video</button>
          <button onClick={saveAll} disabled={saving} className="wp-btn wp-btn-primary">{saving ? 'Saving...' : 'Save All'}</button>
        </div>
      </div>

      {slides.length === 0 ? (
        <div className="wp-card" style={{ textAlign: 'center', padding: 60 }}>
          <p style={{ color: '#646970' }}>No slides. Add images or videos to create the carousel.</p>
          <button onClick={addSlide} className="wp-btn wp-btn-primary" style={{ marginTop: 12 }}>+ Add Image/Video</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {slides.map((slide, idx) => (
            <div key={idx} className="wp-card" style={{ marginBottom: 0, padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#646970' }}>Slide {idx + 1}</span>
                <button onClick={() => removeSlide(idx)} className="wp-btn wp-btn-danger" style={{ padding: '2px 8px', fontSize: 11 }}>✕</button>
              </div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                <input value={slide.image} onChange={e => updateSlide(idx, e.target.value)} placeholder="Image/Video URL" style={{ ...inputStyle, flex: 1 }} />
                <input id={`file-${idx}`} type="file" accept="image/*,video/*" onChange={e => uploadForSlide(idx, e)} style={{ display: 'none' }} />
                <button type="button" onClick={() => (document.getElementById(`file-${idx}`) as HTMLInputElement)?.click()} className="wp-btn wp-btn-outline" style={{ fontSize: 12, whiteSpace: 'nowrap', flexShrink: 0 }}>📷</button>
              </div>
              {slide.image && (
                <div style={{ width: '100%', aspectRatio: '16/9', background: '#f0f0f1', overflow: 'hidden', borderRadius: 4, border: '1px solid #dcdcde' }}>
                  {isVideo(slide.image) ? (
                    <video src={slide.image} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <img src={slide.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
