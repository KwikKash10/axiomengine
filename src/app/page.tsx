'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Stripe Payment Integration
          </h1>
          <p className="text-xl text-gray-600">
            Choose your preferred payment integration method
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 max-w-lg mx-auto">
          {/* Card 1 - Payment Link */}
          <Link href="/link" className="block group">
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transition-all duration-200 hover:shadow-lg hover:border-blue-300">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-purple-100 p-3 rounded-full mr-4">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Shareable Payment Link
                  </h3>
                </div>
                <p className="text-gray-600">
                  Create payment links that can be shared via email, social media, or messaging apps
                </p>
              </div>
            </div>
          </Link>

          {/* Card 2 - Redirect Checkout */}
          <Link href="/form" className="block group">
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transition-all duration-200 hover:shadow-lg hover:border-blue-300">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-green-100 p-3 rounded-full mr-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Pre-built Checkout Form (Redirect)
                  </h3>
                </div>
                <p className="text-gray-600">
                  Redirect customers to Stripe's hosted checkout page for a secure payment experience
                </p>
              </div>
            </div>
          </Link>

          {/* Card 3 - Embedded Checkout */}
          <Link href="/embedded-checkout" className="block group">
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transition-all duration-200 hover:shadow-lg hover:border-blue-300">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Pre-built Checkout Form (Embedded)
                  </h3>
                </div>
                <p className="text-gray-600">
                  Embed Stripe's checkout form directly on your site with an iframe for a seamless experience
                </p>
              </div>
            </div>
          </Link>

          {/* Card 4 - Elements */}
          <Link href="/embedded" className="block group">
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transition-all duration-200 hover:shadow-lg hover:border-blue-300">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-orange-100 p-3 rounded-full mr-4">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Embedded Components
                  </h3>
                </div>
                <p className="text-gray-600">
                  Simple embedded payment form with Stripe Elements
                </p>
              </div>
            </div>
          </Link>

          {/* Card 5 - Advanced Elements Form */}
          <Link href="/embedded-components" className="block group">
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transition-all duration-200 hover:shadow-lg hover:border-blue-300">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-purple-100 p-3 rounded-full mr-4">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Advanced Elements Form
                  </h3>
                </div>
                <p className="text-gray-600">
                  Feature-rich payment form with plan selection
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
} 