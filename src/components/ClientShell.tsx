'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Props {
  children: React.ReactNode;
  serverCategories: any[];
  serverSettings: Record<string, string>;
}

export default function ClientShell({ children, serverCategories, serverSettings }: Props) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) return <>{children}</>;

  return (
    <>
      <Header serverCategories={serverCategories} serverSettings={serverSettings} />
      <main style={{ minHeight: '100vh' }}>{children}</main>
      <Footer />
    </>
  );
}
