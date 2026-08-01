'use client';

import Link from 'next/link';
import { useCart } from '@/components/CartProvider';
import AnnouncementBar from '@/components/AnnouncementBar';
import { Search, ShoppingBag, Menu, X, User } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useIsMobile } from '@/lib/useIsMobile';

interface HeaderProps {
  serverCategories?: any[];
  serverSettings?: Record<string, string>;
}

export default function Header({ serverCategories = [], serverSettings = {} }: HeaderProps) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { itemCount } = useCart();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Initialize from server props (SSR-safe) or localStorage (client cache)
  const [categories, setCategories] = useState<any[]>(() => {
    if (serverCategories.length > 0) return serverCategories;
    if (typeof window === 'undefined') return [];
    try { const d = localStorage.getItem('ug-cats'); return d ? JSON.parse(d) : []; } catch { return []; }
  });

  const [logoUrl, setLogoUrl] = useState(() => {
    if (serverSettings.site_logo) return serverSettings.site_logo;
    if (typeof window === 'undefined') return '';
    try { return localStorage.getItem('ug-logo') || ''; } catch { return ''; }
  });

  // Background refresh — keep data current without causing flash
  useEffect(() => {
    fetch('/api/admin/categories')
      .then(r => r.json())
      .then(d => {
        const cats = Array.isArray(d) ? d : [];
        if (cats.length > 0) {
          setCategories(cats);
          try { localStorage.setItem('ug-cats', JSON.stringify(cats)); } catch {}
        }
      })
      .catch(() => {});

    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(d => {
        if (d.site_logo) {
          setLogoUrl(d.site_logo);
          try { localStorage.setItem('ug-logo', d.site_logo); } catch {}
        }
      })
      .catch(() => {});
  }, []); // Runs once — Header persists in layout

  // Search debounce
  useEffect(() => {
    if (searchQuery.length < 2) { setSearchResults([]); return; }
    const t = setTimeout(() => {
      fetch('/api/search?q=' + encodeURIComponent(searchQuery))
        .then(r => r.json())
        .then(setSearchResults)
        .catch(() => {});
    }, 200);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Close search on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Active state detection
  const isActive = (href: string): boolean => {
    if (href === '/') return pathname === '/';
    if (href.startsWith('/products/category/')) return pathname === href;
    if (href === '/products') return pathname === '/products' || pathname.startsWith('/products?');
    return pathname === href;
  };

  const navs = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'All Products' },
    ...categories.map((c: any) => ({
      href: `/products/category/${c.slug}`,
      label: c.name,
    })),
    { href: '/about', label: 'About Us' },
  ];

  return (
    <>
      <AnnouncementBar serverAnnLeft={serverSettings.announcement_left} serverAnnRight={serverSettings.announcement_right} />
      <header style={{ background: '#000', position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="header-inner" style={{ maxWidth: 1400, margin: '0 auto', padding: '0 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', flexShrink: 0, display: 'flex', alignItems: 'center', height: 48 }}>
            {logoUrl ? (
              <img src={logoUrl} alt="Urban Garage" style={{ height: 48, width: 'auto' }} />
            ) : (
              <span style={{ fontSize: 22, fontWeight: 600, color: '#fff', letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
                URBAN<span style={{ color: '#D63F1C', fontWeight: 300 }}>GARAGE</span>
              </span>
            )}
          </Link>

          {/* Desktop nav — CSS media query controls visibility */}
          <nav className="desktop-nav" style={{ display: 'flex', gap: 32 }}>
            {navs.map(n => {
              const active = isActive(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  style={{
                    fontSize: 14,
                    color: active ? '#D63F1C' : '#77736b',
                    textDecoration: 'none',
                    paddingBottom: 2,
                    borderBottom: active ? '2px solid #D63F1C' : '2px solid transparent',
                    whiteSpace: 'nowrap',
                    transition: 'color 0.15s, border-color 0.15s',
                  }}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {/* Search */}
            {!isMobile && <div ref={searchRef} className="desktop-search" style={{ position: 'relative' }}>
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                style={{ background: 'none', border: 'none', color: '#77736b', cursor: 'pointer', padding: 0 }}
                aria-label="Search"
              >
                <Search size={18} />
              </button>
              {searchOpen && (
                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 12, width: 320, background: '#fff', border: '1px solid #dfdfdf', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', zIndex: 60, padding: 12 }}>
                  <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search..." style={{ width: '100%', padding: '10px 12px', border: '1px solid #dfdfdf', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                  {searchResults.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      {searchResults.map((p: any) => {
                        const imgs = typeof p.images === 'string' ? JSON.parse(p.images || '[]') : (p.images || []);
                        return (
                          <Link key={p.id} href={`/products/${p.slug}`} onClick={() => setSearchOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', textDecoration: 'none', borderBottom: '1px solid #f5f1ea' }}>
                            <div style={{ width: 40, height: 40, background: '#f5f1ea', flexShrink: 0 }}>
                              {imgs[0] && <img src={imgs[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                            </div>
                            <div>
                              <p style={{ fontSize: 13, fontWeight: 500, color: '#14140f', margin: 0 }}>{p.name}</p>
                              <p style={{ fontSize: 12, color: '#77736b', margin: 0 }}>${p.price?.toFixed(2)}</p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
            </div>}

            <Link href="/account" style={{ color: '#77736b', display: 'flex' }} aria-label="Account"><User size={18} /></Link>
            <Link href="/cart" style={{ color: '#77736b', display: 'flex', position: 'relative' }} aria-label="Cart">
              <ShoppingBag size={18} />
              {itemCount > 0 && (
                <span style={{ position: 'absolute', top: -6, right: -6, background: '#D63F1C', color: '#fff', fontSize: 10, width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>{itemCount}</span>
              )}
            </Link>

            <button onClick={() => setOpen(!open)} className="mobile-menu-btn" style={{ background: 'none', border: 'none', color: '#77736b', cursor: 'pointer', padding: 0 }} aria-label="Menu">
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>


          {/* Mobile Search Bar */}
          {isMobile && <div className="mobile-search-bar" style={{ width: '100%', padding: '0 12px 12px' }}>
            <div style={{ display: 'flex', gap: 8, position: 'relative' }}>
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search..." style={{ flex: 1, padding: '10px 12px', border: '1px solid #333', background: '#111', color: '#fff', fontSize: 14, borderRadius: 4, outline: 'none' }} />
              <Link href="/cart" style={{ color: '#77736b', display: 'flex', position: 'relative', flexShrink: 0 }} aria-label="Cart">
                <ShoppingBag size={22} />
                {itemCount > 0 && (
                  <span style={{ position: 'absolute', top: -6, right: -6, background: '#D63F1C', color: '#fff', fontSize: 10, width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>{itemCount}</span>
                )}
              </Link>
            </div>
            {searchQuery.length >= 2 && (
              <div style={{ marginTop: 8, background: '#111', border: '1px solid #333', maxHeight: 300, overflow: 'auto' }}>
                {searchResults.map((p: any) => {
                  const imgs = typeof p.images === 'string' ? JSON.parse(p.images || '[]') : (p.images || []);
                  return (
                    <Link key={p.id} href={`/products/${p.slug}`} onClick={() => { setSearchQuery(''); setSearchResults([]); }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', textDecoration: 'none', borderBottom: '1px solid #222' }}>
                      <div style={{ width: 36, height: 36, background: '#1a1a1a', flexShrink: 0 }}>
                        {imgs[0] && <img src={imgs[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 500, color: '#fff', margin: 0 }}>{p.name}</p>
                        <p style={{ fontSize: 12, color: '#999', margin: 0 }}>${p.price?.toFixed(2)}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

        {/* Mobile nav */}
        {open && (
          <div className="mobile-nav" style={{ background: '#000', borderTop: '1px solid rgba(255,255,255,0.1)', padding: '24px 48px' }}>
            {navs.map(n => (
              <Link key={n.href} href={n.href} onClick={() => setOpen(false)} style={{ display: 'block', padding: '10px 0', fontSize: 14, color: isActive(n.href) ? '#D63F1C' : '#77736b', textDecoration: 'none' }}>{n.label}</Link>
            ))}
          </div>
        )}
      </header>

      <style jsx>{`
        .mobile-menu-btn { display: none; }
        .desktop-nav { display: flex; }
        .desktop-search { display: flex; }
        .mobile-search-bar { display: none; }
        @media (max-width: 768px) {
          .desktop-nav { display: none; }
          .desktop-search { display: none; }
          .mobile-menu-btn { display: block; }
          .mobile-search-bar { display: flex; }
          .header-inner { padding: 0 12px !important; height: 52px !important; }
          .mobile-nav { padding: 16px !important; }
        }
        @media (min-width: 769px) {
          .mobile-nav { display: none; }
          .mobile-search-bar { display: none; }
        }
      `}</style>
    </>
  );
}
