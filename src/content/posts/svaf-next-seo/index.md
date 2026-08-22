---
title: 纯前端 SPA 的 SEO 自救指南：我是如何让博客和论坛被百度谷歌乖乖收录的
description: 众所周知，现在流行前后端分离，而 SPA 更是许多个人网站的首选。但 SPA 天生的 SEO 劣势（爬虫不执行
  JS）让很多人头疼不已。这篇文章就来复盘一下， 我（二叉树树）的网站是如何通过边缘 Worker + 路由级元数据 + 结构化数据 +
  预渲染四管齐下，让搜索引擎和社交爬虫在 SPA 里也能畅游的。
image: img/cover-svaf-next-seo.png
published: 2026-07-22
draft: false
pinned: false
tags: [开发]

---
> [!CAUTION] 本文使用 DeepSeek-V4-Flash 编写。

## 引言

众所周知，现在是个做网站的都要把前后端分离一下。我赶了一趟晚集，在 2026 年的时候也把网站从 Next.js 迁移到了 Vite + React Router 7 的纯 SPA（单页应用）。

为什么要这么干？因为受够了每次改一行代码就要重新构建整个站点的 SSG 模式（如果你还有 100 多篇博文和几百张图片，你也会疯掉的）。具体可以看我之前那篇文章：

[整个博客非得塞到网站源码吗？不！纯前端的前后端分离全部搞定！](/posts/micro-blog-service)

但问题来了：SPA 是靠 JavaScript 渲染页面的。搜索引擎爬虫虽然进步了很多，大部分已经能跑 JS，但社交平台（微信、Telegram、Discord）的爬虫和部分搜索引擎在抓取链接分享卡片时，依然不执行 JavaScript。这意味着如果你的网站是个 SPA，别人发你链接到群里，分享卡片只能看到一片空白和默认标题，极其掉价。

所以我不光要把网站做成 SPA，还要让它在各种爬虫面前表现得像传统多页网站一样优雅。这篇文章就从头到尾盘一盘我是怎么做到的。

## 问题拆解

爬虫访问一个 SPA 页面时，大概下面这几个东西是会出问题的：

1. **标题和描述** —— SPA 的 HTML 里只有一个默认 `<title>`，JavaScript 执行后才能改成正确标题，但爬虫不等 JS
2. **分享卡片（OG/Twitter meta）** —— 同上理由，Meta 标签也没机会被改
3. **内容本身** —— 爬虫看不到文章正文，觉得这是个空页面
4. **结构化数据** —— JSON-LD 这玩意也是 JS 注入的，爬虫拿不到
5. **Sitemap** —— 动态页面没法预先知道有哪些路径
6. **RSS** —— 前端 SPA 本身没有 `/rss.xml`

每一个问题都需要策略性地解决。下面进入正题。

## 第一层：共用路由元数据表

最核心的出发点：我需要一个**客户端和边缘都能读**的路由表。每一页的 title、description、是否允许索引，都统一写在这个表里，两侧永不漂移。

做法非常简单粗暴——写一个纯数据+纯函数的 TypeScript 文件，不引入任何浏览器或 Node API：

```ts
export const STATIC_ROUTE_META: Record<string, RouteMeta> = {
  '/': { title: '', description: '二叉树树的个人网站 ……' },
  '/posts': { title: '博客文章', description: '……' },
  '/forum': { title: '论坛社区', description: '……' },
  '/draw': { title: 'AI 生图', description: '……' },
  // ... 其他所有路由
};
export function resolveRouteMeta(pathname: string): RouteMeta { ... }
```

客户端路由切换时，`SeoManager` 组件通过 `useLocation()` 拿到当前路径，查这张表，调用 `applySeo()` 重写 `<head>` 里的 title、description、canonical、OG、Twitter 和 JSON-LD 标签。

这东西看起来很简单，但它解决了一个本质问题：**路由和元数据不再是写死的 HTML，而是可编程的。** 我新增一个页面时，只要在这个表加一条记录，前端和边缘就都有了对应 meta，不需要到处改。

## 第二层：边缘 Worker 注入——爬虫的救命稻草

光客户端写 meta 是不够的，爬虫进来看不到。解决方案是让 Cloudflare Worker 在返回 HTML 之前，先用 `HTMLRewriter` 把 meta 标签替换成正确的值。

这个 Worker 只处理 SPA 路由路径（没有对应静态文件的路径），逻辑很简单：

```
请求进来 → 从 ASSETS 拿到 index.html → 用 HTMLRewriter 重写 title/description/canonical/OG → 返回
```

但关键在于，它和客户端**共用同一张路由表** —— 没错，Worker 直接 import 了 `src/lib/seo/route-meta.ts`。这意味着前后端使用同一份数据源，不会出现 "客户端显示的是这个标题，爬虫抓到的却是另一个" 的割裂局面。

