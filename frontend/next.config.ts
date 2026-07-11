import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",  // Necessário para o Dockerfile de produção
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

