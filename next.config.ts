import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    NEXT_PUBLIC_US_MARKET_ONLY: process.env.US_MARKET_ONLY || 'false',
  },
};

export default nextConfig;
