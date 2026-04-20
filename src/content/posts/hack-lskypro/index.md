---
title: 记录破解兰空图床（Lsky-Pro）
published: 2025-08-19T13:09:47
description: '兰空图床是一个简洁易用（？）的图床框架，抓包了一下激活过程，这玩意居然没加密...记录一下'
image: 'img/2025-08-20-21-11-48-image.webp'
tags: [兰空图床]
category: '记录'
draft: false 
lang: ''
---


> 仅供学习交流，请在下载后24h内删除。体验地址： https://lsky.2x.nz
> 视频教程： https://www.bilibili.com/video/BV1UieUzQEvq/

# 方案一：本地开心版（推荐）

突然发现交付给我的项目是源码，那还逆向什么授权，直接永远返回true呗~

## 安装包体

- http://r2.072103.xyz/2xnzlskypro223.zpaq 
- [OneDrive - 2xnzlskypro223.zpaq](https://acofork-my.sharepoint.com/:u:/g/personal/af_acofork_onmicrosoft_com/Eenhpe5Kt0RLopi_n6Ud-qMBh6fmDsXKaB8csLIVLu-FEQ?e=Z6QLGn)
- 密码： 2xnz二叉树树

zpaq可以使用 [Bandizip 官方网站 - 免费压缩软件下载 (Windows)](https://www.bandisoft.com/bandizip/) 进行解压，旧版不支持

## 我们做了什么？

- 安装过程中无论输入授权密钥为任何值直接内部返回true，不再请求授权服务器
- 版本更新不再请求授权服务器，始终返回当前版本为最新版本
- 所有操作不经过授权服务器，全部本地执行

## 环境配置

自行参考： https://docs.lsky.pro/guide/install

**推荐使用宝塔面板部署**，1Panel的容器化PHP好像有点问题

如果坚持要用1Panel，推荐使用PHP8.2，出现500，404等状态码问题请自行解决，似乎需要一个特殊的 `fallback` 设置。感谢 fishcpy提供的解决方案！这里是他的部署教程： [AcoFork的兰空图床开心版1panel部署教程 - 福利羊毛 - LINUX DO](https://linux.do/t/topic/882900)

```nginx
    # 全局 404 交给 @fallback 处理，不强制状态码
    error_page 404 @fallback;

    location / {
        try_files $uri $uri/ @fallback;
    }

    # 命名 location：交给 index.php，但不强制 200
    location @fallback {
        rewrite ^ /index.php last;
    }

    # -----------------------------
    # 特殊路径：/api/v2/ 也走 index.php，但不能强制 200
    # -----------------------------
    location ^~ /api/v2/ {
        # 同样使用 @fallback，不强制状态码
        try_files $uri $uri/ @fallback;
    }
```

## 安装过程

授权密钥随便填直接过

![](img/2025-08-22-04-21-45-8d13151d19e627bd9e614517aeb5dbe6.webp)

系统升级已Hook，定死版本

![](img/2025-08-22-04-22-19-image.webp)

最终效果

![](img/2025-08-22-04-22-37-image.webp)

# 方案二：手动破解

如果你想自己动手破解，或者需要获取最新版本包体，可以参考此方案。

> 注意。如果需要更新新版本，仍然需要有效的授权密钥，否则无法得到新版包体

## 下载包体

兰空图床Pro付费版包： https://r2.072103.xyz/lp223.zpaq （解压密码：2x.nz二叉树树）

## 破解授权

首先为你的Linux配置一个HTTP代理，指向 Burp Suite（软件自己找）

```bash
export http_proxy="http://127.0.0.1:8080"
export https_proxy="http://127.0.0.1:8080"
```

![](img/a5fd2695975981d785cea1af5c0ee9588dc1b9ee.webp)

默认Burp仅拦截请求，不拦截响应，需要手动设置一下

![](img/2690f8470df19d0c4a0f134835a7cbc95c9798fd.webp)

然后启用拦截

![](img/52650c556acc9406923fb824823fe3a04e153d5d.webp)

当你通过官方教程到执行 `./install.sh` 的时候

会要求输入域名和授权密钥，域名填你自己的，否则之后上传的图片的预览地址将会不正确！授权密钥随便填！

![](img/67b17d4c5f5d7ba8d2e2ee348d19bc01c6d42b1d.webp)

回车，会开始转圈圈

![](img/fb540faa472d476e8d6b05a04d01be5a19adb236.webp)

查看Burp，发现多了一个请求，首先点击放行

![](img/8a6dd20b7ad55a9fdad795be358b8486b75de5b7.webp)

现在出现了响应，并且状态码为401

![](img/ce862cb4eeefc2a7a52bea44e4e6ab137a7cd3da.webp)

响应那块是可以编辑的，用 https://r2.072103.xyz/lsky_success_223.txt 中的内容替换原响应。然后点击放行

![](img/b8545b978629815aec471489890a0be62f0a8f89.webp)

恭喜，通过授权了

![](img/fdda3a54fd4a6da5d0c0c9d5ac0fbd5b79ef2b51.webp)

安装完毕后也一样

![](img/79f0f4645235e7cb3ecbe554cb13295bed326be5.webp)38dd52c6e.webp)

# 进阶：自建授权服务器

可以通过Cloudflare Worker自建授权。感谢一位不愿透露姓名的小伙伴提供的代码

```js
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const jsonContent = `[{"logo":"products\\/lsky-pro.webp","name":"V 2.2.3","version":"2.2.3","changelog":"### \\u4f18\\u5316\\n- \\u6539\\u8fdb\\u76f8\\u518c\\u5217\\u8868\\u6837\\u5f0f\\n\\n### \\u4fee\\u590d\\n- \\u4fee\\u590d\\u4f7f\\u7528\\u624b\\u673a\\u53f7\\u6ce8\\u518c\\u8d26\\u53f7\\u8981\\u6c42\\u8f93\\u5165\\u90ae\\u7bb1\\u7684 bug\\n- \\u4fee\\u590d\\u72ec\\u7acb\\u9875\\u9762 title \\u663e\\u793a\\u4e0d\\u6b63\\u786e\\u7684 bug","pushed_at":"2025-07-29","milestone":"stable","download_url":"https:\\/\\/dl.huohuastudio.com\\/packages\\/products\\/lsky-pro\\/2.2.3.zip?X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=d8vF9cr3Wmbu8qHMD3W1%2F20250818%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20250818T141321Z&X-Amz-SignedHeaders=host&X-Amz-Expires=1800&X-Amz-Signature=40682060b50fa3ee0f520f78418e5f0754277e14e4794f5e283ab4149a6028eb"},{"logo":"products\\/lsky-pro.webp","name":"V 2.2.2","version":"2.2.2","changelog":"### \\u65b0\\u589e\\n- \\u540e\\u53f0\\u7ba1\\u7406\\u5217\\u8868\\u589e\\u52a0\\u8fc7\\u6ee4\\u5668\\n- \\u652f\\u6301\\u8bbe\\u7f6e\\u9ed8\\u8ba4\\u4e0a\\u4f20\\u50a8\\u5b58\\n- \\u652f\\u6301\\u6279\\u91cf\\u590d\\u5236\\u94fe\\u63a5\\n- \\u652f\\u6301\\u63a7\\u5236\\u5e7f\\u573a\\u662f\\u5426\\u5c55\\u793a\\n\\n### \\u4f18\\u5316\\n- \\u6539\\u8fdb\\u6837\\u5f0f\\n- \\u7f51\\u9875 title \\u6839\\u636e\\u5f53\\u524d\\u83dc\\u5355\\u663e\\u793a\\n- \\u4eea\\u8868\\u76d8\\u589e\\u52a0\\u7edf\\u8ba1\\u5361\\u7247\\n- \\u6539\\u8fdb\\u5e7f\\u573a\\u7684\\u56fe\\u7247\\u5217\\u8868\\u663e\\u793a\\n\\n### \\u4fee\\u590d\\n- \\u4fee\\u590d\\u4f7f\\u7528 libvips \\u9a71\\u52a8\\u65f6\\u4e91\\u5904\\u7406\\u8f93\\u51fa\\u56fe\\u7247\\u8fd8\\u662f\\u4f7f\\u7528 imagick \\u5904\\u7406\\u7684 bug\\n- \\u4fee\\u590d\\u56fe\\u7247\\u5904\\u7406\\u4e2d\\u6c34\\u5370\\u9009\\u62e9\\u5e73\\u53f0\\u540e\\u4fdd\\u5b58\\u63d0\\u793a\\u9700\\u8981\\u9009\\u62e9\\u6c34\\u5370\\u4f4d\\u7f6e\\u7684 bug\\n- \\u4fee\\u590d\\u5220\\...

  const headers = new Headers({
    'Content-Type': 'application/json',
    'Content-Length': '30872',
    'Strict-Transport-Security': 'max-age=31536000',
    'Alt-Svc': 'h3=":443"; ma=86400',
    'Vary': 'Accept-Encoding',
    'Cache-Control': 'max-age=0, must-revalidate, no-cache, no-store, private',
    'Pragma': 'no-cache',
    'Expires': 'Fri, 01 Jan 1990 00:00:00 GMT',
    'Access-Control-Allow-Origin': '*',
    'X-Cache': 'MISS',
    'Server': 'WAFPRO'
  });

  // 使用当前日期作为响应日期
  const currentDate = new Date().toUTCString();
  headers.set('Date', currentDate);

  return new Response(jsonContent, {
    status: 200,
    statusText: 'OK',
    headers: headers
  });
}
```

自建结束后将 `config/app.php` 内的 `服务接口地址` 改为你的。就不需要每次安装都手动改响应包了

```php
    /**
     * 服务接口地址
     */
    'service_api' => env('APP_SERVICE_API', 'https://huohuastudio.com'),
```
