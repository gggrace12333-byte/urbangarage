'use client';

import { useEffect, useState } from 'react';
import { useLocale } from '@/components/LocaleProvider';

const CURRENCIES = [{ code: 'USD', symbol: '$' }, { code: 'EUR', symbol: '€' }, { code: 'GBP', symbol: '£' }];

interface Props {
  serverAnnLeft?: string;
  serverAnnRight?: string;
}

export default function AnnouncementBar({ serverAnnLeft, serverAnnRight }: Props) {
  const { currency, setCurrency } = useLocale();

  // Init from server props first (SSR), then localStorage, then defaults
  const [leftText, setLeftText] = useState(() => {
    if (serverAnnLeft) return serverAnnLeft;
    if (typeof window === 'undefined') return 'Free US Shipping on Every Order';
    try { return localStorage.getItem('ug-ann-left') || 'Free US Shipping on Every Order'; } catch { return 'Free US Shipping on Every Order'; }
  });

  const [rightText, setRightText] = useState(() => {
    if (serverAnnRight) return serverAnnRight;
    if (typeof window === 'undefined') return '30-Day Money Back Guarantee';
    try { return localStorage.getItem('ug-ann-right') || '30-Day Money Back Guarantee'; } catch { return '30-Day Money Back Guarantee'; }
  });

  // Background refresh
  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(d => {
        const l = d.announcement_left;
        const r = d.announcement_right;
        if (l) { setLeftText(l); try { localStorage.setItem('ug-ann-left', l); } catch {} }
        if (r) { setRightText(r); try { localStorage.setItem('ug-ann-right', r); } catch {} }
      })
      .catch(() => {});
  }, []);

  return (
    <div style={{ background: '#000', color: '#fff', fontSize: 12, fontWeight: 500, padding: '8px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span>{leftText} <span style={{ margin: '0 8px', opacity: 0.2 }}>|</span> {rightText}</span>
      <select value={currency} onChange={e => setCurrency(e.target.value)} style={{ background: '#000', color: '#fff', border: '1px solid #333', fontSize: 11, padding: '2px 4px', cursor: 'pointer' }}>
        {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} {c.symbol}</option>)}
      </select>
    </div>
  );
}
