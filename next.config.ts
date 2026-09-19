import type { NextConfig } from "next";

import path from "path";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'cloudflare:workers': path.resolve('./cloudflare-mock.js'),
    };
    return config;
  },
  turbopack: {
    resolveAlias: {
      'cloudflare:workers': './cloudflare-mock.js',
    },
  },
};

export default nextConfig;
