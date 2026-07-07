/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // Types are gate-checked separately via `npm run typecheck` (tsc --noEmit).
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
