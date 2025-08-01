// API 响应基础类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  record: T
}

// 分页请求参数
export interface PaginationParams {
  page?: number
  size?: number
  [key: string]: any
}

// 分页响应数据
export interface PaginationData<T = any> {
  list: T[]
  total: number
  page: number
  size: number
}

// 用户相关类型
export interface User {
  id: string | number
  username: string
  email: string
  avatar?: string
  status?: number
  createdAt?: string
  updatedAt?: string
}

export interface LoginParams {
  username: string
  password: string
}

export interface RegisterParams {
  username: string
  email: string
  password: string
  confirmPassword: string
}

export interface ChangePasswordParams {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

// 文件相关类型
export interface FileInfo {
  id: string
  name: string
  size: number
  url: string
  type: string
  uploadedAt: string
}

// 文章相关类型
export interface Article {
  id: string | number
  title: string
  content: string
  author: string
  status: number
  createdAt: string
  updatedAt: string
}

// HTTP 请求配置类型
export interface RequestConfig extends Partial<{
  timeout: number
  headers: Record<string, string>
  params: Record<string, any>
  data: any
  responseType: 'json' | 'blob' | 'text'
}> {}

// 请求错误类型
export interface RequestError {
  code?: number
  message: string
  response?: any
  request?: any
  config?: any
}

// useRequest Hook 返回类型
export interface UseRequestResult<T = any> {
  data: T | null
  loading: boolean
  error: RequestError | null
  run: (...args: any[]) => Promise<T>
}

// useRequest Hook 配置类型
export interface UseRequestOptions<T = any> {
  manual?: boolean
  defaultParams?: any[]
  onSuccess?: (data: T, params: any[]) => void
  onError?: (error: RequestError, params: any[]) => void
  onFinally?: (params: any[]) => void
} 