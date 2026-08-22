---
title: 从 SPA 到全站 SSR：2x.nz 的服务端渲染实践录
description: 上篇 SEO 的文章里我提到已经把网站从 Next.js 迁到了 Vite+React Router 7 的纯 SPA，并靠边缘
  Worker+路由级元数据+预渲染四管齐下搞定了 SEO。但 SPA 终究有天花板——比如禁用 JS 后整页空白这种硬伤，
  不是边缘补丁能解决的。这篇文章记录 2x.nz 从 SPA 再次迁移到 React Router 7 Framework Mode 全站 SSR
  的完整过程，包括架构选型、坑位清单、部署流水线和运维保障。
image: img/cover-fullstack-ssr.png
published: 2026-07-27
draft: false
pinned: false
tags: [开发]

---

> [!CAUTION] 本文使用 DeepSeek-V4-Pro 编写。

## 引言

我在上篇文章[纯前端 SPA 的 SEO 自救指南](/posts/svaf-next-seo)里详细讲了一遍我是怎么靠边缘 Worker + 路由级元数据 + 结构化数据那套组合拳，让一个纯 SPA 网站在搜索引擎和社交爬虫面前装成传统多页网站的。这套方案跑了不到三天就被我放弃了——不是因为 SEO 效果不行，而是架构太复杂了。各种 Worker 路由叠在一起，你完全搞不清主站某个路径到底是主站本身提供的，还是被别的 Worker 路由截胡了；再加上回源规则的重写，这个路径到底是真的还是被改写过的，根本无从判断。Google 和百度确实收得挺好，分享卡片也正常展开——表面上看起来 SEO 问题解决了，但底下的复杂度已经失控。

但有两个硬伤是边缘补丁怎么都盖不住的：

1. **禁用 JavaScript 后，页面是什么样？** SPA 嘛，`<div id="root">` 里什么都没有，用户看到的是一片白。虽说现实中没多少人关 JS，而且我们已经做了内容分流——搜索引擎和社交爬虫看到的是边缘 Worker 预烘焙的 HTML，收录不成问题——但「看人下菜碟」本身就说明架构有根本性的缺陷，靠补丁过日子不是长久之计。
2. **架构越叠越复杂。** 一个页面三套渲染路径：边缘 Worker 给爬虫拼 HTML、SPA 自己给浏览器画界面、还有一堆 `<noscript>` 兜底。同一功能两份实现，改一处忘一处是常态。

于是在把博客拆到独立仓库、论坛独立部署、工具页稳定运行之后，我终于腾出手来做了一件事——**把整个 svaf-next 从纯 SPA 迁到 React Router 7 Framework Mode 的全站服务端渲染（SSR）**。

这篇文章就是这次迁移的完整记录。不吹不黑，把架构决策、踩过的坑、以及最终落地的运维方案都摊开来。

## 为什么是 React Router 7，不是 Next.js，也不是 Astro？

这个问题在社区里被问烂了，但我确实认真比较过。

我的上一个版本用的就是 Next.js Pages Router。Next.js 本身没问题，但它是一套全栈框架——Server Components、`"use client"` 边界、App Router 的文件约定……这些能力在你真的需要的时候是利器，但对我这种「外壳 SSR + 交互做岛」的场景来说，它们更像是必须绕开的约束。

React Router 7 的 Framework Mode 是另一个极端：它就做一件事——**把路由映射到 loader → component 这条链路，loader 在服务端跑、component 同构渲染**。没有 Server Components，没有 `"use client"` 分界线，一个组件就是一份代码。对我要做的事刚刚好。

那 Astro 呢？它在内容驱动型网站这个赛道确实很能打，但我有明确的理由不选它：

