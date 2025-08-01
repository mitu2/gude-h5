import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import toast from '@/utils/notification'
import { ApiResponse, RequestConfig } from '@/types/api'
import { API_URL } from "@/utils/env";

// 创建 axios 实例
const request: AxiosInstance = axios.create({
  baseURL: API_URL, // 基础 URL
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 在发送请求之前做些什么
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 可以在这里添加 loading 状态
    console.log('发送请求:', config.url)
    
    return config
  },
  (error: any) => {
    // 对请求错误做些什么
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // 对响应数据做点什么
    const { data } = response
    
    // 根据你的后端 API 结构来调整
    if (data.code === 0) {
      return data.record || data
    } else {
      // 业务错误处理
      toast.error(data.message || '请求失败')
      return Promise.reject(new Error(data.message || '请求失败'))
    }
  },
  (error: any) => {
    // 对响应错误做点什么
    console.error('响应错误:', error)
    
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          toast.error('未授权，请重新登录')
          // 优雅清除所有认证信息并重定向到登录页
          if (typeof window !== 'undefined') {
            const { AuthStore } = require('@/stores/AuthStore');
            AuthStore.clearAuthGlobally();
            const currentPath = window.location.pathname + window.location.search;
            window.location.href = `/login?returnTo=${encodeURIComponent(currentPath)}`;
          }
          break
        case 403:
          toast.error('拒绝访问')
          break
        case 404:
          toast.error('请求的资源不存在')
          break
        case 500:
          toast.error('服务器内部错误')
          break
        default:
          toast.error(data?.message || '网络错误')
      }
    } else if (error.request) {
      toast.error('网络连接失败，请检查网络')
    } else {
      toast.error('请求配置错误')
    }
    
    return Promise.reject(error)
  }
)

// HTTP 请求方法类型
interface HttpMethods {
  get<T = any>(url: string, params?: Record<string, any>, config?: RequestConfig): Promise<T>
  post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T>
  put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T>
  delete<T = any>(url: string, config?: RequestConfig): Promise<T>
  patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T>
  upload<T = any>(url: string, file: File, config?: RequestConfig): Promise<T>
  download(url: string, params?: Record<string, any>, filename?: string): Promise<void>
}

// 封装常用的请求方法
export const http: HttpMethods = {
  // GET 请求
  get<T = any>(url: string, params?: Record<string, any>, config: RequestConfig = {}) {
    return request.get<T>(url, { params, ...config })
  },
  
  // POST 请求
  post<T = any>(url: string, data?: any, config: RequestConfig = {}) {
    return request.post<T>(url, data, config)
  },
  
  // PUT 请求
  put<T = any>(url: string, data?: any, config: RequestConfig = {}) {
    return request.put<T>(url, data, config)
  },
  
  // DELETE 请求
  delete<T = any>(url: string, config: RequestConfig = {}) {
    return request.delete<T>(url, config)
  },
  
  // PATCH 请求
  patch<T = any>(url: string, data?: any, config: RequestConfig = {}) {
    return request.patch<T>(url, data, config)
  },
  
  // 上传文件
  upload<T = any>(url: string, file: File, config: RequestConfig = {}) {
    const formData = new FormData()
    formData.append('file', file)
    
    return request.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      ...config,
    })
  },
  
  // 下载文件
  async download(url: string, params?: Record<string, any>, filename?: string) {
    const response = await request.get(url, {
      params,
      responseType: 'blob',
    })
    
    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename || 'download'
    link.click()
    window.URL.revokeObjectURL(downloadUrl)
  },
}

// 导出 axios 实例，以便需要时直接使用
export default request