# SVAF - SvelteKit + shadcn-svelte

一个使用 SvelteKit 和 shadcn-svelte UI 组件库的静态站点生成（SSG）项目。

## 技术栈

- **SvelteKit** - 全栈 Svelte 框架
- **shadcn-svelte** - 高质量的 UI 组件库
- **Tailwind CSS v4** - 实用优先的 CSS 框架
- **TypeScript** - 类型安全
- **Maia 设计系统** - Hugeicons + Figtree 字体

## 开发

### 启动开发服务器

```bash
pnpm dev
```

开发服务器将在 `http://localhost:5173` 启动

你也可以自动打开浏览器：

```bash
pnpm dev -- --open
```

### 构建静态站点

```bash
pnpm build
```

构建后的静态文件将输出到 `build` 目录

### 预览构建结果

```bash
pnpm preview
```

## 添加 UI 组件

使用 shadcn-svelte CLI 添加更多组件：

```bash
# 添加单个组件
npx shadcn-svelte@latest add button
npx shadcn-svelte@latest add card
npx shadcn-svelte@latest add input

# 查看所有可用组件
npx shadcn-svelte@latest add
```

## 项目结构

```
src/
├── lib/
│   ├── components/
│   │   └── ui/          # shadcn-svelte 组件
│   └── utils/           # 工具函数
├── routes/
│   ├── +layout.svelte   # 根布局
│   ├── +layout.ts       # SSG 配置
│   └── +page.svelte     # 首页
└── app.css              # 全局样式
```

## 配置

- `components.json` - shadcn-svelte 配置
- `svelte.config.js` - SvelteKit 配置（使用 adapter-static）
- `vite.config.ts` - Vite 配置
- `src/routes/+layout.ts` - 启用预渲染和禁用 SSR

## SSG 模式

此项目配置为静态站点生成（SSG）模式：

- 使用 `@sveltejs/adapter-static` 适配器
- 在 `src/routes/+layout.ts` 中设置 `prerender = true` 和 `ssr = false`
- 构建时会生成纯静态 HTML/CSS/JS 文件
- 可以部署到任何静态托管服务（Vercel、Netlify、GitHub Pages 等）
