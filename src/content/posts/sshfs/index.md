---
title: 将你的Linux硬盘映射到Windows？
published: 2026-04-18
description: 如何像Windows一样管理Linux文件和开发？SSHFS来帮你！
image: img/Linux-win.png
tags:
  - SSHFS
category: 教程
draft: false
lang: ""
---

# 引言
你是否有一个Linux服务器？你是否曾经使用过各大IDE的远程开发？你是否被巨大的 `vscode-server` `trae-server` ... 占用巨额储存空间？

实际上，当我们进行远程开发的时候，我们只需要 **在Windows上操作Linux的文件** 即可

那我们为什么不尝试 **将Linux上的目录挂到Windows上** 呢？

# 正式开始
首先我们需要安装SSHFS，你可以前往Github下载发行版： [libfuse/sshfs: A network filesystem client to connect to SSH servers](https://github.com/libfuse/sshfs)，又或者通过Scoop安装： `scoop install nonportable/sshfs-np` 

接着编写一个批处理脚本，方便我们每次的挂载

```sql
SET PATH=C:\Program Files\SSHFS-Win\bin
"C:\Program Files\SSHFS-Win\bin\sshfs.exe" -f root@192.168.124.14:/ X: -o workaround=rename -o idmap=user
```

> 第一行命令的作用详见： https://github.com/winfsp/sshfs-win/issues/401#issuecomment-1968129241

- `C:\Program Files\SSHFS-Win\bin` 你的SSHFS二进制文件所在的目录
- `-f` 前台挂载，关闭CMD窗口后则失效
- `root@192.168.124.14:/` 你要连接的SSH主机（192.168.124.14），登录用户（root），挂载目录（/）
- `X:` 要挂载到的Windows盘符
- `workaround=rename` 自动修复Unix文件名
- `idmap=user` 以SSH登录的用户权限来访问挂载目录，这里为root，避免访问权限问题

最后，我们就可以在Windows文件资源管理器中看到被挂载的Linux盘符了

![](img/sshfs.png)

![](img/sshfs-1.png)

同时，我们也可以使用任何软件来直接打开Linux上的文件来远程开发

![](img/sshfs-2.png)

需要注意的是，和其他IDE直接通过SSH连接服务器进行远程开发不同。SSHFS仅是通过SFTP协议将Linux上的 **文件系统** 映射到Windows上来。并不包含整个Linux环境

所以，SSHFS上的终端解释器为你的 **Windows终端解释器** ，而其他IDE的远程开发的终端解释器为 **目标Linux上的终端解释器**。

如果需要调用Linux上的原生命令，则需要另开SSH

![](img/sshfs-4.png)