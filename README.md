# Stripe Payment App

A Next.js application for handling Stripe payments with various integration methods.

## Hydration Issues Solution

This project addresses React hydration errors that occur when the server-rendered HTML doesn't match what React tries to render on the client side. The main issues were:

1. **Dynamic Content During Hydration**: Components like `LoadingDots` were rendering different content on the server versus the client.

2. **Client-Side Only Components**: Some components were using browser-only APIs without proper checks.

### Solution Components

1. **ClientOnly Component**: A wrapper component that ensures its children are only rendered on the client side, preventing hydration mismatches.

```tsx
import React, { useState, useEffect, ReactNode } from 'react';

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
```

2. **LoadingDots Component**: A component that displays animated loading dots, wrapped in `ClientOnly` to prevent hydration issues.

```tsx
import React from 'react';
import ClientOnly from './ClientOnly';

export default function LoadingDots({ className = '' }) {
  return (
    <ClientOnly fallback={<span className={className}>...</span>}>
      <AnimatedDots className={className} />
    </ClientOnly>
  );
}
```

3. **CheckoutPageWrapper**: A wrapper component for the checkout page that ensures the entire page content is only rendered on the client side.

### Best Practices for Preventing Hydration Errors

1. **Use the `'use client'` directive**: Mark components that use client-side features with this directive.

2. **Avoid mixing server and client rendering**: Use `ClientOnly` for components that should only render on the client.

3. **Provide fallbacks**: Always provide fallback content for components that might render differently on the server.

4. **Check for browser APIs**: Use `typeof window !== 'undefined'` to check if code is running in the browser.

5. **Use `useEffect` for client-side initialization**: Initialize state that depends on browser APIs in `useEffect`.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Create a `.env.local` file with the following variables:

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Hydration Errors](https://nextjs.org/docs/messages/react-hydration-error)
- [Stripe Documentation](https://stripe.com/docs) 