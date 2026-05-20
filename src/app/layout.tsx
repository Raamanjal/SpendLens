// src/app/layout.tsx
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Geist } from 'next/font/google';
import './globals.css';

const geist = Geist({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SpendLens — Free AI Spend Audit',
  description: 'Find out where your team is overspending on AI tools. Free audit in seconds. No login required.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://spendlens.vercel.app'),
  openGraph: {
    title: 'SpendLens — Free AI Spend Audit',
    description: 'Find out where your team is overspending on AI tools.',
    siteName: 'SpendLens',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SpendLens — Free AI Spend Audit',
    description: 'Find out where your team is overspending on AI tools.',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={geist.className}>
        {children}
      </body>
    </html>
  );
}