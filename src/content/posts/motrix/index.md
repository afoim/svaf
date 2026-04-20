---
title: 浏览器自带下载慢？你需要一个第三方下载器 Motrix！
published: 2025-05-25T16:00:00
description: '如果你觉得 Chromium 浏览器自带下载速度太慢，不妨试试免费开源、界面简洁且体验不错的第三方下载器 Motrix。'
image: img/ee0efba8-8c27-449f-86d0-3e9367d12463.webp
tags: [Motrix, 下载器]
category: '教程'
draft: false 
lang: ''
ai_level: 1
---


# 原理

通过浏览器插件拦截下载请求，再将原始请求转发给 Motrix，就可以实现由 Motrix 接管下载。

# 下载 Motrix

前往官网：https://motrix.app/ 下载 Motrix。

如果你连下载 Motrix 都觉得慢……~~那就先忍一忍~~。

安装完成后，大概就是这个样子：

![](/public/assets/images/6a10d31c-0c39-456c-8402-ff3190a80dcc.webp)

# 配置 Motrix

打开 Motrix，进入 `进阶设置 -> RPC`。你会看到 RPC 监听端口（默认为 `16800`）和一个随机生成的 RPC 授权密钥。
![](img/53e255cf-965f-441d-a47a-81e20f272256.webp)

记住监听端口，并复制好授权密钥（点击小眼睛后即可复制，旁边的骰子图标用于随机生成新密钥）。完成后点击“保存并应用”。

# 配置浏览器

> 仅支持 Chromium 系浏览器（如 Chrome 和新版 Microsoft Edge），Firefox 请另寻方案。

浏览器扩展请选择：**Aria2 Explorer**。

安装完成后，右键扩展图标，进入“扩展选项”，在这里填入 Motrix 的 RPC 配置。

![](img/0f4a510b-378a-45ab-a35f-88cfa53593e3.webp)

最后，右键扩展并勾选“下载拦截”，然后再尝试下载文件。如果配置无误，浏览器中的下载请求会被 Aria2 Explorer 捕获并转发给 Motrix。此时你可以在 **Aria2 Explorer** 和 **Motrix** 中看到正在下载的文件。

![](img/57fa7b18-541e-4115-a160-cd742735e298.webp)