1. **AI 辅助开发的代码质量不过关。** 之前用 Astro 开发的时候，AI 生成的 `.astro` 模板代码经常出低级错误——语法混搭、作用域理解偏差、组件边界模糊。这不是 Astro 本身的问题，但在 2026 年 AI 辅助编程已经成为日常的背景下，工具的 AI 友好度就是一个真实的选型考虑。React/JSX 生态在训练数据量上天然占优，AI 生成的 React 代码质量明显更高。
2. **交互多了以后还是得缝框架。** Astro 是为内容驱动型网站设计的，核心是 `.astro` 模板零 JS 输出。但我的站点有大量交互——论坛发帖编辑器、工具页的 canvas 操作、全站搜索——这些在 Astro 里要么用 `client:load` 挂 React/Vue 组件，要么用 Island Architecture 拼。问题是这些交互之间共享状态（比如全局搜索框和搜索结果页），拼 Island 的结果是状态管理变成一场灾难。React Router 一个路由树就能搞定的事情，在 Astro 里要拆成若干个互相不知道对方存在的孤岛。
3. **代码演进路径不支持。** 这个项目的代码演进路径是 Next.js → `next export` → 静出 SPA → React Router SPA → React Router SSR。全程在 React 生态内，组件库、状态管理、路由逻辑一路复用。引入 Astro 意味着大量重写，而它带来的收益——内容型页面的零 JS 输出——对于已经用 SSR + `useEffect` 做好客户端能力分离的项目来说，边际收益很小。

而且我本来就用的 React Router，API 上是顺迁而不是重写：

```
旧：react-router.config.ts  tsx3: false,   入口 main.tsx → <BrowserRouter>
新：react-router.config.ts  tsx3: true,    入口 app/root.tsx → 全站 SSR
```

另外还有一个工程上的原因——**部署**。Next.js 需要 `next start`，那是一个完整的 Node 进程，而我需要控制 Express 的 `express.static` 细节（后面会讲）。RR7 就给了我一个标准的 `server.js`，我可以完全控制 Express 中间件的顺序和行为。

## 架构总览：壳是 SSR，交互是岛

整个网站的渲染策略可以概括为一句话：**静态壳走服务端渲染，动态交互做客户端岛**。

```
app/root.tsx          ← <html> 骨架、Meta/Links/Scripts（SSR）
app/routes.ts         ← 路由表（SSR）
app/routes/*.tsx      ← 薄包装层：loader + meta，复用 src/ 组件
src/app/*/page.tsx    ← 真正的页面组件（同构，SSR+CSR 同一份代码）
src/components/ui/    ← 自研 Shell UI 组件库（零第三方依赖）
```

关键设计原则就三条：

**1. 路由层只管数据，UI 层只管渲染。** `app/routes/posts.tsx` 只是个壳——它调用 loader 拿数据、写 meta 标签、然后把数据当 props 传给 `src/app/posts/page.tsx`。页面组件本身不 import 任何服务端专用模块（比如 `fs`、`pg`），所以同构无压力。

**2. 不要给已经有 loader 数据的组件包 `<Suspense>`。** 这是我踩的第一个大坑。loader 已经把数据拿到了，组件不会 suspend，但 React 流式 SSR 仍然会为每个 Suspense 边界生成占位注释（`<!--$?-->` 和 `<template id="B:0">`），把内容甩进响应末尾的 `<div hidden>`，靠内联 `$RC()` 脚本搬回原位——禁用 JS 时整页空白。自查：
```bash
curl 页面 | grep 'div hidden id="S:'  # 应为 0
```

**3. 客户端专用能力走 `useEffect`，不阻塞首屏。** watermark、convert、tier 这些工具页有十几处 canvas 调用，但它们全都在 `useEffect` 或事件回调里，SSR 完全跑得动。唯一保留整页 `ClientOnly` 的是 `/draw` 系列路由——canvas/WebGL 在组件顶层就有依赖，SSR 零收益。但 `meta()` 仍在服务端直出。

## 禁用 JS 是硬指标：七个意料之外的坑

「用户关掉 JavaScript 后看到什么」是我迁到 SSR 后的核心验收标准。不是「大部分可用」，是**必须可用**。下面是实际踩过的坑，按出坑难度从低到高排列。

### 坑 1：`<Suspense>` 会杀死无 JS 页面

前面说过了，不再展开。一句话：**有 loader 数据的组件别包 Suspense。**

### 坑 2：分页和筛选必须是真链接

论坛分页曾经是 `onClick` 按钮——点一下触发 `useState` 翻页。禁用 JS 时点了没反应，99 篇帖子里只有前 20 篇能被爬虫发现。改成 `<Link>` / `<Form method="get">` 后，有 JS 时走客户端导航、页面不重载，无 JS 时变成整页跳转——两边都不亏。

### 坑 3：`<noscript>` 里放元素会导致水合失配

