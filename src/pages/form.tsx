'use client';

import React from 'react';
import Link from 'next/link';

export default function FormPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Stripe Checkout Form</h1>
        <p className="text-gray-600 mb-6">
          This is a placeholder for the Stripe checkout form page. In a real implementation, 
          this would redirect to Stripe's hosted checkout page.
        </p>
        
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
          <p className="text-gray-500 text-center">Stripe Checkout Form would render here</p>
        </div>
        
        <Link href="/" className="block w-full bg-blue-600 text-white text-center py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          Back to Home
        </Link>
      </div>
    </div>
  );
} 