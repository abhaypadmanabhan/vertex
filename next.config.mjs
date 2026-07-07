import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const projectRoot = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Pin the workspace root — a stray lockfile in $HOME otherwise misleads
  // Turbopack's root inference (multiple-lockfiles warning).
  turbopack: {
    root: projectRoot,
  },
  typescript: {
    // Types are gate-checked separately via `npm run typecheck` (tsc --noEmit).
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