这是 React 的一个已知问题（#418）：浏览器在 JS 开启时**不把 noscript 内容解析成 DOM**，React 却按元素去水合。必须用 `dangerouslySetInnerHTML`。我被这个坑绊倒过两次——一次是 Cookie 横幅，一次是论坛的分类兜底 UI。

### 坑 4：`@iconify/react` 的 SSR 输出是空 `<span>`

Iconify 的 React 组件在服务端只渲染一个空壳，真正的 SVG 数据是客户端运行时向 API 拉的。SSR 输出就是 `<span></span>`，客户端水合后从内部存储查图标——但服务端写入的内部存储和浏览器端不是同一个，必然水合失配。

解法：`scripts/build-icon-subset.mjs` 在构建期扫描全站 `Icon` 组件的引用，把用到的图标预先抽出成静态 JSON。`Icon` 组件直接查表出 `<svg>`，不依赖运行时网络。**这个脚本随 `pnpm build` 自动重跑**，加新图标不需要手动维护。

### 坑 5：`backdrop-filter` 会让 `fixed` 后代脱轨

移动端的汉堡菜单是个 `<details>` 抽屉，原本用 `position:fixed` 定位到视口。但 header 带了 `backdrop-blur-md`，而 CSS 规范规定 `backdrop-filter` 会成为 fixed 后代的新包含块——抽屉被压进 56px 高的 header 里，实测面板整个塌掉。改成 `absolute` 相对 header 定位即可，因为 header 本身已是 `fixed inset-x-0`。

### 坑 6：按需挂载重组件

`MermaidRenderer` 一挂载就 `import('mermaid')`（~150KB：mermaid.core + rough + purify + cytoscape……），而 159 篇文章里只有 6 篇含图表。此前无条件渲染让 96% 的读者白下这堆东西。

现在改了双重门禁：路由层先检查 `html.includes('class="mermaid"')` 决定是否挂载组件，组件内再兜一层 `document.querySelector('.mermaid')`。单篇文章 JS 从 400KB / 50 请求降到 184KB / 30 请求。

### 坑 7：DOMPurify 在 Node 里跑不了

DOMPurify 依赖真实 DOM API，Node 里没有。SSR 之前，SPA 时代的净化全在浏览器端；SSR 之后，论坛帖子的正文由 loader 用 `renderMarkdown` 预渲染，如果净化这一步被跳过，用户投稿里的 `<script>` / `on*` 就会原样穿过。

解法是 `app/lib/sanitize.server.ts`——用 jsdom 模拟 DOM，在上面跑 DOMPurify，与客户端逐字节等价。**不要自造标签白名单**，和客户端不一致会导致内容漂移。

## 博客不绑在主项目里：为什么不做 SSG

这一段值得单独拿出来讲，因为它决定了整个站点的内容获取策略。

无论是旧项目还是新项目，**2x.nz 从来没有用过 SSG**。旧项目是纯 CSR——前端在浏览器里发请求拉博客后端的 `posts.json` 索引，拿到列表后再按需取单篇 markdown 回来渲染。新项目是 SSR+ISR——服务端在请求时读本地文件渲染 HTML，缓存按 `generatedAt` 版本标记失效。

为什么不做 SSG？原因非常简单：**我不想把博客文章和图片打包到主项目的源码里面。** 一百多篇带全文的 markdown、上千张原图（单张最大 714KB），塞进源码里构建时间和体积都会爆炸。旧项目时代我甚至专门写过一篇文章讲这件事——[整个博客非得塞到网站源码吗？不！纯前端的前后端分离全部搞定！](/posts/micro-blog-service)。

所以博客内容始终放在独立的仓库里（eleventy-blog-pagescms）。实际写博客的体验分两种情况：

**人来写。** 登录 Pages CMS 的 Web 后台，直接在浏览器里写 Markdown、上传封面图、填好 frontmatter，点「发布」就完事了。Pages CMS 会替你把内容推到 GitHub，触发 Action 自动构建，构建完成后通过 webhook 回调 VPS 上的 `/internal/revalidate`——ISR 缓存失效、新文章即时上线。全程不用碰 Git、不用打开终端、甚至不用知道自己写的东西最后跑在哪个服务器上。

