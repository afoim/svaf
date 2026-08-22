---
title: 神了！PagesCMS拯救静态博客！
description: PagesCMS可以代理读写您的Github仓库，帮你创建，编辑文章，最后通过你喜欢的CDN发布他们！
image: img/b336d0ff-34b2-418f-9b81-d9c7c61db739.png
published: 2026-07-04
draft: false
pinned: false
tags: [开发]
---
## 这是个啥

众所周知，我们在编写静态博客时，需要在客户端配置好Github，MarkDown编辑器以及一些杂七杂八的东西。但是，PagesCMS改变了这一切！你只需要将你的仓库连接到PagesCMS，然后就可以用任意设备创作文章了！只要它能用浏览器

## 快速入门

流水账式体验： [https://www.bilibili.com/video/BV18vTo6cEMD/](https://www.bilibili.com/video/BV18vTo6cEMD/)

简单来说

1. 选择模板创建仓库/连接已有仓库
2. 开写

## 原理

PagesCMS通过一个放置在仓库根目录的 `.pages.yml` 来声明式配置所有功能。比如：文章存储在哪？文章链接的媒体目录在哪？构建使用的工作流在哪？构建按钮在哪？

然后通过预定义的行为去读写Github，创建，编辑文件，创建Action等等，用人话来说就是把Github当数据库用

接下来，你的Github仓库就有了文章，媒体资源，以及其他的你自定义的东西。你就可以编写一套静态网站生成器或者用PagesCMS自带的模板（Next.js、Astro、11ty）来上线你的网站啦！

![image.png](img/image-2.png)

后续发文章，改文章，无需拉取Github仓库，无需配置各式各样的SSH密钥，无需配置你的MarkDown编辑器，一切都在 [https://app.pagescms.org/](https://app.pagescms.org/) 完成，所有数据存储在你的Github仓库，公开，透明，不怕跑路 ~~除非PagesCMS和Github一起跑了~~

同时 PagesCMS 也是一个非常好的 **服务器驱动式开发** 的范例。他们的前端写好后几乎一劳永逸。根据后端返回的 `.json` 模板文件来动态在用户浏览器渲染不同的内容。它就可以做到，加一个 “在首页添加部署按钮”，推送到Github后刷新页面即可看到“部署按钮”

![image.png](img/image-1.png)
