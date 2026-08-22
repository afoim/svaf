---
title: EmDash，拉完了
published: '2026-07-03'
description: 昨晚看到有群U说什么能部署在CF的WordPress，我看看怎么个事！
draft: false
tags: [开发]
image: img/emdash-index.png
---
## 这是什么？

一句话说，这是一个支持 **完全部署在 Cloudflare 边缘** 上的 **类 WordPress CMS** 。但实际上，若想在CF上部署EmDash，你必须 [订阅 Workers Paid](https://www.cloudflare-cn.com/plans/developer-platform-pricing/) 。所以，大部分用户应该只能降级到Nodejs来部署EmDash

## 它的优点/缺点？

| 优点                                                                | 缺点               |
| ----------------------------------------------------------------- | ---------------- |
| 核心WordPress功能全都有                                                  | 少外围功能，如插件，主题     |
| 支持从WordPress导入文章                                                  | 只能导入文章           |
| 支持在CF边缘部署                                                         | 免费用户玩不了          |
| 基于 Astro 6 驱动，有完美的SEO                                             | 设置可配SEO的地方太少了    |
| 所有账户无密码登录，使用通行密钥代替                                                | 普通用户连创建管理员账号都做不到 |
| 框架先进，UI对齐 [dash.cloudflare.com](http://dash.cloudflare.com) ，未来可期 | 现阶段毛坯房           |

## 简单的部署流程？

1. 创建项目： `npm create emdash@latest`
2. 启动开发服务器： `npx emdash dev`
3. 创建反向代理指向端口 `4321`
4. 访问EmDash，创建管理员账号

## 一些槽点

1. 令人难绷的文章封面图![](img/emdash-index-2.png)
2. 评论只有 提交 → 审核 → 展示。高级功能要自己写代码![](img/emdash-index-3.png)
3. 最大亮点就是边缘化，但是部署到CF要钱![](img/emdash-index-5.png)
4. CV粘贴图片只粘贴到了前端导致这篇文章没图😅 → 去这看吧 [https://2x.nz/posts/emdash](https://2x.nz/posts/emdash)