**AI 来写。** 更简单。AI 直接读博客仓库的 `posts/` 目录了解现有风格和 frontmatter 约定，写完一篇 Markdown 推到仓库，手动触发一下 GitHub Action 就上线了。整个流程 AI 不需要理解主站的 SSR 架构，也不需要知道论坛的 D1 表结构——它只需要面对一个纯内容仓库。

反过来想，如果把博客内容直接缝在主项目的源码里，会有什么问题？人来写的话，要么在本地电脑上存一份主项目源码、改完文章再推送——这过程中你完全可能不小心改到别的文件，误伤功能代码。要么把 Pages CMS 接到主项目仓库——但你在后台写博客的时候，AI 可能正在帮你改论坛的反滥用逻辑，两边的 commit 搅在一起，rebase 和 merge 冲突是家常便饭，commit 历史会乱得没法看。再加上文章 + 图片 + 业务逻辑全塞在一个仓库里，clone 一次等半天，构建一次喝杯咖啡——拆分是唯一合理的决定。

不过旧项目的拆分方式过于激进了：它不光把内容拆出去，连前端的壳也拆了——博客数据在 Cloudflare Workers 上、渲染在浏览器端，两者之间只有 JSON。用户感知到的是多一次网络请求、多一秒白屏。而现在用 SSR + ISR 的方案，博客内容和主站 UI 在服务端就合在一起了——**用户完全感知不到博客是外部数据源，只有开发者才知道它们是分开的。**

论坛的数据源是本机的 D1 数据库，帖子实时变化，同样不需要构建。

所以我把职责一刀切了：

| 产物 | 生成方 | 本站角色 |
|---|---|---|
| 博客 sitemap | eleventy 仓库 Action | **代理**（读本地文件，不出网） |
| RSS | eleventy 仓库 Action | **代理** |
| 论坛 sitemap | svaf-next 实时查询 D1 | **生成** |
| 静态页 sitemap | svaf-next 内置路由表 | **生成** |

这里有一个非显而易见的细节：**RSS `<enclosure>` 的 `length` 属性只能在文件系统上拿**。

RSS 2.0 规范要求封面图同时带 `url`、`length`、`type` 三个属性，缺一个 Search Console 就报「缺少 XML 属性」（本站实测报了 30 处）。而封面图在 `raw-posts.2x.nz`，这个域名跑在 Cloudflare Workers 后面——缓存命中的响应**既不返回 `content-length`，也不支持 `Range: bytes=0-0`**（直接回 200 而非 206），网络侧根本拿不到字节数。

图片就在 eleventy 仓库 `img/` 下，`statSync` 一下就有了。所以 RSS 必须在那边生成，这也是职责划分的根本驱动力之一。

VPS 上的副本靠 `/internal/revalidate` webhook 更新：

```
GitHub Action deploy 完成
  → POST https://2x.nz/internal/revalidate?token=...
    → git pull origin main
    → node generate-posts.js
    → 清缓存 → RSS / sitemap / 博客正文即时生效
```

同时 `rss.xml` 的 content-type 从 `application/rss+xml` 改成了 `application/xml`——因为前者浏览器不当可渲染 XML，直接摊成纯文本。对 RSS 阅读器两者都是合法类型，订阅的自动发现靠的是 `<link rel="alternate">` 标签的 `type` 属性，跟响应头没关系。顺带给 RSS 和 sitemap 各加了一份终端风 XSL 样式表，在浏览器里打开也能看到排版好的可读页面，而不是裸 XML。

## 从边缘到 VPS：为什么选择自己托管

这次迁移表面上是 SPA → SSR，底层其实还有一个更大的转向：**从边缘函数 / 静态托管退回到自己管一台 VPS。**

上一代架构——纯 SPA + 边缘 Worker 预烘焙——理论上可以部署在任何静态托管服务上：Cloudflare Workers 拼路由、Cloudflare Pages 放静态资源、Vercel 跑构建。实际上我也是这么干的：博客拆在 Cloudflare Workers 上当远程数据源、论坛跑在 `wrangler dev` 上、主站静态资源放在 Cloudflare Pages。三个域名、三套部署流水线、三处日志分散在不同的仪表盘里。

迁到 VPS 之后，所有这些变成了一台机器上的一个进程。听起来像是倒退，但有几个实打实的好处：

