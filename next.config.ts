import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.convex.cloud",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "*.r2.dev",
      },
    ],
    // 画像キャッシュを7日間に設定
    minimumCacheTTL: 604800,
    // 画像の最適化設定
    deviceSizes: [320, 420, 640, 750, 828],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  experimental: {
    // カスタムスクロール復元を使用するため無効化
    scrollRestoration: false,
  },
};

export default nextConfig;
