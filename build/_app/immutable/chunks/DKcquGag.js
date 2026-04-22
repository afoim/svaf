import{n as e}from"./pn1seLaS.js";import{D as t,F as n,L as r,Mt as i,at as a,jt as o,ot as s,st as c}from"./R8CaXVlq.js";import"./ZsEnWiqm.js";var l=e({default:()=>b,metadata:()=>u}),u={category:`记录`,description:`在N100小主机上安装PVE，然后在其中安装飞牛NAS和Debian，实现追番建站分离，并且易扩展，易迁移`,draft:!1,image:`img/N100-PVE_cover.avif`,lang:``,published:`2024-10-27T16:00:00.000Z`,tags:[`PVE`],title:`N100 - PVE（fnOS+Debian）基建记录`},{category:d,description:f,draft:p,image:m,lang:h,published:g,tags:_,title:v}=u,y=r(`<h1>配置&需求</h1> <ul><li><p>N100 CPU 频率：最小 700 Mhz, 最大 3400 Mhz | TDP：6 W</p></li> <li><p>8G RAM</p></li> <li><p>128G M.2 NVme SSD</p></li> <li><p>512G SATA HDD</p></li> <li><p>Realtek R8168 有线网卡</p></li> <li><p>USB有线网卡</p></li> <li><p>U盘（作PVE引导盘）</p></li></ul> <h1>目标</h1> <ol><li><p>所有系统通过PVE管理</p></li> <li><p>PVE下安装fnOS，作NAS并配置自动追番（直通：<code>N100核显</code> <code>512G SATA HDD</code> ）</p></li> <li><p>PVE下安装Debian，搭建QQBot、博客、AList</p></li></ol> <hr/> <h1>1. PVE</h1> <h2>安装</h2> <ul><li><p>下载Ventoy最新版可执行文件：</p> <p><a href="https://www.ventoy.net/cn/download.html" rel="nofollow">https://www.ventoy.net/cn/download.html</a></p> <ul><li>使用GPT分区表，NTFS格式将Ventoy写入U盘</li></ul></li> <li><p>下载PVE最新版ISO（使用USTC镜像源）：</p> <p><a href="https://mirrors.ustc.edu.cn/help/proxmox.html" rel="nofollow">https://mirrors.ustc.edu.cn/help/proxmox.html</a></p> <ul><li>将PVE的ISO文件放入U盘根目录</li></ul></li> <li><p>插入USB网卡，U盘连接到到N100，开机从U盘启动，进入PVE安装界面，安装PVE。网络配置选择USB网卡</p></li> <li><p>重启，进入PVE，通过IP+8006端口进入WebUI，登录进去</p></li></ul> <h2>配置</h2> <h3>安装PVE快捷管理脚本</h3> <ul><li><p>安装PVE快捷管理脚本：<a href="https://alist.onani.cn/pve_source.tar.gz" rel="nofollow">pve_source.tar.gz | AcoFork-AList</a> 或 <a href="https://wwp.lanzoul.com/ivHta1ngmo6d" rel="nofollow"><strong>https://wwp.lanzoul.com/ivHta1ngmo6d</strong></a> （密码:i1ws）（来自：在下莫老师）</p> <ul><li><p>解压：<code>tar zxvf pve_source.tar.gz</code></p></li> <li><p>运行：<code>./pve_source</code></p></li> <li><p>同意许可协议</p></li> <li><p>依次执行白框操作<img src="img/ea205e1a00e7029dfa4bd7850c5a6a68d6d4c0d9.avif"/></p></li> <li><p>扩容local：<code>lvextend -rl +100%FREE /dev/pve/root</code></p></li></ul></li></ul> <h3>配置Realtek R8168网卡</h3> <blockquote><p>由于Debian系默认安装R8169驱动，我们需要手动安装R8168驱动，否则无法使用N100小主机自带的有线网口上网</p></blockquote> <ul><li><p>下载驱动：</p> <p><a href="https://www.realtek.com/Download/List?cate_id=584" rel="nofollow">https://www.realtek.com/Download/List?cate_id=584</a><img src="img/0d8457c7fb0d497e12e2c8b544f07c3c37cf96cd.avif"/></p></li> <li><p>解压，安装：<code>sh autorun.sh</code></p></li> <li><p>查看是否有新的网络接口：<code>ip a</code></p></li> <li><pre class="language-shell"></pre></li> <li><p>配置网络配置文件：<code>nano /etc/network/interfaces</code></p> <pre class="language-undefined"></pre></li> <li><p>重启网络服务：<code>systemctl restart networking</code></p></li> <li><p>查看ip：<code>ip a</code></p> <pre class="language-shell"></pre></li> <li><p>卸除USB网卡</p></li></ul> <h3>配置STUN穿透</h3> <h4>路由器设置DMZ主机为PVEIP</h4> <ul><li><img src="img/dbeb7980e5fc699c696ffa6f2fda4a17c05ee821.avif"/></li></ul> <h4>安装Lucky</h4> <ul><li><p>执行：<code>curl -o /tmp/install.sh http://6.666666.host:6/files/golucky.sh && sh /tmp/install.sh http://6.666666.host:6/files 2.13.4</code></p></li> <li><p>通过<code>host:16601</code> 进入Lucky后台，设置STUN穿透</p></li> <li><p><img src="img/2175839424184aee880b91382bd1fbf3c578d258.avif"/></p></li></ul> <h1>2. fnOS</h1> <h2>安装</h2> <ul><li><p>前往官网下载最新版ISO：</p> <p><a href="https://www.fnnas.com/" rel="nofollow">https://www.fnnas.com/</a></p></li> <li><p>上传至PVE：<img src="img/073808516d357e099a866c30b4a77954c5b9b458.avif"/></p></li> <li><p>创建fnOS虚拟机，CPU类型选择host，步骤略</p></li> <li><p>直通核显和硬盘：<img src="img/08e4f7a3b87ae86334011e1d4c3a384a36ad9866.avif"/></p></li> <li><p>如果你不知道你的核显和SATA控制器的PCI ID：<code>lspci</code></p> <ul><li><p>可见核显为<code>00:02.0</code>，SATA控制器为<code>00:17.0</code></p> <pre class="language-shell"></pre></li></ul></li> <li><p>启动虚拟机，安装fnOS</p></li></ul> <h2>配置</h2> <ul><li><p>前往飞牛设置，创建储存空间，Linear模式，选择刚才直通的硬盘<img src="img/581cf01462df545a8662acbb5e20e1676bd17744.avif"/></p></li> <li><p>前往飞牛应用中心安装qBittorrent、影视，并且在设置给予目录读取权限<img src="img/92a2e0bf25d630db4858775fdbb6c907f419c25d.avif"/></p></li> <li><p>配置qBittorrent的用户名和密码</p></li> <li><p>打开飞牛Docker，初始化</p></li> <li><p>拉取并运行AutoBangumi Docker镜像：</p> <pre class="language-shell"></pre></li> <li><p>进入<code>host:7892</code> 让AutoBangumi连接qBittorrent并配置下载地址<img src="img/82c4a003d2399f82a7ccf5849cd1d5858d5f1f61.avif"/></p></li> <li><p>添加RSS。可前往<a href="https://mikanime.tv/" rel="nofollow">蜜柑计划 - Mikan Project</a>获得各个字幕组的RSS</p> <p><img src="img/f36daae968d8043bbcd1e4a2bbb9b9cd2d707cee.avif"/></p> <p>注意：使用<a href="https://mikanime.tv/" rel="nofollow">蜜柑计划 - Mikan Project</a>时，请订阅单个字幕组的RSS，不要使用个人的RSS，会导致<strong>只能获取到你所有追番的最新一集而不是单个番的全部剧集</strong></p></li> <li><p>打开飞牛影视，初始化并设置媒体库<img src="img/269b78c3b7dffe7f8cdb861098f44147552b5eb4.avif"/></p> <ul><li><p>注意：如果要刮削旧集旧番，请规范重命名，可以使用自动化工具：<a href="https://alist.onani.cn/Episode-ReName.zip" rel="nofollow">Episode-ReName.zip | AcoFork-AList</a></p> <ul><li><p>一级目录：即qb下载目录，无需重命名</p></li> <li><p>二级目录：番剧名称</p></li> <li><p>三级目录：季，如<code>Season 1</code></p></li> <li><p>四级目录：集和字幕，如<code>S01E01.mp4</code> <code>S01E01.chs.ass</code></p></li></ul></li></ul></li></ul> <h1>3. Debian</h1> <h2>安装</h2> <ul><li><p>下载Debian12 ISO（USTC镜像源）（建议选择DVD镜像，包更全，安装更快）</p> <p><a href="https://mirrors.ustc.edu.cn/help/debian-cd.html" rel="nofollow">https://mirrors.ustc.edu.cn/help/debian-cd.html</a></p></li> <li><p>上传至PVE，创建Debian虚拟机，CPU类型选择host，步骤略</p></li></ul> <h3>安装1Panel：</h3> <p><a href="https://1panel.cn/docs/installation/online_installation/" rel="nofollow">https://1panel.cn/docs/installation/online_installation/</a></p> <ul><li>在1Panel中安装<code>Openresty</code> <code>MySQL</code> <code>Halo</code> <code>AList</code> <code>Cloudflared</code> 配置步骤略</li></ul> <h3>搭建QQBot</h3> <h4>安装OneBotv11协议实现：Lagrange.OneBot</h4> <ul><li><p>Docker Run：<code>docker run -td -p 8081:8081 -v /root/qqbot/lo:/app/data -e UID=$UID -e GID=$(id -g) ghcr.onani.cn/lagrangedev/lagrange.onebot:edge</code></p></li> <li><p>修改配置文件：<code>appsettings.json</code></p> <pre class="language-json"></pre></li> <li><p>重启容器，扫码登录</p></li></ul> <h4>安装NoneBot2</h4> <ul><li><p>安装pip：<code>apt install python3-pip</code></p></li> <li><p>配置pip USTC源：<code>pip config set global.index-url https://mirrors.ustc.edu.cn/pypi/simple</code></p></li> <li><p>安装pipx：<code>apt install pipx</code></p></li> <li><p>安装nb-cli：<code>pipx install nb-cli</code></p></li> <li><p>设置pipx变量：<code>pipx ensurepath</code></p></li> <li><p>安装nb bootstrap：<code>nb self install nb-cli-plugin-bootstrap</code></p></li> <li><p>创建新NoneBot2项目：<code>nb bs</code></p></li> <li><pre class="language-undefined"></pre></li></ul> <h1>成果展示（域名已弃用）</h1> <p><img src="img/4b4680cc548e0c59ec18cef537c9b1f5412fbbcd.avif"/></p> <p><a href="https://blog.onani.cn" rel="nofollow">https://blog.onani.cn</a></p> <p><a href="https://alist.onani.cn" rel="nofollow">https://alist.onani.cn</a></p> <p><img src="img/7c24ff7d54b2e0ccaecce4b2ef79155c54124fa4.avif"/></p>`,1);function b(e){var r=y(),l=c(s(r),26),u=c(a(l),6),d=a(u);t(d,()=>`<code class="language-shell">root@n100-pve:~<span class="token comment"># ip a</span>
<span class="token punctuation">..</span>.
<span class="token number">2</span>: enp3s0: <span class="token operator">&lt;</span>BROADCAST,MULTICAST,UP,LOWER_UP<span class="token operator">></span> mtu <span class="token number">1500</span> qdisc mq master vmbr1 state UP group default qlen <span class="token number">1000</span>
    link/ether 00:e0:4c:08:91:a6 brd ff:ff:ff:ff:ff:ff
<span class="token punctuation">..</span>.</code>`,!0),i(d),i(u);var f=c(u,2),p=c(a(f),2);t(p,()=>`<code class="language-undefined"># network interface settings; autogenerated
# Please do NOT modify this file directly, unless you know what
# you&#39;re doing.
#
# If you want to manage parts of the network configuration manually,
# please utilize the &#39;source&#39; or &#39;source-directory&#39; directives to do
# so.
# PVE will preserve these directives, but will NOT read its network
# configuration from sourced files, so do not attempt to move any of
# the PVE managed interfaces into external files!

auto lo
iface lo inet loopback

iface wlp1s0 inet manual

iface enp3s0 inet manual

auto vmbr1
iface vmbr1 inet static
        address 192.168.124.25/24
        gateway 192.168.124.1
        bridge-ports enp3s0
        bridge-stp off
        bridge-fd 0

iface vmbr1 inet6 auto
        dhcp 1
        accept_ra 2
        request_prefix 1

source /etc/network/interfaces.d/*</code>`,!0),i(p),i(f);var m=c(f,4),h=c(a(m),2);t(h,()=>`<code class="language-shell">root@n100-pve:~<span class="token comment"># ip a</span>
<span class="token punctuation">..</span>.
<span class="token number">2</span>: enp3s0: <span class="token operator">&lt;</span>BROADCAST,MULTICAST,UP,LOWER_UP<span class="token operator">></span> mtu <span class="token number">1500</span> qdisc mq master vmbr1 state UP group default qlen <span class="token number">1000</span>
    link/ether 00:e0:4c:08:91:a6 brd ff:ff:ff:ff:ff:ff
<span class="token punctuation">..</span>.
<span class="token number">4</span>: vmbr1: <span class="token operator">&lt;</span>BROADCAST,MULTICAST,UP,LOWER_UP<span class="token operator">></span> mtu <span class="token number">1500</span> qdisc noqueue state UP group default qlen <span class="token number">1000</span>
    link/ether 00:e0:4c:08:91:a6 brd ff:ff:ff:ff:ff:ff
    inet <span class="token number">192.168</span>.124.25/24 scope global vmbr1
       valid_lft forever preferred_lft forever
    inet6 <span class="token number">2409</span>:8a30:320:7fc0:2e0:4cff:fe08:91a6/64 scope global dynamic mngtmpaddr
       valid_lft 2763sec preferred_lft 2762sec
    inet6 fe80::2e0:4cff:fe08:91a6/64 scope <span class="token function">link</span>
       valid_lft forever preferred_lft forever</code>`,!0),i(h),i(m),o(2),i(l);var g=c(l,16),_=c(a(g),8),v=c(a(_),2),b=a(v),x=c(a(b),2);t(x,()=>`<code class="language-shell">root@n100-pve:~<span class="token comment"># lspci</span>
00:00.0 Host bridge: Intel Corporation Device 461c
00:02.0 VGA compatible controller: Intel Corporation Alder Lake-N <span class="token punctuation">[</span>UHD Graphics<span class="token punctuation">]</span>
00:0a.0 Signal processing controller: Intel Corporation Platform Monitoring Technology <span class="token punctuation">(</span>rev 01<span class="token punctuation">)</span>
00:14.0 USB controller: Intel Corporation Alder Lake-N PCH USB <span class="token number">3.2</span> xHCI Host Controller
00:14.2 RAM memory: Intel Corporation Alder Lake-N PCH Shared SRAM
00:16.0 Communication controller: Intel Corporation Alder Lake-N PCH HECI Controller
00:17.0 SATA controller: Intel Corporation Alder Lake-N SATA AHCI Controller
00:1a.0 SD Host controller: Intel Corporation Device 54c4
00:1c.0 PCI bridge: Intel Corporation Device 54be
00:1d.0 PCI bridge: Intel Corporation Alder Lake-N PCI Express Root Port
00:1d.1 PCI bridge: Intel Corporation Alder Lake-N PCI Express Root Port
00:1e.0 Communication controller: Intel Corporation Alder Lake-N Serial IO UART Host Controller
00:1e.3 Serial bus controller: Intel Corporation Device 54ab
00:1f.0 ISA bridge: Intel Corporation Alder Lake-N PCH eSPI Controller
00:1f.3 Audio device: Intel Corporation Alder Lake-N PCH High Definition Audio Controller
00:1f.4 SMBus: Intel Corporation Alder Lake-N SMBus
00:1f.5 Serial bus controller: Intel Corporation Alder Lake-N SPI <span class="token punctuation">(</span>flash<span class="token punctuation">)</span> Controller
01:00.0 Network controller: Intel Corporation Wireless <span class="token number">3160</span> <span class="token punctuation">(</span>rev <span class="token number">83</span><span class="token punctuation">)</span>
02:00.0 Non-Volatile memory controller: Realtek Semiconductor Co., Ltd. RTS5765DL NVMe SSD Controller <span class="token punctuation">(</span>DRAM-less<span class="token punctuation">)</span> <span class="token punctuation">(</span>rev 01<span class="token punctuation">)</span>
03:00.0 Ethernet controller: Realtek Semiconductor Co., Ltd. RTL8111/8168/8411 PCI Express Gigabit Ethernet Controller <span class="token punctuation">(</span>rev 2b<span class="token punctuation">)</span></code>`,!0),i(x),i(b),i(v),i(_),o(2),i(g);var S=c(g,4),C=c(a(S),8),w=c(a(C),2);t(w,()=>`<code class="language-shell"><span class="token function">docker</span> run <span class="token parameter variable">-d</span> <span class="token punctuation"></span>
<span class="token parameter variable">--name</span><span class="token operator">=</span>AutoBangumi <span class="token punctuation"></span>
<span class="token parameter variable">-v</span> /vol1/1000/AutoBangumi/config:/app/config <span class="token punctuation"></span>
<span class="token parameter variable">-v</span> /vol1/1000/AutoBangumi/data:/app/data <span class="token punctuation"></span>
<span class="token parameter variable">-p</span> <span class="token number">7892</span>:7892 <span class="token punctuation"></span>
<span class="token parameter variable">-e</span> <span class="token assign-left variable">TZ</span><span class="token operator">=</span>Asia/Shanghai <span class="token punctuation"></span>
<span class="token parameter variable">-e</span> <span class="token assign-left variable">PUID</span><span class="token operator">=</span><span class="token variable"><span class="token variable">$(</span><span class="token function">id</span> <span class="token parameter variable">-u</span><span class="token variable">)</span></span> <span class="token punctuation"></span>
<span class="token parameter variable">-e</span> <span class="token assign-left variable">PGID</span><span class="token operator">=</span><span class="token variable"><span class="token variable">$(</span><span class="token function">id</span> <span class="token parameter variable">-g</span><span class="token variable">)</span></span> <span class="token punctuation"></span>
<span class="token parameter variable">-e</span> <span class="token assign-left variable">UMASK</span><span class="token operator">=</span>022 <span class="token punctuation"></span>
<span class="token parameter variable">--network</span><span class="token operator">=</span>bridge <span class="token punctuation"></span>
<span class="token parameter variable">--dns</span><span class="token operator">=</span><span class="token number">8.8</span>.8.8 <span class="token punctuation"></span>
<span class="token parameter variable">--restart</span> unless-stopped <span class="token punctuation"></span>
ghcr.onani.cn/estrellaxd/auto_bangumi:latest</code>`,!0),i(w),i(C),o(6),i(S);var T=c(S,18),E=c(a(T),2),D=c(a(E),2);t(D,()=>`<code class="language-json"><span class="token punctuation">&#123;</span>
    <span class="token property">"Logging"</span><span class="token operator">:</span> <span class="token punctuation">&#123;</span>
        <span class="token property">"LogLevel"</span><span class="token operator">:</span> <span class="token punctuation">&#123;</span>
            <span class="token property">"Default"</span><span class="token operator">:</span> <span class="token string">"Information"</span><span class="token punctuation">,</span>
            <span class="token property">"Microsoft"</span><span class="token operator">:</span> <span class="token string">"Warning"</span><span class="token punctuation">,</span>
            <span class="token property">"Microsoft.Hosting.Lifetime"</span><span class="token operator">:</span> <span class="token string">"Information"</span>
        <span class="token punctuation">&#125;</span>
    <span class="token punctuation">&#125;</span><span class="token punctuation">,</span>
    <span class="token property">"SignServerUrl"</span><span class="token operator">:</span> <span class="token string">""</span><span class="token punctuation">,</span>
    <span class="token property">"SignProxyUrl"</span><span class="token operator">:</span> <span class="token string">""</span><span class="token punctuation">,</span>
    <span class="token property">"MusicSignServerUrl"</span><span class="token operator">:</span> <span class="token string">""</span><span class="token punctuation">,</span>
    <span class="token property">"Account"</span><span class="token operator">:</span> <span class="token punctuation">&#123;</span>
        <span class="token property">"Uin"</span><span class="token operator">:</span> <span class="token number">0</span><span class="token punctuation">,</span>
        <span class="token property">"Password"</span><span class="token operator">:</span> <span class="token string">""</span><span class="token punctuation">,</span>
        <span class="token property">"Protocol"</span><span class="token operator">:</span> <span class="token string">"Linux"</span><span class="token punctuation">,</span>
        <span class="token property">"AutoReconnect"</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
        <span class="token property">"GetOptimumServer"</span><span class="token operator">:</span> <span class="token boolean">true</span>
    <span class="token punctuation">&#125;</span><span class="token punctuation">,</span>
    <span class="token property">"Message"</span><span class="token operator">:</span> <span class="token punctuation">&#123;</span>
        <span class="token property">"IgnoreSelf"</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
        <span class="token property">"StringPost"</span><span class="token operator">:</span> <span class="token boolean">false</span>
    <span class="token punctuation">&#125;</span><span class="token punctuation">,</span>
    <span class="token property">"QrCode"</span><span class="token operator">:</span> <span class="token punctuation">&#123;</span>
        <span class="token property">"ConsoleCompatibilityMode"</span><span class="token operator">:</span> <span class="token boolean">false</span>
    <span class="token punctuation">&#125;</span><span class="token punctuation">,</span>
    <span class="token property">"Implementations"</span><span class="token operator">:</span> <span class="token punctuation">[</span>
        <span class="token punctuation">&#123;</span>
            <span class="token property">"Type"</span><span class="token operator">:</span> <span class="token string">"ReverseWebSocket"</span><span class="token punctuation">,</span>
            <span class="token property">"Host"</span><span class="token operator">:</span> <span class="token string">"192.168.124.34"</span><span class="token punctuation">,</span>
            <span class="token property">"Port"</span><span class="token operator">:</span> <span class="token number">9090</span><span class="token punctuation">,</span>
            <span class="token property">"Suffix"</span><span class="token operator">:</span> <span class="token string">"/onebot/v11/ws"</span><span class="token punctuation">,</span>
            <span class="token property">"ReconnectInterval"</span><span class="token operator">:</span> <span class="token number">5000</span><span class="token punctuation">,</span>
            <span class="token property">"HeartBeatInterval"</span><span class="token operator">:</span> <span class="token number">5000</span><span class="token punctuation">,</span>
            <span class="token property">"AccessToken"</span><span class="token operator">:</span> <span class="token string">""</span>
        <span class="token punctuation">&#125;</span>
    <span class="token punctuation">]</span>
<span class="token punctuation">&#125;</span></code>`,!0),i(D),i(E),o(2),i(T);var O=c(T,4),k=c(a(O),14),A=a(k);t(A,()=>`<code class="language-undefined">root@n100-debian:~# nb bs
加载适配器列表中……
请输入项目名称
[?] 请输入 &gt; onani
[?] 请选择你想要使用的适配器 OneBot V11 (OneBot V11 协议)
请输入 Bot 超级用户，超级用户拥有对 Bot 的最高权限（如对接 QQ 填 QQ 号即可）（留空回车结束输入）
[?] 第 1 项 &gt; 666
[?] 第 2 项 &gt;
请输入 Bot 昵称，消息以 Bot 昵称开头可以代替艾特（留空回车结束输入）
[?] 第 1 项 &gt;
请输入 Bot 命令起始字符，消息以起始符开头将被识别为命令，
如果有一个指令为 查询，当该配置项中有 &quot;/&quot; 时使用 &quot;/查询&quot; 才能够触发，
留空将使用默认值 [&#39;&#39;, &#39;/&#39;, &#39;#&#39;]（留空回车结束输入）
[?] 第 1 项 &gt;
请输入 Bot 命令分隔符，一般用于二级指令，
留空将使用默认值 [&#39;.&#39;, &#39; &#39;]（留空回车结束输入）
[?] 第 1 项 &gt;
请输入 NoneBot2 监听地址，如果要对公网开放，改为 0.0.0.0 即可
[?] 请输入 &gt; 0.0.0.0
请输入 NoneBot2 监听端口，范围 1 ~ 65535，请保证该端口号与连接端配置相同，或与端口映射配置相关
[?] 请输入 &gt; 9090
[?] 是否在项目目录中释出快捷启动脚本？ Yes
[?] 是否将 localstore 插件的存储路径重定向到项目路径下以便于后续迁移 Bot？ Yes
[?] 是否使用超级用户 Ping 指令回复插件？ Yes
[?] 是否安装 logpile 插件提供日志记录到文件功能？ Yes
[?] 是否在启动脚本中使用 webui 插件启动项目以使用网页管理 NoneBot？（该插件仍在开发中，不推荐用于生产环境） No
成功新建项目 onani
[?] 是否新建虚拟环境？ Yes
正在 /root/onani/.venv 中创建虚拟环境
创建虚拟环境成功
[?] 是否需要修改或清除 pip 的 PyPI 镜像源配置？ No
[?] 是否立即安装项目依赖？ Yes
正在安装项目依赖
依赖安装成功
[?] 请选择需要启用的内置插件
项目配置完毕，开始使用吧！</code>`,!0),i(A),i(k),i(O),o(10),n(e,r)}export{l as t};