1. **不再管理碎片化项目。** 博客、论坛、主站、工具页全在一个仓库里，一条 `pnpm build` 出所有产物。不用在三个 Cloudflare 仪表盘之间跳来跳去查日志，也不用为每个 Worker 单独配环境变量和路由规则。
2. **开发成本显著降低。** 本地 `node server.js` 起来就是完整环境——博客代理、论坛代理、RSS 代理、静态资源服务全在，和线上 1:1。之前每加一个子域名 Worker 就要在 `wrangler.toml` 里补路由、在 `_headers` 里补 CORS、在 GitHub Actions 里补部署步骤——现在都不需要了。
3. **用户体验更好。** 所有页面全站 SSR，首屏 HTML 直出，不再依赖客户端 JS 渲染 → 水合这一整条链路。禁用 JS 也能看到完整内容。

但代价也很明确：**你需要一台 VPS，而且你得自己管它。** supervisor、ufw、日志轮转、磁盘告警——这些都是静态托管不会让你操心的事。好在本站的 TLS 不需要自己续：VPS 只开 80 端口，Cloudflare 开小黄云代理回源，SSL 完全归 CF 管，证书到期自动续。

另外有两个迁移中特别明显的降级：

**1. 数据库失去了秒级回滚。** Cloudflare D1 自带 point-in-time recovery，删库了能从任意时间点恢复到秒级。但 D1 的查询层跑在 Cloudflare 边缘，`wrangler dev` 只能做远程代理——迁到 VPS 后论坛后端要跑在本机，D1 不再可用。我最终选了 SQLite 平替——功能对等，但秒级回滚没了。现在只能靠自己：定时 `sqlite3 .dump` 备份、上线前先在 staging 验证——说白了就是回到了传统 DBA 的谨慎模式。

**2. VPS 没有 Cloudflare 的云安全护盾。** D1 跑在 CF 的 VPC 里、Workers 默认隔离、DDoS 在边缘就被消化了。自己管 VPS 意味着你要自己盯安全公告、自己配 ufw、自己堵漏洞——SSRF、SQL 注入、依赖供应链攻击，每一样都得自己兜底。Cloudflare 那层小黄云挡了 DDoS，但应用层的安全问题它不会替你修。

