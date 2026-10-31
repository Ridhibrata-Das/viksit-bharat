import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: process.env.NEXT_DIST_DIR || '.next',
  transpilePackages: ['@viksit/shared', '@viksit/database'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/en/dashboard',
        permanent: false,
      },
      {
        source: '/promises',
        destination: '/en/promises',
        permanent: false,
      },
      {
        source: '/districts',
        destination: '/en/districts',
        permanent: false,
      },
      {
        source: '/indicators',
        destination: '/en/indicators',
        permanent: false,
      },
      {
        source: '/admin',
        destination: '/en/admin',
        permanent: false,
      },
    ];
  },
};

export default withNextIntl(nextConfig);