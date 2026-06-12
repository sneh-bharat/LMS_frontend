import type { NextConfig } from 'next';

// Whitelisted API origins for CSP connect-src
const API_ORIGINS = [
  'https://www.snehbharat.com',
  // Add additional allowed API origins here
].join(' ');

const securityHeaders = [
  // Prevent DNS prefetch leaking internal hostnames
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  // Enforce HTTPS for 2 years (only set on production)
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  // Block clickjacking
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Prevent MIME-type sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Control referrer information
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Disable browser features not needed by this app
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  // Legacy XSS filter (belt-and-suspenders)
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  // Content Security Policy
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // Next.js requires unsafe-eval in development; inline scripts for hydration
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      // Tailwind inline styles
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Google Fonts
      "font-src 'self' https://fonts.gstatic.com data:",
      // Images: self + data URIs (base64 images) + external HTTPS
      "img-src 'self' data: https:",
      // API connections — add any additional microservice origins here
      `connect-src 'self' ${API_ORIGINS}`,
      // iframes — block all
      "frame-src 'none'",
      // No plugins
      "object-src 'none'",
      // Subresource integrity upgrade
      "upgrade-insecure-requests",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },

  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },

  // Redirect HTTP → HTTPS is handled by the host (Vercel/Nginx);
  // the middleware.ts also sets HSTS for belt-and-suspenders.
};

export default nextConfig;
