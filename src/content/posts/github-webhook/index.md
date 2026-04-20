---
title: 利用WebHook来为你的订阅者推送文章更新信息
published: 2025-05-18T16:00:00
description: '针对于静态博客，博主在文章更新后一般需要手动通知订阅者阅读新的文章，本文通过WebHook来实现一个全自动的文章更新通知'
image: img/69389a6f-da33-4f53-be34-408b9f88d9e1.webp
tags: [Github, Netlify, QQBot]
category: '教程'
draft: false 
lang: ''
---


# 原理解析

静态博客一般会托管在Github来方便静态网站构建服务提供商进行自动构建和发布站点。

我们可以通过 WebHook 在文章更新后自动通知订阅者。但单一 WebHook 有各自的缺陷：

| WebHook 类型 | 优点 | 缺点 |
|---|---|---|
| Github WebHook | 能检测文件变动，知道哪些文章更新了 | 不知道构建时长，需要设置保守延迟 |
| Netlify WebHook | 构建完成后通知，时机精准 | 不能检测文件变动 |

最佳方案是 **两者结合使用**，工作流为：

**Push** → **Github WebHook 通知Bot（记录变动文章）** → **Netlify WebHook 通知构建完成** → **Bot 即刻推送文章更新消息**

# 正式开始

## 设置你的自托管WebHook接收器

我使用Koishi编写一个插件创建一个HTTP服务器用于接受WebHook，并且在接收到指定提交信息的WebHook后将在2分钟后在我的群里广播文章更新消息

![](/public/assets/images/53b434e4-cf0e-4cfc-a688-054d13f1c01a.webp)

如果你的服务在内网，可以使用Cloudflared将WebHook接收服务器开放到公网。否则Github将无法将WebHook信息发送到你的服务

## 配置Github Repo WebHook

打开你的博客仓库，在仓库设置找到WebHooks

![](img/e899ddd6-9b3e-4d0a-848b-7f9b43d2004e.webp)

添加一个新的WebHook，如图设置

![](img/7fa35782-2d3c-4d18-afca-cb7db8ee36fc.webp)

## 配置Netlify WebHook

如果你的站点部署在 Netlify，可以进一步配置构建完成通知。

添加HTTP POST钩子

![](img/2025-08-09-23-15-10-image.webp)

创建一个部署成功钩子

![](img/2025-08-09-23-15-40-image.webp)

## Bot端配置

设置一个双监听WebHook服务器，同时接受Github和Netlify的WebHook

![](img/2025-08-09-23-36-50-5ec10aad91b98d8d36699c7956c705f0.webp)

![](img/2025-08-09-23-39-27-cfc2d6a91a07455adbcee0c491143640.webp)

![](img/2025-08-09-23-57-02-image.webp)

## 开发测试

在你的博客仓库进行一次Push操作，检查是否收到了WebHook信息并且分析信息配置你的WebHook接收器做后续操作
