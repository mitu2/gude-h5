import request from './request'
import {LoginParams, RegisterParams, RestPasswordParams, User} from '@/types/ApiType'

// 用户相关接口
export const AuthApis = {

    // 登录
    login(data: LoginParams): Promise<{ token: string; validity: number }> {
        return request.post('/auth/login', data)
    },

    checkEmail(email: string): Promise<boolean> {
        return request.get('/auth/register/check', {params: {email}})
    },

    sendRegisterVerificationCode(email: string): Promise<never> {
        return request.get('/auth/register/verification-code/send', {params: {email}})
    },

    register(data: RegisterParams): Promise<never> {
        return request.post('/auth/register', data)
    },

    sendRestPasswordVerificationCode(email: string): Promise<never> {
        return request.get('/auth/rest-password/verification-code/send', {params: {email}})
    },

    restPassword(data: RestPasswordParams): Promise<never> {
        return request.post('/auth/rest-password', data)
    },


}

export const UserApis = {
    getUserDetails(): Promise<User> {
        return request.get('/user/details')
    },
}

