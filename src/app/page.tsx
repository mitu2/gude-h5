'use client';

import {MessageCircle} from 'lucide-react';
import {APP_NAME} from '@/utils/env';
import React from "react";

export default function Home() {
    return (
            <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
                <div className="container mx-auto px-4 py-16">
                    {/* Hero区域 */}
                    <div className="text-center mb-20">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl mb-6 shadow-lg">
                            <MessageCircle size={40} className="text-white"/>
                        </div>
                        <h1 className="text-6xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-6">
                            欢迎使用{APP_NAME}
                        </h1>
                        <p className="text-xl text-default-600 max-w-2xl mx-auto leading-relaxed">
                            基于 Next.js 15、HeroUI 和 WebSocket 构建的现代化实时聊天应用，为您提供流畅、安全、高效的沟通体验。
                        </p>
                    </div>
                </div>
            </div>
    );
}
