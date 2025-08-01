import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* 基础配置 */
  reactStrictMode: true,
  
  /* 环境变量配置 */
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_LOGO_PATH: process.env.NEXT_PUBLIC_LOGO_PATH,
  },
  
  /* 图片配置 */
  images: {
    domains: ['localhost'],
  },
};

export default nextConfig;
