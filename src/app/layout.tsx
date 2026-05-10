// src/app/layout.tsx
import type { Metadata } from 'next';
import { Geist }         from 'next/font/google';
import './globals.css';

// ─── 1. Font ──────────────────────────────────────────────
// Geist is Next.js's own font — loads from Google Fonts
// subsets: ['latin'] keeps bundle small
const geist = Geist({ subsets: ['latin'] });

// ─── 2. Default metadata ─────────────────────────────────
// Applied to every page unless overridden by generateMetadata
export const metadata: Metadata = {
  title:       'SpendLens — Free AI Spend Audit',
  description: 'Find out where your team is overspending on AI tools. Free audit in seconds.',
  openGraph: {
    title:       'SpendLens — Free AI Spend Audit',
    description: 'Find out where your team is overspending on AI tools.',
    url:          process.env.NEXT_PUBLIC_BASE_URL,
    siteName:    'SpendLens',
    images:      [{ url: '/og-image.png', width: 1200, height: 630 }],
    type:        'website',
  },
  twitter: {
    card:        'summary_large_image',
    title:       'SpendLens — Free AI Spend Audit',
    description: 'Find out where your team is overspending on AI tools.',
  },
};

// ─── 3. Root layout ───────────────────────────────────────
// Wraps every page — font class applied to body
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={geist.className}>
        {children}
      </body>
    </html>
  );
}