import type { NextConfig } from "next";

const staticHosting =
  process.env.NEXT_PUBLIC_STATIC_HOSTING === "1" || process.env.NEXT_PUBLIC_STATIC_HOSTING === "true";

/** Empty for custom domain (battle.leafsteroids.net); /battle-of-the-paddles for github.io subpath */
const basePath = staticHosting ? process.env.NEXT_PUBLIC_BASE_PATH ?? "/battle-of-the-paddles" : "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  ...(staticHosting
    ? {
        output: "export" as const,
        basePath,
        assetPrefix: `${basePath}/`,
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