如果你财力雄厚、不担心被刷账单，那直接把 SSR 应用部署在边缘函数上也是可行的。Cloudflare Workers 配合 [OpenNext](https://opennext.js.org) 这样的适配器就能在边缘起一个完整的 Next.js / React Router 运行时——全球分发、零运维。但有两个风险绕不开：

- **被 DDoS 攻击时服务不会停，但账单没有天花板。** 边缘函数的计费模型是按请求数 + CPU 时间，不设封顶。Cloudflare 的 DDoS 防护能保证你在线，不能保证你不破产。
- **边缘函数不是真正的 Node.js。** Workers 的运行时是 V8 Isolate，不是 Node 进程。跑 SSR 框架需要借助专门的适配器（Next.js → OpenNext，Remix → 有社区方案），这些适配器成熟度参差不齐，出了 bug 排查链很长——到底是你的代码、框架、还是适配器的问题，很难定位。

VPS 的方案则相反：**一台机器的账单是固定的**，不管你一天 100 UV 还是 10 万 UV（只要机器扛得住）。被攻击时 `ufw` 挡在前面，Cloudflare 小黄云在边缘扛 DDoS，最多打满带宽，不会有意外账单。对我这种个人站点来说，一个月几美元的固定成本远比弹性计费的心智负担划算。

所以这不是「VPS 比边缘函数好」的问题，是「固定成本 vs 弹性计费」的取舍。如果你的流量稳定、愿意做运维，选 VPS；如果你追求零运维、能承受账单波动，选边缘函数。

## 近零停机部署

部署到 VPS 这件事，社区里多数教程是 `rsync` + `pm2 restart`。但 SSR 应用有个特殊问题：**构建会清空 `build/client/assets`**，而旧进程仍然在发 HTML 引用那些被删掉的哈希文件名——构建的一两分钟里，访客会拿到 404 的 JS/CSS。

解法是**旁路构建 + 原子替换**：

```bash
# 构建到临时目录，不动正在服务的 build/
SVAF_BUILD_DIR=build-next npm run build

# server bundle 里硬写了构建目录名，修正它
sed -i 's|assetsBuildDirectory = "build-next/client"|
          assetsBuildDirectory = "build/client"|' build-next/server/index.js

# 原子替换
rm -rf build.old && mv build build.old && mv build-next build

# 优雅重启（SIGTERM 会排空已有连接）
supervisorctl restart svaf-ssr:
```

`server.js` 收 SIGTERM 后先停止接收新连接、等现有请求处理完再退出，这个间隙足够让 supervisor 启动新进程。观察下来实际断开窗口不到 1 秒，有感的停机窗口为零。`build.old` 留着当回滚——新版本翻车了直接 `mv build.old build && supervisorctl restart` 即可。

论坛后端更简单：`wrangler dev` 自带文件监听，改完源码保存即自动重建并热替换，**不需要重启进程**。实测 forum 进程 uptime 12 小时，期间经过了注册冷却逻辑、验证链接域名修复等多次改动，没有一次中断服务。

## 防滥用体系

SSR 让页面渲染不再依赖客户端 JS，但发邮件、注册、登录这些写操作仍然需要防滥用。本站靠的是三层：

**第一层：Cloudflare CDN。** VPS 只对公网开放 80 端口，Cloudflare 小黄云代理回源，真实 IP 只从 `CF-Connecting-IP` 取——这个头在边缘被覆写，伪造不进来。DDoS 在 CF 边缘就被消化了，打不到源站。

**第二层：按 IP 的冷却窗口。** 注册、找回密码、更换邮箱各有一个独立的冷却计时器。同一 IP 在窗口期内重复请求会收到 429，附带 `retryAfter` 秒数。邮箱维度的冷却保留——防止同一个人反复点重发，IP 维度的冷却补上——防止换邮箱接着刷。两者互补。

**第三层：登录爆破计数器。** 登录不用冷却（正常用户也会连登几次），改用滑动窗口内累计失败次数。失败到阈值就锁，成功登录立即清零。TOTP 错误也计数——6 位数字空间太小，不限流就是送分题。

所有限流参数都在管理后台可配，填 `0` 即关闭该项。默认值取了中等档：注册/找回密码/换邮箱各 5 分钟冷却，登录 15 分钟窗口内最多失败 10 次。

## 给 LLM 看的导航

最后顺手加了个小东西：`/llms.txt`，按 llmstxt.org 的约定格式，给大语言模型看的站点导航。

内容全部动态生成——博客文章读本地 `posts.json`、论坛帖子走 `127.0.0.1:8787` 实时查库，两者都随发文自动变化，零维护。正文里特意写明了 RSS 全文源的地址——对模型来说，一次抓 982KB 的 XML 比逐页翻 HTML 省事得多，这个细节说不定哪天哪个爬虫就真的用上了。

## 选型结论

如果你也在纠结 SSR 方案，我的经验可以总结成一句话：**外壳 SSR、交互做岛。** 不要因为有了 SSR 就把所有逻辑往服务端搬，也不要因为怕 SSR 的坑就继续在客户端硬撑。

- **不需要 Next.js 的全栈能力** 的时候，React Router 7 Framework Mode 够用且清爽。它只做路由 → loader → 同构 component 这一条链，没有 Server Components 的心智负担。
- **无 JS 可用性是验收标准，不是优化项。** 从第一天就 `curl` 页面检查，不要等上线了才发现禁用 JS 的用户看到的是空白。
- **内容和数据分离。** 博客文章和图片不打包进主项目，独立仓库通过 ISR 式的本地副本按需 SSR 渲染；论坛这种活数据才需要每次请求都查库。职责不清会导致同一个数据有两个生成源，然后两边漂移。
- **部署不比 SPA 复杂。** express.static + supervisor 就能跑，旁路构建 + 原子替换就能做到近零停机。不需要 Docker、不需要 K8s。

把博客从源码里拆出去（[那篇文章](/posts/micro-blog-service)）、给 SPA 加上 SEO（[那篇文章](/posts/svaf-next-seo)）、再到现在全站 SSR——这三次迁移下来，2x.nz 的前端架构终于到了我满意的状态。后面如果有时间，可能会再写一篇关于整个后端体系的（论坛 D1 → SQLite + 生图 nDI + Cloudflare 组网），那个坑更多。
