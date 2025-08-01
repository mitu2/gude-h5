'use client';

import Link from "next/link";
import { Button, Card, CardBody } from '@heroui/react';
import { MessageCircle, LogIn, Rocket, User } from 'lucide-react';
import { APP_NAME } from '@/utils/env';
import React from "react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="container mx-auto px-4 py-16">
        {/* Hero区域 */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl mb-6 shadow-lg">
            <MessageCircle size={40} className="text-white" />
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-6">
            欢迎使用{APP_NAME}
          </h1>
          <p className="text-xl text-default-600 max-w-2xl mx-auto leading-relaxed">
            基于 Next.js 15、HeroUI 和 WebSocket 构建的现代化实时聊天应用，为您提供流畅、安全、高效的沟通体验。
          </p>
        </div>

        {/* 功能特性区域 */}
        <div className="max-w-6xl mx-auto mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-default-800 mb-4">核心功能</h2>
            <p className="text-default-500">体验现代化的实时通信</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-none bg-white/60 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardBody className="text-center p-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl mb-4 mx-auto">
                  <MessageCircle size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-default-800 mb-2">实时消息</h3>
                <p className="text-default-600 text-sm">
                  基于WebSocket的实时消息传输，毫秒级响应，支持多种消息类型
                </p>
              </CardBody>
            </Card>

            <Card className="border-none bg-white/60 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardBody className="text-center p-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-success-400 to-success-600 rounded-xl mb-4 mx-auto">
                  <User className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-default-800 mb-2">用户管理</h3>
                <p className="text-default-600 text-sm">
                  安全的用户认证系统，支持用户状态管理，提供个性化的使用体验
                </p>
              </CardBody>
            </Card>

            <Card className="border-none bg-white/60 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardBody className="text-center p-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-warning-400 to-warning-600 rounded-xl mb-4 mx-auto">
                  <Rocket size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-default-800 mb-2">快速部署</h3>
                <p className="text-default-600 text-sm">
                  现代化的技术栈，一键部署，支持云端和本地环境，易于扩展
                </p>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* CTA区域 */}
        <div className="text-center">
          <div className="inline-flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              as={Link}
              href="/register"
              color="primary"
              size="lg"
              variant="shadow"
              startContent={<Rocket size={20} />}
              className="min-w-[160px] bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-[1.05] active:scale-[0.95] transition-all duration-300"
            >
              立即开始
            </Button>
            <Button
              as={Link}
              href="/login"
              color="primary"
              size="lg"
              variant="shadow"
              startContent={<LogIn size={20} />}
              className="min-w-[160px] bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-[1.05] active:scale-[0.95] transition-all duration-300"
            >
              登录体验
            </Button>
            <Button
              as={Link}
              href="/chat"
              color="secondary"
              size="lg"
              variant="flat"
              startContent={<MessageCircle size={20} />}
              className="min-w-[160px] hover:bg-secondary-100 hover:text-secondary-800 transform hover:scale-[1.05] active:scale-[0.95] transition-all duration-300"
            >
              立即体验
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