具体实现大概这样：

```ts
let rewriter = new HTMLRewriter()
  .on('title', { element(el) { el.setInnerContent(title); } })
  .on('meta[name="description"]', new SetContent(meta.description))
  .on('link[rel="canonical"]', new SetHref(canonical))
  .on('meta[property="og:title"]', new SetContent(title))
  .on('meta[property="og:image"]', new SetContent(ogImage));
// ... 更多 meta 标签
return rewriter.transform(assetRes);
```

这样一来，微信、Telegram、Discord 的爬虫来抓链接分享卡片时，拿到的是一个已被正确注入 OG 标签的完整 HTML，分享卡片就能正常显示了。

## 第三层：博客文章边缘预渲染

对于静态页面，注入 title 和 description 已经足够了。但对于博客文章这种内容型页面，爬虫如果能直接看到正文，对 SEO 是极大的加分。

我的博客内容来源于另一个独立的 eleventy 仓库（生成 `posts.json` 索引 + Markdown 原文），存储在 `raw-posts.2x.nz` 域名下。Worker 在收到 `/posts/<slug>` 请求时，会：

1. 从边缘缓存（或回源）拉取 `posts.json` 索引，找到文章元数据
2. 拉取对应的 `.md` 原文
3. 用和客户端**完全同一套**的 markdown 渲染管线（`markdown-it` + callout + hljs）渲染成 HTML
4. 把渲染后的 HTML 注入到 `<div id="root">` 中

这就意味着非 JS 爬虫在访问文章页时，直接就能拿到包含完整正文的 HTML。而浏览器端 React 挂载时，`createRoot().render()` 会直接替换掉预渲染的内容，不存在 hydration 冲突——因为 SPA 本身就是 CSR，不是 SSR。

效果？来看看实际搜索结果就知道了。

Google 搜索 "二叉树树"，首页第一就是本站，正文片段也能正常展示：

![Google 搜索 "二叉树树" 结果](img/search-google.jpg)

百度同样有很好的收录表现：

![百度搜索 "二叉树树" 结果](img/search-baidu.jpg)

Bing 也没落下，同样排名靠前：

![Bing 搜索 "二叉树树" 结果](img/search-bing.jpg)

更让人惊喜的是，这套 SEO 方案不只让网站名称能搜到，一些技术关键词也有不错的权重。比如搜索 "Cloudflare优选"，在 Google 和 Bing 上本站同样位列前排：

![Google 搜索 "Cloudflare优选" 结果](img/search-google-cf.jpg)

![Bing 搜索 "Cloudflare优选" 结果](img/search-bing-cf.jpg)

这就是边缘 Worker + 路由元数据 + 预渲染 + 结构化数据四管齐下的成果。

而对于 `/posts` 列表页，Worker 也会生成一个简单的文章链接列表注入 `#root`，方便爬虫发现所有文章入口：

```html
<h1>博客文章</h1><ul>
  <li><time>2026-07-17</time><a href="/posts/micro-blog-service">整个博客非得塞到网站源码吗？...</a></li>
  ...
</ul>
```

## 第四层：论坛帖子结构化数据与 SEO

论坛相对博客来说更特殊一些：内容来自用户生成，动态性更强，首页列表页不需要预渲染（因为数据一直变），但详情页必须要让爬虫能看懂。

论坛详情页的做法是这样的：

1. **边缘 Worker 侧**：拦截 `/forum/post/<id>` 请求，调用论坛后端 API（`/api/posts/<id>`）获取帖子数据，注入 title/description/OG，并附带 `DiscussionForumPosting` 类型的 JSON-LD 结构化数据
2. **客户端侧**：`PostContent` 组件在拿到帖子数据后，调用 `applySeo()` 覆写为真实数据——包括 `DiscussionForumPosting` 类型的 JSON-LD，其中包含了点赞数、评论数、作者等交互数据

这个 `DiscussionForumPosting` 结构化数据是 Google 富媒体结果中的一种，可以在搜索结果中显示帖子标题、作者、点赞数和评论数——对论坛帖子来说非常有用。

客户端代码大概长这样：

```ts
applySeo({
  title: p.title,
  description: makeExcerpt(p.content || ''),
  path: `/forum/post/${id}`,
  ogType: 'article',
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'DiscussionForumPosting',
    headline: p.title,
    interactionStatistic: [
      { '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/LikeAction',
        userInteractionCount: p.likeCount ?? 0 },
      { '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/CommentAction',
        userInteractionCount: p.commentCount ?? 0 },
    ],
  },
});
```

