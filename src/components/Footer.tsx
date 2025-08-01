'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} {process.env.NEXT_PUBLIC_APP_NAME || 'Gude'}
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm">
              <Link href="/" className="text-gray-500 hover:text-primary transition-colors">
                首页
              </Link>
              <span className="text-gray-400">•</span>
              <Link href="/chat" className="text-gray-500 hover:text-primary transition-colors">
                聊天室
              </Link>
              <span className="text-gray-400">•</span>
              <Link href="/login" className="text-gray-500 hover:text-primary transition-colors">
                登录
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}