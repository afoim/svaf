---
title: 终极版！国内免梯上Github！
published: 2026-03-10T11:29:58
description: 巨简单！1分钟自建你的Github代理！
image: img/cf-gh.png
draft: false
lang: ""
---
# 视频

https://bilibili.com/video/BV16YcXzeEGJ

# 前言

原理这里不说，好奇的可以自行站内搜索

# 正式开始

复制该代码

[GithubSiteProxyForCloudflareWorker/worker.js at main · afoim/GithubSiteProxyForCloudflareWorker](https://github.com/afoim/GithubSiteProxyForCloudflareWorker/blob/main/worker.js)

部署到 Cloudflare Worker

创建DNS解析： 

```sql
*.yourdomain.com CNAME CloudflareCDN
```

![](img/gh-cf.png)

创建Worker路由：

```sql
*-gh.yourdomain.com
```

![](img/gh-cf-1.png)

创建重定向： 

```sql
gh.yourdomain.com 302 github-com-gh.yourdomain.com 
```

![](img/gh-cf-2.png)

屏蔽海外（海外你连不上Github？）

![](img/gh-cf-3.png)

享受它！访问：

```sql
gh.yourdomain.com/yourname
```

![](img/gh-cf-4.png)