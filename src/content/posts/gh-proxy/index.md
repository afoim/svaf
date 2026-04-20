---
category: 教程
description: 搭建Github全站代理的完整指南，涵盖原理讲解与多种部署方案（Cloudflare Worker、EdgeOne Pages、Vercel、VPS+Go）
draft: false
image: img/8bb2d8ae-1703-44e8-9f3b-10b46ab69913.webp
lang: ''
published: 2025-04-14T16:00:00
tags: [Github, 反向代理, Cloudflare Worker, EdgeOne, Vercel]
title: Github全站反向代理搭建指南
---


# 引言

由于网络原因，国内访问Github经常遇到各种问题。本文将带你从原理到实践，搭建一个属于自己的Github全站反向代理。

# 为什么不能只用透明代理？

针对Github这样的网站，我们无法仅使用一个简单的透明反向代理指向 `github.com` 来解决，原因有两点：

## 1. 外域依赖问题

Github官网有许多外域依赖，比如 `raw.githubusercontent.com`、`avatars.githubusercontent.com` 等。如果只代理主域名，这些资源请求会直接访问原站，导致加载失败。

## 2. 钓鱼风险

注意！直接反代主流网站后，不久你的网站就会被Cloudflare标记为**钓鱼站点**，因为你原封不动的克隆了人家站点并且 **没有显式屏蔽登录页面**。

# 解决方案：透明代理 + HTML覆写

## 核心思路

我们需要实现两个关键功能：

1. **透明代理**：将请求转发到Github服务器
2. **HTML覆写**：重写Github返回的HTML，将其中的外域改为我们自己的域

## 请求流程对比

**原始流程：**
```
用户 -> github.com -> raw.githubusercontent.com（被github.com请求）
```

**代理流程：**
```
用户 -> gh.072103.xyz -> raw-githubusercontent-com.072103.xyz（被gh.072103.xyz请求）
```

对于 `gh.072103.xyz` 的请求由代理服务转发到 `github.com`，而针对于 `raw-githubusercontent-com.072103.xyz` 的请求则转发到 `raw.githubusercontent.com`。

## 域名映射配置

你需要配置类似这样的域名映射：

```js
const domain_mappings = {
  'github.com': 'gh.',
  'avatars.githubusercontent.com': 'avatars-githubusercontent-com.',
  'github.githubassets.com': 'github-githubassets-com.',
  'collector.github.com': 'collector-github-com.',
  'api.github.com': 'api-github-com.',
  'raw.githubusercontent.com': 'raw-githubusercontent-com.',
  'gist.githubusercontent.com': 'gist-githubusercontent-com.',
  'github.io': 'github-io.',
  'assets-cdn.github.com': 'assets-cdn-github-com.',
  'cdn.jsdelivr.net': 'cdn.jsdelivr-net.',
  'securitylab.github.com': 'securitylab-github-com.',
  'www.githubstatus.com': 'www-githubstatus-com.',
  'npmjs.com': 'npmjs-com.',
  'git-lfs.github.com': 'git-lfs-github-com.',
  'githubusercontent.com': 'githubusercontent-com.',
  'github.global.ssl.fastly.net': 'github-global-ssl-fastly-net.',
  'api.npms.io': 'api-npms-io.',
  'github.community': 'github-community.'
};
```

假如你的域名为 `abc.com`，你需要将以下子域名绑定到你的代理服务：

- `gh.abc.com`
- `avatars-githubusercontent-com.abc.com`
- `raw-githubusercontent-com.abc.com`
- ...等等

## 防钓鱼措施

我们需要找到原站点的所有登录页逐一屏蔽，对于Github.com，我们需要屏蔽：

`/` `/login` `/signup` `copilot`

你可以将其直接导向404，或者重定向到另外的网站，**只要不让你的用户能在你的反代网站上登录就可以**。

---

# 部署方案

下面介绍四种部署方案，按照部署难度从简单到复杂排序：

## 方案一：Vercel Function（最简单）

> 嫌弃CF Worker不够快？那就试试Vercel Function！

### 优点
- 部署最简单，一键完成
- 速度快
- 与GitHub集成良好

### 部署步骤

