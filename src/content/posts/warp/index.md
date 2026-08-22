---
title: 从零在您的Windows、Linux和Android设备上使用WARP（Cloudflare IP）游览互联网
description: Cloudflare WARP允许您使用Cloudflare的数据中心节点（通常为LAX [洛杉矶] ）进行互联网访问
image: img/f12f646e-a3b0-4afd-9c2e-93821298f58c.png
published: 2026-08-08
draft: false
pinned: false
tags: [网络]

---
## Windows

Cloudflare WARP（下文简称 WARP 或 1.1.1.1 ）的Windows客户端已被更新，新版名为 **Cloudflare One Client** 。您只需前往 [https://1.1.1.1](https://1.1.1.1) 下载Windows客户端后，并使用 **流量和DNS（UDP）** 即可连接WARP

![image.png](img/image-25.png)

## Linux

- 安装 WARP-CLI： [pkg.cloudflareclient.com](http://pkg.cloudflareclient.com)
- 如何运行 WARP-CLI： [Linux desktop client · Cloudflare WARP client docs](https://developers.cloudflare.com/warp-client/get-started/linux/)

## Android

Android 的 WARP 客户端并无太大更新。您需要严格按照以下步骤来启用并连接 WARP

1. 前往 [https://play.google.com/store/apps/details?id=com.cloudflare.onedotonedotonedotone](https://play.google.com/store/apps/details?id=com.cloudflare.onedotonedotonedotone) 下载最新版 WARP 客户端
2. 临时启用 **Magic Network** ，并确保 WARP App 的流量被路由至 **Magic Network**
3. 打开 WARP App，在主页面静等 10s 。期间 WARP App 会静默向 Cloudflare WARP 信令服务器注册您的设备
4. 点击屏幕中央的橙色按钮，确保按钮可以被打开。然后关闭它
5. 依次点按： 右上角汉堡图标 -> 高级 -> 连接选项 -> Tunnel 协议 -> MASQUE
6. 回到首页，再次点击屏幕中央的橙色按钮，等待至多 120s ，保证按钮下方的文字变为：“**已连接**”
7. 一旦您连接成功，退出 WARP App 后，极有可能无法再次打开。您只需确保 Android 系统提示您：**已激活虚拟专用网** 已连接到 “1.1.1.1” 。即可

![Screenshot_2026-08-08-08-11-44-11_9bfe7af5468139f.jpg](img/Screenshot_2026-08-08-08-11-44-11_9bfe7af5468139f.jpg)
