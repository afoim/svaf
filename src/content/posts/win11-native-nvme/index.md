---
title: 一行命令拉爆你的Win11硬盘4K随机性能！
published: 2026-02-26T22:27:08
description: 你知道吗？其实Windows一直都在让NVMe硬盘以兼容模式跑！
image: img/win11-native-nvme.png
draft: false
lang: ""
---
# 前言

简单来说，Windows为了兼容性，始终都在让我们的NVMe固态硬盘模拟为SCSI跑

![](/public/assets/images/win11-native-nvme-1.png)

但是就在前不久，微软为新版Windows11提供了一个开关，允许将NVMe固态硬盘使用原生的NVMe驱动

# 实测

![](img/4833b89c-f0b6-42f0-9430-55dafc770678.png)

![](img/d86fb68e-f5a4-4a18-a94f-e31d309457bd.png)

可以明显看到，在4K随机读写都有不小的提升。而4K性能提升有助于提升在频繁IO工作下的性能，比如浏览网页，列出文件，查看任务管理器

该功能似乎并不仅限于提升极限性能，也提升了磁盘冷启动的速度，貌似可以缓解一些莫名其妙的顿卡

总之推荐开启

# 为我的Win11启用原生NVMe驱动

> [!caution]
> 数据无价，谨慎操作

> [!warning]
> 操作之前请确保你的磁盘使用 **微软官方** 的驱动，而不是 **盘厂驱动** 或 **启用了 Intel VMD** ，否则操作后将无法进入系统

前往 https://github.com/thebookisclosed/ViVe 下载 **ViVeTool** 

接下来查看你的系统版本号，不同版本需要执行不同命令：

![](img/win11-native-nvme-2.png)

对于Windows 11 24H2/25H2： 
```sql
vivetool.exe /enable /id:48613417,48433719,49453572,55369237,59254307,59274315
```
 
 对于Windows 11 26H1：
```sql
vivetool.exe /enable /id:48613417,48433719,49453572
```

执行命令后重启电脑，开机后打开 **设备管理器** ，若多出新条目 **存储磁盘** ，且该条目中有若干个 **NVMe磁盘** 则开启成功

![](img/win11-native-nvme-3.png)

# 参考文献 · 鸣谢

为此文编写奠定了基础 - https://www.bilibili.com/video/BV1CHi8BjELT

部分图片资源引用 - https://www.bilibili.com/opus/1154814983921467415