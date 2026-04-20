---
title: 魔幻嫁接！免费用上完全体的Bitwarden！
published: 2026-02-23T08:08:48
description: 你是否正在寻找一个密码库？又不想自托管？
image: img/bitwarden.png
draft: false
lang: ""
---

# Bitwarden以及Bitwarden.com是什么

Bitwarden是一个开源的密码库工具（云服务或自托管），用户可以将所有网站的登录凭据（包含：密码、TOTP、通行密钥等） **端到端加密** 存储至其中。并在需要的时候自动填充帮你登录网站。这样，你就不再需要记住各个网站的账号密码了，只要你能访问Bitwarden，它会帮你做好一切

而Bitwarden.com是一项服务，提供用以存储密码库的服务器，使得用户 **无需自有服务器** 就可以使用Bitwarden
# Bitwarden.com 免费版的“默认”限制

[Best Password Manager for Business, Enterprise & Personal | Bitwarden](https://bitwarden.com/) 免费版没法用TOTP，必须花钱来升级套餐实现

![](img/Screenshot_2026-02-23-16-24-34-42_edf9c6c5202cf0a.jpg)

我们当然也可以选择不在任何网站使用TOTP，但这样的话。所有网站都只有密码保护你的账号，从长远来看这并不安全

# Bitwarden.com 免费版实际上限制的东西

实际上，如果你曾经用过其他密码库，并存储了TOTP，并将其导入到 Bitwarden.com ，你会发现，它是可以成功导入的，只不过是无法“自动填充”

![](img/bitwarden-com.png)

那么也就是说，实际上 Bitwarden.com 并没有封禁免费用户存储TOTP的权限

**它只是在前端阻止了免费用户“自动填充”TOTP的权限** 

# 绕过 Bitwarden.com 免费版无法自动填充TOTP的限制

既然它是在前端阻止，我们实际上是有办法绕过的

无非就是自建一个第三方客户端/浏览器插件，然后在判断VIP的字段让它始终返回 `true` 即可

我们当然可以自己从零来实现，当然，也可以直接寻找市面上已有的，不错的解决方案

### 针对于 Android

我们可以使用 [AChep/keyguard-app: Alternative client for the Bitwarden® platform & KeePass (KDBX), created to provide the best user experience possible.](https://github.com/AChep/keyguard-app) 这个开源的第三方Bitwarden客户端

**注意，不要去Google Play下载。只有Github的版本拥有全部功能** 

此时，登录你的Bitwarden账号，即可绕过免费版限制，使用TOTP自动填充

![](img/Screenshot_2026-02-23-16-28-57-77_f2500aab0c419d0.jpg)

#### 关于KeyGuard对通行密钥的适配问题

KeyGuard可能无法自动填充你的通行密钥，这可能由多种情况导致，但一般是这种情况： [[虫子]通行密钥在Cloudflare上无法使用·第#635期 ·AChep/keyguard-app](https://github.com/AChep/keyguard-app/issues/635) 

可以尝试重新生成一份通行密钥，通过KeyGuard上传至Bitwarden.com

但更建议： **不使用通行密钥，而是使用更广泛的TOTP二步验证方式** 

### PC 浏览器插件

可以使用 [SunsetMkt/Sunsetvault: Builder for Sunsetvault extension.](https://github.com/SunsetMkt/Sunsetvault) 

它仅做一件事：当Bitwarden官方浏览器插件源码发布时，拉取并修补一段代码：

**让任意账户都被识别为VIP**

这样，TOTP就可用了

![](img/bitwarden-com-1.png)

# 相比自建的好处

直接使用 Bitwarden.com ，你就不再需要有一台服务器来部署 [Vaultwarden](https://github.com/dani-garcia/vaultwarden) 或研究晦涩难懂的Rust/TS代码在Cloudflare Worker上部署 [warden-worker](https://github.com/afoim/warden-worker) / [NodeWarden](https://github.com/shuaiplus/NodeWarden) 

并且也可以收益于官方的登录日志邮件

![](img/bitwarden-com-2.png)

# 注意事项

1. 该方法为 **非官方授权绕过方案** 。不保证未来的可用性，仅供测试学习使用
2. **请不要用Bitwarden.com来管理登录Bitwarden.com的凭据** （如：TOTP，通行密钥等），一旦你无法访问Bitwarden.com，你将无法恢复存储在其上的任何密码。请记住你登录Bitwarden的账密  ，若有二步验证凭据，应当存储在其他地方（如脱机的谷歌/微软验证器，或将密钥写在纸上并存放到私密的地方） *这也是你唯一要记住的东西了*
3. 不用担心 Bitwarden.com 宕机。一旦有设备成功登录到Bitwarden，该设备就可以用以导出密码库中的所有密码。**只要 Bitwarden.com / 登陆设备 二者有其一可用，密码就永不会丢失** 
4. 设置 Bitwarden 的主密码时要尤其小心。**该密码无法通过忘记密码来更改** 。只有在已经登录进 Bitwarden 时才能更改，并且需要验证原主密码。详见： https://bitwarden.com/help/article/forgot-master-password/ 

# 参考文献 · 鸣谢

为此文的编写奠定基础 - [密码管理器折腾记：从微软背刺到 KeyGuard 真香](https://blog.weijx.vip/p/%E5%AF%86%E7%A0%81%E7%AE%A1%E7%90%86%E5%99%A8%E6%8A%98%E8%85%BE%E8%AE%B0%E4%BB%8E%E5%BE%AE%E8%BD%AF%E8%83%8C%E5%88%BA%E5%88%B0-keyguard-%E7%9C%9F%E9%A6%99)
