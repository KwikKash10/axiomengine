import React from 'react';
import ClientOnly from './ClientOnly';
import Link from 'next/link';
import PageExtras from './PageExtras';

interface CheckoutPageWrapperProps {
  children: React.ReactNode;
}

/**
 * CheckoutPageWrapper component that wraps the checkout page content.
 * This component ensures that the checkout page content is only rendered on the client side
 * to prevent hydration issues.
 */
export default function CheckoutPageWrapper({ children }: CheckoutPageWrapperProps) {
  return (
    <>
      <ClientOnly fallback={<div className="min-h-screen bg-transparent py-2 px-3 sm:px-4">
        <div className="w-full">
          <div className="mb-4">
            <Link href="https://getino.app/pricing" className="flex items-center text-gray-600 hover:text-gray-900">
              Back to Pricing
            </Link>
          </div>
          <div className="text-center py-12">
            <p>Loading Secure Checkout...</p>
          </div>
        </div>
      </div>}>
        {children}
      </ClientOnly>
      <PageExtras />
    </>
  );
} 