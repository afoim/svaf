import{n as e}from"./pn1seLaS.js";import{D as t,F as n,L as r,Mt as i,at as a,jt as o,ot as s,st as c}from"./R8CaXVlq.js";import"./ZsEnWiqm.js";var l=e({default:()=>x,metadata:()=>u}),u={category:`教程`,description:`Fuwari 是一个静态博客框架，配合 Cloudflare Pages 可以快速搭建一个轻量、安全且易维护的个人博客`,draft:!1,image:`img/f286ef4d-326c-4c7c-8a1e-ed150937a12b.avif`,lang:``,published:`2025-09-16T16:00:00.000Z`,tags:[`Fuwari`],title:`Fuwari静态博客搭建教程`,ai_level:2},{category:d,description:f,draft:p,image:m,lang:h,published:g,tags:_,title:v,ai_level:y}=u,b=r(`<h3>你需要准备的东西</h3> <ol><li><p>一点基础的折腾能力。遇到问题先自己排查，实在解决不了再搜索或借助 AI，这样搭建过程会顺利很多。</p></li> <li><p><a href="https://git-scm.com/downloads" rel="nofollow">Git - Downloads (git-scm.com)</a>：用于管理本地代码并与 GitHub 仓库同步。如果你更习惯图形界面，也可以尝试 <a href="https://github.com/apps/desktop" rel="nofollow">GitHub Desktop | Simple collaboration from your desktop</a>。</p></li> <li><p><a href="https://nodejs.org/en" rel="nofollow">Node.js — Run JavaScript Everywhere (nodejs.org)</a>：Fuwari 基于 Node.js，因此需要先安装它。</p></li> <li><p>一个 <a href="https://github.com" rel="nofollow">GitHub</a> 账号：用于创建仓库并托管 Fuwari 项目文件。</p></li> <li><p>一个 <a href="https://cloudflare.com" rel="nofollow">Cloudflare</a> 账号：用于创建 Pages 项目并绑定域名。</p></li> <li><p><a href="/posts/obsidian/">黑曜石（Obsidian）</a>：这是一个可视化 Markdown 编辑器。由于 Fuwari 的文章和页面都以 Markdown 文件保存，准备一个顺手的编辑器会方便很多。</p></li> <li><p>需要会一些基础的 Markdown 语法。如果暂时不熟悉，可以先看这个教程：<a href="https://markdown.com.cn/basic-syntax/" rel="nofollow">Markdown 基本语法 | Markdown 官方教程</a>。</p></li></ol> <h3>流程图</h3> <p>本地部署Fuwari，编写文章 -> 推送更改到远程Github仓库 -> Cloudflare Pages检测到仓库更新自动构建新的网站静态文件 -> 网站成功更改</p> <h3>让我们开始吧</h3> <h4>首先，在本地部署 Fuwari</h4> <ol><li><p>Fork仓库：</p> <p><a href="https://github.com/saicaca/fuwari" rel="nofollow">https://github.com/saicaca/fuwari</a></p></li> <li><p>如果你不熟悉 Fork 仓库的流程，可以参考下面的图片教程。</p></li> <li><p><img src="img/2024-10-14-12-15-44-image.avif"/><img src="img/2024-10-14-12-17-03-image.avif"/></p></li> <li><p>然后将仓库克隆到本地：<code>git clone &lt;你的仓库URL&gt;</code>。如果可以使用 SSH，后续推送通常会更方便。</p></li> <li><p>先全局安装 <code>pnpm</code>：<code>npm install -g pnpm</code>。如果 npm 在国内下载较慢，可以尝试切换镜像源，例如 <a href="https://npmmirror.com/" rel="nofollow">npmmirror 镜像站</a>。</p></li> <li><p>接着在项目根目录安装依赖：<code>pnpm install</code> 和 <code>pnpm add sharp</code>。</p></li> <li><p>完成以上步骤后，Fuwari 就已经成功部署到本地了。</p></li></ol> <blockquote><p>[!TIP]</p> <p>你也可以使用创建一个新的空仓库然后手动上传文件，并且可以将仓库可见性设为：Private</p></blockquote> <h4>改写Fuwari的基本信息并且清理多余文件</h4> <blockquote><p>刚创建的 Fuwari 可能带有默认的博主名称、图标、链接、简介和示例文章。为了让站点更符合你的使用场景，建议先把这些内容改成自己的信息。</p></blockquote> <ol><li><p>在根目录的 <code>src</code> 文件夹中找到 <code>config.ts</code>，这里是站点的核心配置文件。</p> <ul><li><p>title：你的博客主标题</p></li> <li><p>subtitle：你的博客副标题。可选，在首页会显示为“主标题 - 副标题”</p></li></ul></li></ol> <ul><li><p>lang：博客显示语言。注释里已经列出了一些常见值，例如 <code>en</code>、<code>zh_CN</code>、<code>zh_TW</code>、<code>ja</code>、<code>ko</code></p></li> <li><p>themeColor：<code>hue</code> 表示博客主题色。你可以先在博客右上角的调色板里挑选喜欢的颜色，再把数值写回配置中。<img src="img/2024-10-15-09-16-30-image.avif"/></p></li> <li><p>banner：src：即banner图片，支持http/https URL</p></li> <li><p>favicon：src：即网站图标，支持http/https URL</p></li> <li><p>links：即友情链接，这些链接在导航栏上</p></li> <li><p>avatar：你的头像</p></li> <li><p>name：你的名字</p></li> <li><p>bio：个性签名，会显示在头像和名字下方</p></li> <li><p><code>NavBarConfig</code> 用于配置导航栏链接，<code>ProfileConfig</code> 用于配置个人资料区域的链接，效果如下图所示。<img src="img/2024-10-15-17-49-30-image.avif"/></p></li> <li><p>icon：你可以前往 <a href="https://icones.js.org/" rel="nofollow">icones.js</a> 搜索想要的图标。例如 QQ 可以填写 <code>fa6-brands:qq</code>。Fuwari 默认支持 <code>fa6-brands</code>、<code>fa6-regular</code>、<code>fa6-solid</code>、<code>material-symbols</code> 等类型，必要时也可以在 <code>astro.config.mjs</code> 中继续扩展。</p></li> <li><p><img src="img/1ef05530-10fd-4301-af4e-21ddadf18605.avif"/></p></li> <li><p><img src="img/da94494b-cc4b-4f07-ae95-8bf3b2f95d3c.avif"/></p></li> <li><p>这里我附上我的 <code>config.ts</code></p></li> <li><pre class="language-ts"></pre></li></ul> <ol start="2"><li><p>清理多余文件。根目录下的 <code>src/content/posts</code> 文件夹里会带有一些示例文章，这些内容主要用于演示 Markdown 语法和 Fuwari 的基本用法。你可以先备份到别处，再按需删除。</p></li> <li><p>完成这些设置后，就可以开始撰写自己的文章了。</p></li></ol> <h4>让我们开始写作！</h4> <blockquote><p>推荐使用 <a href="/posts/obsidian/">黑曜石（Obsidian）</a></p></blockquote> <ol><li><p>首先，在项目根目录执行：<code>pnpm new-post &lt;这里填写你的文章标题&gt;</code></p></li> <li><p>然后，在根目录下的 <code>src/content/posts</code> 文件夹中会多出一个 <code>xxx.md</code>文件</p></li> <li><p>用 MarkText 打开这个文件后，你会看到一组基础元数据，其中有几项最需要关注。</p></li> <li><pre class="language-markdown"></pre> <ul><li><p>title：文章标题</p></li> <li><p>published：文章创建时间</p></li> <li><p>description：文章描述，正常会显示在文章标题下面</p></li> <li><p>image：文章封面图（同目录需要写 <code>./</code> 如：<code>./https://eo-r2.2x.nz/myblog/img/2024-10-14-11-33-28-image.webp</code>）</p></li> <li><p>tag：文章标签</p></li> <li><p>categories：文章分类</p></li></ul></li> <li><p>还需要修改根目录下的 <code>astro.config.mjs</code>，把其中的 <code>site:</code> 改成你自己的站点 URL，例如：<code>site: "https://onani.cn",</code>。</p></li> <li><p>如果你想在 Markdown 文章里方便地插入图片，也可以顺手把编辑器配置好。</p></li> <li><p>这并不复杂。借助 MarkText，可以像使用传统博客编辑器一样直接复制粘贴图片，不过需要先做一点简单配置：</p></li></ol> <ul><li>依次点击 MarkText 左上角菜单 -> <code>File</code> -> <code>Preferences</code> -> 左侧 <code>Image</code> 分类，然后按照下图进行设置。注意把第一个选项改成以 <code>Copy</code> 开头的模式，开启 <code>Prefer</code> 开关，并在上下两个文本框中分别填写绝对路径和相对路径。</li> <li><img src="img/2024-10-14-12-54-21-image.avif"/></li> <li>这样一来，插入图片时就会先把图片复制到 <code>https://eo-r2.2x.nz/myblog/img</code> 对应的位置，再自动以 <code>![1](https://eo-r2.2x.nz/myblog/img/1.webp)</code> 这样的格式写入 Markdown 文件。你只需要复制粘贴，剩下的步骤 MarkText 会自动完成。</li></ul> <ol start="8"><li>配置完成后，你就可以比较高效地用 MarkText 编写 Markdown 博文了。</li></ol> <h4>本地预览，然后发布到Github</h4> <ol><li><p>当你觉得文章写得差不多时，可以在项目根目录执行：<code>pnpm dev</code>。稍等片刻后，就能在本地预览博客效果。<img src="img/2024-10-14-13-03-44-image.avif"/></p></li> <li><p>接下来就可以使用 Git 把这些改动发布到 GitHub。</p></li></ol> <ul><li>首先，让 Git 知道你是谁：<code>git config --global user.name "你的GitHub用户名"</code> 和 <code>git config --global user.email "你的GitHub邮箱@example.com"</code></li> <li>然后，将远程仓库地址改成 SSH 形式（如果你本来就是通过 SSH 克隆的，就不需要再修改）：<code>git remote set-url origin git@github.com:xxx/xxx</code></li> <li>随后，提交所有变更：<code>git add .</code></li> <li>接着，创建一次本地提交：<code>git commit -m "项目初始化"</code></li> <li>最后，把本地更改推送到远程仓库：<code>git push</code></li></ul> <ol start="3"><li>完成后，你的 GitHub 仓库里就应该能看到新的提交记录了。<img src="img/2024-10-14-13-10-12-image.avif"/></li></ol> <h4>让Cloudflare连接上Github，使用Pages服务展示你的博客（FREE！）</h4> <ol><li><p>前往Cloudflare的 Workers 和 Pages 页面，创建一个新Pages<img src="img/2024-10-14-13-14-28-image.avif"/></p></li> <li><p>然后选择连接Git存储库，连接你的Github，随后设置构建命令：<code>pnpm build</code> ，然后设置构建输出目录：<code>dist</code> ，如图<img src="img/2024-10-14-13-16-15-image.avif"/></p></li> <li><p>绑定自定义域，访问自定义域即可访问你的博客！<img src="img/2024-10-14-13-17-00-image.avif"/></p></li> <li><p>随后，你只需要在本地编写文章，然后<a href="#%E6%9C%AC%E5%9C%B0%E9%A2%84%E8%A7%88%E7%84%B6%E5%90%8E%E5%8F%91%E5%B8%83%E5%88%B0github">使用Git将更改推送到远程仓库</a>，Cloudflare就会自动部署，更新你的博客！</p></li></ol>`,1);function x(e){var r=b(),l=c(s(r),22),u=c(a(l),26),d=a(u);t(d,()=>`<code class="language-ts"><span class="token keyword">import</span> <span class="token keyword">type</span> <span class="token punctuation">&#123;</span>
  LicenseConfig<span class="token punctuation">,</span>
  NavBarConfig<span class="token punctuation">,</span>
  ProfileConfig<span class="token punctuation">,</span>
  SiteConfig<span class="token punctuation">,</span>
<span class="token punctuation">&#125;</span> <span class="token keyword">from</span> <span class="token string">'./types/config'</span>
<span class="token keyword">import</span> <span class="token punctuation">&#123;</span> LinkPreset <span class="token punctuation">&#125;</span> <span class="token keyword">from</span> <span class="token string">'./types/config'</span>

<span class="token keyword">export</span> <span class="token keyword">const</span> siteConfig<span class="token operator">:</span> SiteConfig <span class="token operator">=</span> <span class="token punctuation">&#123;</span>
  title<span class="token operator">:</span> <span class="token string">'AcoFork Blog'</span><span class="token punctuation">,</span>
  subtitle<span class="token operator">:</span> <span class="token string">'爱你所爱！'</span><span class="token punctuation">,</span>
  lang<span class="token operator">:</span> <span class="token string">'zh_CN'</span><span class="token punctuation">,</span>         <span class="token comment">// 'en', 'zh_CN', 'zh_TW', 'ja', 'ko'</span>
  themeColor<span class="token operator">:</span> <span class="token punctuation">&#123;</span>
    hue<span class="token operator">:</span> <span class="token number">355</span><span class="token punctuation">,</span>         <span class="token comment">// Default hue for the theme color, from 0 to 360. e.g. red: 0, teal: 200, cyan: 250, pink: 345</span>
    fixed<span class="token operator">:</span> <span class="token boolean">false</span><span class="token punctuation">,</span>     <span class="token comment">// Hide the theme color picker for visitors</span>
  <span class="token punctuation">&#125;</span><span class="token punctuation">,</span>
  banner<span class="token operator">:</span> <span class="token punctuation">&#123;</span>
    enable<span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
    src<span class="token operator">:</span> <span class="token string">'https://eo-r2.2x.nz/myblog/img/222.webp'</span><span class="token punctuation">,</span>   <span class="token comment">// Relative to the /src directory. Relative to the /public directory if it starts with '/'</span>
    position<span class="token operator">:</span> <span class="token string">'center'</span><span class="token punctuation">,</span>      <span class="token comment">// Equivalent to object-position, only supports 'top', 'center', 'bottom'. 'center' by default</span>
    credit<span class="token operator">:</span> <span class="token punctuation">&#123;</span>
      enable<span class="token operator">:</span> <span class="token boolean">false</span><span class="token punctuation">,</span>         <span class="token comment">// Display the credit text of the banner image</span>
      text<span class="token operator">:</span> <span class="token string">''</span><span class="token punctuation">,</span>              <span class="token comment">// Credit text to be displayed</span>
      url<span class="token operator">:</span> <span class="token string">''</span>                <span class="token comment">// (Optional) URL link to the original artwork or artist's page</span>
    <span class="token punctuation">&#125;</span>
  <span class="token punctuation">&#125;</span><span class="token punctuation">,</span>
  favicon<span class="token operator">:</span> <span class="token punctuation">[</span>    <span class="token comment">// Leave this array empty to use the default favicon</span>
     <span class="token punctuation">&#123;</span>
       src<span class="token operator">:</span> <span class="token string">'https://q2.qlogo.cn/headimg_dl?dst_uin=2973517380&amp;spec=5'</span><span class="token punctuation">,</span>    <span class="token comment">// Path of the favicon, relative to the /public directory</span>
       <span class="token comment">//theme: 'light',              // (Optional) Either 'light' or 'dark', set only if you have different favicons for light and dark mode</span>
       sizes<span class="token operator">:</span> <span class="token string">'128x128'</span><span class="token punctuation">,</span>              <span class="token comment">// (Optional) Size of the favicon, set only if you have favicons of different sizes</span>
     <span class="token punctuation">&#125;</span>
  <span class="token punctuation">]</span>
<span class="token punctuation">&#125;</span>

<span class="token keyword">export</span> <span class="token keyword">const</span> navBarConfig<span class="token operator">:</span> NavBarConfig <span class="token operator">=</span> <span class="token punctuation">&#123;</span>
  links<span class="token operator">:</span> <span class="token punctuation">[</span>
    LinkPreset<span class="token punctuation">.</span>Home<span class="token punctuation">,</span>
    LinkPreset<span class="token punctuation">.</span>Archive<span class="token punctuation">,</span>
    LinkPreset<span class="token punctuation">.</span>About<span class="token punctuation">,</span>
    <span class="token punctuation">&#123;</span>
      name<span class="token operator">:</span> <span class="token string">'随机图'</span><span class="token punctuation">,</span>
      url<span class="token operator">:</span> <span class="token string">'https://pic.onani.cn'</span><span class="token punctuation">,</span>     <span class="token comment">// Internal links should not include the base path, as it is automatically added</span>
      external<span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>                               <span class="token comment">// Show an external link icon and will open in a new tab</span>
    <span class="token punctuation">&#125;</span><span class="token punctuation">,</span>
    <span class="token punctuation">&#123;</span>
      name<span class="token operator">:</span> <span class="token string">'GitHub'</span><span class="token punctuation">,</span>
      url<span class="token operator">:</span> <span class="token string">'https://github.com/saicaca/fuwari'</span><span class="token punctuation">,</span>     <span class="token comment">// Internal links should not include the base path, as it is automatically added</span>
      external<span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>                               <span class="token comment">// Show an external link icon and will open in a new tab</span>
    <span class="token punctuation">&#125;</span><span class="token punctuation">,</span>
  <span class="token punctuation">]</span><span class="token punctuation">,</span>
<span class="token punctuation">&#125;</span>

<span class="token keyword">export</span> <span class="token keyword">const</span> profileConfig<span class="token operator">:</span> ProfileConfig <span class="token operator">=</span> <span class="token punctuation">&#123;</span>
  avatar<span class="token operator">:</span> <span class="token string">'https://eo-r2.2x.nz/myblog/img/111.webp'</span><span class="token punctuation">,</span>  <span class="token comment">// Relative to the /src directory. Relative to the /public directory if it starts with '/'</span>
  name<span class="token operator">:</span> <span class="token string">'二叉树树'</span><span class="token punctuation">,</span>
  bio<span class="token operator">:</span> <span class="token string">'Protect What You Love./爱你所爱！'</span><span class="token punctuation">,</span>
  links<span class="token operator">:</span> <span class="token punctuation">[</span>
    <span class="token comment">// &#123;</span>
      <span class="token comment">// name: 'Twitter',</span>
      <span class="token comment">// icon: 'fa6-brands:twitter',       // Visit https://icones.js.org/ for icon codes</span>
                                        <span class="token comment">// You will need to install the corresponding icon set if it's not already included</span>
                                        <span class="token comment">// &#96;pnpm add @iconify-json/&lt;icon-set-name>&#96;</span>
      <span class="token comment">// url: 'https://twitter.com',</span>
    <span class="token comment">// &#125;,</span>
    <span class="token comment">// &#123;</span>
      <span class="token comment">// name: 'Steam',</span>
      <span class="token comment">// icon: 'fa6-brands:steam',</span>
      <span class="token comment">// url: 'https://store.steampowered.com',</span>
    <span class="token comment">// &#125;,</span>
    <span class="token punctuation">&#123;</span>
      name<span class="token operator">:</span> <span class="token string">'GitHub'</span><span class="token punctuation">,</span>
      icon<span class="token operator">:</span> <span class="token string">'fa6-brands:github'</span><span class="token punctuation">,</span>
      url<span class="token operator">:</span> <span class="token string">'https://github.com/afoim'</span><span class="token punctuation">,</span>
    <span class="token punctuation">&#125;</span><span class="token punctuation">,</span>
    <span class="token punctuation">&#123;</span>
      name<span class="token operator">:</span> <span class="token string">'QQ'</span><span class="token punctuation">,</span>
      icon<span class="token operator">:</span> <span class="token string">'fa6-brands:qq'</span><span class="token punctuation">,</span>
      url<span class="token operator">:</span> <span class="token string">'https://qm.qq.com/q/Uy9kmDXHYO'</span><span class="token punctuation">,</span>
    <span class="token punctuation">&#125;</span><span class="token punctuation">,</span>
    <span class="token punctuation">&#123;</span>
      name<span class="token operator">:</span> <span class="token string">'Email'</span><span class="token punctuation">,</span>
      icon<span class="token operator">:</span> <span class="token string">'fa6-solid:envelope'</span><span class="token punctuation">,</span>
      url<span class="token operator">:</span> <span class="token string">'mailto:email@example.com'</span><span class="token punctuation">,</span>
    <span class="token punctuation">&#125;</span><span class="token punctuation">,</span>
  <span class="token punctuation">]</span><span class="token punctuation">,</span>
<span class="token punctuation">&#125;</span>

<span class="token keyword">export</span> <span class="token keyword">const</span> licenseConfig<span class="token operator">:</span> LicenseConfig <span class="token operator">=</span> <span class="token punctuation">&#123;</span>
  enable<span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
  name<span class="token operator">:</span> <span class="token string">'CC BY-NC-SA 4.0'</span><span class="token punctuation">,</span>
  url<span class="token operator">:</span> <span class="token string">'https://creativecommons.org/licenses/by-nc-sa/4.0/'</span><span class="token punctuation">,</span>
<span class="token punctuation">&#125;</span></code>`,!0),i(d),i(u),i(l);var f=c(l,8),p=c(a(f),6),m=a(p);t(m,()=>`<code class="language-markdown">title: xxx
published: 2024-10-14
description: ''
image: ''
tags: []
categories: ''
draft: false 
lang: ''</code>`,!0),i(m),o(2),i(p),o(6),i(f),o(16),n(e,r)}export{l as t};