import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Welcome to Checkout</h1>
        <p className="text-gray-600 mb-6">See payment methods</p>
        <Link href="/stripe-methods" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          View Payment Methods
        </Link>
      </div>
    </div>
  );
} 