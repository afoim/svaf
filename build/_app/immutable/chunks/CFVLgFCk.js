import{n as e}from"./pn1seLaS.js";import{D as t,F as n,L as r,Mt as i,ot as a,st as o}from"./R8CaXVlq.js";import"./ZsEnWiqm.js";var s=e({default:()=>v,metadata:()=>c}),c={category:`教程`,description:`Hugo是一个基于Golang的静态博客，相比于Nodejs的Hexo构建效率提升600%，同时也支持低JavaScript特性，SEO更加优化，爬虫更易获取`,draft:!1,image:`img/3d1b097d-7e31-4312-b3e5-d213e2903f4d.avif`,lang:``,published:`2025-03-02T16:00:00.000Z`,tags:[`Hugo`],title:`Hugo博客搭建教程以及配置调优`},{category:l,description:u,draft:d,image:f,lang:p,published:m,tags:h,title:g}=c,_=r(`<h1>引言</h1> <p>曾经我写过一篇文章叫做：<a href="/posts/fuwari/">Fuwari静态博客搭建教程</a>。</p> <p>文中的<a href="https://github.com/saicaca/fuwari" rel="nofollow">Fuwari</a>是基于Astro的，并且使用了服务器+客户端的混合渲染，尽管UI确实好看，但因为本人不会写Astro导致日后维护特别困难（比如手动添加Giscus评论后和上游分支发生冲突需要手动解决冲突才能合并上游）。</p> <p>最后我放弃了，既然我就是菜我为什么不找一个原生使用HTML+JS+CSS的框架呢？</p> <p>于是我便询问AI，Claude推荐我使用Hugo。</p> <p>其实我早就曾听闻Hugo的大名，但是并没有深入研究，但是Claude又告诉我Hugo采用Go语言进行编译，速度快，而且想要二次开发也只需要改改我最熟悉的HTML+JS+CSS。</p> <p>于是我便花了2小时深入研究、部署、调优。发现Hugo确实很强大：迁移方便，二改简单，构建迅速</p> <h1>正式开始</h1> <blockquote><p>请全程在Windows上操作</p></blockquote> <p>我们首先需要安装Scoop，这是一个适用于Windows的包管理器，个人认为非常好用</p> <p>Scoop默认会安装到C盘，如果你想要换盘请按需更改</p> <pre class="language-powershell"></pre> <p>安装Scoop：</p> <pre class="language-powershell"></pre> <p>如果你以管理员的身份会安装失败，请切换为普通用户。若想强制以管理员身份安装Scoop请使用</p> <p><a href="https://github.com/ScoopInstaller/Install#for-admin" rel="nofollow">github原帖</a></p> <p>出于安全考虑，默认情况下已禁用管理员控制台下的安装。如果您知道自己在做什么并希望以管理员身份安装Scoop，请下载安装程序并在提升的控制台中手动执行它，使用 <code>-RunAsAdmin</code> 参数。以下是示例：</p> <pre class="language-powershell"></pre> <p>安装Hugo框架：</p> <pre class="language-powershell"></pre> <p>然后选择一个你喜欢的文件夹创建你的站点。 <code>myblog</code> 即你的站点文件夹名称</p> <pre class="language-shell"></pre> <p>安装PaperMod主题：</p> <pre class="language-shell"></pre> <p>站点根目录会有一个 <code>hugo.toml</code>。我推荐使用YAML。将文件重命名为 <code>hugo.yaml</code>。粘贴并更改以下内容</p> <pre class="language-yaml"></pre> <p>然后我们需要分别配置分类、标签、归档和搜索页</p> <p>创建 <code>content\\categories\\_index.md</code> 写入：</p> <pre class="language-markdown"></pre> <p>创建 <code>content\\tags\\_index.md</code> 写入：</p> <pre class="language-markdown"></pre> <p>创建 <code>content\\archives.md</code> 写入：</p> <pre class="language-markdown"></pre> <p>创建 <code>content\\search.md</code> 写入：</p> <pre class="language-markdown"></pre> <p>然后我们要更改默认的文章创建模板</p> <p>在 <code>archetypes\\default.md</code> 写入：</p> <pre class="language-markdown"></pre> <p>接下来我们就可以通过命令来创建文章，并开始写作了。注意，最终构建的文章URL是你的文章的文件名。比如：<code>https://你的网站.com/posts/first</code> 所以文章文件名尽量简短，这并不会影响你的文章标题</p> <pre class="language-shell"></pre> <p>当我们写完一篇文章想要预览网站，可以使用</p> <pre class="language-powershell"></pre> <p>当我们想要将站点发布到Vercel、Cloudflare Pages等静态网站托管平台可以将我们的 <code>myblog</code>\xA0作为一个Git存储库提交到Github</p> <p>根目录：<code>./</code></p> <p>输出目录：<code>public</code></p> <p>构建命令：<code>hugo --gc</code></p> <p>环境变量： Key：<code>HUGO_VERSION</code> Value：<code>0.145.0</code></p> <hr/> <h3>对象存储存图中间件代码：</h3> <pre class="language-python"></pre>`,1);function v(e){var r=_(),s=o(a(r),22);t(s,()=>`<code class="language-powershell"><span class="token variable">$env</span>:SCOOP=<span class="token string">'D:Scoop'</span>
<span class="token variable">$env</span>:SCOOP_GLOBAL=<span class="token string">'D:ScoopApps'</span>
<span class="token namespace">[Environment]</span>::SetEnvironmentVariable<span class="token punctuation">(</span><span class="token string">'SCOOP'</span><span class="token punctuation">,</span> <span class="token variable">$env</span>:SCOOP<span class="token punctuation">,</span> <span class="token string">'User'</span><span class="token punctuation">)</span>
<span class="token namespace">[Environment]</span>::SetEnvironmentVariable<span class="token punctuation">(</span><span class="token string">'SCOOP_GLOBAL'</span><span class="token punctuation">,</span> <span class="token variable">$env</span>:SCOOP_GLOBAL<span class="token punctuation">,</span> <span class="token string">'Machine'</span><span class="token punctuation">)</span></code>`,!0),i(s);var c=o(s,4);t(c,()=>`<code class="language-powershell"><span class="token function">Set-ExecutionPolicy</span> <span class="token operator">-</span>ExecutionPolicy RemoteSigned <span class="token operator">-</span>Scope CurrentUser
<span class="token function">Invoke-RestMethod</span> <span class="token operator">-</span>Uri https:<span class="token operator">/</span><span class="token operator">/</span>get<span class="token punctuation">.</span>scoop<span class="token punctuation">.</span>sh <span class="token punctuation">|</span> <span class="token function">Invoke-Expression</span></code>`,!0),i(c);var l=o(c,8);t(l,()=>`<code class="language-powershell"><span class="token function">irm</span> get<span class="token punctuation">.</span>scoop<span class="token punctuation">.</span>sh <span class="token operator">-</span>outfile <span class="token string">'install.ps1'</span>
<span class="token punctuation">.</span>install<span class="token punctuation">.</span>ps1 <span class="token operator">-</span>RunAsAdmin <span class="token punctuation">[</span><span class="token operator">-</span>OtherParameters <span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">]</span>
<span class="token comment"># 如果你想要一行解决：</span>
<span class="token function">iex</span> <span class="token string">"&amp; &#123;<span class="token function">$<span class="token punctuation">(</span><span class="token function">irm</span> get<span class="token punctuation">.</span>scoop<span class="token punctuation">.</span>sh<span class="token punctuation">)</span></span>&#125; -RunAsAdmin"</span></code>`,!0),i(l);var u=o(l,4);t(u,()=>`<code class="language-powershell">scoop install hugo</code>`,!0),i(u);var d=o(u,4);t(d,()=>`<code class="language-shell">hugo new site myblog
<span class="token builtin class-name">cd</span> myblog</code>`,!0),i(d);var f=o(d,4);t(f,()=>`<code class="language-shell"><span class="token function">git</span> clone https://github.com/adityatelange/hugo-PaperMod.git themes/PaperMod</code>`,!0),i(f);var p=o(f,4);t(p,()=>`<code class="language-yaml"><span class="token key atrule">baseURL</span><span class="token punctuation">:</span> <span class="token string">"https://站点url"</span>
<span class="token key atrule">title</span><span class="token punctuation">:</span> <span class="token string">"网站标题"</span>
<span class="token key atrule">LanguageCode</span><span class="token punctuation">:</span> <span class="token string">"zh-CN"</span>
<span class="token key atrule">theme</span><span class="token punctuation">:</span> <span class="token string">"PaperMod"</span>

<span class="token comment"># 启用首页个人简介展示</span>
<span class="token key atrule">params</span><span class="token punctuation">:</span>
  <span class="token comment"># 是否启用评论。你需要自己配置，或者直接引入Giscus等评论系统</span>
  <span class="token key atrule">comments</span><span class="token punctuation">:</span> <span class="token boolean important">false</span>
  <span class="token comment"># 是否显示代码复制按钮</span>
  <span class="token key atrule">ShowCodeCopyButtons</span><span class="token punctuation">:</span> <span class="token boolean important">true</span>
  <span class="token comment"># 是否显示面包屑导航</span>
  <span class="token key atrule">ShowBreadCrumbs</span><span class="token punctuation">:</span> <span class="token boolean important">false</span>
  <span class="token comment"># 是否显示阅读时间  </span>
  <span class="token key atrule">ShowReadingTime</span><span class="token punctuation">:</span> <span class="token boolean important">true</span>
  <span class="token comment"># 是否显示分享按钮</span>
  <span class="token key atrule">ShowShareButtons</span><span class="token punctuation">:</span> <span class="token boolean important">true</span>
  <span class="token comment"># 分享按钮配置</span>
  <span class="token comment"># ShareButtons: ["linkedin", "twitter"]</span>
  <span class="token comment"># 是否禁用主题切换按钮</span>
  <span class="token key atrule">disableThemeToggle</span><span class="token punctuation">:</span> <span class="token boolean important">false</span>
  <span class="token key atrule">assets</span><span class="token punctuation">:</span>
    <span class="token key atrule">favicon</span><span class="token punctuation">:</span> <span class="token string">"/你的/网站图标.webp"</span> <span class="token comment"># 需要在static文件夹放置对应的图片</span>
    <span class="token key atrule">iconHeight</span><span class="token punctuation">:</span> <span class="token number">35</span>
  <span class="token comment"># 首页信息配置</span>
  <span class="token key atrule">homeInfoParams</span><span class="token punctuation">:</span>
    <span class="token key atrule">Title</span><span class="token punctuation">:</span> <span class="token string">"首页展示的标题"</span>
    <span class="token key atrule">Content</span><span class="token punctuation">:</span> <span class="token punctuation">></span><span class="token scalar string">
      首页展示的文本</span>

  <span class="token comment"># 设置网站头像和首页头像</span>
  <span class="token key atrule">profileMode</span><span class="token punctuation">:</span>
    <span class="token key atrule">enabled</span><span class="token punctuation">:</span> <span class="token boolean important">false</span> <span class="token comment"># 设为 true 将完全替换 homeInfoParams</span>

  <span class="token comment"># 网站头像设置 (显示在导航栏)</span>
  <span class="token key atrule">label</span><span class="token punctuation">:</span>
    <span class="token key atrule">text</span><span class="token punctuation">:</span> <span class="token string">"左上角显示的文本"</span>
    <span class="token key atrule">icon</span><span class="token punctuation">:</span> <span class="token string">"/你的/左上角显示的图片.webp"</span> <span class="token comment"># 这将显示在导航栏标题旁边。需要在static文件夹放置对应的图片</span>
    <span class="token key atrule">iconHeight</span><span class="token punctuation">:</span> <span class="token number">35</span>

  <span class="token comment"># 社交图标 (显示在简介下方)</span>
  <span class="token key atrule">socialIcons</span><span class="token punctuation">:</span>
    <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> bilibili
      <span class="token key atrule">url</span><span class="token punctuation">:</span> <span class="token string">""</span>
    <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> github
      <span class="token key atrule">url</span><span class="token punctuation">:</span> <span class="token string">""</span>
    <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> telegram
      <span class="token key atrule">url</span><span class="token punctuation">:</span> <span class="token string">""</span>
    <span class="token comment"># 可以添加更多社交图标 https://github.com/adityatelange/hugo-PaperMod/wiki/Icons</span>

<span class="token comment"># 顶部导航栏的快捷链接</span>
<span class="token key atrule">menu</span><span class="token punctuation">:</span>
  <span class="token key atrule">main</span><span class="token punctuation">:</span>
    <span class="token punctuation">-</span> <span class="token key atrule">identifier</span><span class="token punctuation">:</span> categories
      <span class="token key atrule">name</span><span class="token punctuation">:</span> 分类
      <span class="token key atrule">url</span><span class="token punctuation">:</span> /categories/
      <span class="token key atrule">weight</span><span class="token punctuation">:</span> <span class="token number">10</span>
    <span class="token punctuation">-</span> <span class="token key atrule">identifier</span><span class="token punctuation">:</span> tags
      <span class="token key atrule">name</span><span class="token punctuation">:</span> 标签
      <span class="token key atrule">url</span><span class="token punctuation">:</span> /tags/
      <span class="token key atrule">weight</span><span class="token punctuation">:</span> <span class="token number">20</span>
    <span class="token punctuation">-</span> <span class="token key atrule">identifier</span><span class="token punctuation">:</span> archives
      <span class="token key atrule">name</span><span class="token punctuation">:</span> 归档
      <span class="token key atrule">url</span><span class="token punctuation">:</span> /archives/
      <span class="token key atrule">weight</span><span class="token punctuation">:</span> <span class="token number">30</span>
    <span class="token punctuation">-</span> <span class="token key atrule">identifier</span><span class="token punctuation">:</span> search
      <span class="token key atrule">name</span><span class="token punctuation">:</span> 搜索
      <span class="token key atrule">url</span><span class="token punctuation">:</span> /search/
      <span class="token key atrule">weight</span><span class="token punctuation">:</span> <span class="token number">40</span>
    <span class="token comment"># 可以添加更多导航链接。weight的值越高排序越靠后</span>

<span class="token comment"># 如果要启用搜索功能，需要添加这个</span>
<span class="token key atrule">outputs</span><span class="token punctuation">:</span>
  <span class="token key atrule">home</span><span class="token punctuation">:</span>
    <span class="token punctuation">-</span> HTML
    <span class="token punctuation">-</span> RSS
    <span class="token punctuation">-</span> JSON <span class="token comment"># 必须，用于搜索功能</span></code>`,!0),i(p);var m=o(p,6);t(m,()=>`<code class="language-markdown"><span class="token front-matter-block"><span class="token punctuation">---</span>
<span class="token front-matter yaml language-yaml"><span class="token key atrule">title</span><span class="token punctuation">:</span> 分类
<span class="token key atrule">layout</span><span class="token punctuation">:</span> categories</span>
<span class="token punctuation">---</span></span></code>`,!0),i(m);var h=o(m,4);t(h,()=>`<code class="language-markdown"><span class="token front-matter-block"><span class="token punctuation">---</span>
<span class="token front-matter yaml language-yaml"><span class="token key atrule">title</span><span class="token punctuation">:</span> 标签
<span class="token key atrule">layout</span><span class="token punctuation">:</span> tags</span>
<span class="token punctuation">---</span></span></code>`,!0),i(h);var g=o(h,4);t(g,()=>`<code class="language-markdown"><span class="token front-matter-block"><span class="token punctuation">---</span>
<span class="token front-matter yaml language-yaml"><span class="token key atrule">title</span><span class="token punctuation">:</span> 归档
<span class="token key atrule">layout</span><span class="token punctuation">:</span> archives</span>
<span class="token punctuation">---</span></span></code>`,!0),i(g);var v=o(g,4);t(v,()=>`<code class="language-markdown"><span class="token front-matter-block"><span class="token punctuation">---</span>
<span class="token front-matter yaml language-yaml"><span class="token key atrule">title</span><span class="token punctuation">:</span> <span class="token string">"搜索"</span>
<span class="token key atrule">layout</span><span class="token punctuation">:</span> <span class="token string">"search"</span></span>
<span class="token punctuation">---</span></span></code>`,!0),i(v);var y=o(v,6);t(y,()=>`<code class="language-markdown"><span class="token front-matter-block"><span class="token punctuation">---</span>
<span class="token front-matter yaml language-yaml"><span class="token key atrule">title</span><span class="token punctuation">:</span> <span class="token punctuation">&#123;</span><span class="token punctuation">&#123;</span> replace .File.ContentBaseName "<span class="token punctuation">-</span>" " " <span class="token punctuation">|</span> title <span class="token punctuation">&#125;</span><span class="token punctuation">&#125;</span>
<span class="token key atrule">published</span><span class="token punctuation">:</span> <span class="token punctuation">&#123;</span><span class="token punctuation">&#123;</span> .Date <span class="token punctuation">&#125;</span><span class="token punctuation">&#125;</span>
<span class="token key atrule">summary</span><span class="token punctuation">:</span> <span class="token string">"文章简介"</span>
<span class="token key atrule">cover</span><span class="token punctuation">:</span>
  <span class="token key atrule">image</span><span class="token punctuation">:</span> 文章封面图。也支持HTTPS
<span class="token key atrule">tags</span><span class="token punctuation">:</span> <span class="token punctuation">[</span>标签1<span class="token punctuation">,</span> 标签2<span class="token punctuation">]</span>
<span class="token key atrule">categories</span><span class="token punctuation">:</span> <span class="token string">'文章所处的分类'</span>
<span class="token key atrule">draft</span><span class="token punctuation">:</span> <span class="token boolean important">false</span> 
<span class="token key atrule">lang</span><span class="token punctuation">:</span> <span class="token string">''</span></span>
<span class="token punctuation">---</span></span></code>`,!0),i(y);var b=o(y,4);t(b,()=>`<code class="language-shell">hugo new posts/first.md</code>`,!0),i(b);var x=o(b,4);t(x,()=>`<code class="language-powershell">hugo server</code>`,!0),i(x);var S=o(x,16);t(S,()=>`<code class="language-python"><span class="token keyword">import</span> keyboard
<span class="token keyword">import</span> pyperclip
<span class="token keyword">from</span> PIL <span class="token keyword">import</span> ImageGrab<span class="token punctuation">,</span> Image
<span class="token keyword">import</span> io
<span class="token keyword">import</span> boto3
<span class="token keyword">from</span> botocore<span class="token punctuation">.</span>config <span class="token keyword">import</span> Config
<span class="token keyword">import</span> time
<span class="token keyword">import</span> uuid
<span class="token keyword">import</span> pyautogui
<span class="token keyword">import</span> os
<span class="token keyword">from</span> io <span class="token keyword">import</span> BytesIO
<span class="token comment"># 示例配置</span>
<span class="token comment"># # R2 配置</span>
<span class="token comment"># R2_CONFIG = &#123;</span>
<span class="token comment">#     'account_id': '11111111111111111',</span>
<span class="token comment">#     'access_key_id': '11111111111111111',</span>
<span class="token comment">#     'secret_access_key': '11111111111111111',</span>
<span class="token comment">#     'bucket_name': '11111111111111111'</span>
<span class="token comment"># &#125;</span>

<span class="token comment"># # OSS 配置</span>
<span class="token comment"># OSS_CONFIG = &#123;</span>
<span class="token comment">#     'url': 'sb-eo-r2.2x.nz',</span>
<span class="token comment">#     'prefix': '/fuwari-blog/img'</span>
<span class="token comment"># &#125;</span>
<span class="token comment">#########################################################</span>
<span class="token comment"># R2 配置</span>
R2_CONFIG <span class="token operator">=</span> <span class="token punctuation">&#123;</span>
    <span class="token string">'account_id'</span><span class="token punctuation">:</span> <span class="token string">''</span><span class="token punctuation">,</span>
    <span class="token string">'access_key_id'</span><span class="token punctuation">:</span> <span class="token string">''</span><span class="token punctuation">,</span>
    <span class="token string">'secret_access_key'</span><span class="token punctuation">:</span> <span class="token string">''</span><span class="token punctuation">,</span>
    <span class="token string">'bucket_name'</span><span class="token punctuation">:</span> <span class="token string">''</span>
<span class="token punctuation">&#125;</span>

<span class="token comment"># OSS 配置</span>
OSS_CONFIG <span class="token operator">=</span> <span class="token punctuation">&#123;</span>
    <span class="token string">'url'</span><span class="token punctuation">:</span> <span class="token string">''</span><span class="token punctuation">,</span>
    <span class="token string">'prefix'</span><span class="token punctuation">:</span> <span class="token string">''</span>
<span class="token punctuation">&#125;</span>
<span class="token comment">#########################################################</span>
<span class="token keyword">def</span> <span class="token function">init_r2_client</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">:</span>
    <span class="token triple-quoted-string string">"""初始化 R2 客户端"""</span>
    <span class="token keyword">return</span> boto3<span class="token punctuation">.</span>client<span class="token punctuation">(</span>
        <span class="token string">'s3'</span><span class="token punctuation">,</span>
        endpoint_url<span class="token operator">=</span><span class="token string-interpolation"><span class="token string">f'https://</span><span class="token interpolation"><span class="token punctuation">&#123;</span>R2_CONFIG<span class="token punctuation">[</span><span class="token string">"account_id"</span><span class="token punctuation">]</span><span class="token punctuation">&#125;</span></span><span class="token string">.r2.cloudflarestorage.com'</span></span><span class="token punctuation">,</span>
        aws_access_key_id<span class="token operator">=</span>R2_CONFIG<span class="token punctuation">[</span><span class="token string">'access_key_id'</span><span class="token punctuation">]</span><span class="token punctuation">,</span>
        aws_secret_access_key<span class="token operator">=</span>R2_CONFIG<span class="token punctuation">[</span><span class="token string">'secret_access_key'</span><span class="token punctuation">]</span><span class="token punctuation">,</span>
        config<span class="token operator">=</span>Config<span class="token punctuation">(</span>signature_version<span class="token operator">=</span><span class="token string">'s3v4'</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
        region_name<span class="token operator">=</span><span class="token string">'auto'</span>
    <span class="token punctuation">)</span>

<span class="token keyword">def</span> <span class="token function">get_image_from_clipboard</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">:</span>
    <span class="token triple-quoted-string string">"""从剪贴板获取图片"""</span>
    <span class="token keyword">try</span><span class="token punctuation">:</span>
        image <span class="token operator">=</span> ImageGrab<span class="token punctuation">.</span>grabclipboard<span class="token punctuation">(</span><span class="token punctuation">)</span>
        <span class="token keyword">if</span> image <span class="token keyword">is</span> <span class="token boolean">None</span><span class="token punctuation">:</span>
            <span class="token keyword">return</span> <span class="token boolean">None</span>

        <span class="token comment"># 如果是列表（多个文件），取第一个</span>
        <span class="token keyword">if</span> <span class="token builtin">isinstance</span><span class="token punctuation">(</span>image<span class="token punctuation">,</span> <span class="token builtin">list</span><span class="token punctuation">)</span><span class="token punctuation">:</span>
            <span class="token keyword">if</span> <span class="token builtin">len</span><span class="token punctuation">(</span>image<span class="token punctuation">)</span> <span class="token operator">></span> <span class="token number">0</span><span class="token punctuation">:</span>
                <span class="token comment"># 如果是图片文件路径，打开它</span>
                <span class="token keyword">try</span><span class="token punctuation">:</span>
                    <span class="token keyword">return</span> Image<span class="token punctuation">.</span><span class="token builtin">open</span><span class="token punctuation">(</span>image<span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">]</span><span class="token punctuation">)</span>
                <span class="token keyword">except</span> Exception <span class="token keyword">as</span> e<span class="token punctuation">:</span>
                    <span class="token keyword">print</span><span class="token punctuation">(</span><span class="token string-interpolation"><span class="token string">f"打开图片文件失败: </span><span class="token interpolation"><span class="token punctuation">&#123;</span>e<span class="token punctuation">&#125;</span></span><span class="token string">"</span></span><span class="token punctuation">)</span>
                    <span class="token keyword">return</span> <span class="token boolean">None</span>
            <span class="token keyword">return</span> <span class="token boolean">None</span>

        <span class="token comment"># 如果直接是 Image 对象</span>
        <span class="token keyword">if</span> <span class="token builtin">isinstance</span><span class="token punctuation">(</span>image<span class="token punctuation">,</span> Image<span class="token punctuation">.</span>Image<span class="token punctuation">)</span><span class="token punctuation">:</span>
            <span class="token keyword">return</span> image

        <span class="token keyword">return</span> <span class="token boolean">None</span>
    <span class="token keyword">except</span> Exception <span class="token keyword">as</span> e<span class="token punctuation">:</span>
        <span class="token keyword">print</span><span class="token punctuation">(</span><span class="token string-interpolation"><span class="token string">f"获取剪贴板图片失败: </span><span class="token interpolation"><span class="token punctuation">&#123;</span>e<span class="token punctuation">&#125;</span></span><span class="token string">"</span></span><span class="token punctuation">)</span>
        <span class="token keyword">return</span> <span class="token boolean">None</span>

<span class="token keyword">def</span> <span class="token function">convert_to_webp</span><span class="token punctuation">(</span>image<span class="token punctuation">)</span><span class="token punctuation">:</span>
    <span class="token triple-quoted-string string">"""将图片转换为 webp 格式"""</span>
    <span class="token keyword">if</span> <span class="token keyword">not</span> image<span class="token punctuation">:</span>
        <span class="token keyword">return</span> <span class="token boolean">None</span>

    <span class="token keyword">try</span><span class="token punctuation">:</span>
        <span class="token builtin">buffer</span> <span class="token operator">=</span> BytesIO<span class="token punctuation">(</span><span class="token punctuation">)</span>
        <span class="token comment"># 确保图片是 RGB 模式</span>
        <span class="token keyword">if</span> image<span class="token punctuation">.</span>mode <span class="token keyword">in</span> <span class="token punctuation">(</span><span class="token string">'RGBA'</span><span class="token punctuation">,</span> <span class="token string">'LA'</span><span class="token punctuation">)</span><span class="token punctuation">:</span>
            background <span class="token operator">=</span> Image<span class="token punctuation">.</span>new<span class="token punctuation">(</span><span class="token string">'RGB'</span><span class="token punctuation">,</span> image<span class="token punctuation">.</span>size<span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token number">255</span><span class="token punctuation">,</span> <span class="token number">255</span><span class="token punctuation">,</span> <span class="token number">255</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
            background<span class="token punctuation">.</span>paste<span class="token punctuation">(</span>image<span class="token punctuation">,</span> mask<span class="token operator">=</span>image<span class="token punctuation">.</span>split<span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">[</span><span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">]</span><span class="token punctuation">)</span>
            image <span class="token operator">=</span> background
        <span class="token keyword">elif</span> image<span class="token punctuation">.</span>mode <span class="token operator">!=</span> <span class="token string">'RGB'</span><span class="token punctuation">:</span>
            image <span class="token operator">=</span> image<span class="token punctuation">.</span>convert<span class="token punctuation">(</span><span class="token string">'RGB'</span><span class="token punctuation">)</span>

        image<span class="token punctuation">.</span>save<span class="token punctuation">(</span><span class="token builtin">buffer</span><span class="token punctuation">,</span> <span class="token builtin">format</span><span class="token operator">=</span><span class="token string">"WEBP"</span><span class="token punctuation">,</span> quality<span class="token operator">=</span><span class="token number">80</span><span class="token punctuation">)</span>
        <span class="token keyword">return</span> <span class="token builtin">buffer</span><span class="token punctuation">.</span>getvalue<span class="token punctuation">(</span><span class="token punctuation">)</span>
    <span class="token keyword">except</span> Exception <span class="token keyword">as</span> e<span class="token punctuation">:</span>
        <span class="token keyword">print</span><span class="token punctuation">(</span><span class="token string-interpolation"><span class="token string">f"转换图片失败: </span><span class="token interpolation"><span class="token punctuation">&#123;</span>e<span class="token punctuation">&#125;</span></span><span class="token string">"</span></span><span class="token punctuation">)</span>
        <span class="token keyword">return</span> <span class="token boolean">None</span>

<span class="token keyword">def</span> <span class="token function">upload_to_r2</span><span class="token punctuation">(</span>image_data<span class="token punctuation">)</span><span class="token punctuation">:</span>
    <span class="token triple-quoted-string string">"""上传图片到 R2"""</span>
    <span class="token keyword">if</span> <span class="token keyword">not</span> image_data<span class="token punctuation">:</span>
        <span class="token keyword">return</span> <span class="token boolean">None</span>

    client <span class="token operator">=</span> init_r2_client<span class="token punctuation">(</span><span class="token punctuation">)</span>

    <span class="token comment"># 生成基础文件名</span>
    base_filename <span class="token operator">=</span> <span class="token string-interpolation"><span class="token string">f"</span><span class="token interpolation"><span class="token punctuation">&#123;</span>uuid<span class="token punctuation">.</span>uuid4<span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">&#125;</span></span><span class="token string">.webp"</span></span>
    filename <span class="token operator">=</span> base_filename

    <span class="token keyword">try</span><span class="token punctuation">:</span>
        <span class="token comment"># 检查文件是否已存在</span>
        attempt <span class="token operator">=</span> <span class="token number">1</span>
        <span class="token keyword">while</span> <span class="token boolean">True</span><span class="token punctuation">:</span>
            <span class="token keyword">try</span><span class="token punctuation">:</span>
                <span class="token comment"># 尝试获取文件信息，如果文件存在会返回数据，不存在会抛出异常</span>
                client<span class="token punctuation">.</span>head_object<span class="token punctuation">(</span>
                    Bucket<span class="token operator">=</span>R2_CONFIG<span class="token punctuation">[</span><span class="token string">'bucket_name'</span><span class="token punctuation">]</span><span class="token punctuation">,</span>
                    Key<span class="token operator">=</span><span class="token string-interpolation"><span class="token string">f"</span><span class="token interpolation"><span class="token punctuation">&#123;</span>OSS_CONFIG<span class="token punctuation">[</span><span class="token string">'prefix'</span><span class="token punctuation">]</span><span class="token punctuation">.</span>strip<span class="token punctuation">(</span><span class="token string">'/'</span><span class="token punctuation">)</span><span class="token punctuation">&#125;</span></span><span class="token string">/</span><span class="token interpolation"><span class="token punctuation">&#123;</span>filename<span class="token punctuation">&#125;</span></span><span class="token string">"</span></span>
                <span class="token punctuation">)</span>
                <span class="token comment"># 如果文件存在，修改文件名</span>
                name_without_ext <span class="token operator">=</span> base_filename<span class="token punctuation">.</span>rsplit<span class="token punctuation">(</span><span class="token string">'.'</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">]</span>
                filename <span class="token operator">=</span> <span class="token string-interpolation"><span class="token string">f"</span><span class="token interpolation"><span class="token punctuation">&#123;</span>name_without_ext<span class="token punctuation">&#125;</span></span><span class="token string">_</span><span class="token interpolation"><span class="token punctuation">&#123;</span>attempt<span class="token punctuation">&#125;</span></span><span class="token string">.webp"</span></span>
                attempt <span class="token operator">+=</span> <span class="token number">1</span>
                <span class="token keyword">print</span><span class="token punctuation">(</span><span class="token string-interpolation"><span class="token string">f"文件名已存在，尝试重命名为: </span><span class="token interpolation"><span class="token punctuation">&#123;</span>filename<span class="token punctuation">&#125;</span></span><span class="token string">"</span></span><span class="token punctuation">)</span>
            <span class="token keyword">except</span> client<span class="token punctuation">.</span>exceptions<span class="token punctuation">.</span>ClientError <span class="token keyword">as</span> e<span class="token punctuation">:</span>
                <span class="token comment"># 如果是 404 错误，说明文件不存在，可以使用这个文件名</span>
                <span class="token keyword">if</span> e<span class="token punctuation">.</span>response<span class="token punctuation">[</span><span class="token string">'Error'</span><span class="token punctuation">]</span><span class="token punctuation">[</span><span class="token string">'Code'</span><span class="token punctuation">]</span> <span class="token operator">==</span> <span class="token string">'404'</span><span class="token punctuation">:</span>
                    <span class="token keyword">break</span>
                <span class="token keyword">raise</span> e  <span class="token comment"># 其他错误则抛出</span>

        <span class="token comment"># 上传文件</span>
        client<span class="token punctuation">.</span>put_object<span class="token punctuation">(</span>
            Bucket<span class="token operator">=</span>R2_CONFIG<span class="token punctuation">[</span><span class="token string">'bucket_name'</span><span class="token punctuation">]</span><span class="token punctuation">,</span>
            Key<span class="token operator">=</span><span class="token string-interpolation"><span class="token string">f"</span><span class="token interpolation"><span class="token punctuation">&#123;</span>OSS_CONFIG<span class="token punctuation">[</span><span class="token string">'prefix'</span><span class="token punctuation">]</span><span class="token punctuation">.</span>strip<span class="token punctuation">(</span><span class="token string">'/'</span><span class="token punctuation">)</span><span class="token punctuation">&#125;</span></span><span class="token string">/</span><span class="token interpolation"><span class="token punctuation">&#123;</span>filename<span class="token punctuation">&#125;</span></span><span class="token string">"</span></span><span class="token punctuation">,</span>
            Body<span class="token operator">=</span>image_data<span class="token punctuation">,</span>
            ContentType<span class="token operator">=</span><span class="token string">'image/webp'</span>
        <span class="token punctuation">)</span>
        <span class="token keyword">return</span> filename
    <span class="token keyword">except</span> Exception <span class="token keyword">as</span> e<span class="token punctuation">:</span>
        <span class="token keyword">print</span><span class="token punctuation">(</span><span class="token string-interpolation"><span class="token string">f"上传失败: </span><span class="token interpolation"><span class="token punctuation">&#123;</span>e<span class="token punctuation">&#125;</span></span><span class="token string">"</span></span><span class="token punctuation">)</span>
        <span class="token keyword">return</span> <span class="token boolean">None</span>

<span class="token keyword">def</span> <span class="token function">generate_markdown_link</span><span class="token punctuation">(</span>filename<span class="token punctuation">)</span><span class="token punctuation">:</span>
    <span class="token triple-quoted-string string">"""生成 Markdown 图片链接"""</span>
    <span class="token keyword">if</span> <span class="token keyword">not</span> filename<span class="token punctuation">:</span>
        <span class="token keyword">return</span> <span class="token boolean">None</span>

    url <span class="token operator">=</span> <span class="token string-interpolation"><span class="token string">f"https://</span><span class="token interpolation"><span class="token punctuation">&#123;</span>OSS_CONFIG<span class="token punctuation">[</span><span class="token string">'url'</span><span class="token punctuation">]</span><span class="token punctuation">&#125;</span></span><span class="token interpolation"><span class="token punctuation">&#123;</span>OSS_CONFIG<span class="token punctuation">[</span><span class="token string">'prefix'</span><span class="token punctuation">]</span><span class="token punctuation">&#125;</span></span><span class="token string">/</span><span class="token interpolation"><span class="token punctuation">&#123;</span>filename<span class="token punctuation">&#125;</span></span><span class="token string">"</span></span>
    <span class="token keyword">return</span> <span class="token string-interpolation"><span class="token string">f"![](</span><span class="token interpolation"><span class="token punctuation">&#123;</span>url<span class="token punctuation">&#125;</span></span><span class="token string">)"</span></span>

<span class="token keyword">def</span> <span class="token function">type_markdown_link</span><span class="token punctuation">(</span>markdown_link<span class="token punctuation">)</span><span class="token punctuation">:</span>
    <span class="token triple-quoted-string string">"""模拟键盘输入 Markdown 链接"""</span>
    <span class="token keyword">if</span> <span class="token keyword">not</span> markdown_link<span class="token punctuation">:</span>
        <span class="token keyword">return</span>

    pyperclip<span class="token punctuation">.</span>copy<span class="token punctuation">(</span>markdown_link<span class="token punctuation">)</span>
    pyautogui<span class="token punctuation">.</span>hotkey<span class="token punctuation">(</span><span class="token string">'ctrl'</span><span class="token punctuation">,</span> <span class="token string">'v'</span><span class="token punctuation">)</span>

<span class="token keyword">def</span> <span class="token function">handle_upload</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">:</span>
    <span class="token triple-quoted-string string">"""处理图片上传的主函数"""</span>
    <span class="token keyword">print</span><span class="token punctuation">(</span><span class="token string-interpolation"><span class="token string">f"&#92;n[</span><span class="token interpolation"><span class="token punctuation">&#123;</span>time<span class="token punctuation">.</span>strftime<span class="token punctuation">(</span><span class="token string">'%Y-%m-%d %H:%M:%S'</span><span class="token punctuation">)</span><span class="token punctuation">&#125;</span></span><span class="token string">] 收到粘贴请求"</span></span><span class="token punctuation">)</span>

    <span class="token keyword">print</span><span class="token punctuation">(</span><span class="token string">"正在检查剪贴板..."</span><span class="token punctuation">)</span>
    <span class="token comment"># 获取剪贴板图片</span>
    image <span class="token operator">=</span> get_image_from_clipboard<span class="token punctuation">(</span><span class="token punctuation">)</span>
    <span class="token keyword">if</span> <span class="token keyword">not</span> image<span class="token punctuation">:</span>
        <span class="token keyword">print</span><span class="token punctuation">(</span><span class="token string">"❌ 剪贴板中没有图片"</span><span class="token punctuation">)</span>
        <span class="token keyword">return</span>
    <span class="token keyword">print</span><span class="token punctuation">(</span><span class="token string">"✅ 获取到剪贴板图片"</span><span class="token punctuation">)</span>

    <span class="token comment"># 转换为 webp</span>
    <span class="token keyword">print</span><span class="token punctuation">(</span><span class="token string">"正在转换为 WebP 格式..."</span><span class="token punctuation">)</span>
    image_data <span class="token operator">=</span> convert_to_webp<span class="token punctuation">(</span>image<span class="token punctuation">)</span>
    <span class="token keyword">if</span> <span class="token keyword">not</span> image_data<span class="token punctuation">:</span>
        <span class="token keyword">print</span><span class="token punctuation">(</span><span class="token string">"❌ 图片转换失败"</span><span class="token punctuation">)</span>
        <span class="token keyword">return</span>
    <span class="token keyword">print</span><span class="token punctuation">(</span><span class="token string-interpolation"><span class="token string">f"✅ 转换完成，大小: </span><span class="token interpolation"><span class="token punctuation">&#123;</span><span class="token builtin">len</span><span class="token punctuation">(</span>image_data<span class="token punctuation">)</span><span class="token operator">/</span><span class="token number">1024</span><span class="token punctuation">:</span><span class="token format-spec">.2f</span><span class="token punctuation">&#125;</span></span><span class="token string">KB"</span></span><span class="token punctuation">)</span>

    <span class="token comment"># 上传到 R2</span>
    <span class="token keyword">print</span><span class="token punctuation">(</span><span class="token string">"正在上传到 R2..."</span><span class="token punctuation">)</span>
    filename <span class="token operator">=</span> upload_to_r2<span class="token punctuation">(</span>image_data<span class="token punctuation">)</span>
    <span class="token keyword">if</span> <span class="token keyword">not</span> filename<span class="token punctuation">:</span>
        <span class="token keyword">print</span><span class="token punctuation">(</span><span class="token string">"❌ 上传失败"</span><span class="token punctuation">)</span>
        <span class="token keyword">return</span>
    <span class="token keyword">print</span><span class="token punctuation">(</span><span class="token string-interpolation"><span class="token string">f"✅ 上传成功，文件名: </span><span class="token interpolation"><span class="token punctuation">&#123;</span>filename<span class="token punctuation">&#125;</span></span><span class="token string">"</span></span><span class="token punctuation">)</span>

    <span class="token comment"># 生成并输入 Markdown 链接</span>
    markdown_link <span class="token operator">=</span> generate_markdown_link<span class="token punctuation">(</span>filename<span class="token punctuation">)</span>
    <span class="token keyword">if</span> markdown_link<span class="token punctuation">:</span>
        <span class="token keyword">print</span><span class="token punctuation">(</span><span class="token string-interpolation"><span class="token string">f"生成的 URL: https://</span><span class="token interpolation"><span class="token punctuation">&#123;</span>OSS_CONFIG<span class="token punctuation">[</span><span class="token string">'url'</span><span class="token punctuation">]</span><span class="token punctuation">&#125;</span></span><span class="token interpolation"><span class="token punctuation">&#123;</span>OSS_CONFIG<span class="token punctuation">[</span><span class="token string">'prefix'</span><span class="token punctuation">]</span><span class="token punctuation">&#125;</span></span><span class="token string">/</span><span class="token interpolation"><span class="token punctuation">&#123;</span>filename<span class="token punctuation">&#125;</span></span><span class="token string">"</span></span><span class="token punctuation">)</span>
        <span class="token keyword">print</span><span class="token punctuation">(</span><span class="token string-interpolation"><span class="token string">f"模拟键入: </span><span class="token interpolation"><span class="token punctuation">&#123;</span>markdown_link<span class="token punctuation">&#125;</span></span><span class="token string">"</span></span><span class="token punctuation">)</span>
        type_markdown_link<span class="token punctuation">(</span>markdown_link<span class="token punctuation">)</span>
        <span class="token keyword">print</span><span class="token punctuation">(</span><span class="token string">"✅ 操作完成"</span><span class="token punctuation">)</span>

<span class="token keyword">def</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">:</span>
    <span class="token triple-quoted-string string">"""主函数"""</span>
    <span class="token keyword">print</span><span class="token punctuation">(</span><span class="token string">"="</span> <span class="token operator">*</span> <span class="token number">50</span><span class="token punctuation">)</span>
    <span class="token keyword">print</span><span class="token punctuation">(</span><span class="token string">"R2 图片上传插件已启动"</span><span class="token punctuation">)</span>
    <span class="token keyword">print</span><span class="token punctuation">(</span><span class="token string-interpolation"><span class="token string">f"当前配置:"</span></span><span class="token punctuation">)</span>
    <span class="token keyword">print</span><span class="token punctuation">(</span><span class="token string-interpolation"><span class="token string">f"- OSS 域名: </span><span class="token interpolation"><span class="token punctuation">&#123;</span>OSS_CONFIG<span class="token punctuation">[</span><span class="token string">'url'</span><span class="token punctuation">]</span><span class="token punctuation">&#125;</span></span><span class="token string">"</span></span><span class="token punctuation">)</span>
    <span class="token keyword">print</span><span class="token punctuation">(</span><span class="token string-interpolation"><span class="token string">f"- 存储路径: </span><span class="token interpolation"><span class="token punctuation">&#123;</span>OSS_CONFIG<span class="token punctuation">[</span><span class="token string">'prefix'</span><span class="token punctuation">]</span><span class="token punctuation">&#125;</span></span><span class="token string">"</span></span><span class="token punctuation">)</span>
    <span class="token keyword">print</span><span class="token punctuation">(</span><span class="token string-interpolation"><span class="token string">f"- R2 存储桶: </span><span class="token interpolation"><span class="token punctuation">&#123;</span>R2_CONFIG<span class="token punctuation">[</span><span class="token string">'bucket_name'</span><span class="token punctuation">]</span><span class="token punctuation">&#125;</span></span><span class="token string">"</span></span><span class="token punctuation">)</span>
    <span class="token keyword">print</span><span class="token punctuation">(</span><span class="token string">"使用 Ctrl+Alt+V 上传剪贴板中的图片"</span><span class="token punctuation">)</span>
    <span class="token keyword">print</span><span class="token punctuation">(</span><span class="token string">"="</span> <span class="token operator">*</span> <span class="token number">50</span><span class="token punctuation">)</span>

    <span class="token comment"># 注册快捷键</span>
    keyboard<span class="token punctuation">.</span>add_hotkey<span class="token punctuation">(</span><span class="token string">'ctrl+alt+v'</span><span class="token punctuation">,</span> handle_upload<span class="token punctuation">)</span>

    <span class="token comment"># 保持程序运行</span>
    keyboard<span class="token punctuation">.</span>wait<span class="token punctuation">(</span><span class="token punctuation">)</span>

<span class="token keyword">if</span> __name__ <span class="token operator">==</span> <span class="token string">"__main__"</span><span class="token punctuation">:</span>
    main<span class="token punctuation">(</span><span class="token punctuation">)</span> </code>`,!0),i(S),n(e,r)}export{s as t};