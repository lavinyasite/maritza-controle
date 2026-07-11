import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removido output: 'export' para suportar App Router, useSearchParams e API routes
  // Para mobile (Capacitor), faremos o build separado quando necessário
  images: {
    unoptimized: true,
  },
  // Redirecionar /api/* para o backend FastAPI em dev
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
