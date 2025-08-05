'use client';

import {useState} from 'react';
import {Button, Card, CardBody, CardHeader, Input, Link, Spinner} from '@heroui/react';
import {Lock, Mail, Rocket, User} from 'lucide-react';
import {useRouter} from 'next/navigation';
import {observer} from 'mobx-react-lite';
import {APP_NAME} from '@/utils/env';
import {toast} from 'react-toastify';
import {AuthApis} from "@/utils/apis";

interface RegisterFormValues {
    nickname: string;
    email: string;
    emailCode: string;
    password: string;
    confirmPassword: string;
}

const RegisterPage = observer(() => {
    const [loading, setLoading] = useState(false);
    const [sendingCode, setSendingCode] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [formData, setFormData] = useState<RegisterFormValues>({
        nickname: '',
        email: '',
        emailCode: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState<Partial<RegisterFormValues>>({});
    const router = useRouter();

    const validateForm = () => {
        const newErrors: Partial<RegisterFormValues> = {};

        if (!formData.nickname) newErrors.nickname = '请输入用户名';
        else if (formData.nickname.length < 3) newErrors.nickname = '用户名至少3个字符';
        else if (formData.nickname.length > 20) newErrors.nickname = '用户名最多20个字符';

        if (!formData.email) newErrors.email = '请输入邮箱';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = '请输入有效的邮箱地址';

        if (!formData.emailCode) newErrors.emailCode = '请输入邮箱验证码';
        else if (formData.emailCode.length !== 6) newErrors.emailCode = '验证码应为6位数字';

        if (!formData.password) newErrors.password = '请输入密码';
        else if (formData.password.length < 6) newErrors.password = '密码至少6个字符';

        if (!formData.confirmPassword) newErrors.confirmPassword = '请确认密码';
        else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = '两次输入的密码不一致';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const sendEmailCode = async () => {
        if (!formData.email) {
            setErrors(prev => ({...prev, email: '请先输入邮箱地址'}));
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setErrors(prev => ({...prev, email: '请输入有效的邮箱地址'}));
            return;
        }

        setSendingCode(true);

        try {
            // 先检查邮箱是否已注册
            const checkRes = await AuthApis.checkEmail(formData.email);

            if (!checkRes) {
                setErrors(prev => ({...prev, email: '该邮箱已被注册'}));
                return;
            }

            // 发送验证码
            await AuthApis.sendVerificationCode(formData.email);

            toast.success('验证码已发送到您的邮箱');

            setCountdown(60);

            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } finally {
            setSendingCode(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        try {
            // 调用注册接口
            await AuthApis.register({
                nickname: formData.nickname,
                email: formData.email,
                password: formData.password,
                verificationCode: formData.emailCode,
            });

            toast.success('注册成功！请前往登录');

            // 跳转到登录页面
            router.push('/login');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: keyof RegisterFormValues, value: string) => {
        setFormData(prev => ({...prev, [field]: value}));
        setErrors(prev => ({...prev, [field]: undefined}));
    };

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md border-none shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="flex flex-col items-center py-8">
                    <div
                        className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl mb-4 shadow-lg">
                        <Rocket size={32} className="text-white"/>
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                        创建账户
                    </h1>
                    <p className="text-default-500">加入{APP_NAME}的大家庭</p>
                </CardHeader>

                <CardBody className="px-8 pb-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-default-700">用户名</label>
                            <Input
                                type="text"
                                placeholder="请输入用户名"
                                value={formData.nickname}
                                onChange={(e) => handleInputChange('nickname', e.target.value)}
                                startContent={<User className="text-default-400" size={20}/>}
                                isInvalid={!!errors.nickname}
                                errorMessage={errors.nickname}
                                variant="bordered"
                                size="lg"
                                classNames={{
                                    input: "text-base",
                                    inputWrapper: "bg-default-100 hover:bg-default-200/70"
                                }}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-default-700">邮箱</label>
                            <Input
                                type="email"
                                placeholder="请输入邮箱"
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
                            <label className="text-sm font-medium text-default-700">邮箱验证码</label>
                            <Input
                                type="text"
                                placeholder="请输入6位验证码"
                                value={formData.emailCode}
                                onChange={(e) => handleInputChange('emailCode', e.target.value)}
                                startContent={<Mail className="text-default-400" size={20}/>}
                                endContent={
                                    <Button
                                        size="sm"
                                        color="primary"
                                        onPress={sendEmailCode}
                                        isLoading={sendingCode}
                                        isDisabled={countdown > 0}
                                        variant="flat"
                                        className="min-w-[80px] font-medium bg-primary-100 hover:bg-primary-200 text-primary-700 transition-colors"
                                    >
                                        {countdown > 0 ? `${countdown}s` : '发送'}
                                    </Button>
                                }
                                isInvalid={!!errors.emailCode}
                                errorMessage={errors.emailCode}
                                variant="bordered"
                                size="lg"
                                classNames={{
                                    input: "text-base",
                                    inputWrapper: "bg-default-100 hover:bg-default-200/70"
                                }}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-default-700">密码</label>
                            <Input
                                type="password"
                                placeholder="请输入密码"
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
                            <label className="text-sm font-medium text-default-700">确认密码</label>
                            <Input
                                type="password"
                                placeholder="请再次输入密码"
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
                            spinner={<Spinner size="sm"/>}
                            variant="shadow"
                        >
                            {loading ? '注册中...' : '立即注册'}
                        </Button>

                        <div className="text-center space-y-3">
                            <p className="text-sm text-default-600">
                                已有账号？{' '}
                                <Link href="/login"
                                      className="text-transparent bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text hover:underline font-medium">
                                    立即登录
                                </Link>
                            </p>
                            <Link href="/"
                                  className="text-sm text-default-500 hover:text-default-700 transition-colors">
                                返回首页
                            </Link>
                        </div>
                    </form>
                </CardBody>
            </Card>
        </div>
    );
});

export default RegisterPage;