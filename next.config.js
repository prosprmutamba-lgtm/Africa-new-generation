const createNextIntlPlugin = require("next-intl/plugin");

const withNextIntl = createNextIntlPlugin("./lib/i18n-request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    // Our logo files are SVG (trusted, local placeholder assets — not
    // user uploads), which next/image blocks by default for security.
    // The contentSecurityPolicy below is Next's recommended safe default
    // when enabling SVG support.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      // Add remote image domains here if you host images externally
      // { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  eslint: {
    dirs: ["app", "components", "lib", "config", "hooks", "types"],
  },
  async headers() {
    // The admin area must never be indexed, framed or cached.
    const adminHeaders = [
      { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "same-origin" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Cache-Control", value: "no-store" },
    ];
    return [
      { source: "/admin/:path*", headers: adminHeaders },
      { source: "/api/admin/:path*", headers: adminHeaders },
    ];
  },
};

module.exports = withNextIntl(nextConfig);
