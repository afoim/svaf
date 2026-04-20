---
title: Cyberduck - 简洁好用的S3文件浏览器
published: 2025-08-30T19:38:24
description: '对象存储是一个非常好用的东西，但是要如何方便的上传文件呢？'
image: 'img/2025-08-31-03-39-46-image.webp'
tags: [Cyberduck, 对象存储]

draft: false 
lang: ''
---

# 前情提要

你可能知道 或不知道我运营着一个 **二次元随机图 API**，比如 [AcoFork - RandomPic](https://pic.072103.xyz/)

它的图片存储在 **Cloudflare R2** 也就是 Cloudflare 提供的对象存储

随机图库存总是要扩充的，在曾经，我会使用 [AList](https://alistgo.com/zh/) ，但现在，我会使用 [Cyberduck](https://cyberduck.io/)

# 这是什么？

[Cyberduck](https://cyberduck.io/) 是一个 Win&Mac 双端的云存储浏览器，相比于 AList 它无需部署，传输文件也无需中转，仅作为一个前端来连接你自己的对象存储，简洁易用，界面如图

![](img/2025-08-31-03-45-24-image.webp)

如果你想将云存储映射为本地磁盘，可以使用姊妹软件 [Mountain Duck](https://mountainduck.io/)

# 优点？

API的图片统计，我无需再手搓S3 API来获取图片数量了，它自带

![](img/2025-08-31-03-47-41-image.webp)

![](img/2025-08-31-03-47-57-image.webp)

---

上传文件无需再通过家里云的 AList 中转了

之前的链路：我 - AList - S3

现在的链路：我 - S3

这显著降低了传输时间，提高了工作效率

---

不止于S3，临时给家庭服务器传输文件可以直接使用SFTP而无需登录1Panel等面板了

![](img/2025-08-31-03-52-04-image.webp)
