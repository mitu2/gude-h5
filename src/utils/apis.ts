import request from './request'
import {LoginParams, RegisterParams} from '@/types/ApiType'

// 用户相关接口
export const userApis = {

    // 登录
    login(data: LoginParams): Promise<{ token: string; validity: number }> {
        return request.post('/auth/login', data)
    },

    checkEmail(email: string): Promise<boolean> {
        return request.get('/auth/register/check', {params: {email}})
    },

    sendVerificationCode(email: string): Promise<never> {
        return request.get('/auth/register/verification-code/send', {params: {email}})
    },

    register(data: RegisterParams): Promise<never> {
        return request.post('/auth/register', data)
    },

}

