// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "web120.ir",
        pathname: "/apartment/**",
      },
      {
        protocol: "http",
        hostname: "web120.ir",
        pathname: "/apartment/**",
      },
    ],
  },
};

export default nextConfig;