/**
 * 环境变量配置工具
 */

// API基础URL
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8801';

// 应用名称
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || '';

// 环境判断
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';
