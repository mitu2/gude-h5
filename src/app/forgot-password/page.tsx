'use client';

import React, {useState} from 'react';
import {useRouter} from 'next/navigation';
import {Button, Card, CardBody, CardHeader, Input} from '@heroui/react';
import Link from 'next/link';
import {BadgeCheck, Lock, Mail} from 'lucide-react';
import {toast} from 'react-toastify';
import {AuthApis} from "@/utils/apis";

interface ForgotPasswordValues {
    email: string,
    code: string,
    password: string,
    confirmPassword: string
}

const ForgotPasswordPage = () => {
    const [formData, setFormData] = useState<ForgotPasswordValues>({
        email: '',
        code: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState<Partial<ForgotPasswordValues>>({});
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const router = useRouter();

    const validateEmail = () => {
        const newErrors: Partial<ForgotPasswordValues> = {};
        if (!formData.email) {
            newErrors.email = '请输入邮箱';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = '请输入有效的邮箱地址';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateForm = () => {
        const newErrors: Partial<ForgotPasswordValues> = {} = {};

        if (!formData.email) newErrors.email = '请输入邮箱';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = '请输入有效的邮箱地址';

        if (!formData.code) newErrors.code = '请输入验证码';
        else if (formData.code.length !== 6) newErrors.code = '验证码应为6位数字';

        if (!formData.password) newErrors.password = '请输入密码';
        else if (formData.password.length < 8) newErrors.password = '密码至少8个字符';

        if (!formData.confirmPassword) newErrors.confirmPassword = '请确认密码';
        else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = '两次输入的密码不一致';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field: keyof ForgotPasswordValues, value: string) => {
        setFormData(prev => ({...prev, [field]: value}));
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = {...prev};
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleSendCode = async () => {
        if (!validateEmail()) return;

        setLoading(true);
        try {
            // 发送验证码
            await AuthApis.sendRestPasswordVerificationCode(formData.email);

            toast.success('验证码已发送到您的邮箱！');

            setCountdown(60);
            const timer = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            // 调用注册接口
            await AuthApis.restPassword({
                email: formData.email,
                newPassword: formData.password,
                verificationCode: formData.code,
            });
            toast.success('密码已成功重置！');
            router.push('/login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md border-none shadow-xl bg-white/80 backdrop-blur-sm animate-fade-in">
                <CardHeader className="flex flex-col items-center py-8">
                    <div
                        className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl mb-4 shadow-lg">
                        <Lock size={32} className="text-white"/>
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                        忘记密码
                    </h1>
                    <p className="text-default-500 mt-2">请输入您的电子邮件地址以重置密码</p>
                </CardHeader>

                <CardBody className="px-8 pb-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-default-700">邮箱</label>
                            <Input
                                type="email"
                                placeholder="请输入您的电子邮件地址"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                startContent={<Mail className="text-default-400" size={20}/>}
                                isInvalid={!!errors.email}
                                errorMessage={errors.email}
                                variant="bordered"
                                size="lg"
                                classNames={{
                                    input: "text-base",
                                    inputWrapper: "bg-default-100 hover:bg-default-200/70"
                                }}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-default-700">验证码</label>
                            <div className="flex gap-2">
                                <Input
                                    type="text"
                                    placeholder="请输入6位验证码"
                                    value={formData.code}
                                    onChange={(e) => handleInputChange('code', e.target.value)}
                                    startContent={<BadgeCheck className="text-default-400" size={20}/>}
                                    endContent={
                                        <Button
                                            size="sm"
                                            color="primary"
                                            onPress={handleSendCode}
                                            isLoading={loading}
                                            isDisabled={countdown > 0}
                                            variant="flat"
                                            className="min-w-[80px] font-medium bg-primary-100 hover:bg-primary-200 text-primary-700 transition-colors"
                                        >
                                            {countdown > 0 ? `${countdown}s` : '发送'}
                                        </Button>
                                    }
                                    isInvalid={!!errors.code}
                                    errorMessage={errors.code}
                                    variant="bordered"
                                    size="lg"
                                    classNames={{
                                        input: "text-base",
                                        inputWrapper: "bg-default-100 hover:bg-default-200/70"
                                    }}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-default-700">新密码</label>
                            <Input
                                type="password"
                                placeholder="请输入新密码"
                                value={formData.password}
                                onChange={(e) => handleInputChange('password', e.target.value)}
                                startContent={<Lock className="text-default-400" size={20}/>}
                                isInvalid={!!errors.password}
                                errorMessage={errors.password}
                                variant="bordered"
                                size="lg"
                                classNames={{
                                    input: "text-base",
                                    inputWrapper: "bg-default-100 hover:bg-default-200/70"
                                }}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-default-700">确认新密码</label>
                            <Input
                                type="password"
                                placeholder="请再次输入新密码"
                                value={formData.confirmPassword}
                                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                startContent={<Lock className="text-default-400" size={20}/>}
                                isInvalid={!!errors.confirmPassword}
                                errorMessage={errors.confirmPassword}
                                variant="bordered"
                                size="lg"
                                classNames={{
                                    input: "text-base",
                                    inputWrapper: "bg-default-100 hover:bg-default-200/70"
                                }}
                            />
                        </div>

                        <Button
                            type="submit"
                            color="primary"
                            size="lg"
                            className="w-full font-semibold bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                            isLoading={loading}
                        >
                            {loading ? '重置中...' : '重置密码'}
                        </Button>

                        <div className="text-center">
                            <Link href="/login"
                                  className="text-sm text-default-500 hover:text-default-700 transition-colors">
                                返回登录
                            </Link>
                        </div>
                    </form>
                </CardBody>
            </Card>
        </div>
    );
};

export default ForgotPasswordPage;