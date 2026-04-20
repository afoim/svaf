---
title: 我给BetterStack的状态页面汉化了
published: 2025-08-28T10:46:27
description: '闲着没事打开 BetterStack 的状态页面时，我发现里面一会儿中文、一会儿英文，索性就把它整体汉化了一遍。'
image: 'img/2025-08-28-18-49-56-image.webp'
tags: [BetterStack]

draft: false 
lang: ''
ai_level: 1
---


# 速览

现在点击 [这里](https://ss.2x.nz)，或者通过顶部导航栏里的 `状态` 页面，就可以看到已经汉化好的 BetterStack 状态面板。

# 汉化过程

在 [BetterStack](https://uptime.betterstack.com/) 左侧导航栏进入 `Status pages`，打开你的状态页域名后，再进入 `Translations`，就可以开始汉化了。

![](img/2025-08-28-18-52-03-image.webp)

# 一些小插曲

由于 BetterStack 并没有很好照顾中文语境，所以像 `日` 和 `年` 这样的翻译默认不会自动补上后缀。不过这个问题可以通过硬编码处理。

![](img/2025-08-28-18-57-52-image.webp)

至于 `月`，我这里则是直接这样写：

![](img/2025-08-28-18-58-30-image.webp)

另外，BetterStack 会把 `UTC+8` 自作聪明地写成 `CST`。但 `CST` 本身是一个有歧义的时区缩写，所以这里同样建议通过硬编码来修正。

![](img/2025-08-28-18-56-39-image.webp)

![](img/2025-08-28-18-58-45-image.webp)
