/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'export',
  trailingSlash: true,
  devIndicators: false,
  serverExternalPackages: [],
  // Allow dev server from Replit domains
  allowedDevOrigins: [
    '.replit.dev',
    '.repl.co'
  ]
}

export default nextConfig