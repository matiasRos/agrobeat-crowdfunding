/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mind.fra1.digitaloceanspaces.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig
