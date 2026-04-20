---
category: 随笔
description: 在桌面端，我们可以用 VS Code 和 Obsidian 写文章；那么到了手机上，是否也能保持同样顺手的写作体验？
draft: false
image: img/Screenshot_2025-11-11-14-04-23-56_a2e3670364a4153bdb03dad30c8d4108.webp
lang: ""
published: 2025-11-10T16:00:00
tags:
  - Git
  - 博客
title: 如何在安卓手机上优雅的写我的博客
ai_level: 1
---

# 正式开始
为了让我在出门时也能直接用手机写博客，我专门研究了一下，发现这套方案完全可行。

首先，我们需要挑选一个手机上的 Git 客户端。这里我使用的是：https://github.com/catpuppyapp/PuppyGit

安装之后，点击右上角的加号，点击克隆，即可克隆仓库
![](img/Screenshot_2025-11-11-14-11-13-56_a2e3670364a4153bdb03dad30c8d4108.webp)

创建 GitHub Token
![](img/Screenshot_2025-11-24-07-55-54-35_df198e732186825c8df26e3c5a10d7cd1.webp)

将它添加到 PuppyGit 中。
![](img/Screenshot_2025-11-24-07-56-23-48_a2e3670364a4153bdb03dad30c8d41081.webp)

连接仓库。
![](img/Screenshot_2025-11-24-07-56-33-62_a2e3670364a4153bdb03dad30c8d4108.webp)

修改完成后，点击 **需要提交** 按钮，进入提交界面。
![](img/Screenshot_2025-11-11-14-11-59-16_a2e3670364a4153bdb03dad30c8d4108.webp)

进入后，点击右上角的三个点，就可以执行最常用的 **提交（commit）**、**拉取（pull）** 和 **推送（push）** 操作。
![](img/Screenshot_2025-11-11-14-13-03-99_a2e3670364a4153bdb03dad30c8d4108.webp)

有了 Git 客户端之后，接下来还需要一个顺手的 Markdown 编辑器。很巧，**Obsidian** 也提供了移动端。
![](img/Screenshot_2025-11-11-14-15-01-63_b5a5c5cb02ca09c784c5d88160e2ec24.webp)

打开后导入仓库（`src/content`）即可。如果你的使用习惯本身就围绕 Obsidian 展开，那么迁移到手机端也会比较自然。
![](img/Screenshot_2025-11-11-14-15-59-46_51606159b24eff83e24a54116878fe3e.webp)

在桌面端，新建文章通常会使用 Fuwari 提供的 `pnpm new-post xxx` 命令；不过在手机上，我们也可以曲线救国：随便选一篇现有文章，**创建副本** 后再修改元数据即可。
![](img/Screenshot_2025-11-11-14-17-32-08_51606159b24eff83e24a54116878fe3e.webp)

最后，这篇文章本身也是我用手机写完的。