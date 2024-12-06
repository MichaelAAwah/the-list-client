/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/the-list-client/', // Replace with your GitHub repository name
  assetPrefix: '/the-list-client/',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
