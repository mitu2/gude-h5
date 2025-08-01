import React from 'react'
import { Spin } from 'antd'

interface LoadingWrapperProps {
  loading: boolean
  children: React.ReactNode
  tip?: string
  size?: 'small' | 'default' | 'large'
  wrapperClassName?: string
  spinning?: boolean
}

// 加载状态包装组件
export const LoadingWrapper: React.FC<LoadingWrapperProps> = ({
  loading,
  children,
  tip = '加载中...',
  size = 'large',
  wrapperClassName,
  spinning = true,
}) => {
  if (loading) {
    return (
      <div className={wrapperClassName} style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size={size} tip={tip} spinning={spinning} />
      </div>
    )
  }
  
  return <>{children}</>
}

// 带骨架屏的加载组件
interface SkeletonWrapperProps {
  loading: boolean
  children: React.ReactNode
  rows?: number
  avatar?: boolean
  title?: boolean
  paragraph?: boolean
}

export const SkeletonWrapper: React.FC<SkeletonWrapperProps> = ({
  loading,
  children,
  rows = 3,
  avatar = false,
  title = true,
  paragraph = true,
}) => {
  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ marginBottom: '20px' }}>
          {title && <div style={{ height: '24px', background: '#f0f0f0', marginBottom: '16px', borderRadius: '4px' }} />}
          {paragraph && (
            <>
              {Array.from({ length: rows }).map((_, index) => (
                <div
                  key={index}
                  style={{
                    height: '16px',
                    background: '#f0f0f0',
                    marginBottom: '12px',
                    borderRadius: '4px',
                    width: index === rows - 1 ? '60%' : '100%',
                  }}
                />
              ))}
            </>
          )}
        </div>
      </div>
    )
  }
  
  return <>{children}</>
} 