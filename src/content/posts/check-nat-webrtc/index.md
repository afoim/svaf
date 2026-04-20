---
title: 握草，用浏览器检测你的NAT类型？！
published: 2026-04-04T13:46:01
description: 众所周知，NAT类型的检测并不是什么门槛，但是，如果我说纯浏览器也可以实现检测呢...
image: img/nat.png
draft: false
lang: ""
---
# 视频（非教程）

https://www.bilibili.com/video/BV1H4DuBWEes/

# 原理

我们都知道，NAT类型测试非常简单就可以实现，我们可以使用类似如下Python库在客户端本地跑一个脚本测试

[MikeWang000000/Natter](https://github.com/MikeWang000000/Natter)

但如果我说，我们根本就不需要下载一个程序，只需要打开一个浏览器就可以测试你的NAT类型呢？

稍微深入一点，大部分的客户端测试你的NAT类型一般都是

- 主动请求STUN服务器
- 分析返回的 `公网IP:端口`
- 判断NAT类型

但是，在浏览器中，我们无法发送原生的UDP（STUN）请求，只能使用一个包装过的UDP接口： **WebRTC** 

该功能设计初衷是让浏览器也可以进行P2P连接

但我们也可以将它拿来测试NAT类型，不过我们的后端需要富裕一点：**用两个不同的IP来探测** 

实际上，它的原理简单来说就是：

- 浏览器请求STUN服务器，将自己的 `公网IP:端口` 发送给后端A（HTTP/WS）
- 后端A收到浏览器的  `公网IP:端口` 后，发送回包，拿取凭证（因为浏览器不允许陌生源直接发包）。此时，后端A已经是可信源了
- 接下来，后端A将自己的凭证告知后端B，让后端B拿着这个凭证去请求浏览器。如果可以收到浏览器的回包，则是 **全锥型** 
- 如果收不到，则让后端A换端口请求浏览器。如果可以收到包，则是 **IP限制型** ，如果不行，则继续测试
- 最后，再让后端A用同一个端口请求浏览器。如果可以收到包，并且浏览器源端口与之前一致，则是 **端口限制型** ，如果不一致或压根收不到包，则为 **对称型** 

详细的技术文档参见： [webrtc_check_nat/nat_detector_explanation.md at main · afoim/webrtc_check_nat](https://github.com/afoim/webrtc_check_nat/blob/main/nat_detector_explanation.md)

# 实现

最终，我们只需要写好后端，再创建一个HTTP端点，即可实现 **完整的、全状态、纯浏览器的** NAT类型检测

![](img/check-nat-webrtc.png)

[afoim/webrtc_check_nat](https://github.com/afoim/webrtc_check_nat)

[https://2x.nz/nat-check/](https://2x.nz/nat-check/)