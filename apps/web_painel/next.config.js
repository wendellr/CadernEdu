/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@cadernedu/api-client'],
}

module.exports = nextConfig
