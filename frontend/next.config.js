/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};
if (!process.env.VERCEL) {
  nextConfig.rewrites = async () => [
    {
      source: '/api/:path*',
      destination: 'http://localhost:5000/api/:path*',
    },
  ];
}
module.exports = nextConfig;

