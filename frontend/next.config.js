/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: { serverActions: { allowedOrigins: ['*'] } },
  async rewrites() {
    return [
      {
        source: '/api/iris/:path*',
        destination: `${process.env.IRIS_API_BASE || 'http://localhost:52773/api/smartrent/v1'}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