1. 克隆 [afoim/VercelFunctionGithubProxy](https://github.com/afoim/VercelFunctionGithubProxy)

2. 部署到Vercel

![](img/2025-08-30-22-14-07-aa3b925d5e2e522cc0a0abccd87b5887.webp)

3. 绑定你自己的域名

![](img/2025-08-30-22-14-10-b79c2d588117ab15fc4a08efe359db4f.webp)

4. 根据你的域名修改域名映射配置，绑定所有子域名即可使用

---

## 方案二：Cloudflare Worker（推荐）

> 教程视频：https://www.bilibili.com/video/BV1jGd6YpE8z

### 优点
- 免费
- 无需服务器
- 全球CDN加速
- 部署简单

### 部署步骤

1. 进入 [dash.cloudflare.com](https://dash.cloudflare.com)

2. 创建新Worker，选择Hello World模板

3. 前往 [GitHub - afoim/GithubSiteProxyForCloudflareWorker](https://github.com/afoim/GithubSiteProxyForCloudflareWorker) 复制 `worker.js` 代码粘贴到你的Worker

4. 根据你的域名修改域名映射配置

5. 将所有需要的子域名绑定到你的Worker

6. 访问 `gh.你的域名` 即可使用

### 完整代码

参见Github仓库：https://github.com/afoim/GithubSiteProxyForCloudflareWorker

---

## 方案三：EdgeOne Pages

> 适合国内用户，访问速度更快

### 优点
- 国内访问速度优秀
- 免费额度充足
- 部署相对简单

### 部署步骤

#### 1. 下载源码

> 源码：[afoim/EdgeOnePagesFunctionGithubProxy](https://github.com/afoim/EdgeOnePagesFunctionGithubProxy)

下载 https://r2.072103.xyz/github-eopf.zip 并解压

目录结构：

![](img/2025-08-30-20-43-29-image.webp)

#### 2. 修改域名配置

打开任意一个JS文件，更改域名映射配置。注意：每个JS文件的内容都需要修改！

#### 3. 上传到EdgeOne Pages

![](img/2025-08-30-20-45-20-image.webp)

#### 4. 绑定域名

按照前缀绑定所有需要的子域名：

![](img/2025-08-30-20-46-18-image.webp)

### 为什么目录结构这么特殊？

- **`index.html`**：空的HTML文件，因为不放就404
- **`index.js`**：负责 `/` 路由
- **`[[default.js]]`**：负责 `/*` 路由

---

## 方案四：VPS + Go（最灵活）

> 适合有VPS且希望完全掌控的用户，部署相对复杂

### 优点
- 完全自主可控
- 不依赖第三方平台
- 可以自定义更多功能

### 部署步骤

#### 1. 安装Golang运行时

```bash
apt install golang
```

#### 2. 创建项目目录

创建一个文件夹，放置 `main.go`：

```go
package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"regexp"
	"strings"
	"time"
)

// 域名映射配置
var domainMappings = map[string]string{
	"github.com":                    "gh.",
	"avatars.githubusercontent.com": "avatars-githubusercontent-com.",
	"github.githubassets.com":       "github-githubassets-com.",
	"collector.github.com":          "collector-github-com.",
	"api.github.com":                "api-github-com.",
	"raw.githubusercontent.com":     "raw-githubusercontent-com.",
	"gist.githubusercontent.com":    "gist-githubusercontent-com.",
	"github.io":                     "github-io.",
	"assets-cdn.github.com":         "assets-cdn-github-com.",
	"cdn.jsdelivr.net":              "cdn.jsdelivr-net.",
	"securitylab.github.com":        "securitylab-github-com.",
	"www.githubstatus.com":          "www-githubstatus-com.",
	"npmjs.com":                     "npmjs-com.",
	"git-lfs.github.com":            "git-lfs-github-com.",
	"githubusercontent.com":         "githubusercontent-com.",
	"github.global.ssl.fastly.net":  "github-global-ssl-fastly-net.",
	"api.npms.io":                   "api-npms-io.",
	"github.community":              "github-community.",
}

// 需要重定向的路径
var redirectPaths = []string{"/", "/login", "/signup", "/copilot"}

// 检查路径是否需要重定向
func shouldRedirect(path string) bool {
	for _, p := range redirectPaths {
		if path == p {
			return true
		}
	}
	return false
}

// 获取代理前缀
func getProxyPrefix(host string) string {
	if strings.HasPrefix(host, "gh.") {
		return "gh."
	}

	for _, prefix := range domainMappings {
		if strings.HasPrefix(host, prefix) {
			return prefix
		}
	}

	return ""
}

// 根据前缀获取目标域名
func getTargetHost(prefix string) string {
	for original, p := range domainMappings {
		if p == prefix {
			return original
		}
	}
	return ""
}

// 处理响应内容，替换域名引用
func modifyResponse(body []byte, contentType, hostPrefix, currentHostname string) []byte {
	if !strings.Contains(contentType, "text/") &&
		!strings.Contains(contentType, "application/json") &&
		!strings.Contains(contentType, "application/javascript") &&
		!strings.Contains(contentType, "application/xml") {
		return body
	}

	text := string(body)
	domainSuffix := currentHostname[len(hostPrefix):]

	for originalDomain, proxyPrefix := range domainMappings {
		fullProxyDomain := proxyPrefix + domainSuffix
		text = strings.ReplaceAll(text, "https://"+originalDomain, "https://"+fullProxyDomain)
		text = strings.ReplaceAll(text, "http://"+originalDomain, "https://"+fullProxyDomain)
		text = strings.ReplaceAll(text, "//"+originalDomain, "//"+fullProxyDomain)
		text = strings.ReplaceAll(text, `"`+originalDomain+`"`, `"`+fullProxyDomain+`"`)
		text = strings.ReplaceAll(text, `'`+originalDomain+`'`, `'`+fullProxyDomain+`'`)
	}

	if hostPrefix == "gh." {
		text = strings.ReplaceAll(text, `"/`, `"https://`+currentHostname+`/`)
		text = strings.ReplaceAll(text, `'/`, `'https://`+currentHostname+`/`)
	}

	return []byte(text)
}

// 处理请求
func handleRequest(w http.ResponseWriter, r *http.Request) {
	currentHost := r.Host

	if shouldRedirect(r.URL.Path) {
		http.Redirect(w, r, "https://www.gov.cn", http.StatusFound)
		return
	}

	hostPrefix := getProxyPrefix(currentHost)
	if hostPrefix == "" {
		http.Error(w, "Domain not configured for proxy", http.StatusNotFound)
		return
	}

	targetHost := getTargetHost(hostPrefix)
	if targetHost == "" {
		http.Error(w, "Domain not configured for proxy", http.StatusNotFound)
		return
	}

	pathname := r.URL.Path

	re1 := regexp.MustCompile(`(/[^/]+/[^/]+/(?:latest-commit|tree-commit-info)/[^/]+)/https%3A//[^/]+.*`)
	pathname = re1.ReplaceAllString(pathname, "$1")

	re2 := regexp.MustCompile(`(/[^/]+/[^/]+/(?:latest-commit|tree-commit-info)/[^/]+)/https://[^/]+.*`)
	pathname = re2.ReplaceAllString(pathname, "$1")

	re3 := regexp.MustCompile(`(/[^/]+/[^/]+/(?:latest-commit|tree-commit-info)/[^/]+)/https:/[^/]+.*`)
	pathname = re3.ReplaceAllString(pathname, "$1")

	targetURL := &url.URL{
		Scheme:   "https",
		Host:     targetHost,
		Path:     pathname,
		RawQuery: r.URL.RawQuery,
	}

	req, err := http.NewRequest(r.Method, targetURL.String(), r.Body)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to create request: %v", err), http.StatusInternalServerError)
		return
	}

	for key, values := range r.Header {
		for _, value := range values {
			req.Header.Add(key, value)
		}
	}

	req.Header.Set("Host", targetHost)
	req.Header.Set("Referer", targetURL.String())
	req.Header.Set("Accept-Encoding", "identity")

	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	resp, err := client.Do(req)
	if err != nil {
		http.Error(w, fmt.Sprintf("Proxy Error: %v", err), http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to read response: %v", err), http.StatusInternalServerError)
		return
	}

	contentType := resp.Header.Get("Content-Type")
	modifiedBody := modifyResponse(body, contentType, hostPrefix, currentHost)

	for key, values := range resp.Header {
		if key == "Content-Encoding" || key == "Content-Length" {
			continue
		}
		for _, value := range values {
			w.Header().Add(key, value)
		}
	}

	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Credentials", "true")
	w.Header().Set("Cache-Control", "public, max-age=14400")
	w.Header().Del("Content-Security-Policy")
	w.Header().Del("Content-Security-Policy-Report-Only")
	w.Header().Del("Clear-Site-Data")
	w.Header().Set("Content-Length", fmt.Sprintf("%d", len(modifiedBody)))
	w.WriteHeader(resp.StatusCode)
	w.Write(modifiedBody)
}

func main() {
	http.HandleFunc("/", handleRequest)
	port := ":8080"
	log.Printf("GitHub代理服务器启动在端口 %s", port)
	log.Printf("请确保你的域名已正确配置并指向此服务器")

	if err := http.ListenAndServe(port, nil); err != nil {
		log.Fatal("服务器启动失败:", err)
	}
}
```

#### 3. 创建 go.mod

```go
module github-proxy

go 1.19
```

#### 4. 运行服务

```bash
go run .
```

输出以下日志即成功：

```bash
root@localhost:~/go_proxy# go run .
2025/06/20 23:13:17 GitHub代理服务器启动在端口 :8080
2025/06/20 23:13:17 请确保你的域名已正确配置并指向此服务器
```

#### 5. 配置Nginx反向代理

使用Nginx或OpenResty反向代理 `localhost:8080`，配置域名格式为 `gh.你的域名`：

![](img/123a521d-2340-4433-b9fe-4965d46d4321.webp)

#### 6. 签发SSL证书

签发泛域名证书并部署：

![](img/b58b55fe-adbd-4d3e-8977-c3f7efaf0185.webp)

#### 7. 完成

现在你可以通过自己的域名+VPS代理访问Github，国内直连，无需梯子：

![](img/fccbc8af-d2b1-479f-b32d-d0f023fd4c06.webp)

---

# 方案对比

| 方案 | 成本 | 国内速度 | 部署难度 | 可定制性 |
|------|------|----------|----------|----------|
| Vercel Function | 免费 | 一般 | 最简单 | 中等 |
| Cloudflare Worker | 免费 | 一般 | 简单 | 中等 |
| EdgeOne Pages | 免费 | 优秀 | 简单 | 中等 |
| VPS + Go | VPS费用 | 取决于VPS位置 | 复杂 | 高 |

# 高级配置

如果你想修改三级域名，比如将 `gh.abc.com` 改为 `github.abc.com`，直接更改域名映射配置对应键的值即可。

你可以添加和删除要重定向的路径，默认重定向到一个神秘网站，根据注释自行更改。

本项目也是一个通用的全站反代模板，可以反代其他网站（注意需要大改代码）。
