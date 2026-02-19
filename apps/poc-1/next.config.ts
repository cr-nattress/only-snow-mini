import type { NextConfig } from "next";

const API_BACKEND =
  process.env.NEXT_PUBLIC_ONLYSNOW_API_URL ??
  "https://ski-ai-mu.vercel.app/api";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_BACKEND}/:path*`,
      },
    ];
  },
};

export default nextConfig;
