---
title: 你有一个全球网站？如何做好监控？
published: 2026-01-09T03:26:02
description: 如果你正好在运营一个全球性的网站，它可能在不同地区有不同节点，我们要如何做好宕机提醒？
image: img/double-monitior.webp
draft: false
lang: ""
---


> [!warning]
> 由于被DDOS，已经不再做分流监控，故本文诸多链接失效

# 正式开始
> 视频： https://www.bilibili.com/video/BV14dqwBVEa5/

比如说我的博客
[https://blog.acofork.com](https://blog.acofork.com)

它在国外的节点是 **Cloudflare Page** ，而在国内的节点是 **阿里云 ESA Pages/EdgeOne Pages** 

我使用的方案是在国内自托管一个 **Uptime Kuma** 服务，而在海外使用一些大厂的云监控，如 **BetterStack** **UptimeRobot** 等等，并且让他们互相监控

对于大厂的监控，我们不必做防护，但对于你自托管的监控，推荐套 **Cloudflare Tunnel** ，防止被DDoS

国内监控：
[https://kuma.2x.nz](https://kuma.2x.nz)

海外监控：
[https://vps.2x.nz](https://vps.2x.nz)

# 进阶：利用自定义HTTP请求头Host字段实现单节点分流域名的监控

> 如果你有个分流域名，正常来说我们需要两个监测源模拟国内和海外用户访问，但真的需要这么麻烦吗...

## 原理
CDN上托管了那么多的网站，那它是如何识别每个用户需要访问哪个网站的呢？

针对 HTTPS ，CDN 会检查SSL握手报文中的 `Server_Name` 字段。而针对 HTTP ，CDN 会检查请求头中的 `Host` 字段

也就是说，对于海外CDN是否存活，我们可以通过直接访问CDN节点，如： `http://blog.acofork.com.a1.initww.com` 并携带上 `Host` 头指定为 `blog.acofork.com` ，从而强制指定节点访问业务网站，不走分流

那么如果CDN开启了强制HTTPS呢？那就关掉

![](img/http-header-host-3.webp)

## 常用CDN节点

- Cloudflare：你自己的优选域名，如 **http://cdn.2x.nz** 
- Github： **http://pages.github.com** 

## 配置方法
部署一个Uptime Kuma（或者其他服务，监测源必须在国内。因为EO，ESA我们要做拦截海外策略）

如图写监测项目，直接使用HTTP协议监测CDN节点，并且携带Host头，将重定向设为0，只要返回 200 就算存活（为了减轻站点压力，建议使用HEAD请求）

![](img/http-header-host-1.webp)

![](img/http-header-host-2.webp)

# Demo
[https://status.acofork.com](https://status.acofork.com)
