'use client';

import React, { useState, useEffect } from 'react';
import { Avatar, Card, CardBody, CardHeader, Button, Input, RadioGroup, Radio } from '@heroui/react';
import { User, Mail, MessageCircle, Settings } from 'lucide-react';
import { observer } from "mobx-react-lite";
import { authStore } from '@/stores/AuthStore';
import { UserApis } from "@/utils/apis";

const Setting = observer(() => {
    const { user, isLoggedIn: isAuthenticated, username } = authStore;
    const [gender, setSelected] = useState<string>("1");
    const [status, setStatus] = useState<string>('');
    const [mounted, setMounted] = useState(false); // 防止 SSR mismatch

    useEffect(() => {
        setMounted(true); // 只在客户端渲染
    }, []);

    useEffect(() => {
        if (isAuthenticated && !user?.id) {
            UserApis.getUserDetails().then(user => {
                authStore.setUser(user);
            });
        }
    }, [isAuthenticated, user]);
    const handleSubmit = () => {
        // 这里你可以把数据发送给后台接口
        console.log('提交的数据:', { username, gender, status });

        // 假设使用 authStore 更新用户名
        // authStore.setUser({ ...authStore.user, username });
        alert('提交也没用，小B没给我接口');
    };

    if (!mounted) return null; // SSR 阶段不渲染

    return (
        <div className='max-w-6xl w-full mx-auto'>
            <div className='w-full p-4 m-1' style={{ backgroundColor: '#fff' }}>
                <span className="text-sm" style={{ color: 'skyblue' }}>{username || '加载中...'}</span>
                <span className="text-sm"> &nbsp;&nbsp; 基本信息</span>
            </div>
            <form className="space-y-6">
                <div className='w-full p-4 m-1 flex flex-col gap-2' style={{ backgroundColor: '#fff' }}>
                    <div className="mb-3">
                        <div className="text-gray-700 mb-1.5">昵称: </div>
                        <Input
                            type="text"
                            placeholder="请输入用户名"
                            value={username || ''}
                            variant="bordered"
                            size="sm"
                            classNames={{
                                input: "text-base border-none",
                                inputWrapper: "bg-white border border-gray-300 hover:border-gray-300"
                            }}
                        />
                    </div>
                    <div className="mb-3">
                        <div className="text-gray-700 mb-1.5">注册时间： </div>
                        无法获取，因为小b没给我接口
                    </div>
                    <div className="mb-3">
                        <div className="text-gray-700 mb-1.5">性别：</div>
                        <RadioGroup color="secondary" label="无法获取，因为小b没给我接口" value={gender} onValueChange={setSelected}>
                            <Radio value="1">男</Radio>
                            <Radio value="2">女</Radio>
                            <Radio value="3">保密</Radio>
                        </RadioGroup>
                    </div>
                    <div className="mb-3">
                        <div className="text-gray-700 mb-1.5">个性签名：</div>
                        <Input
                            type="text"
                            placeholder="无法获取，因为小b没给我接口"
                            value={status}
                            onValueChange={setStatus}   // 绑定状态更新
                            variant="bordered"
                            size="sm"
                            classNames={{
                                input: "text-base border-none",
                                inputWrapper: "bg-white border border-gray-300 hover:border-gray-300"
                            }}
                        />
                    </div>
                    <div className="mb-3 flex flex-row-reverse">
                        <Button
                            variant="solid"
                            color="primary"
                            className='bg-blue-500'
                            onClick={handleSubmit}
                        >
                            提交
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
});

export default Setting;
