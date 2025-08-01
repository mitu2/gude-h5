# Cloudflare Workers 部署指南

## 环境准备

### 1. 安装Wrangler CLI
```bash
npm install -g wrangler
```

### 2. 登录Cloudflare
```bash
wrangler login
```

### 3. 创建KV命名空间（可选）
```bash
wrangler kv:namespace create CACHE
wrangler kv:namespace create CACHE --preview
```

## 部署步骤

### 1. 配置环境变量
复制环境变量示例文件：
```bash
cp .dev.vars.example .dev.vars
```

编辑 `.dev.vars` 文件，填入实际的环境变量值。

### 2. 更新wrangler.toml
根据你的Cloudflare账户信息更新 `wrangler.toml` 文件：
- 更新 `account_id`
- 更新 `kv_namespaces` 的ID（如果使用KV存储）

### 3. 本地预览
```bash
npm run preview
```

### 4. 部署到生产环境
```bash
npm run deploy
```

## 配置说明

### wrangler.toml 配置项
- `name`: Workers名称
- `main`: 入口文件路径
- `compatibility_date`: 兼容性日期
- `compatibility_flags`: 兼容性标志
- `kv_namespaces`: KV存储配置

### 环境变量
- `NEXT_PUBLIC_API_URL`: API服务器地址
- `NEXT_PUBLIC_APP_NAME`: 应用名称
- `NEXT_PUBLIC_LOGO_PATH`: Logo路径

## 注意事项

1. **静态资源**: 确保所有静态资源都在 `/public` 目录中
2. **API代理**: 如果API服务器有CORS限制，需要在Cloudflare Workers中添加代理
3. **缓存策略**: 可以根据需要配置KV缓存策略
4. **域名绑定**: 部署后可以在Cloudflare Dashboard中绑定自定义域名

## 故障排除

### 构建失败
- 检查 `next.config.ts` 配置是否正确
- 确保所有依赖都已安装

### 部署失败
- 检查 `wrangler.toml` 配置是否正确
- 确认Cloudflare账户已登录
- 检查环境变量是否正确设置

### 运行时错误
- 查看Cloudflare Workers日志
- 检查API连接是否正常
- 确认静态资源路径正确