import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      new URL("http://example.com/**"),
      new URL("https://i.sstatic.net/**"),
    ],
  },
};

export default nextConfig;
