import {makeAutoObservable} from 'mobx';

interface User {
  id?: string;
  username: string;
  email?: string;
  avatar?: string;
}

export class AuthStore {
  user: User | null = null;
  isLoggedIn = false;

  constructor() {
    makeAutoObservable(this);
    // 延迟初始化，确保只在客户端执行
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        this.initializeAuth();
      }, 0);
    }
  }

  // 初始化认证状态 - SSR安全版本
  private initializeAuth() {
    // 服务端渲染时保持默认状态
    if (typeof window === 'undefined') {
      return;
    }

    // 客户端渲染时从localStorage恢复状态
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr);
        this.user = userData;
        this.isLoggedIn = true;
      } catch (error) {
        console.error('解析用户信息失败:', error);
        this.clearAuth();
      }
    }

    // 使用useEffect类似的延迟确保hydration完成后再添加监听器
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.addEventListener('auth:logout', this.handleGlobalLogout);
      }, 0);
    }
  }

  // 处理全局登出事件
  private handleGlobalLogout = () => {
    this.user = null;
    this.isLoggedIn = false;
  };

  // 清理事件监听器
  cleanup() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('auth:logout', this.handleGlobalLogout);
    }
  }

  // 登录
  login(token: string, user: User) {
    this.user = user;
    this.isLoggedIn = true;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  // 注册（保持向后兼容）
  register(username: string) {
    const user = {username};
    this.user = user;
    this.isLoggedIn = true;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  // 登出
  logout() {
    this.user = null;
    this.isLoggedIn = false;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  // 清除认证信息
  private clearAuth() {
    this.user = null;
    this.isLoggedIn = false;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  // 静态方法：全局清除认证信息（供request.ts使用）
  static clearAuthGlobally() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    
    // 触发storage事件来通知所有组件认证状态已变更
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
  }
}