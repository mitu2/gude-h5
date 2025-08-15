import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    /* 基础配置 */
    reactStrictMode: true,

    /* 环境变量配置 */
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    },

    /* 静态资源优化 */
    images: {
        unoptimized: true,
    },

    turbopack: {
        rules: {
            "*.less": {
                loaders: [
                    {
                        loader: 'less-loader',
                        options: {
                            lessOptions: {
                                javascriptEnabled: true,
                            },
                        },
                    },
                ],
                as: "*.css"
            }
        }
    }

    // /* 构建优化 */
    // eslint: {
    //   ignoreDuringBuilds: true,
    // },
    // typescript: {
    //   ignoreBuildErrors: true,
    // },

};

export default nextConfig;
