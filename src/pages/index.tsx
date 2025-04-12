import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Stripe Payment Integration
          </h1>
          <p className="text-xl text-gray-600">
            Choose your preferred payment integration method
          </p>
        </div>

        <div className="space-y-4">
          {/* Shareable Payment Link */}
          <Link href="/link" className="block">
            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-semibold text-gray-900">Shareable Payment Link</h2>
                  <p className="mt-1 text-gray-600">Create payment links that can be shared via email, social media, or messaging apps</p>
                </div>
              </div>
            </div>
          </Link>

          {/* Pre-built Checkout Form (Redirect) */}
          <Link href="/form" className="block">
            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-semibold text-gray-900">Pre-built Checkout Form (Redirect)</h2>
                  <p className="mt-1 text-gray-600">Redirect customers to Stripe's hosted checkout page for a secure payment experience</p>
                </div>
              </div>
            </div>
          </Link>

          {/* Pre-built Checkout Form (Embedded) */}
          <Link href="/embedded-checkout" className="block">
            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-semibold text-gray-900">Pre-built Checkout Form (Embedded)</h2>
                  <p className="mt-1 text-gray-600">Embed Stripe's checkout form directly on your site with an iframe for a seamless experience</p>
                </div>
              </div>
            </div>
          </Link>

          {/* Embedded Components */}
          <Link href="/embedded-components" className="block">
            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-semibold text-gray-900">Embedded Components</h2>
                  <p className="mt-1 text-gray-600">Simple embedded payment form with Stripe Elements</p>
                </div>
              </div>
            </div>
          </Link>

          {/* Advanced Elements Form */}
          <Link href="/embedded" className="block">
            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-semibold text-gray-900">Advanced Elements Form</h2>
                  <p className="mt-1 text-gray-600">Feature-rich payment form with plan selection</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
} 