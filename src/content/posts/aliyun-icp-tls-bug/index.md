---
title: 阿里云网关 DPI 阻断绕过漏洞分析报告：TLS Client Hello 分片逃逸
published: 2026-02-11T11:38:46
description: ""
image: ""
draft: false
lang: ""
---
> [!caution]
> 提了Bug也没人管，公开了，侵删

# 阿里云网关 DPI 阻断绕过漏洞分析报告：TLS Client Hello 分片逃逸

**目标资产**: `0721for.me` (未备案域名)  
**解析 IP**: `39.107.95.178` (阿里云)  
**漏洞类型**: DPI 深度包检测逃逸 / Fail-Open (失败即放行)  
**核心原因**: 防火墙 DPI 引擎无法正确处理 TCP 分片的 TLS Client Hello 包

## 1. 结论摘要

经深度抓包分析，阿里云网关针对未备案域名的 SNI 阻断策略存在严重的底层实现缺陷。**当 TLS** `Client Hello` **数据包大小超过以太网 MTU (1500 字节) 从而触发 TCP 分片时，DPI 引擎会因无法重组报文或解析超时而选择直接“放行”**。

随着现代浏览器（Chrome/Firefox）和新版工具（Curl）默认启用 **后量子加密 (PQC, X25519Kyber768)**，Client Hello 包大小普遍暴增至 1800+ 字节。这导致正常的现代 HTTPS 流量能够天然绕过监管阻断，而旧版客户端或手动降级的请求反被拦截。

## 2. 现象对比与证据链

我们对比了多种客户端配置下的抓包数据，结果呈现出完美的二元对立：**凡是分片的包均绕过，凡是不分片的包均被拦截**。

| 客户端环境                 | TLS 关键特征                   | 包大小 (approx) | TCP 分片  | 结果              | 原因分析                     |
| --------------------- | -------------------------- | ------------ | ------- | --------------- | ------------------------ |
| **Chrome / Firefox**  | 默认开启 PQC (Kyber768)        | ~1900 bytes  | ✅ **是** | **绕过 (200 OK)** | 包过大触发分片，DPI 解析失败导致放行     |
| **Curl (Linux 新版)**   | 默认开启 PQC (Kyber768)        | ~1800 bytes  | ✅ **是** | **绕过 (200 OK)** | 同上                       |
| **Curl (伪装 TLS 1.2)** | 伪装 1.2 但带 PQC Key Share    | ~2400 bytes  | ✅ **是** | **绕过 (200 OK)** | 只要有 PQC 撑大包，版本号伪装也能过     |
| **Curl (手动指定)**       | `--curves X25519` (禁用 PQC) | ~300 bytes   | ❌ 否     | **拦截 (RST)**    | 单包完整，DPI 成功提取 SNI 并拦截    |
| **Curl (Windows)**    | 旧版/Schannel (无 PQC)        | ~450 bytes   | ❌ 否     | **拦截 (RST)**    | 同上                       |
| **Firefox (强制 1.2)**  | 纯 TLS 1.2 (无 KeyShare)     | ~180 bytes   | ❌ 否     | **拦截 (RST)**    | 纯 TLS 1.2 包极小，DPI 轻松解析拦截 |

## 3. 技术细节分析

### 3.1 核心机制：PQC 撑爆 MTU

- **PQC 引入**：TLS 1.3 引入了后量子加密算法支持。主流的 `X25519MLKEM768` (Kyber768) 密钥交换需要在 `Client Hello` 的 `key_share` 扩展中携带约 **1200 字节** 的公钥数据。
- **包大小激增**：加上其他常规扩展（SNI, ALPN, Signature Algorithms 等），整个 `Client Hello` 的长度通常在 **1800 - 2500 字节** 之间。
- **TCP 分片**：标准以太网 MTU 为 1500 字节。超过此大小的 TLS 握手包必须被网络协议栈拆分为多个 TCP 段（Segments）发送。

### 3.2 DPI 缺陷：Fail-Open

- **解析逻辑**：阿里云网关的 DPI 引擎似乎**仅检测 TLS 握手的第一个 TCP 数据包**。
- **截断失效**：对于分片的 Client Hello，SNI 扩展虽然通常在第一个包中，但由于 TLS Record Layer 的 `Length` 字段指示的长度（如 1800）远大于实际接收到的第一个分片长度（如 1400），DPI 引擎会判断为报文不完整或无法解析。
- **策略选择**：为了避免在高并发下进行昂贵的 TCP 流重组（Stream Reassembly），或者避免误杀（False Positive），DPI 采取了 **Fail-Open** 策略，即 **“看不懂就行”**。

### 3.3 关键抓包证据 (Wireshark Frames)

1. **Frame 4251 (Firefox - 绕过)**:

- `Length: 1890`
- `[2 Reassembled TCP Segments]`
- `Extension: key_share ... X25519MLKEM768`

1. **Frame 964 (Firefox 强制 TLS 1.2 - 拦截)**:

- `Length: 186`
- 无 `key_share`，无 PQC。
- 单包发送，立即 RST。

1. **Frame 568 (伪装 TLS 1.2 - 绕过)**:

- `Version: TLS 1.2` 但包含 PQC Key Share。
- `Length: 2441`，分片 -> 绕过。

## 4. 危害与建议

- **危害**：当前的监管阻断策略对现代流量（主流浏览器、新版工具）几乎完全失效，仅能拦截旧设备或特定配置的爬虫，形同虚设。
- **建议**：

1. **升级 DPI 引擎**：必须支持 TCP 流重组（Reassembly），确保能够还原并解析跨包的 TLS Client Hello。
2. **优化解析逻辑**：即使不重组，也可以尝试在第一个分片中尽力提取 SNI（SNI 通常靠前），但这可能容易被 Padding 混淆绕过。最稳妥的方式依然是流重组。
