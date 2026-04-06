import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';
 
const withNextIntl = createNextIntlPlugin(
  './i18n/request.ts'
);
 
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      }
    ],
  },
} satisfies NextConfig;
 
export default withNextIntl(nextConfig);
