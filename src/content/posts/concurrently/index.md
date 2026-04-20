---
title: 你在做全栈吗？你想要前后端统一的热重载吗？
published: 2026-03-24T11:51:17
description: 经常做全栈的小伙伴们都知道，写完后端看效果要dev，写完前端看效果也要dev，那么有没有一劳永逸的解决方案呢？
image: img/concurrently.png
draft: false
lang: ""
---
# 引言

经常做全栈的小伙伴们都知道，写完后端看效果要dev，写完前端看效果也要dev，那么有没有一劳永逸的解决方案呢？

比如说我的项目：

[afoim/acofork_forum_backend](https://github.com/afoim/acofork_forum_backend)

前端是一坨React

![](img/concurrently-1.png)

后端是一坨 Typescript

![](img/concurrently-2.png)

而前端要用 Vite 来 Dev

![](img/concurrently-3.png)

那么后端还要使用 Wrangler 来 Dev

![](img/concurrently-4.png)

那么如果我们想要测试，就需要把前后端的dev一起拉起来，对吧？

但是不知道为什么，在今天之前，我都是用一种很奇妙的方法来做这件事的，那就是

*我先Build前端，然后让后端把前端build后的产物作为静态路由*

这会导致一个问题，由于最终是 Wrangler 起的 Dev，那么后端自然是可以热重载的了，那么前端呢？

在曾经，我改一次前端，就要 rebuild 一下，但是现在，我们有一个更好的解决方案，那就是：

**concurrently !**

它是一个能给前端 + 后端的 Dev 同时拉起来，这样，我们就同时得到了前后端的热重载，我们只需要专心的去改代码，网页会实时呈现效果

# 正式开始

首先，安装 concurrently 的 npm 包

```bash
npm install -D concurrently
```

接下来配置 `package.json` 。意为：调用 **concurrently** 工具同时运行 `npm run dev:frontend` 和 `npm run dev:backend` 

*dev-remote 是用来连接远程 D1 SQL 进行开发调试的*

```json title=package.json ins={7-8}
    "scripts": {
        "build:frontend": "vite build --config frontend/vite.config.ts",
        "dev:frontend": "vite --config frontend/vite.config.ts",
        "dev:backend": "wrangler dev",
        "dev:backend-remote": "wrangler dev --remote",
        "deploy": "npm run build:frontend && wrangler deploy",
        "dev": "concurrently \"npm run dev:frontend\" \"npm run dev:backend\"",
        "dev:remote": "concurrently \"npm run dev:frontend\" \"npm run dev:backend-remote\"",
        "start": "npm run build:frontend && wrangler dev",
        "test": "vitest run",
        "cf-typegen": "wrangler types"
```

最后，我们需要设置一下 Vite 的 Proxy ，将 `/api` 也就是后端的请求转发给 Wrangler ，配置 Vite 配置文件的 `server` 块

```ts vite.config.ts ins={5-9}
    server: {
        fs: {
            allow: ['..']
        },
        proxy: {
            '/api': {
                target: 'http://localhost:8787',
                changeOrigin: true
            }
        }
    }
```

然后，我们就可以使用一条命令，同时拉起前后端的 Dev ，并且都支持热重载

```bash
npm run dev
```

![](img/concurrently-5.png)

![](img/concurrently-6.png)