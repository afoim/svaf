# 站点配置说明

## 站点基本信息

站点配置文件位于 `src/lib/config/site.ts`

### 当前配置

```typescript
{
  name: 'SVAF',
  url: 'https://2x.nz',
  icon: 'https://q2.qlogo.cn/headimg_dl?dst_uin=2726730791&spec=0',
  description: 'SvelteKit + shadcn-svelte 项目',
  author: {
    name: 'Your Name',
    url: 'https://2x.nz'
  },
  links: {
    github: 'https://github.com/yourusername/svaf'
  }
}
```

## 修改站点配置

### 1. 修改站点名称和描述

编辑 `src/lib/config/site.ts`:

```typescript
export const siteConfig = {
  name: '你的站点名称',
  description: '你的站点描述',
  // ...
};
```

### 2. 修改站点 URL

```typescript
export const siteConfig = {
  url: 'https://yourdomain.com',
  // ...
};
```

### 3. 修改站点图标

你可以使用：
- 外部 URL（如当前配置）
- 本地文件（放在 `static/` 目录）

```typescript
// 使用外部 URL
icon: 'https://example.com/icon.png'

// 使用本地文件
icon: '/favicon.png'  // 文件放在 static/favicon.png
```

### 4. 修改作者信息

```typescript
export const siteConfig = {
  author: {
    name: '你的名字',
    url: 'https://yourwebsite.com'
  },
  // ...
};
```

## Base Path 配置

如果你的站点部署在子路径下（如 `https://example.com/myapp/`），需要配置 base path。

编辑 `svelte.config.js`:

```javascript
kit: {
  adapter: adapter(),
  paths: {
    base: process.env.NODE_ENV === 'production' ? '/myapp' : ''
  }
}
```

## 环境变量

你可以使用环境变量来配置不同环境的设置。

1. 复制 `.env.example` 为 `.env`
2. 修改 `.env` 中的值
3. 在代码中使用 `import.meta.env.PUBLIC_*` 访问

示例：

```typescript
// .env
PUBLIC_SITE_URL=https://2x.nz

// 在代码中使用
const siteUrl = import.meta.env.PUBLIC_SITE_URL || 'https://2x.nz';
```

## SEO 配置

站点的 SEO 元数据在 `src/routes/+layout.svelte` 中配置：

- `<title>` - 页面标题
- `<meta name="description">` - 页面描述
- `<meta property="og:*">` - Open Graph 标签（社交媒体分享）
- `<link rel="canonical">` - 规范链接

每个页面可以通过 `<svelte:head>` 覆盖这些设置。

## 主题颜色

在 `src/app.html` 中配置：

```html
<meta name="theme-color" content="#ffffff" />
```

这会影响浏览器地址栏的颜色（移动端）。
