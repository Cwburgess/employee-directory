import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  distDir: "build", // Optional: custom build folder
  output: "standalone", // Required for Azure App Service
};

export default nextConfig;
