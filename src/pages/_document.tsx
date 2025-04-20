import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        
        {/* High-compatibility favicons (placed at the very top for maximum browser compatibility) */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        
        {/* Force favicon refresh with explicit caching directives */}
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        
        {/* Basic favicons first - these need to be first for best cross-browser support */}
        <link rel="shortcut icon" href="/favicons/favicon.ico?v=1" />
        <link rel="icon" href="/favicons/favicon.ico?v=1" />
        
        {/* PNG favicons for maximum mobile browser compatibility - ORDER MATTERS FOR SIZE! */}
        {/* Put largest sizes first for better display in tabs */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicons/favicon-32x32.png?v=1" />
        <link rel="icon" type="image/png" sizes="48x48" href="/favicons/favicon-48x48.png?v=1" />
        <link rel="icon" type="image/png" sizes="64x64" href="/favicons/favicon-64x64.png?v=1" />
        <link rel="icon" type="image/png" sizes="128x128" href="/favicons/favicon-128x128.png?v=1" />
        <link rel="icon" type="image/png" sizes="192x192" href="/favicons/icon-192x192.png?v=1" />
        <link rel="icon" type="image/png" sizes="256x256" href="/favicons/favicon-256x256.png?v=1" />
        {/* Smallest size last */}
        <link rel="icon" type="image/png" sizes="16x16" href="/favicons/favicon-16x16.png?v=1" />
        
        {/* SVG favicons with correct crossorigin attribute */}
        <link rel="icon" type="image/svg+xml" href="/favicons/favicon-simple.svg?v=1" crossOrigin="anonymous" />
        <link rel="icon" type="image/svg+xml" href="/favicons/favicon.svg?v=1" crossOrigin="anonymous" />
        
        {/* Safari-specific icons with proper mask-icon setting */}
        <link rel="mask-icon" href="/favicons/safari-pinned-tab.svg?v=1" color="#282958" />
        
        {/* Multiple apple touch icons with proper sizes - ORDER MATTERS! */}
        {/* Use the largest sizes first as Safari prefers them */}
        <link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon-180x180.png?v=1" />
        <link rel="apple-touch-icon" sizes="167x167" href="/favicons/apple-touch-icon-167x167.png?v=1" />
        <link rel="apple-touch-icon" sizes="152x152" href="/favicons/apple-touch-icon-152x152.png?v=1" />
        <link rel="apple-touch-icon" sizes="144x144" href="/favicons/apple-touch-icon-144x144.png?v=1" />
        <link rel="apple-touch-icon" sizes="120x120" href="/favicons/apple-touch-icon-120x120.png?v=1" />
        <link rel="apple-touch-icon" sizes="114x114" href="/favicons/apple-touch-icon-114x114.png?v=1" />
        <link rel="apple-touch-icon" sizes="76x76" href="/favicons/apple-touch-icon-76x76.png?v=1" />
        <link rel="apple-touch-icon" sizes="72x72" href="/favicons/apple-touch-icon-72x72.png?v=1" />
        <link rel="apple-touch-icon" sizes="60x60" href="/favicons/apple-touch-icon-60x60.png?v=1" />
        <link rel="apple-touch-icon" sizes="57x57" href="/favicons/apple-touch-icon-57x57.png?v=1" />
        
        {/* Legacy apple touch icon - must be after sized versions */}
        <link rel="apple-touch-icon" href="/favicons/apple-touch-icon.png?v=1" />
        <link rel="apple-touch-icon-precomposed" href="/favicons/apple-touch-icon-precomposed.png?v=1" />
        
        {/* Mobile specific meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="SECURE CHECKOUT" />
        <meta name="application-name" content="SECURE CHECKOUT" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        {/* Windows tiles */}
        <meta name="msapplication-TileColor" content="#282958" />
        <meta name="msapplication-TileImage" content="/favicons/apple-touch-icon-144x144.png?v=1" />
        <meta name="theme-color" content="#282958" />
        
        {/* Android PWA settings */}
        <link rel="manifest" href="/site.webmanifest?v=1" />
        <link 
          rel="icon" 
          type="image/png" 
          sizes="512x512" 
          href="/favicons/maskable-icon.png?v=1" 
          data-purpose="maskable" 
        />
        
        {/* Inline script to force favicon refresh */}
        <script dangerouslySetInnerHTML={{
          __html: `
            // Force favicon refresh on page load
            window.addEventListener('load', function() {
              // Create a temporary link element with a timestamp to bypass cache
              var link = document.createElement('link');
              link.type = 'image/x-icon';
              link.rel = 'shortcut icon';
              link.href = '/favicon.ico?v=' + new Date().getTime();
              document.head.appendChild(link);
            });
          `
        }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
} 