import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // 빌드 중 타입 에러가 있어도 성공 처리
    ignoreBuildErrors: true,
  },
  eslint: {
    // ESLint 에러도 빌드에서 무시하려면
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
