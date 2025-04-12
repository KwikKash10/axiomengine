import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Stripe Checkout',
  description: 'A simple Stripe checkout implementation',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
} 