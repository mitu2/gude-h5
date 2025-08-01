import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* 基础配置 */
  reactStrictMode: true,
  output: "standalone",
  
  /* 环境变量配置 */
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_LOGO_PATH: process.env.NEXT_PUBLIC_LOGO_PATH,
  },
  
  /* Cloudflare Workers 适配配置 */
  serverExternalPackages: ["@heroui/react"],

  /* 静态资源优化 */
  images: {
    unoptimized: true,
  },
  
  // /* 构建优化 */
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },
  // typescript: {
  //   ignoreBuildErrors: true,
  // },

};

export default nextConfig;
