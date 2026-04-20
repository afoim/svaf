---
title: 自建一个匿名文件上传终结点
published: 2025-11-08T03:02:04
description: 你有没有遇到过一种场景？在学校/公司电脑需要带一个文件走，但是又不想安装远程软件。那么今天，教你无需U盘，让你在任何地方将你想要的文件带回你家！
image: img/unknown-upload.webp
tags:
  - EdgeOne
  - 对象存储
  - Python
draft: false
lang: ""
---
# 视频
https://www.bilibili.com/video/BV1Hz1DBZEov/

# 明确需求

在做一个项目时，无论大小，首先我们要知道自己需要什么，哪些是刚需，哪些是次要的，哪些是根本不必要的

深度思考一下，我觉得该项目使用场景应该在：当我处于非家庭环境，且手上有一台不直通家庭网络但是可连接至互联网的设备，需要传输一些非敏感文件且文件不大（如：文档，截图，小软件）

那么大致的需求即为：
1. 基于Web网页，制作一个前端页面，必须包含一个 `input file` 。上传完成打印上传完成
2. 后端将文件放到一个存储空间。该存储空间必须在家庭网络内较方便的访问

# 方案对比

这里提供两种方案，各有优劣：

| | 方案一：对象存储 | 方案二：本地服务器 |
|---|---|---|
| 稳定性 | ⭐⭐⭐⭐⭐ 不依赖本地设备 | ⭐⭐ 需要家庭电脑在线 |
| 复杂度 | ⭐⭐⭐ 需要配置云函数 | ⭐⭐⭐⭐⭐ 一行命令启动 |
| 成本 | 对象存储费用 | 无（家庭带宽） |
| 适用场景 | 需要稳定运行 | 家庭电脑常在线 |

# 方案一：EdgeOne Pages + 对象存储

如果你希望服务稳定运行，不依赖家庭设备在线状态，那么对象存储方案更适合你。

## 梳理思路

借助对象存储，我只需要找一个云函数连接到我的对象存储，然后提供一个上传端点即可。

![](/public/assets/images/unknown-upload-1.webp)

## 正式开始

于是我找到了EdgeOne Pages，它的Functions非常适合做这件事，且支持原生Node运行时，也就是 `node-functions` 直接使用 `AWS-S3` 这个NPM包再做一个最简单的前端上传页面，搞定！

![](img/unknown-upload-2.webp)

为了防止上传重名文件，每个文件上传后都会被重命名为 `原文件名_时间戳_IP` 

该项目已开源 [afoim/EdgeOnePageFunctionUnknownUploader-S3-](https://github.com/afoim/EdgeOnePageFunctionUnknownUploader-S3-)

# 方案二：Python uploadserver

> 更推荐： https://github.com/svenstaro/miniserve

如果你的家庭电脑通常保持在线，且追求简单易用，那么在自家电脑启动一个匿名文件上载器也是个不错的选择。

## 安装

确保你安装了 **Python**

安装 **uploadserver**
```bash
pip install --user uploadserver
```

接下来，创建并进入一个新文件夹，作为 **上传目录**
```bash
mkdir upload
cd upload
```

运行，并监听 **IPv4** 的 **8000端口**
```bash
python -m uploadserver 8000
```

又或者，监听 **IPv6** 的 **8000端口** 
```bash
python -m uploadserver --bind :: 8000
```

接下来，你就可以在内网环境使用这个 **文件上载器** 了
![](img/py-uploadserver.webp)

## 打到公网

### 方法一：使用EdgeOne进行IPv6回源

将你的IPv6做 **DDNS** ，然后使用EdgeOne回源
![](img/py-uploadserver-1.webp)

### 方法二：STUN（仅NAT1可用）

当你的家庭网络为 **NAT1** ，则可以使用类似这样的软件将你的 **内网端口** 直接打到 **公网端口** （貌似该程序对TCP分片敏感，会导致RST） [MikeWang000000/Natter: Expose your TCP/UDP port behind full-cone NAT to the Internet.](https://github.com/MikeWang000000/Natter) 
![](img/py-uploadserver-2.webp)
