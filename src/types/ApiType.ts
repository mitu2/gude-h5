// API 响应基础类型
export interface ApiResponse<T> {
  code: number
  message: string
  record: T
}

// 用户相关类型
export interface User {
  id: string | number
  nickname: string
  email: string
  avatar?: string
  status?: number
  createdAt?: string
  updatedAt?: string
}

export interface LoginParams {
  email: string
  password: string
}

export interface RegisterParams {
  nickname: string
  email: string
  password: string
  verificationCode: string
}

export interface ChangePasswordParams {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}