这里有个关键点：论坛的 API 调用在边缘 Worker 中做了 5 分钟边缘缓存 + 一次自动重试。内容源 Worker 的冷启动偶尔会超时，重试一次能显著降低爬虫拿到兜底 meta 的概率——搜索引擎爬虫没有那么耐心，你响应慢了它就直接走了。

## 第五层：Sitemap 动态生成

传统 SSG 的 sitemap 是构建时生成的静态 XML 文件。但我的博客文章是存在独立仓库的，论坛帖子更是用户实时发布的，不可能在构建时知道所有路径。

解决方案还是在 Worker 层面动态生成。`/sitemap.xml` 请求进来后，Worker 同时做三件事：

1. 拉取 `posts.json` 索引获取所有博客文章路径
2. 调用论坛 API `/api/posts?limit=100` 获取最新帖子路径
3. 合并所有静态页面路径（从路由表自动收集）

然后拼装成一个完整的 `urlset` 返回，带 5 分钟缓存：

```ts
const urls = [
  ...indexableStaticPaths().map(p => `<url><loc>${SITE_URL}${p}</loc></url>`),
  ...posts.map(p => `<url><loc>${SITE_URL}/posts/${p.slug}</loc></url>`),
  ...forumPosts.map(p => `<url><loc>${SITE_URL}/forum/post/${p.id}</loc></url>`),
];
```

如果 URL 数量超过 `SITEMAP_SHARD_SIZE`（我设为 10000），还会自动分片成 sitemap 索引 + 多个分片文件，适配将来内容增长。

Edge 缓存 5 分钟的意思是：Google 来抓 sitemap 时，大部分情况直接命中缓存，只有首次或缓存过期才会触发一次完整的回源构建，对性能几乎无影响。

## 第六层：RSS —— 其实纯透传就够了

RSS 我采取了一个非常偷懒但非常聪明的做法：**不做任何复杂处理，直接从后端透传。**

博客的内容源（eleventy 仓库）在构建时已经生成了完整的 `rss.xml`，带有 `content:encoded` 全文和 `media:content` 封面图。Worker 只需要把这个文件透传给用户就行：

```ts
const upstream = await fetch(`${env.POSTS_DOMAIN}/rss.xml`);
return new Response(upstream.body, {
  headers: { 'content-type': 'application/rss+xml; charset=utf-8' },
});
```

这样一来，RSS 阅读器（如 Folo、Feedly）拿到的 feed 链接是 `2x.nz/rss.xml`，但内容的真正来源是 `raw-posts.2x.nz/rss.xml`。用户感知不到这层代理，看到的只有一个统一的域名。

为什么这么做？因为在博客前后端分离后，如果你让 RSS 阅读器直接去读 `raw-posts.2x.nz/rss.xml`，用户会看到一个丑陋的原始域名，并且点文章链接会跳到后端域名而非美化后的前端 SPA。透传 + 链接重写一次解决两个问题。

## 第七层：Uniform URL —— 无尾斜杠大统一

你可能觉得这不算 SEO，但在 Google 看来，`/posts/x` 和 `/posts/x/` 是两个不同的 URL。如果两种形态同时存在，收录会分裂，浏览量会被记成两条，PageRank 也会被稀释。

我是怎么解决的？**四面围堵：**

1. **边缘 Worker**：任何带尾斜杠的路径（根路径除外）直接 301 重定向到无斜杠版本
2. **SPA 路由内部**：`TrailingSlashRedirect` 组件兜底 SPA 内部导航（history API 不走边缘）
3. **sitemap**：生成的 URL 全部使用 `canonicalPath()` 统一去斜杠
4. **浏览量统计**：`normalizePathname()` 同样标准化路径后再上报

四者必须保持同一个形态，任何一处漂移都会导致分裂。这在测试里很容易漏掉，但一旦出了幺蛾子，你的搜索流量就会莫名其妙地下降一截。

## 第八层：结构化数据的完整覆盖

最后串一下所有 JSON-LD 结构化数据的覆盖：


| 页面类型 | JSON-LD 类型 | 用途 |
| --------- | ------------------------ | ---------------------- |
| 整站 | `WebSite` + `Person` | 品牌搜索、知识图谱 |
| 所有可索引页 | `BreadcrumbList` | Google 搜索结果里的面包屑路径 |
| 博客文章 | `BlogPosting` | 富媒体文章卡（标题+描述+日期+封面+作者） |
| 论坛帖子 | `DiscussionForumPosting` | 论坛帖子富媒体结果（点赞数+评论数） |
| 工具/登录/管理等 | 无（`noindex: true`） | 不让这些页面进索引 |


面包屑是自动计算的——从路由表的路径前缀逐级推导。比如 `/posts/xxx` 会自动生成 "二叉树树 › 博客文章 › <文章标题>" 的 BreadcrumbList。这意味着我不需要手动为每篇文章维护一个面包屑配置。

