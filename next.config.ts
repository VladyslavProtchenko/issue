import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    relay: {
      src: "./app",
      artifactDirectory: "./app/__generated__",
      language: "typescript",
      eagerEsModules: false,
    },
  },
};

export default nextConfig;
