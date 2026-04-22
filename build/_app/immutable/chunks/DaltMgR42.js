import{n as e}from"./pn1seLaS.js";import{D as t,F as n,L as r,Mt as i,jt as a,ot as o,st as s}from"./R8CaXVlq.js";import"./ZsEnWiqm.js";var c=e({default:()=>y,metadata:()=>l}),l={category:`教程`,description:`使用NapCat连接NoneBot2，打造自己的聊天机器人`,draft:!1,image:`img/QmcMSSKysZmgUCUk9W7hQUvZCtVSFH6hGKHctg99yo1yDE.avif`,lang:`zh_CN`,published:`2024-11-19T16:00:00.000Z`,tags:[`QQBot`],title:`使用NoneBot2搭建你的QQBot！`},{category:u,description:d,draft:f,image:p,lang:m,published:h,tags:g,title:_}=l,v=r(`<h1>安装 NapCat(Win)</h1> <blockquote><p>用于登录 QQ 实现收发消息</p></blockquote> <ol><li><p>进入<a href="https://github.com/NapNeko/NapCatQQ/releases/latest" rel="nofollow">Release NapCat V4.1.12 · NapNeko/NapCatQQ · GitHub</a>，下载<code>NapCat.Shell.zip</code></p></li> <li><p>将其解压到一个单独的文件夹，然后打开命令行，运行<code>launcher.bat &lt;BOT QQ号&gt;</code></p></li> <li><p>运行后通过手机扫码登录</p></li> <li><p>它会打印本地控制台的地址信息，如：<code>[NapCat] [WebUi] WebUi Local Panel Url: http://127.0.0.1:6099/webui?token=4xldg5fqb1</code></p></li> <li><p>直接进入，如图配置即可（端口号可以自己修改，但是要和下部分NoneBot2监听的端口一致。这里是9090）<img src="img/2024-11-20-19-21-21-2024-11-20-19-15-39-image.avif"/></p></li></ol> <h1>安装 NoneBot2</h1> <p>用于实现逻辑，控制 NapCat 收发消息</p> <ol><li><p>首先，你得装<a href="https://www.python.org/downloads/" rel="nofollow">Python</a>。Windows可以使用 <a href="https://scoop.sh/" rel="nofollow">https://scoop.sh/</a></p></li> <li><p>pypi 清华源：<code>pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple</code></p></li> <li><p>装 pipx：<code>pip install pipx</code>。你也可以使用<code>scoop install pipx</code></p></li> <li><p>设置 pipx 全局变量：<code>pipx ensurepath</code></p></li> <li><p>装 nb-cli：<code>pipx install nb-cli</code></p></li> <li><p><strong>如果找不到 nb 命令：</strong> 对于 root 用户，你可以编辑 <code>/root/.bashrc</code> 或 <code>/root/.profile</code>（如果你使用的是 Bash）： <code>nano /root/.bashrc</code> 添加以下行： <code>export PATH="$HOME/.local/bin:$PATH"</code> 保存并重新加载配置： <code>source /root/.bashrc</code></p></li> <li><p>装 nb bootstrap：<code>nb self install nb-cli-plugin-bootstrap</code></p></li> <li><p>新建项目，选一个你喜欢的文件夹，然后：<code>nb bs</code> （看不懂的就一路回车）</p></li></ol> <p>示例：</p> <pre class="language-undefined"></pre> <ol start="9"><li><p>项目创建完毕后启动：<code>nb run</code></p></li> <li><p>出现：<code>[INFO] nonebot | OneBot V11 | Bot XXXXXXXXXX connected</code> 你就成功连接上 Lagrange 了</p></li> <li><p>测试，发个<code>/ping</code>，看是否出现Pong~</p></li> <li><p>如果你要调试 NoneBot2，请先使用<code>nb</code> 进入虚拟环境。然后使用<code>pip install &lt;包名&gt;</code></p></li></ol>`,1);function y(e){var r=v(),c=s(o(r),14);t(c,()=>`<code class="language-undefined">C:afbot&gt;nb bs
加载适配器列表中……
请输入项目名称
[?] 请输入 &gt; onanibot
[?] 请选择你想要使用的适配器 OneBot V11 (OneBot V11 协议)
请输入 Bot 超级用户，超级用户拥有对 Bot 的最高权限（如对接 QQ 填 QQ 号即可）（留空回车结束输入）
[?] 第 1 项 &gt;
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
[?] 请输入 &gt; 127.0.0.1
请输入 NoneBot2 监听端口，范围 1 ~ 65535，请保证该端口号与连接端配置相同，或与端口映射配置相关
[?] 请输入 &gt; 8080
[?] 是否在项目目录中释出快捷启动脚本？ Yes
[?] 是否将 localstore 插件的存储路径重定向到项目路径下以便于后续迁移 Bot？ Yes
[?] 是否使用超级用户 Ping 指令回复插件？ Yes
[?] 是否安装 logpile 插件提供日志记录到文件功能？ Yes
[?] 是否在启动脚本中使用 webui 插件启动项目以使用网页管理 NoneBot？（该插件仍在开发中，不推荐用于生产环境） No
成功新建项目 onanibot
[?] 是否新建虚拟环境？ Yes
正在 C:afbotonanibot.venv 中创建虚拟环境
创建虚拟环境成功
[?] 是否需要修改或清除 pip 的 PyPI 镜像源配置？ No
[?] 是否立即安装项目依赖？ Yes
正在安装项目依赖
依赖安装成功
[?] 请选择需要启用的内置插件
项目配置完毕，开始使用吧！</code>`,!0),i(c),a(2),n(e,r)}export{c as t};