import{n as e}from"./pn1seLaS.js";import{D as t,F as n,L as r,Mt as i,jt as a,ot as o,st as s}from"./R8CaXVlq.js";import"./ZsEnWiqm.js";var c=e({default:()=>y,metadata:()=>l}),l={category:`教程`,description:`搭建Github全站代理的完整指南，涵盖原理讲解与多种部署方案（Cloudflare Worker、EdgeOne Pages、Vercel、VPS+Go）`,draft:!1,image:`img/8bb2d8ae-1703-44e8-9f3b-10b46ab69913.avif`,lang:``,published:`2025-04-14T16:00:00.000Z`,tags:[`Github`,`反向代理`,`Cloudflare Worker`,`EdgeOne`,`Vercel`],title:`Github全站反向代理搭建指南`},{category:u,description:d,draft:f,image:p,lang:m,published:h,tags:g,title:_}=l,v=r(`<h1>引言</h1> <p>由于网络原因，国内访问Github经常遇到各种问题。本文将带你从原理到实践，搭建一个属于自己的Github全站反向代理。</p> <h1>为什么不能只用透明代理？</h1> <p>针对Github这样的网站，我们无法仅使用一个简单的透明反向代理指向 <code>github.com</code> 来解决，原因有两点：</p> <h2>1. 外域依赖问题</h2> <p>Github官网有许多外域依赖，比如 <code>raw.githubusercontent.com</code>、<code>avatars.githubusercontent.com</code> 等。如果只代理主域名，这些资源请求会直接访问原站，导致加载失败。</p> <h2>2. 钓鱼风险</h2> <p>注意！直接反代主流网站后，不久你的网站就会被Cloudflare标记为<strong>钓鱼站点</strong>，因为你原封不动的克隆了人家站点并且 <strong>没有显式屏蔽登录页面</strong>。</p> <h1>解决方案：透明代理 + HTML覆写</h1> <h2>核心思路</h2> <p>我们需要实现两个关键功能：</p> <ol><li><strong>透明代理</strong>：将请求转发到Github服务器</li> <li><strong>HTML覆写</strong>：重写Github返回的HTML，将其中的外域改为我们自己的域</li></ol> <h2>请求流程对比</h2> <p><strong>原始流程：</strong></p> <pre class="language-undefined"></pre> <p><strong>代理流程：</strong></p> <pre class="language-undefined"></pre> <p>对于 <code>gh.072103.xyz</code> 的请求由代理服务转发到 <code>github.com</code>，而针对于 <code>raw-githubusercontent-com.072103.xyz</code> 的请求则转发到 <code>raw.githubusercontent.com</code>。</p> <h2>域名映射配置</h2> <p>你需要配置类似这样的域名映射：</p> <pre class="language-js"></pre> <p>假如你的域名为 <code>abc.com</code>，你需要将以下子域名绑定到你的代理服务：</p> <ul><li><code>gh.abc.com</code></li> <li><code>avatars-githubusercontent-com.abc.com</code></li> <li><code>raw-githubusercontent-com.abc.com</code></li> <li>…等等</li></ul> <h2>防钓鱼措施</h2> <p>我们需要找到原站点的所有登录页逐一屏蔽，对于Github.com，我们需要屏蔽：</p> <p><code>/</code> <code>/login</code> <code>/signup</code> <code>copilot</code></p> <p>你可以将其直接导向404，或者重定向到另外的网站，<strong>只要不让你的用户能在你的反代网站上登录就可以</strong>。</p> <hr/> <h1>部署方案</h1> <p>下面介绍四种部署方案，按照部署难度从简单到复杂排序：</p> <h2>方案一：Vercel Function（最简单）</h2> <blockquote><p>嫌弃CF Worker不够快？那就试试Vercel Function！</p></blockquote> <h3>优点</h3> <ul><li>部署最简单，一键完成</li> <li>速度快</li> <li>与GitHub集成良好</li></ul> <h3>部署步骤</h3> <ol><li><p>克隆 <a href="https://github.com/afoim/VercelFunctionGithubProxy" rel="nofollow">afoim/VercelFunctionGithubProxy</a></p></li> <li><p>部署到Vercel</p></li></ol> <p><img src="img/2025-08-30-22-14-07-aa3b925d5e2e522cc0a0abccd87b5887.avif"/></p> <ol start="3"><li>绑定你自己的域名</li></ol> <p><img src="img/2025-08-30-22-14-10-b79c2d588117ab15fc4a08efe359db4f.avif"/></p> <ol start="4"><li>根据你的域名修改域名映射配置，绑定所有子域名即可使用</li></ol> <hr/> <h2>方案二：Cloudflare Worker（推荐）</h2> <blockquote><p>教程视频：<a href="https://www.bilibili.com/video/BV1jGd6YpE8z" rel="nofollow">https://www.bilibili.com/video/BV1jGd6YpE8z</a></p></blockquote> <h3>优点</h3> <ul><li>免费</li> <li>无需服务器</li> <li>全球CDN加速</li> <li>部署简单</li></ul> <h3>部署步骤</h3> <ol><li><p>进入 <a href="https://dash.cloudflare.com" rel="nofollow">dash.cloudflare.com</a></p></li> <li><p>创建新Worker，选择Hello World模板</p></li> <li><p>前往 <a href="https://github.com/afoim/GithubSiteProxyForCloudflareWorker" rel="nofollow">GitHub - afoim/GithubSiteProxyForCloudflareWorker</a> 复制 <code>worker.js</code> 代码粘贴到你的Worker</p></li> <li><p>根据你的域名修改域名映射配置</p></li> <li><p>将所有需要的子域名绑定到你的Worker</p></li> <li><p>访问 <code>gh.你的域名</code> 即可使用</p></li></ol> <h3>完整代码</h3> <p>参见Github仓库：<a href="https://github.com/afoim/GithubSiteProxyForCloudflareWorker" rel="nofollow">https://github.com/afoim/GithubSiteProxyForCloudflareWorker</a></p> <hr/> <h2>方案三：EdgeOne Pages</h2> <blockquote><p>适合国内用户，访问速度更快</p></blockquote> <h3>优点</h3> <ul><li>国内访问速度优秀</li> <li>免费额度充足</li> <li>部署相对简单</li></ul> <h3>部署步骤</h3> <h4>1. 下载源码</h4> <blockquote><p>源码：<a href="https://github.com/afoim/EdgeOnePagesFunctionGithubProxy" rel="nofollow">afoim/EdgeOnePagesFunctionGithubProxy</a></p></blockquote> <p>下载 <a href="https://r2.072103.xyz/github-eopf.zip" rel="nofollow">https://r2.072103.xyz/github-eopf.zip</a> 并解压</p> <p>目录结构：</p> <p><img src="img/2025-08-30-20-43-29-image.avif"/></p> <h4>2. 修改域名配置</h4> <p>打开任意一个JS文件，更改域名映射配置。注意：每个JS文件的内容都需要修改！</p> <h4>3. 上传到EdgeOne Pages</h4> <p><img src="img/2025-08-30-20-45-20-image.avif"/></p> <h4>4. 绑定域名</h4> <p>按照前缀绑定所有需要的子域名：</p> <p><img src="img/2025-08-30-20-46-18-image.avif"/></p> <h3>为什么目录结构这么特殊？</h3> <ul><li><strong><code>index.html</code></strong>：空的HTML文件，因为不放就404</li> <li><strong><code>index.js</code></strong>：负责 <code>/</code> 路由</li> <li><strong><code>[[default.js]]</code></strong>：负责 <code>/*</code> 路由</li></ul> <hr/> <h2>方案四：VPS + Go（最灵活）</h2> <blockquote><p>适合有VPS且希望完全掌控的用户，部署相对复杂</p></blockquote> <h3>优点</h3> <ul><li>完全自主可控</li> <li>不依赖第三方平台</li> <li>可以自定义更多功能</li></ul> <h3>部署步骤</h3> <h4>1. 安装Golang运行时</h4> <pre class="language-bash"></pre> <h4>2. 创建项目目录</h4> <p>创建一个文件夹，放置 <code>main.go</code>：</p> <pre class="language-go"></pre> <h4>3. 创建 go.mod</h4> <pre class="language-go"></pre> <h4>4. 运行服务</h4> <pre class="language-bash"></pre> <p>输出以下日志即成功：</p> <pre class="language-bash"></pre> <h4>5. 配置Nginx反向代理</h4> <p>使用Nginx或OpenResty反向代理 <code>localhost:8080</code>，配置域名格式为 <code>gh.你的域名</code>：</p> <p><img src="img/123a521d-2340-4433-b9fe-4965d46d4321.avif"/></p> <h4>6. 签发SSL证书</h4> <p>签发泛域名证书并部署：</p> <p><img src="img/b58b55fe-adbd-4d3e-8977-c3f7efaf0185.avif"/></p> <h4>7. 完成</h4> <p>现在你可以通过自己的域名+VPS代理访问Github，国内直连，无需梯子：</p> <p><img src="img/fccbc8af-d2b1-479f-b32d-d0f023fd4c06.avif"/></p> <hr/> <h1>方案对比</h1> <table><thead><tr><th>方案</th><th>成本</th><th>国内速度</th><th>部署难度</th><th>可定制性</th></tr></thead><tbody><tr><td>Vercel Function</td><td>免费</td><td>一般</td><td>最简单</td><td>中等</td></tr><tr><td>Cloudflare Worker</td><td>免费</td><td>一般</td><td>简单</td><td>中等</td></tr><tr><td>EdgeOne Pages</td><td>免费</td><td>优秀</td><td>简单</td><td>中等</td></tr><tr><td>VPS + Go</td><td>VPS费用</td><td>取决于VPS位置</td><td>复杂</td><td>高</td></tr></tbody></table> <h1>高级配置</h1> <p>如果你想修改三级域名，比如将 <code>gh.abc.com</code> 改为 <code>github.abc.com</code>，直接更改域名映射配置对应键的值即可。</p> <p>你可以添加和删除要重定向的路径，默认重定向到一个神秘网站，根据注释自行更改。</p> <p>本项目也是一个通用的全站反代模板，可以反代其他网站（注意需要大改代码）。</p>`,1);function y(e){var r=v(),c=s(o(r),28);t(c,()=>`<code class="language-undefined">用户 -&gt; github.com -&gt; raw.githubusercontent.com（被github.com请求）</code>`,!0),i(c);var l=s(c,4);t(l,()=>`<code class="language-undefined">用户 -&gt; gh.072103.xyz -&gt; raw-githubusercontent-com.072103.xyz（被gh.072103.xyz请求）</code>`,!0),i(l);var u=s(l,8);t(u,()=>`<code class="language-js"><span class="token keyword">const</span> domain_mappings <span class="token operator">=</span> <span class="token punctuation">&#123;</span>
  <span class="token string-property property">'github.com'</span><span class="token operator">:</span> <span class="token string">'gh.'</span><span class="token punctuation">,</span>
  <span class="token string-property property">'avatars.githubusercontent.com'</span><span class="token operator">:</span> <span class="token string">'avatars-githubusercontent-com.'</span><span class="token punctuation">,</span>
  <span class="token string-property property">'github.githubassets.com'</span><span class="token operator">:</span> <span class="token string">'github-githubassets-com.'</span><span class="token punctuation">,</span>
  <span class="token string-property property">'collector.github.com'</span><span class="token operator">:</span> <span class="token string">'collector-github-com.'</span><span class="token punctuation">,</span>
  <span class="token string-property property">'api.github.com'</span><span class="token operator">:</span> <span class="token string">'api-github-com.'</span><span class="token punctuation">,</span>
  <span class="token string-property property">'raw.githubusercontent.com'</span><span class="token operator">:</span> <span class="token string">'raw-githubusercontent-com.'</span><span class="token punctuation">,</span>
  <span class="token string-property property">'gist.githubusercontent.com'</span><span class="token operator">:</span> <span class="token string">'gist-githubusercontent-com.'</span><span class="token punctuation">,</span>
  <span class="token string-property property">'github.io'</span><span class="token operator">:</span> <span class="token string">'github-io.'</span><span class="token punctuation">,</span>
  <span class="token string-property property">'assets-cdn.github.com'</span><span class="token operator">:</span> <span class="token string">'assets-cdn-github-com.'</span><span class="token punctuation">,</span>
  <span class="token string-property property">'cdn.jsdelivr.net'</span><span class="token operator">:</span> <span class="token string">'cdn.jsdelivr-net.'</span><span class="token punctuation">,</span>
  <span class="token string-property property">'securitylab.github.com'</span><span class="token operator">:</span> <span class="token string">'securitylab-github-com.'</span><span class="token punctuation">,</span>
  <span class="token string-property property">'www.githubstatus.com'</span><span class="token operator">:</span> <span class="token string">'www-githubstatus-com.'</span><span class="token punctuation">,</span>
  <span class="token string-property property">'npmjs.com'</span><span class="token operator">:</span> <span class="token string">'npmjs-com.'</span><span class="token punctuation">,</span>
  <span class="token string-property property">'git-lfs.github.com'</span><span class="token operator">:</span> <span class="token string">'git-lfs-github-com.'</span><span class="token punctuation">,</span>
  <span class="token string-property property">'githubusercontent.com'</span><span class="token operator">:</span> <span class="token string">'githubusercontent-com.'</span><span class="token punctuation">,</span>
  <span class="token string-property property">'github.global.ssl.fastly.net'</span><span class="token operator">:</span> <span class="token string">'github-global-ssl-fastly-net.'</span><span class="token punctuation">,</span>
  <span class="token string-property property">'api.npms.io'</span><span class="token operator">:</span> <span class="token string">'api-npms-io.'</span><span class="token punctuation">,</span>
  <span class="token string-property property">'github.community'</span><span class="token operator">:</span> <span class="token string">'github-community.'</span>
<span class="token punctuation">&#125;</span><span class="token punctuation">;</span></code>`,!0),i(u);var d=s(u,112);t(d,()=>`<code class="language-bash"><span class="token function">apt</span> <span class="token function">install</span> golang</code>`,!0),i(d);var f=s(d,6);t(f,()=>`<code class="language-go"><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token punctuation">(</span>
	<span class="token string">"fmt"</span>
	<span class="token string">"io"</span>
	<span class="token string">"log"</span>
	<span class="token string">"net/http"</span>
	<span class="token string">"net/url"</span>
	<span class="token string">"regexp"</span>
	<span class="token string">"strings"</span>
	<span class="token string">"time"</span>
<span class="token punctuation">)</span>

<span class="token comment">// 域名映射配置</span>
<span class="token keyword">var</span> domainMappings <span class="token operator">=</span> <span class="token keyword">map</span><span class="token punctuation">[</span><span class="token builtin">string</span><span class="token punctuation">]</span><span class="token builtin">string</span><span class="token punctuation">&#123;</span>
	<span class="token string">"github.com"</span><span class="token punctuation">:</span>                    <span class="token string">"gh."</span><span class="token punctuation">,</span>
	<span class="token string">"avatars.githubusercontent.com"</span><span class="token punctuation">:</span> <span class="token string">"avatars-githubusercontent-com."</span><span class="token punctuation">,</span>
	<span class="token string">"github.githubassets.com"</span><span class="token punctuation">:</span>       <span class="token string">"github-githubassets-com."</span><span class="token punctuation">,</span>
	<span class="token string">"collector.github.com"</span><span class="token punctuation">:</span>          <span class="token string">"collector-github-com."</span><span class="token punctuation">,</span>
	<span class="token string">"api.github.com"</span><span class="token punctuation">:</span>                <span class="token string">"api-github-com."</span><span class="token punctuation">,</span>
	<span class="token string">"raw.githubusercontent.com"</span><span class="token punctuation">:</span>     <span class="token string">"raw-githubusercontent-com."</span><span class="token punctuation">,</span>
	<span class="token string">"gist.githubusercontent.com"</span><span class="token punctuation">:</span>    <span class="token string">"gist-githubusercontent-com."</span><span class="token punctuation">,</span>
	<span class="token string">"github.io"</span><span class="token punctuation">:</span>                     <span class="token string">"github-io."</span><span class="token punctuation">,</span>
	<span class="token string">"assets-cdn.github.com"</span><span class="token punctuation">:</span>         <span class="token string">"assets-cdn-github-com."</span><span class="token punctuation">,</span>
	<span class="token string">"cdn.jsdelivr.net"</span><span class="token punctuation">:</span>              <span class="token string">"cdn.jsdelivr-net."</span><span class="token punctuation">,</span>
	<span class="token string">"securitylab.github.com"</span><span class="token punctuation">:</span>        <span class="token string">"securitylab-github-com."</span><span class="token punctuation">,</span>
	<span class="token string">"www.githubstatus.com"</span><span class="token punctuation">:</span>          <span class="token string">"www-githubstatus-com."</span><span class="token punctuation">,</span>
	<span class="token string">"npmjs.com"</span><span class="token punctuation">:</span>                     <span class="token string">"npmjs-com."</span><span class="token punctuation">,</span>
	<span class="token string">"git-lfs.github.com"</span><span class="token punctuation">:</span>            <span class="token string">"git-lfs-github-com."</span><span class="token punctuation">,</span>
	<span class="token string">"githubusercontent.com"</span><span class="token punctuation">:</span>         <span class="token string">"githubusercontent-com."</span><span class="token punctuation">,</span>
	<span class="token string">"github.global.ssl.fastly.net"</span><span class="token punctuation">:</span>  <span class="token string">"github-global-ssl-fastly-net."</span><span class="token punctuation">,</span>
	<span class="token string">"api.npms.io"</span><span class="token punctuation">:</span>                   <span class="token string">"api-npms-io."</span><span class="token punctuation">,</span>
	<span class="token string">"github.community"</span><span class="token punctuation">:</span>              <span class="token string">"github-community."</span><span class="token punctuation">,</span>
<span class="token punctuation">&#125;</span>

<span class="token comment">// 需要重定向的路径</span>
<span class="token keyword">var</span> redirectPaths <span class="token operator">=</span> <span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token builtin">string</span><span class="token punctuation">&#123;</span><span class="token string">"/"</span><span class="token punctuation">,</span> <span class="token string">"/login"</span><span class="token punctuation">,</span> <span class="token string">"/signup"</span><span class="token punctuation">,</span> <span class="token string">"/copilot"</span><span class="token punctuation">&#125;</span>

<span class="token comment">// 检查路径是否需要重定向</span>
<span class="token keyword">func</span> <span class="token function">shouldRedirect</span><span class="token punctuation">(</span>path <span class="token builtin">string</span><span class="token punctuation">)</span> <span class="token builtin">bool</span> <span class="token punctuation">&#123;</span>
	<span class="token keyword">for</span> <span class="token boolean">_</span><span class="token punctuation">,</span> p <span class="token operator">:=</span> <span class="token keyword">range</span> redirectPaths <span class="token punctuation">&#123;</span>
		<span class="token keyword">if</span> path <span class="token operator">==</span> p <span class="token punctuation">&#123;</span>
			<span class="token keyword">return</span> <span class="token boolean">true</span>
		<span class="token punctuation">&#125;</span>
	<span class="token punctuation">&#125;</span>
	<span class="token keyword">return</span> <span class="token boolean">false</span>
<span class="token punctuation">&#125;</span>

<span class="token comment">// 获取代理前缀</span>
<span class="token keyword">func</span> <span class="token function">getProxyPrefix</span><span class="token punctuation">(</span>host <span class="token builtin">string</span><span class="token punctuation">)</span> <span class="token builtin">string</span> <span class="token punctuation">&#123;</span>
	<span class="token keyword">if</span> strings<span class="token punctuation">.</span><span class="token function">HasPrefix</span><span class="token punctuation">(</span>host<span class="token punctuation">,</span> <span class="token string">"gh."</span><span class="token punctuation">)</span> <span class="token punctuation">&#123;</span>
		<span class="token keyword">return</span> <span class="token string">"gh."</span>
	<span class="token punctuation">&#125;</span>

	<span class="token keyword">for</span> <span class="token boolean">_</span><span class="token punctuation">,</span> prefix <span class="token operator">:=</span> <span class="token keyword">range</span> domainMappings <span class="token punctuation">&#123;</span>
		<span class="token keyword">if</span> strings<span class="token punctuation">.</span><span class="token function">HasPrefix</span><span class="token punctuation">(</span>host<span class="token punctuation">,</span> prefix<span class="token punctuation">)</span> <span class="token punctuation">&#123;</span>
			<span class="token keyword">return</span> prefix
		<span class="token punctuation">&#125;</span>
	<span class="token punctuation">&#125;</span>

	<span class="token keyword">return</span> <span class="token string">""</span>
<span class="token punctuation">&#125;</span>

<span class="token comment">// 根据前缀获取目标域名</span>
<span class="token keyword">func</span> <span class="token function">getTargetHost</span><span class="token punctuation">(</span>prefix <span class="token builtin">string</span><span class="token punctuation">)</span> <span class="token builtin">string</span> <span class="token punctuation">&#123;</span>
	<span class="token keyword">for</span> original<span class="token punctuation">,</span> p <span class="token operator">:=</span> <span class="token keyword">range</span> domainMappings <span class="token punctuation">&#123;</span>
		<span class="token keyword">if</span> p <span class="token operator">==</span> prefix <span class="token punctuation">&#123;</span>
			<span class="token keyword">return</span> original
		<span class="token punctuation">&#125;</span>
	<span class="token punctuation">&#125;</span>
	<span class="token keyword">return</span> <span class="token string">""</span>
<span class="token punctuation">&#125;</span>

<span class="token comment">// 处理响应内容，替换域名引用</span>
<span class="token keyword">func</span> <span class="token function">modifyResponse</span><span class="token punctuation">(</span>body <span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token builtin">byte</span><span class="token punctuation">,</span> contentType<span class="token punctuation">,</span> hostPrefix<span class="token punctuation">,</span> currentHostname <span class="token builtin">string</span><span class="token punctuation">)</span> <span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token builtin">byte</span> <span class="token punctuation">&#123;</span>
	<span class="token keyword">if</span> <span class="token operator">!</span>strings<span class="token punctuation">.</span><span class="token function">Contains</span><span class="token punctuation">(</span>contentType<span class="token punctuation">,</span> <span class="token string">"text/"</span><span class="token punctuation">)</span> <span class="token operator">&amp;&amp;</span>
		<span class="token operator">!</span>strings<span class="token punctuation">.</span><span class="token function">Contains</span><span class="token punctuation">(</span>contentType<span class="token punctuation">,</span> <span class="token string">"application/json"</span><span class="token punctuation">)</span> <span class="token operator">&amp;&amp;</span>
		<span class="token operator">!</span>strings<span class="token punctuation">.</span><span class="token function">Contains</span><span class="token punctuation">(</span>contentType<span class="token punctuation">,</span> <span class="token string">"application/javascript"</span><span class="token punctuation">)</span> <span class="token operator">&amp;&amp;</span>
		<span class="token operator">!</span>strings<span class="token punctuation">.</span><span class="token function">Contains</span><span class="token punctuation">(</span>contentType<span class="token punctuation">,</span> <span class="token string">"application/xml"</span><span class="token punctuation">)</span> <span class="token punctuation">&#123;</span>
		<span class="token keyword">return</span> body
	<span class="token punctuation">&#125;</span>

	text <span class="token operator">:=</span> <span class="token function">string</span><span class="token punctuation">(</span>body<span class="token punctuation">)</span>
	domainSuffix <span class="token operator">:=</span> currentHostname<span class="token punctuation">[</span><span class="token function">len</span><span class="token punctuation">(</span>hostPrefix<span class="token punctuation">)</span><span class="token punctuation">:</span><span class="token punctuation">]</span>

	<span class="token keyword">for</span> originalDomain<span class="token punctuation">,</span> proxyPrefix <span class="token operator">:=</span> <span class="token keyword">range</span> domainMappings <span class="token punctuation">&#123;</span>
		fullProxyDomain <span class="token operator">:=</span> proxyPrefix <span class="token operator">+</span> domainSuffix
		text <span class="token operator">=</span> strings<span class="token punctuation">.</span><span class="token function">ReplaceAll</span><span class="token punctuation">(</span>text<span class="token punctuation">,</span> <span class="token string">"https://"</span><span class="token operator">+</span>originalDomain<span class="token punctuation">,</span> <span class="token string">"https://"</span><span class="token operator">+</span>fullProxyDomain<span class="token punctuation">)</span>
		text <span class="token operator">=</span> strings<span class="token punctuation">.</span><span class="token function">ReplaceAll</span><span class="token punctuation">(</span>text<span class="token punctuation">,</span> <span class="token string">"http://"</span><span class="token operator">+</span>originalDomain<span class="token punctuation">,</span> <span class="token string">"https://"</span><span class="token operator">+</span>fullProxyDomain<span class="token punctuation">)</span>
		text <span class="token operator">=</span> strings<span class="token punctuation">.</span><span class="token function">ReplaceAll</span><span class="token punctuation">(</span>text<span class="token punctuation">,</span> <span class="token string">"//"</span><span class="token operator">+</span>originalDomain<span class="token punctuation">,</span> <span class="token string">"//"</span><span class="token operator">+</span>fullProxyDomain<span class="token punctuation">)</span>
		text <span class="token operator">=</span> strings<span class="token punctuation">.</span><span class="token function">ReplaceAll</span><span class="token punctuation">(</span>text<span class="token punctuation">,</span> &#96;<span class="token string">"&#96;+originalDomain+&#96;"</span><span class="token string">&#96;, &#96;</span>"<span class="token string">&#96;+fullProxyDomain+&#96;</span>"<span class="token string">&#96;)
		text = strings.ReplaceAll(text, &#96;</span>'<span class="token string">&#96;+originalDomain+&#96;</span><span class="token char">'&#96;, &#96;'</span><span class="token string">&#96;+fullProxyDomain+&#96;</span>'<span class="token string">&#96;)
	&#125;

	if hostPrefix == "gh." &#123;
		text = strings.ReplaceAll(text, &#96;</span>"<span class="token operator">/</span><span class="token string">&#96;, &#96;</span>"https<span class="token punctuation">:</span><span class="token operator">/</span><span class="token operator">/</span><span class="token string">&#96;+currentHostname+&#96;</span><span class="token operator">/</span><span class="token string">&#96;)
		text = strings.ReplaceAll(text, &#96;</span><span class="token char">'/&#96;, &#96;'</span>https<span class="token punctuation">:</span><span class="token operator">/</span><span class="token operator">/</span><span class="token string">&#96;+currentHostname+&#96;</span><span class="token operator">/</span><span class="token string">&#96;)
	&#125;

	return []byte(text)
&#125;

// 处理请求
func handleRequest(w http.ResponseWriter, r *http.Request) &#123;
	currentHost := r.Host

	if shouldRedirect(r.URL.Path) &#123;
		http.Redirect(w, r, "https://www.gov.cn", http.StatusFound)
		return
	&#125;

	hostPrefix := getProxyPrefix(currentHost)
	if hostPrefix == "" &#123;
		http.Error(w, "Domain not configured for proxy", http.StatusNotFound)
		return
	&#125;

	targetHost := getTargetHost(hostPrefix)
	if targetHost == "" &#123;
		http.Error(w, "Domain not configured for proxy", http.StatusNotFound)
		return
	&#125;

	pathname := r.URL.Path

	re1 := regexp.MustCompile(&#96;</span><span class="token punctuation">(</span><span class="token operator">/</span><span class="token punctuation">[</span><span class="token operator">^</span><span class="token operator">/</span><span class="token punctuation">]</span><span class="token operator">+</span><span class="token operator">/</span><span class="token punctuation">[</span><span class="token operator">^</span><span class="token operator">/</span><span class="token punctuation">]</span><span class="token operator">+</span><span class="token operator">/</span><span class="token punctuation">(</span>?<span class="token punctuation">:</span>latest<span class="token operator">-</span>commit<span class="token operator">|</span>tree<span class="token operator">-</span>commit<span class="token operator">-</span>info<span class="token punctuation">)</span><span class="token operator">/</span><span class="token punctuation">[</span><span class="token operator">^</span><span class="token operator">/</span><span class="token punctuation">]</span><span class="token operator">+</span><span class="token punctuation">)</span><span class="token operator">/</span>https<span class="token operator">%</span>3A<span class="token comment">//[^/]+.*&#96;)</span>
	pathname <span class="token operator">=</span> re1<span class="token punctuation">.</span><span class="token function">ReplaceAllString</span><span class="token punctuation">(</span>pathname<span class="token punctuation">,</span> <span class="token string">"$1"</span><span class="token punctuation">)</span>

	re2 <span class="token operator">:=</span> regexp<span class="token punctuation">.</span><span class="token function">MustCompile</span><span class="token punctuation">(</span><span class="token string">&#96;(/[^/]+/[^/]+/(?:latest-commit|tree-commit-info)/[^/]+)/https://[^/]+.*&#96;</span><span class="token punctuation">)</span>
	pathname <span class="token operator">=</span> re2<span class="token punctuation">.</span><span class="token function">ReplaceAllString</span><span class="token punctuation">(</span>pathname<span class="token punctuation">,</span> <span class="token string">"$1"</span><span class="token punctuation">)</span>

	re3 <span class="token operator">:=</span> regexp<span class="token punctuation">.</span><span class="token function">MustCompile</span><span class="token punctuation">(</span><span class="token string">&#96;(/[^/]+/[^/]+/(?:latest-commit|tree-commit-info)/[^/]+)/https:/[^/]+.*&#96;</span><span class="token punctuation">)</span>
	pathname <span class="token operator">=</span> re3<span class="token punctuation">.</span><span class="token function">ReplaceAllString</span><span class="token punctuation">(</span>pathname<span class="token punctuation">,</span> <span class="token string">"$1"</span><span class="token punctuation">)</span>

	targetURL <span class="token operator">:=</span> <span class="token operator">&amp;</span>url<span class="token punctuation">.</span>URL<span class="token punctuation">&#123;</span>
		Scheme<span class="token punctuation">:</span>   <span class="token string">"https"</span><span class="token punctuation">,</span>
		Host<span class="token punctuation">:</span>     targetHost<span class="token punctuation">,</span>
		Path<span class="token punctuation">:</span>     pathname<span class="token punctuation">,</span>
		RawQuery<span class="token punctuation">:</span> r<span class="token punctuation">.</span>URL<span class="token punctuation">.</span>RawQuery<span class="token punctuation">,</span>
	<span class="token punctuation">&#125;</span>

	req<span class="token punctuation">,</span> err <span class="token operator">:=</span> http<span class="token punctuation">.</span><span class="token function">NewRequest</span><span class="token punctuation">(</span>r<span class="token punctuation">.</span>Method<span class="token punctuation">,</span> targetURL<span class="token punctuation">.</span><span class="token function">String</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span> r<span class="token punctuation">.</span>Body<span class="token punctuation">)</span>
	<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">&#123;</span>
		http<span class="token punctuation">.</span><span class="token function">Error</span><span class="token punctuation">(</span>w<span class="token punctuation">,</span> fmt<span class="token punctuation">.</span><span class="token function">Sprintf</span><span class="token punctuation">(</span><span class="token string">"Failed to create request: %v"</span><span class="token punctuation">,</span> err<span class="token punctuation">)</span><span class="token punctuation">,</span> http<span class="token punctuation">.</span>StatusInternalServerError<span class="token punctuation">)</span>
		<span class="token keyword">return</span>
	<span class="token punctuation">&#125;</span>

	<span class="token keyword">for</span> key<span class="token punctuation">,</span> values <span class="token operator">:=</span> <span class="token keyword">range</span> r<span class="token punctuation">.</span>Header <span class="token punctuation">&#123;</span>
		<span class="token keyword">for</span> <span class="token boolean">_</span><span class="token punctuation">,</span> value <span class="token operator">:=</span> <span class="token keyword">range</span> values <span class="token punctuation">&#123;</span>
			req<span class="token punctuation">.</span>Header<span class="token punctuation">.</span><span class="token function">Add</span><span class="token punctuation">(</span>key<span class="token punctuation">,</span> value<span class="token punctuation">)</span>
		<span class="token punctuation">&#125;</span>
	<span class="token punctuation">&#125;</span>

	req<span class="token punctuation">.</span>Header<span class="token punctuation">.</span><span class="token function">Set</span><span class="token punctuation">(</span><span class="token string">"Host"</span><span class="token punctuation">,</span> targetHost<span class="token punctuation">)</span>
	req<span class="token punctuation">.</span>Header<span class="token punctuation">.</span><span class="token function">Set</span><span class="token punctuation">(</span><span class="token string">"Referer"</span><span class="token punctuation">,</span> targetURL<span class="token punctuation">.</span><span class="token function">String</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
	req<span class="token punctuation">.</span>Header<span class="token punctuation">.</span><span class="token function">Set</span><span class="token punctuation">(</span><span class="token string">"Accept-Encoding"</span><span class="token punctuation">,</span> <span class="token string">"identity"</span><span class="token punctuation">)</span>

	client <span class="token operator">:=</span> <span class="token operator">&amp;</span>http<span class="token punctuation">.</span>Client<span class="token punctuation">&#123;</span>
		Timeout<span class="token punctuation">:</span> <span class="token number">30</span> <span class="token operator">*</span> time<span class="token punctuation">.</span>Second<span class="token punctuation">,</span>
	<span class="token punctuation">&#125;</span>

	resp<span class="token punctuation">,</span> err <span class="token operator">:=</span> client<span class="token punctuation">.</span><span class="token function">Do</span><span class="token punctuation">(</span>req<span class="token punctuation">)</span>
	<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">&#123;</span>
		http<span class="token punctuation">.</span><span class="token function">Error</span><span class="token punctuation">(</span>w<span class="token punctuation">,</span> fmt<span class="token punctuation">.</span><span class="token function">Sprintf</span><span class="token punctuation">(</span><span class="token string">"Proxy Error: %v"</span><span class="token punctuation">,</span> err<span class="token punctuation">)</span><span class="token punctuation">,</span> http<span class="token punctuation">.</span>StatusBadGateway<span class="token punctuation">)</span>
		<span class="token keyword">return</span>
	<span class="token punctuation">&#125;</span>
	<span class="token keyword">defer</span> resp<span class="token punctuation">.</span>Body<span class="token punctuation">.</span><span class="token function">Close</span><span class="token punctuation">(</span><span class="token punctuation">)</span>

	body<span class="token punctuation">,</span> err <span class="token operator">:=</span> io<span class="token punctuation">.</span><span class="token function">ReadAll</span><span class="token punctuation">(</span>resp<span class="token punctuation">.</span>Body<span class="token punctuation">)</span>
	<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">&#123;</span>
		http<span class="token punctuation">.</span><span class="token function">Error</span><span class="token punctuation">(</span>w<span class="token punctuation">,</span> fmt<span class="token punctuation">.</span><span class="token function">Sprintf</span><span class="token punctuation">(</span><span class="token string">"Failed to read response: %v"</span><span class="token punctuation">,</span> err<span class="token punctuation">)</span><span class="token punctuation">,</span> http<span class="token punctuation">.</span>StatusInternalServerError<span class="token punctuation">)</span>
		<span class="token keyword">return</span>
	<span class="token punctuation">&#125;</span>

	contentType <span class="token operator">:=</span> resp<span class="token punctuation">.</span>Header<span class="token punctuation">.</span><span class="token function">Get</span><span class="token punctuation">(</span><span class="token string">"Content-Type"</span><span class="token punctuation">)</span>
	modifiedBody <span class="token operator">:=</span> <span class="token function">modifyResponse</span><span class="token punctuation">(</span>body<span class="token punctuation">,</span> contentType<span class="token punctuation">,</span> hostPrefix<span class="token punctuation">,</span> currentHost<span class="token punctuation">)</span>

	<span class="token keyword">for</span> key<span class="token punctuation">,</span> values <span class="token operator">:=</span> <span class="token keyword">range</span> resp<span class="token punctuation">.</span>Header <span class="token punctuation">&#123;</span>
		<span class="token keyword">if</span> key <span class="token operator">==</span> <span class="token string">"Content-Encoding"</span> <span class="token operator">||</span> key <span class="token operator">==</span> <span class="token string">"Content-Length"</span> <span class="token punctuation">&#123;</span>
			<span class="token keyword">continue</span>
		<span class="token punctuation">&#125;</span>
		<span class="token keyword">for</span> <span class="token boolean">_</span><span class="token punctuation">,</span> value <span class="token operator">:=</span> <span class="token keyword">range</span> values <span class="token punctuation">&#123;</span>
			w<span class="token punctuation">.</span><span class="token function">Header</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">Add</span><span class="token punctuation">(</span>key<span class="token punctuation">,</span> value<span class="token punctuation">)</span>
		<span class="token punctuation">&#125;</span>
	<span class="token punctuation">&#125;</span>

	w<span class="token punctuation">.</span><span class="token function">Header</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">Set</span><span class="token punctuation">(</span><span class="token string">"Access-Control-Allow-Origin"</span><span class="token punctuation">,</span> <span class="token string">"*"</span><span class="token punctuation">)</span>
	w<span class="token punctuation">.</span><span class="token function">Header</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">Set</span><span class="token punctuation">(</span><span class="token string">"Access-Control-Allow-Credentials"</span><span class="token punctuation">,</span> <span class="token string">"true"</span><span class="token punctuation">)</span>
	w<span class="token punctuation">.</span><span class="token function">Header</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">Set</span><span class="token punctuation">(</span><span class="token string">"Cache-Control"</span><span class="token punctuation">,</span> <span class="token string">"public, max-age=14400"</span><span class="token punctuation">)</span>
	w<span class="token punctuation">.</span><span class="token function">Header</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">Del</span><span class="token punctuation">(</span><span class="token string">"Content-Security-Policy"</span><span class="token punctuation">)</span>
	w<span class="token punctuation">.</span><span class="token function">Header</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">Del</span><span class="token punctuation">(</span><span class="token string">"Content-Security-Policy-Report-Only"</span><span class="token punctuation">)</span>
	w<span class="token punctuation">.</span><span class="token function">Header</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">Del</span><span class="token punctuation">(</span><span class="token string">"Clear-Site-Data"</span><span class="token punctuation">)</span>
	w<span class="token punctuation">.</span><span class="token function">Header</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">Set</span><span class="token punctuation">(</span><span class="token string">"Content-Length"</span><span class="token punctuation">,</span> fmt<span class="token punctuation">.</span><span class="token function">Sprintf</span><span class="token punctuation">(</span><span class="token string">"%d"</span><span class="token punctuation">,</span> <span class="token function">len</span><span class="token punctuation">(</span>modifiedBody<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
	w<span class="token punctuation">.</span><span class="token function">WriteHeader</span><span class="token punctuation">(</span>resp<span class="token punctuation">.</span>StatusCode<span class="token punctuation">)</span>
	w<span class="token punctuation">.</span><span class="token function">Write</span><span class="token punctuation">(</span>modifiedBody<span class="token punctuation">)</span>
<span class="token punctuation">&#125;</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">&#123;</span>
	http<span class="token punctuation">.</span><span class="token function">HandleFunc</span><span class="token punctuation">(</span><span class="token string">"/"</span><span class="token punctuation">,</span> handleRequest<span class="token punctuation">)</span>
	port <span class="token operator">:=</span> <span class="token string">":8080"</span>
	log<span class="token punctuation">.</span><span class="token function">Printf</span><span class="token punctuation">(</span><span class="token string">"GitHub代理服务器启动在端口 %s"</span><span class="token punctuation">,</span> port<span class="token punctuation">)</span>
	log<span class="token punctuation">.</span><span class="token function">Printf</span><span class="token punctuation">(</span><span class="token string">"请确保你的域名已正确配置并指向此服务器"</span><span class="token punctuation">)</span>

	<span class="token keyword">if</span> err <span class="token operator">:=</span> http<span class="token punctuation">.</span><span class="token function">ListenAndServe</span><span class="token punctuation">(</span>port<span class="token punctuation">,</span> <span class="token boolean">nil</span><span class="token punctuation">)</span><span class="token punctuation">;</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">&#123;</span>
		log<span class="token punctuation">.</span><span class="token function">Fatal</span><span class="token punctuation">(</span><span class="token string">"服务器启动失败:"</span><span class="token punctuation">,</span> err<span class="token punctuation">)</span>
	<span class="token punctuation">&#125;</span>
<span class="token punctuation">&#125;</span></code>`,!0),i(f);var p=s(f,4);t(p,()=>`<code class="language-go">module github<span class="token operator">-</span>proxy

<span class="token keyword">go</span> <span class="token number">1.19</span></code>`,!0),i(p);var m=s(p,4);t(m,()=>`<code class="language-bash">go run <span class="token builtin class-name">.</span></code>`,!0),i(m);var h=s(m,4);t(h,()=>`<code class="language-bash">root@localhost:~/go_proxy<span class="token comment"># go run .</span>
<span class="token number">2025</span>/06/20 <span class="token number">23</span>:13:17 GitHub代理服务器启动在端口 :8080
<span class="token number">2025</span>/06/20 <span class="token number">23</span>:13:17 请确保你的域名已正确配置并指向此服务器</code>`,!0),i(h),a(32),n(e,r)}export{c as t};