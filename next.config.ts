import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      // VietQR payment QR code generation service
      {
        protocol: 'https',
        hostname: 'img.vietqr.io',
      },
    ],
  },
};

export default nextConfig;
