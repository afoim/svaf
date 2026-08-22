---
title: 迁移Linux到新硬盘
published: '2026-06-12'
description: 从旧硬盘迁移Linux到新硬盘，包括硬盘对拷、UUID修复、GRUB引导重建和fstab更新
draft: false
tags: [服务器]
image: img/move-linux-cover7.png
---
## 第一步：硬盘对拷

将新旧硬盘都接入目标作业系统，并插入PE U盘，进入WinPE（FirPE）

打开DiskGenius，启动硬盘对拷，将旧盘的所有数据对拷进新盘，如有需要，可将Linux主分区扩容

![](img/move-linux-diskgenius-clone.png)

## 第二步：迁移硬盘分区UUID

> 由于Linux启动的时候认硬盘的UUID。由于我们刚刚进行了硬盘对拷，则会将Linux在曾经创建的分区UUID映射一并拷贝过来，但新硬盘中新的分区自身的UUID不会改变。所以我们需要临时外挂一个Linux系统来chroot进原系统，然后迁移UUID

接下来，重启，进入Ubuntu Server 安装镜像。进入安装向导界面

按 `Alt+F2` 进入命令行界面，输入 `sudo -i` 切换为 `root` 用户

```bash
sudo -i
```

查看新硬盘的分区信息

```bash
lsblk -f
```

挂载根分区和EFI分区

```bash
mount /dev/nvme0n1p2 /mnt
mount /dev/nvme0n1p1 /mnt/boot/efi
```

## 第三步：更新UUID

chroot 进入原系统

```bash
mount --bind /dev /mnt/dev
mount --bind /proc /mnt/proc
mount --bind /sys /mnt/sys
chroot /mnt
```

更新 grub 引导和 initramfs

```bash
update-grub
update-initramfs -u
```

## 第四步：更新 fstab

查看当前分区 UUID

```bash
blkid
```

编辑 `/etc/fstab`，将旧的 UUID 替换为新的

```bash
nano /etc/fstab
```

## 第五步：重启验证

```bash
exit
umount -R /mnt
reboot
```

重启后确认系统正常启动，所有分区正确挂载。

## 思考

### 为什么要迁移 UUID？

Linux 系统通过 `/etc/fstab` 文件记录每个分区的 UUID 来挂载。硬盘对拷后，旧盘的 fstab 里仍然是旧盘的 UUID。如果直接启动，内核找不到对应 UUID 的分区，会进入 emergency mode。

### 为什么不用 dd？

dd 是逐扇区拷贝，包括空扇区。对于不同容量的新旧硬盘，dd 需要额外处理分区表。DiskGenius 的对拷功能更智能，只拷贝有效数据，且能自动调整分区大小。