## 总结

总结一下这套架构的全貌：

```
用户/爬虫请求 → Cloudflare Worker
  ↓
  请求是静态资源（JS/CSS/图片）？→ 直接返回 ASSETS，不走 Worker
  请求是 SPA 路由（无对应文件）？→ Worker 开始工作
    ↓
  1. 解析 pathname
  2. 查路由表 → 拿到基础 meta（title/description/robots）
  3. /posts/<slug>？→ 拉 posts.json + .md → 预渲染全文 HTML → BlogPosting JSON-LD
  4. /forum/post/<id>？→ 调用论坛 API → DiscussionForumPosting JSON-LD
  5. /sitemap.xml？→ 收集全站路径 → 输出 sitemap（自动分片）
  6. /rss.xml？→ 透传后端 RSS
  7. 其他路径 → 只注入 meta 标签
    ↓
  使用 HTMLRewriter 改写 index.html → 返回给客户端
    ↓
  客户端 React 挂载 → SeoManager 按路由表覆写 meta → 数据加载后 applySeo 覆写动态详情
```

这套方案的好处是：

- **低成本**：没有 SSR 服务器，没有 Node.js 后端，全靠 Cloudflare Worker 的边缘计算能力
- **同源同数据**：客户端和边缘共用路由表，不会出现前后端 meta 不一致的尴尬
- **渐进增强**：爬虫看到的是预渲染版本，用户看到的是完整 SPA，各取所需
- **自动扩展**：新增页面只要加路由表记录，sitemap 和 meta 自动跟进

当然也有一些代价和取舍：

- `posts.json` 携带所有文章元数据供搜索与边缘预读，但列表翻页实际走的是 `posts-{n}.json` 分片（每片 30 篇），不依赖全量索引的大小
- Worker 的 `HTMLRewriter` 有 512 个 handler 的上限，好在静态页面的 meta 标签数量固定，不受内容规模影响
- 博客正文的预渲染只在边缘做，如果文章渲染失败，爬虫看到的还是空壳——所以要有优雅的降级策略

但总的来说，这套方案在 "纯前端 SPA" 和 "搜索引擎友好" 之间找到了一个不错的平衡点。对于个人网站和小型社区来说，已经绰绰有余了。

你听懂了吗？

有问题欢迎在论坛或评论区留言讨论~



## [2x.nz](http://2x.nz) 全自动开发焚诀

```markdown
你是一个运行在纯文本模式下的全托管 AI 工程师（无视觉多模态能力）。
请直接将“当前工作区目录”作为开发与测试环境，自主跑通并验证以下业务需求。

================================================================
【业务需求与变更目标】
{{REQ}}
================================================================

【自主执行闭环流程】

阶段一：项目架构感知与环境准备
1. 静态分析：读取当前工作区目录结构、依赖文件（如 package.json）及源码，梳理项目架构并定位目标改动文件。
2. 本地服务启动：启动本地 Dev Server（例如 `npm run dev` / `npx serve . -p {{DEV_PORT}}`）。
3. 动态结构感知：通过 Node.js 执行 Headless Chromium (Playwright)，以指定 Viewport 访问本地开发地址，获取 DOM 树结构、组件选择器及初始计算样式 (Computed Style)。

阶段二：代码修改与功能实现
1. 根据需求修改源码（HTML/CSS/JS/组件等），确保符合标准的响应式或交互规范。
2. 为关键新增交互节点配置清晰的语义化属性（如 id、class 或 data-testid），以供自动化断言定位。

阶段三：无视觉自动化测试与代码自愈
编写并执行 Playwright/Node 测试脚本，完成以下逻辑断言：
1. **静态/动态状态断言**：通过 `window.getComputedStyle()` 与 DOM 状态检查目标元素的显隐（如 display/visibility/rect 坐标）、属性值及结构变化。
2. **交互动作断言**：模拟用户行为（点击、输入、切换等），等待渲染更新后校验页面状态是否符合预期的交互逻辑。
3. **环境适配断言**（若涉及响应式）：在不同的 Viewport 尺寸下测试，验证布局与样式切换正常。
4. **异常日志审计**：读取控制台 Log 和 Network 状态，确保无未捕获的 JS 异常或 404/500 请求。
*注：若任意断言失败，自主分析原因、修正代码，重复阶段三，直至测试 100% 通过。*

阶段四：收束、部署与生产验证
1. 测试全部通过后，创建 Git 提交：
2. 执行生产构建/部署命令，将代码上线
3. 驱动 Playwright 访问生产环境 HTTP 地址，重新运行阶段三的自动化功能与样式回归断言。
4. 全部正确后，向用户汇报修改内容与自动化验证结果。
```
