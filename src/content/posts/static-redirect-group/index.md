---
title: 完全免费！搭建一个自己的短链服务！
published: 2026-01-14T15:39:31
description: 利用 Cloudflare Worker 和 GitHub，可以搭建一个纯静态、可自动维护的短链服务
image: img/static-redirect-group.webp
draft: false
lang: ""
ai_level: 2
---

# 前言
原本这篇内容更适合写进仓库的 `README`，因为它本质上就是一个简洁的自部署教程。不过在实际整理时，我发现如果强行拆成 GitHub Pages + Cloudflare Worker 的前后端分离方案，反而会增加不少额外工作。实际上，这个项目只需要一个 Cloudflare Worker 就能跑起来，所以干脆单独写成一篇文章，方便说明整体思路。

# 项目原理
这个项目和上一篇短链项目的思路比较接近，不过整体做得更精简一些。

首先，这个项目把前后端逻辑合并到了同一套体系里。前端基本不做复杂校验，主要校验工作都放在后端处理，这样就不用在两个项目之间来回维护规则。

由于前端部分非常简单，只有两个 HTML 页面（一个用于创建短链，一个用于跳转），因此合并后也不会显得臃肿。

另外，这个项目不再依赖 Cloudflare 服务端提供的 301/302 重定向规则，因此也绕开了 2000 条静态重定向的数量限制。它的做法是：当 CDN 请求静态资源命中 404 时，回退到 `404.html`，再由其中的 JavaScript 负责查询短链规则并执行跳转，思路上有些类似 Nginx 的伪静态。

如果某个 `pathname` 没有命中任何规则，也会统一落到默认回退源，这样就能兼容类似 `https://2x.nz/posts/pin/ --> https://blog.acofork.com/posts/pin/` 这样的场景。

创建短链的逻辑和上一个项目也比较相似：由 Worker 代理访问 GitHub，修改对应的 JS 文件并新增一条短链规则，然后推送到仓库。提交完成后会自动触发 Cloudflare Worker 的重新构建，稍等片刻后，新路径就能正常跳转。

最后，这个项目还支持有效期。实现方式也很直接：前端在创建短链时把过期时间一并传给后端，后端将其写入规则文件，再借助 GitHub Action 定时巡检并清理过期短链。

# 在哪搞个短链
我的 `2x.nz` 是在 https://porkbun.com 购买的，价格大概是一年一百元左右。其他后缀也可以考虑，比如 `.im`、`.mk`。

# 正式搭建你的短链服务

首先，Fork仓库

[afoim/Static_Redirect_Group](https://github.com/afoim/Static_Redirect_Group)

接下来，先修改一些硬编码内容。由于 Cloudflare Worker 在处理静态资源时不能直接使用环境变量，因此部分信息是直接写在 HTML 里的。你可以在所有 HTML 文件中搜索 `afoim` 并替换成自己的内容；如果你愿意，也可以额外增加一层配置，并在构建阶段注入这些值。

然后，请修改 `js` 文件夹中的短链规则，替换成你自己的配置。

再接着，创建一个 GitHub Token，只需要授予 `repo` 权限即可。

继续，绑定机密环境变量，使用 `wrangler secret put XXX`

| 变量名 | 值 | 说明 |
| :--- | :--- | :--- |
| `GITHUB_TOKEN` | `ghp_xxxx...` | 刚才申请的 Token |
| `GITHUB_OWNER` | `你的GitHub用户名` | 例如 `afoim` |
| `GITHUB_REPO` | `Static_Redirect_Group` | 你的仓库名 |
| `BASE_DOMAIN` | `你的短链域名` | 例如 `u.2x.nz` 或 Worker 的默认域名 `xxx.workers.dev` |

完成这些配置后，访问 `/_url` 就可以开始创建短链了。

# 防护
建议重点保护创建短链的入口，避免被滥刷。你可以使用 Cloudflare Turnstile、速率限制或其他方式进行防护。

在Cloudflare创建一个WAF规则

当传入请求匹配时...
```sql
(http.host eq "你的域名" and (
  http.request.uri.path eq "/_url"
  or http.request.uri.path wildcard "/api/*"
))
```

然后采取措施…

**交互式质询** 

