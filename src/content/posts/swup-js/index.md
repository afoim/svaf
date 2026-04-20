---
title: 解决困扰我多时的JS重复请求问题
published: 2025-11-18T00:46:02
description: 这篇文章记录了博客在接入动态访问量统计后，因 Swup 处理不当而产生重复请求的问题，以及最终的排查与修复过程
image: img/swup-js.webp
tags:
  - Swup
  - JS
draft: false
lang: ""
ai_level: 1
---

# 正式开始
正如标题所说，我的博客是在 [saicaca/fuwari: ✨A static blog template built with Astro.](https://github.com/saicaca/fuwari) 的基础上深度改造而来的。

和 Fuwari 原版一样，它本质上仍然是一个 **静态博客**：文章以 Markdown 文件形式维护，构建后输出为 HTML。

但原项目在设计之初并没有重点考虑 **动态功能**，例如我现在用到的 **访问量显示**，因此后续接入这类能力时就容易出现一些问题。

关于访问量显示的整体思路，我已经在 [这篇文章](/posts/static-view/) 中讲过。简单来说，它分为两步：1. 先获取全局分享 Token；2. 再使用这个 Token 请求实际访问量数据。

当时出现了一个比较奇怪的问题：第一步会发生多次重复请求。分析之后我发现，博客里有三个位置都用了同一套逻辑，而且彼此独立。也就是说，用户一打开页面，博客既会获取全站访问量，也会同时请求首屏几篇文章的访问量。

但这个全局分享 Token 在很长一段时间内其实都不会变化，这就导致出现了不少冗余请求。为了解决这个问题，我当时写了一个中间层：首次请求后把 Token 缓存在用户浏览器里，后续直接复用，不再重复请求。

不过后来还是有读者发现，某些页面依旧会多次请求 Umami，如图所示：
![](img/swup-js-1.webp)

于是他提交了一个 issue：[Bug: 站内转跳时由于swup处理不当导致的多umami实例 · Issue #79 · afoim/fuwari](https://github.com/afoim/fuwari/issues/79)。问题的核心是 Swup 不应该接管这类脚本资源，把相关 JS 排除后，问题确实得到了解决。

按 issue 中的方法调整后，我们随便打开一个页面，再来分析一次请求情况：
![](img/swup-js-2.webp)
我们只看Umami请求：
- https://cloud.umami.is/script.js ：Umami官方的全局JS，注入在所有页面中，用于后续将访客行为告知给Umami
- http://localhost:4321/js/umami-share.js ：之前写的中间件，用于避免多次请求Umami拿全局Token
- https://umami.2x.nz/analytics/us/api/websites/5d710dbd-3a2e-43e3-a553-97b415090c63/stats?startAt=0&endAt=1763429011353&unit=hour&timezone=Asia%2FShanghai&compare=false ：获取全站统计信息。为什么在文章页也会获取全站统计？因为全站统计被安放在用户配置块，而用户配置块全局可见
- https://umami.2x.nz/analytics/us/api/websites/5d710dbd-3a2e-43e3-a553-97b415090c63/stats?startAt=0&endAt=1763429243350&unit=hour&timezone=Asia%2FShanghai&path=eq.%2Fposts%2Fswup-js%2F&compare=false ：获取本页统计信息
- 两个预检请求：由于存在 CORS，请求源和被请求源不一致，因此浏览器会先发起预检请求，再决定是否继续发送正式请求。这是浏览器的安全机制，用来确认目标站点是否明确允许这次跨域访问。
- https://api-gateway.umami.dev/api/send ：Umami的官方JS，用于将本次访问的行为汇报给Umami

到这里，问题就算彻底解决了：没有多余实例，也没有冗余请求，整体请求链路也干净了很多。