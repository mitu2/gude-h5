'use client';

import {createContext, useContext, ReactNode, useEffect, useState} from 'react';
import {AuthStore} from './AuthStore';

// 创建上下文
const StoreContext = createContext<{
  authStore: AuthStore;
} | null>(null);

// Provider组件
export function StoreProvider({children}: {children: ReactNode}) {
  const [authStore] = useState(() => new AuthStore());

  useEffect(() => {
    return () => {
      // 组件卸载时清理事件监听器
      authStore.cleanup();
    };
  }, [authStore]);

  return (
    <StoreContext.Provider value={{authStore}}>
      {children}
    </StoreContext.Provider>
  );
}

// Hook用于访问store
export function useAuthStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useAuthStore必须在StoreProvider内部使用');
  }
  return context.authStore;
}