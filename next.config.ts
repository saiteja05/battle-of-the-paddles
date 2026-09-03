import type { NextConfig } from "next";

const staticHosting =
  process.env.NEXT_PUBLIC_STATIC_HOSTING === "1" || process.env.NEXT_PUBLIC_STATIC_HOSTING === "true";

const basePath = staticHosting ? "/battle-of-the-paddles" : "";

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
