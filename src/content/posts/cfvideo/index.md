---
title: 教你在Cloudflare上原生托管视频！自建YouTube！
published: 2026-02-26T22:01:46
description: 你知道吗？Cloudflare上也是可以“原生”托管视频的！
image: img/cfvideo.png
draft: false
lang: ""
---
# 引言

你可能看过 [这一期文章](/posts/jkw/) ，在该文章中，我们嵌入了一个视频，并且是由Cloudflare“原生”提供的，你是否想知道这是怎么做到的？

# 原理

众所周知，视频其实就是文件

而Cloudflare有一项业务支持在它的边缘节点上直接存放文件

当然，我说的并不是Cloudflare R2这个对象存储

而是Cloudflare Page/Worker的静态资产分发

你可能会想说，欸？这东西不是限制单文件最大25MB吗？稍微大点的视频是不是就没法放了？那也没啥用嘛

并非，如果你稍微了解现代Web的流媒体播放，你就会知道，实际上，大部分流媒体资源播放时，客户端并不会一次性下载整个视频包体，而是采用流式传输

简单来说，就是将一个大视频进行分片，客户端只需要下载其中一个小片，即可立即开始播放，之后就是传统的边播边下了

那么既然我们分片了，就可以轻松绕过单文件25MB这个限制了

不过我们刚刚讲的都是些理论，众所周知，理论都是简单的，实践都是困难的

那么我们怎么从0实现它呢？

# 实操

接下来，我就以刚才提到的文章中的视频的源文件举例，可以看到，它是一个AV1编码的MP4，并且有1GB之大

![](img/cfvideo-1.png)

![](img/cfvideo-5.png)

接下来，我们使用 **FFmpeg** 将其转为流式MP4

```bash
ffmpeg -i 0.mp4 -map 0 -c copy -f dash -seg_duration 4 -use_template 1 -use_timeline 1 manifest.mpd
```

接下来，我们就能得到产物： **一个 `.mpd` 和一堆 `.m4s`** 

![](img/cfvideo-3.png)

其中 `.mpd` 为索引文件，而 `.m4s` 文件才是真正的被切片后的视频流

改为按大小排序，可以看到其中最大一个切片也才 ≈ 18MB，完全符合Cloudflare所规定的单文件最大25MB的规定

![](img/cfvideo-4.png)

好了，接下来我们只需要将其上传到Cloudflare Page了，然后绑定一个域名，这样，我们就成功在Cloudflare上托管一条视频了

然后呢？我们需要配置客户端，或者说，让你的网站能够读取该视频并播放对吧

一般来说，将一个视频流式传输在浏览器中播放有多种方案，这里就介绍一种最简单的，利用 [Dash.js](https://reference.dashif.org/) 来在浏览器中流式播放 **流式MP4**

这非常简单！

首先，使用CDN引入 Dash.js 至 `<body>` 块内： [dashjs - Libraries - cdnjs - The #1 free and open source CDN built to make life easier for developers](https://cdnjs.com/libraries/dashjs)

```html
<script src="https://cdn.dashjs.org/latest/dash.all.min.js"></script>
```

然后在你想嵌入视频的页面放置一个带 `data-dashjs-player` 属性的 `<video>` 块，将 `src` 设为 `.mpd` 即可，比如...

```html
<video  
data-dashjs-player  
src="https://f.2x.nz/jkw/manifest.mpd"  
controls  
autoplay>  
</video>
```

就这么简单！

至此，我们成功将一个1GB大小的文件托管到了Cloudflare，并且成功在我们的网站中播放！