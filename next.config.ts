import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimisations de performance
  poweredByHeader: false,
  
  // Compression et optimisation des images
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Experimental features pour les performances
  experimental: {
    optimizeCss: true,
  },

  // Optimisations du bundle
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Tree-shaking optimisé pour les bibliotèques
    config.optimization = {
      ...config.optimization,
      usedExports: true,
      sideEffects: false,
    };

    // Analyse du bundle en développement
    if (!dev && !isServer) {
      config.plugins.push(
        new webpack.DefinePlugin({
          'process.env.BUNDLE_ANALYZE': JSON.stringify(process.env.BUNDLE_ANALYZE),
        })
      );
    }

    return config;
  },

  // Headers de sécurité et performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, stale-while-revalidate=60',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Redirections pour les anciennes URLs
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/',
        permanent: false,
      },
    ];
  },

  // Compilation TypeScript stricte
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint strict en production
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
