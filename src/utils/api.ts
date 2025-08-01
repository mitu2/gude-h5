import { http } from './request'
import {
  LoginParams,
} from '@/types/api'

// 用户相关接口
export const userApi = {
  // 登录
  login(data: LoginParams): Promise<{ token: string; validity: number }> {
    return http.post('/auth/login', data)
  },
  
}


// 导出所有 API
export const api = {
  user: userApi,
} 