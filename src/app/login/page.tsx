'use client';

import {useEffect, useState} from 'react';
import {Button, Card, CardBody, CardHeader, Input, Link, Spinner} from '@heroui/react';
import {User, Lock, MessageCircle} from 'lucide-react';
import {useRouter, useSearchParams} from 'next/navigation';
import { observer } from 'mobx-react-lite';
import { useAuthStore } from '@/stores/StoreProvider';
import {APP_NAME} from '@/utils/env';
import {userApi} from '@/utils/api';


const LoginPage = observer(() => {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{username?: string; password?: string}>({});
  const router = useRouter();
  const searchParams = useSearchParams();
  const authStore = useAuthStore();
  const { isLoggedIn: isAuthenticated } = authStore;

  const validateForm = () => {
    const newErrors: {username?: string; password?: string} = {};
    if (!username) newErrors.username = '请输入用户名';
    if (!password) newErrors.password = '请输入密码';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { token } = await userApi.login({
        username,
        password
      });
      
      // 使用MobX store的登录方法
      localStorage.setItem('token', token);
      authStore.login(username);
      
      // 获取之前的路由地址，如果没有则默认跳转到聊天页面
      const returnTo = searchParams.get('returnTo') || '/chat';
      router.push(returnTo);
    } catch (error) {
      console.error('登录错误:', error);
    } finally {
      setLoading(false);
    }
  };

  // 如果已经登录，直接跳转到之前的路由或聊天页面
  useEffect(() => {
    if (isAuthenticated) {
      const returnTo = searchParams.get('returnTo') || '/chat';
      router.push(returnTo);
    }
  }, [isAuthenticated, router, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="flex flex-col items-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl mb-4 shadow-lg">
              <MessageCircle size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              欢迎回来
            </h1>
            <p className="text-default-500 mt-2">登录您的{APP_NAME}账户</p>
          </CardHeader>
          
          <CardBody className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-default-700">用户名</label>
                <Input
                  type="text"
                  placeholder="请输入用户名"
                  value={username}
                  onValueChange={setUsername}
                  errorMessage={errors.username}
                  isInvalid={!!errors.username}
                  startContent={<User className="w-4 h-4 text-default-400" />}
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
                  value={password}
                  onValueChange={setPassword}
                  errorMessage={errors.password}
                  isInvalid={!!errors.password}
                  startContent={<Lock className="w-4 h-4 text-default-400" />}
                  variant="bordered"
                  size="lg"
                  classNames={{
                    input: "text-base",
                    inputWrapper: "bg-default-100 hover:bg-default-200/70"
                  }}
                />
              </div>

              <div className="flex justify-between items-center">
                <Link href="#" className="text-sm text-primary hover:underline">
                  忘记密码?
                </Link>
                <Link href="/register" className="text-sm text-primary hover:underline">
                  创建新账户
                </Link>
              </div>

              <Button
                type="submit"
                color="primary"
                size="lg"
                className="w-full font-semibold bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                isLoading={loading}
                spinner={<Spinner size="sm" />}
                variant="shadow"
              >
                {loading ? '登录中...' : '登录'}
              </Button>

              <div className="text-center">
                <Link href="/" className="text-sm text-default-500 hover:text-default-700 transition-colors">
                  返回首页
                </Link>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
});

export default LoginPage;