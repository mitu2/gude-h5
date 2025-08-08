/* eslint-disable */
import axios, {AxiosInstance, AxiosResponse, InternalAxiosRequestConfig} from 'axios'
import toast from '@/utils/notifications'
import {ApiResponse} from '@/types/ApiType'
import {API_URL} from "@/utils/env";
import {authStore} from "@/stores/AuthStore";

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
        return config
    },
    (error) => {
        // 对请求错误做些什么
        console.error('请求错误:', error)
        return Promise.reject(error)
    }
)

// 响应拦截器
request.interceptors.response.use(
    (response: AxiosResponse<ApiResponse<any>>) => {
        // 对响应数据做点什么
        const {data} = response

        // 根据你的后端 API 结构来调整
        if (data.code === 0) {
            return data.record || data
        } else {
            const {code, record, message } = data
            switch (code) {
                case 2004:
                    toast.error(message)
                    return Promise.reject(record)
                default:
                    // 业务错误处理
                    toast.error(data.message || '请求失败')
            }
            return Promise.reject(new Error(data.message || '请求失败'))
        }
    },
    (error: any) => {
        // 对响应错误做点什么
        console.error('响应错误:', error)
        if (error.response) {
            const {status, data} = error.response

            switch (status) {
                case 401:
                    authStore.token = null
                    toast.error('未授权，请重新登录')
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


// 导出 axios 实例，以便需要时直接使用
export default request