/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // مهم للنشر الثابت على Netlify
  experimental: {
    serverActions: true,
  },
  images: {
    unoptimized: true,  // مهم للنشر الثابت
    domains: ['localhost', 'supabase.co'],
  },
}

module.exports = nextConfig
