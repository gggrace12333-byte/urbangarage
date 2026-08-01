'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const authed = typeof window !== 'undefined' && localStorage.getItem('admin_auth') === 'true';
    if (!authed) {
      router.push('/admin/login');
    }
  }, [router]);

  return <AdminShell>{children}</AdminShell>;
}
