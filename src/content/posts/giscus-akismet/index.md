---
title: 你是否在寻找一个评论系统而又不想自托管？又饱受垃圾评论的叨扰？
published: 2025-08-03T16:00:00
description: Giscus就是这样一个很好的评论区，它基于Github Discussion，无需自托管，无需你管理账号，仅需引入一个JS即可用！
image: img/2025-08-04-12-14-21-image.webp
tags:
  - Giscus
  - 评论区
category: 教程
draft: false
lang: ""
---


# 配置Giscus

> Giscus使用Github Discussion实现存储用户评论，无需自托管

首先你需要创建一个 **公开仓库** （建议新开一个干净的空仓库）

然后在仓库设置中 **启用** `Discussion` 功能

![](img/2025-08-04-12-16-36-image.webp)

前往 https://giscus.app/zh-CN

首先填写你的仓库，通过检查

![](img/2025-08-04-12-17-42-image.webp)

接下来的 `映射关系` 十分重要！

- pathname **（最推荐）**：假如你的文章路径为 `posts/helloworld` 。那么只要你保证这个路径不变，评论和页面就永远匹配

- url：只要你换**域名**了，评论和页面就无法匹配

- title：只要你换**标题**了，评论和页面就无法匹配

![](img/2025-08-04-12-18-21-image.webp)

**需要特别注意的是**：建议 **勾选** `使用严格的标题匹配` ，**避免评论串台**。开启后，Giscus会根据你选择的映射关系为每一个新的Discussion（新的页面的评论区）插入一个与众不同的 *sha1 指纹* 。之后的页面评论区与Github Discussion的映射关系都依赖这个哈希字符串，它在每一个Discussion的正文中，以注释形式写入

![](img/giscus-akismet-1.png)

如果你弄丢了或者写错了，Giscus之后将会再创建一个同名的Discussion，并写入正确的哈希

若旧Discussion并未删除，并想让Giscus命中一个不同的Discussion，你需要根据Giscus默认分配的页面标题（这取决于你上面勾选的映射关系，若勾选pathname，即为 `posts/pin` ）手动用 *sha1* 算法算出哈希字符串并手动写入你想要让Giscus映射的Discussion

```sql
root@AcoFork-NAS:~# echo -n "posts/pin/" | sha1sum
6ae1aef4a17c896d06677a8e55c23b364bb82bbb  -
root@AcoFork-NAS:~#
```

分类推荐选择 **公告（announcements）**

![](img/2025-08-04-12-22-07-image.webp)

特性按需勾选

![](img/2025-08-04-12-22-25-image.webp)

主题按喜好选择。更改后主题会立即呈现

![](img/2025-08-04-12-22-57-image.webp)

最后将这段JS复制，放置在你想作为评论区的区块即可

![](img/2025-08-04-12-23-41-image.webp)

# 配置Akismet

> Akismet (Automattic Kismet) 是应用广泛的一个垃圾留言过滤系统，其作者是大名鼎鼎的 WordPress 创始人 Matt Mullenweg，Akismet 也是 WordPress 默认安装的插件，其使用非常广泛，设计目标便是帮助博客网站来过滤垃圾留言。

注册 [akismet.com](https://akismet.com/)

选择 Akismet Personal 订阅，将滑块拉到0$，记录得到的 Akismet API Key

![](img/2025-08-04-12-27-58-image.webp)

前往 https://github.com/afoim/giscus-fuwari/blob/main/.github/workflows/akismet-comment-check.yml

将这个Github Action部署到你的启用了Giscus的仓库

配置Secret：

- AKISMET_API_KEY：你的Akismet API Key

- GH_TOKEN：前往 https://github.com/settings/tokens 创建一个具有 `repo` `write:discussion` `user` 权限的Github个人令牌![](img/2025-08-04-12-29-06-image.webp)

测试反垃圾是否有效，发送内容为 `viagra-test-123` 的评论。该评论一定会被当作垃圾评论

查看Github Action是否做出删评行为

![](img/2025-08-04-12-30-37-image.webp)

# 封禁用户

> 如果有人一直刷屏但是反垃圾未检测到？

你可以前往该用户个人信息页面手动封禁它

详见 [阻止用户访问您的个人帐户 - GitHub 文档](https://docs.github.com/zh/communities/maintaining-your-safety-on-github/blocking-a-user-from-your-personal-account#blocking-a-user-from-their-profile-page)



# 防止新用户刷评

> 如果有人一直开小号刷评？

使用 https://github.com/你的用户名/你的仓库/settings/interaction_limits

配置临时交互限制，这样新用户就无法对您的存储库进行任何操作

![](img/2025-08-04-20-43-06-image.webp)
