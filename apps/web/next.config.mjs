import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: process.env.NEXT_DIST_DIR || '.next',
  output: 'standalone',
  transpilePackages: ['@viksit/shared', '@viksit/database'],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default withNextIntl(nextConfig);