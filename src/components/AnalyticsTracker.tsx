'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

async function getCountry(): Promise<string> {
  try {
    const res = await fetch('https://ipapi.co/json/');
    const data = await res.json();
    return data.country_name || 'Unknown';
  } catch {
    return 'Unknown';
  }
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const countryRef = useRef<string>('Unknown');

  useEffect(() => {
    getCountry().then(c => { countryRef.current = c; });
  }, []);

  useEffect(() => {
    if (!pathname) return;
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'pageview', page: pathname, country: countryRef.current }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}
