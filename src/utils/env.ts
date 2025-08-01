/**
 * 环境变量配置工具
 */

// API基础URL
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// 应用名称
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || '';

// Logo路径
export const LOGO_PATH = process.env.NEXT_PUBLIC_LOGO_PATH || '';

// 环境判断
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';

// 获取完整API路径
export const getApiUrl = (path: string): string => {
  const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  const apiPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${apiPath}`;
};