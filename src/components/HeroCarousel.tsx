'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface BannerSlide {
  title: string;
  subtitle: string;
  image: string;
  link: string;
  button_text: string;
}

export default function HeroCarousel({ slides }: { slides: BannerSlide[] }) {
  const [current, setCurrent] = useState(0);
  const [touchStart, setTouchStart] = useState(0);

  const next = useCallback(() => setCurrent(c => (c + 1) % slides.length), [slides.length]);
  const prev = useCallback(() => setCurrent(c => (c - 1 + slides.length) % slides.length), [slides.length]);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [next, slides.length]);

  const slide = slides[current];
  const isVideo = slide.image?.match(/\.(mp4|webm|ogg)$/i);

  return (
    <section style={{ background: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}
      onTouchStart={e => setTouchStart(e.touches[0].clientX)}
      onTouchEnd={e => {
        const diff = touchStart - e.changedTouches[0].clientX;
        if (diff > 50) next();
        else if (diff < -50) prev();
      }}
    >
      {/* Background */}
      {isVideo ? (
        <video autoPlay muted loop playsInline key={slide.image}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}>
          <source src={slide.image} type={`video/${slide.image.split('.').pop()}`} />
        </video>
      ) : (
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${slide.image})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.85, transition: 'opacity 0.8s' }} />
      )}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.05) 100%)' }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10, maxWidth: 1400, margin: '0 auto', padding: '120px 48px', width: '100%' }}>
        <div style={{ maxWidth: 640 }}>
          {slide.title && <p style={{ fontSize: 14, letterSpacing: '0.3em', color: '#D63F1C', marginBottom: 24, fontWeight: 500 }}>{slide.title}</p>}
          <h1 style={{ fontSize: 'clamp(48px, 6vw, 80px)', fontWeight: 200, color: '#fff', lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: 24, whiteSpace: 'pre-line' }}>{slide.subtitle}</h1>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Link href={slide.link || '/products'} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#D63F1C', color: '#fff', border: 'none', padding: '14px 32px', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>
              {slide.button_text || 'Shop Now'} <span>→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      {slides.length > 1 && (
        <>
          <button onClick={prev} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 20, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: 48, height: 48, borderRadius: '50%', cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
          <button onClick={next} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 20, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: 48, height: 48, borderRadius: '50%', cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>

          {/* Dots */}
          <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', zIndex: 20, display: 'flex', gap: 10 }}>
            {slides.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                style={{ width: i === current ? 24 : 8, height: 8, borderRadius: 4, background: i === current ? '#D63F1C' : 'rgba(255,255,255,0.4)', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }} />
            ))}
          </div>
        </>
      )}

      {/* Trust badges */}
      <div style={{ position: 'absolute', bottom: 32, left: 48, zIndex: 20, display: 'flex', gap: 24 }}>
        {['Secure Checkout','5,000+ Happy Customers','24/7 Support','Premium Quality'].map(t =>
          <span key={t} style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{t}</span>
        )}
      </div>
    </section>
  );
}
