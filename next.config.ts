// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Compress responses for better performance score
  compress: true,

  // Cache images for better performance
  images: {
    minimumCacheTTL: 60,
  },

  // Security headers for Best Practices score
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key:   'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key:   'X-Frame-Options',
            value: 'DENY',
          },
          {
            key:   'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;