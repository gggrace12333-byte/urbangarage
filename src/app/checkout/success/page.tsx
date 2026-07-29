'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/components/CartProvider';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const orderNumber = searchParams.get('order');
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    if (!cleared) {
      clearCart();
      setCleared(true);
    }
  }, [clearCart, cleared]);

  return (
    <div className="text-center py-16">
      <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
      <h1 className="text-3xl font-bold text-white mb-4">Order Confirmed!</h1>
      <p className="text-gray-400 mb-2">Thank you for your purchase.</p>
      {orderNumber && (
        <p className="text-sm text-gray-500 mb-8">
          Order number: <span className="text-white font-mono">{orderNumber}</span>
        </p>
      )}
      <p className="text-gray-500 text-sm mb-8">
        You will receive a confirmation email shortly.
      </p>
      <Link
        href="/products"
        className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-medium transition-all"
      >
        Continue Shopping
      </Link>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <>
      
      <main className="pt-16 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <Suspense fallback={<div className="text-center py-16"><p className="text-gray-400">Loading...</p></div>}>
            <SuccessContent />
          </Suspense>
        </div>
      </main>
      
    </>
  );
}
