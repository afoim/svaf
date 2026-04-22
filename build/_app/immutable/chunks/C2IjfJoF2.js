import{n as e}from"./pn1seLaS.js";import{D as t,F as n,L as r,Mt as i,jt as a,ot as o,st as s}from"./R8CaXVlq.js";import"./ZsEnWiqm.js";var c=e({default:()=>_,metadata:()=>l}),l={title:`让我们自建一个自己的CDN！`,published:`2026-04-11T16:21:41.000Z`,description:`你有没有想过从0通过各种开源项目自己搭建一个CDN？今天就来教你！`,image:`img/scdn.avif`,draft:!1,lang:``},{title:u,published:d,description:f,image:p,draft:m,lang:h}=l,g=r(`<h1>前情提要</h1> <p>因为最近搞了甲骨文，有俩1c1g的甲骨文机子，但是不知道能拿来干嘛</p> <p>然后最近偶然发现甲骨文上托管HTML很绿</p> <p><img src="img/self-host-cdn.avif"/></p> <p>于是就想着是否能在我的俩甲骨文上托管我的静态博客？</p> <h1>思路</h1> <p>首先，我们需要一个Web服务器，用来提供HTML内容，因为我是静态博客。所有我们不需要高级功能，故选择最快的 <a href="https://github.com/static-web-server/static-web-server" rel="nofollow">static-web-server/static-web-server: A cross-platform, high-performance and asynchronous web server for static files-serving. ⚡</a></p> <p>其次，我们还需要为它配置SSL，这里使用最简单的 <a href="https://acme.sh" rel="nofollow">https://acme.sh</a></p> <p>最后，我们需要让他实时更新。嘛，最简单的就是写个定时任务，按照固定频次强制拉取远程仓库的最新更改</p> <p>所以流程图最终大致如下</p> <pre class="language-mermaid"></pre> <h1>正式开始！</h1> <p>首先，使用 <a href="https://mobaxterm.mobatek.net/" rel="nofollow">MobaXterm free Xserver and tabbed SSH client for Windows</a> 连上两台机子并且启用 Multi Shell！</p> <p><em>这样我们就可以输入一次命令，让多台机子同时执行！</em></p> <p><img src="img/self-host-cdn-1.avif"/></p> <p>接着，我们首先下载 <a href="https://github.com/static-web-server/static-web-server" rel="nofollow">static-web-server/static-web-server: A cross-platform, high-performance and asynchronous web server for static files-serving. ⚡</a></p> <pre class="language-bash"></pre> <p>然后我们创建 <code>sws.toml</code> 。启用HTTP跳转HTTPS，配置SSL（和上面ACME部署的路径一样）</p> <pre class="language-toml"></pre> <p>接下来我们创建一个系统服务</p> <pre class="language-ini"></pre> <p>然后重载systemd，并且让服务开机自启</p> <pre class="language-bash"></pre> <p>再然后安装 <a href="https://acme.sh" rel="nofollow">https://acme.sh</a></p> <pre class="language-bash"></pre> <p>接着按照文档操作，申请证书 <a href="https://github.com/acmesh-official/acme.sh/wiki/dnsapi#dns_cf" rel="nofollow">dnsapi · acmesh-official/acme.sh Wiki</a></p> <pre class="language-bash"></pre> <p><img src="img/self-host-cdn-2.avif"/></p> <p>签发完毕后需要安装证书，指定一个目录。和刚才我们启动的SWS的SSL目录要一致</p> <pre class="language-bash"></pre> <p>最后配上定时任务</p> <p>但是先等等！我们还需要手动拉取一次我们的博客源码。由于Github Action每次都会自动帮我们构建好，所以我们仅需拉取 <code>page</code> 分支，并且不需要拉取历史</p> <pre class="language-bash"></pre> <p>然后写一个简单的脚本用以强制同步远程仓库的最新更改</p> <pre class="language-bash"></pre> <p>接着创建一个一分钟执行一次该脚本的定时任务</p> <pre class="language-bash"></pre> <p>写入：</p> <pre class="language-bash"></pre> <h1>接入</h1> <p>将两个甲骨文IP写入 <code>oraclecdn.2x.nz</code> 中</p> <p><img src="img/self-host-cdn-3.avif"/></p> <p>接着将 <code>2x.nz</code> CNAME <code>oracle.2x.nz</code></p> <p><img src="img/self-host-cdn-4.avif"/></p> <h1>高级</h1> <blockquote><p>由于我们有两台Linux的完整控制权限，我们就可以实现一些高级功能…</p></blockquote> <ul><li>通过 iptables 在L4层丢弃拨测IP发送的包，做到拨测网站全红😋</li> <li>通过 iptables 设置L4层的TCP连接数速率限制，实现L4层防DDoS</li></ul>`,1);function _(e){var r=g(),c=s(o(r),20);t(c,()=>`<code class="language-mermaid">flowchart TD

\xA0 \xA0 用户 --&gt; 2x.nz --&gt; |DNS解析|cdn[oraclecdn.2x.nz] --&gt; 1[Oracle1]

\xA0 \xA0 cdn --&gt; 2[Oracle2]

\xA0 \xA0 1 --&gt; s1[SWS1]

\xA0 \xA0 2 --&gt; s2[SWS2]

\xA0 \xA0 Acme1 --&gt; |签发SSL|1

\xA0 \xA0 Acme2 --&gt; |签发SSL|2

\xA0 \xA0 cron[定时任务] --&gt; |拉取更新内容|1

\xA0 \xA0 cron --&gt; |拉取更新内容|2

\xA0 \xA0 s1 --&gt; r[静态博客]

\xA0 \xA0 s2 --&gt; r</code>`,!0),i(c);var l=s(c,12);t(l,()=>`<code class="language-bash"><span class="token function">wget</span> https://github.com/static-web-server/static-web-server/releases/download/v2.42.0/static-web-server-v2.42.0-x86_64-unknown-linux-gnu.tar.gz
<span class="token function">tar</span> <span class="token parameter variable">-xzvf</span> static-web-server-v2.42.0-x86_64-unknown-linux-gnu.tar.gz
<span class="token function">rm</span> static-web-server-v2.42.0-x86_64-unknown-linux-gnu.tar.gz</code>`,!0),i(l);var u=s(l,4);t(u,()=>`<code class="language-toml">
<span class="token punctuation">[</span><span class="token table class-name">general</span><span class="token punctuation">]</span>

<span class="token comment">#### Address &amp; Root dir</span>
<span class="token key property">host</span> <span class="token punctuation">=</span> <span class="token string">"0.0.0.0"</span>
<span class="token key property">port</span> <span class="token punctuation">=</span> <span class="token number">443</span>
<span class="token key property">root</span> <span class="token punctuation">=</span> <span class="token string">"/root/fuwari"</span>

<span class="token comment">#### Logging</span>
<span class="token key property">log-level</span> <span class="token punctuation">=</span> <span class="token string">"error"</span>

<span class="token comment">#### Cache Control headers</span>
<span class="token key property">cache-control-headers</span> <span class="token punctuation">=</span> <span class="token boolean">true</span>

<span class="token comment">#### Auto Compression</span>
<span class="token key property">compression</span> <span class="token punctuation">=</span> <span class="token boolean">false</span>
<span class="token key property">compression-level</span> <span class="token punctuation">=</span> <span class="token string">"best"</span>

<span class="token comment">#### Error pages</span>
<span class="token comment"># Note: If a relative path is used then it will be resolved under the root directory.</span>
<span class="token key property">page404</span> <span class="token punctuation">=</span> <span class="token string">"./404.html"</span>
<span class="token key property">page50x</span> <span class="token punctuation">=</span> <span class="token string">"./50x.html"</span>

<span class="token comment">#### HTTP/2 + TLS</span>
<span class="token key property">http2</span> <span class="token punctuation">=</span> <span class="token boolean">true</span>
<span class="token key property">http2-tls-cert</span> <span class="token punctuation">=</span> <span class="token string">"/root/ssl/2x_nz_cert.pem"</span>
<span class="token key property">http2-tls-key</span> <span class="token punctuation">=</span> <span class="token string">"/root/ssl/2x_nz_key.pem"</span>
<span class="token key property">https-redirect</span> <span class="token punctuation">=</span> <span class="token boolean">true</span>
<span class="token key property">https-redirect-host</span> <span class="token punctuation">=</span> <span class="token string">"2x.nz"</span>
<span class="token key property">https-redirect-from-port</span> <span class="token punctuation">=</span> <span class="token number">80</span>
<span class="token key property">https-redirect-from-hosts</span> <span class="token punctuation">=</span> <span class="token string">"2x.nz"</span>

<span class="token comment">#### CORS &amp; Security headers</span>
<span class="token key property">security-headers</span> <span class="token punctuation">=</span> <span class="token boolean">true</span>
<span class="token key property">cors-allow-origins</span> <span class="token punctuation">=</span> <span class="token string">"*"</span>

<span class="token comment">#### Directory listing</span>
<span class="token key property">directory-listing</span> <span class="token punctuation">=</span> <span class="token boolean">false</span>

<span class="token comment">#### Directory listing sorting code</span>
<span class="token key property">directory-listing-order</span> <span class="token punctuation">=</span> <span class="token number">1</span>

<span class="token comment">#### Directory listing content format</span>
<span class="token key property">directory-listing-format</span> <span class="token punctuation">=</span> <span class="token string">"html"</span>

<span class="token comment">#### Directory listing download format</span>
<span class="token key property">directory-listing-download</span> <span class="token punctuation">=</span> <span class="token punctuation">[</span><span class="token punctuation">]</span>

<span class="token comment">#### Basic Authentication</span>
<span class="token comment"># basic-auth = ""</span>

<span class="token comment">#### File descriptor binding</span>
<span class="token comment"># fd = ""</span>

<span class="token comment">#### Worker threads</span>
<span class="token key property">threads-multiplier</span> <span class="token punctuation">=</span> <span class="token number">1</span>

<span class="token comment">#### Grace period after a graceful shutdown</span>
<span class="token key property">grace-period</span> <span class="token punctuation">=</span> <span class="token number">0</span>

<span class="token comment">#### Page fallback for 404s</span>
<span class="token comment"># page-fallback = ""</span>

<span class="token comment">#### Log request Remote Address if available</span>
<span class="token key property">log-remote-address</span> <span class="token punctuation">=</span> <span class="token boolean">false</span>

<span class="token comment">#### Log real IP from X-Forwarded-For header if available</span>
<span class="token key property">log-forwarded-for</span> <span class="token punctuation">=</span> <span class="token boolean">false</span>

<span class="token comment">#### IPs to accept the X-Forwarded-For header from. Empty means all</span>
<span class="token key property">trusted-proxies</span> <span class="token punctuation">=</span> <span class="token punctuation">[</span><span class="token punctuation">]</span>

<span class="token comment">#### Redirect to trailing slash in the requested directory uri</span>
<span class="token key property">redirect-trailing-slash</span> <span class="token punctuation">=</span> <span class="token boolean">true</span>

<span class="token comment">#### Check for existing pre-compressed files</span>
<span class="token key property">compression-static</span> <span class="token punctuation">=</span> <span class="token boolean">true</span>

<span class="token comment">#### Health-check endpoint (GET or HEAD &#96;/health&#96;)</span>
<span class="token key property">health</span> <span class="token punctuation">=</span> <span class="token boolean">false</span>

<span class="token comment">#### Markdown content negotiation</span>
<span class="token key property">accept-markdown</span> <span class="token punctuation">=</span> <span class="token boolean">false</span>

<span class="token comment">#### List of index files</span>
<span class="token comment"># index-files = "index.html, index.htm"</span>
<span class="token comment">#### Maintenance Mode</span>

<span class="token key property">maintenance-mode</span> <span class="token punctuation">=</span> <span class="token boolean">false</span>
<span class="token comment"># maintenance-mode-status = 503</span>
<span class="token comment"># maintenance-mode-file = "./maintenance.html"</span>

<span class="token comment">### Windows Only</span>

<span class="token comment">#### Run the web server as a Windows Service</span>
<span class="token comment"># windows-service = false</span>


<span class="token punctuation">[</span><span class="token table class-name">advanced</span><span class="token punctuation">]</span>

<span class="token comment">#### HTTP Headers customization (examples only)</span>

<span class="token comment">#### a. Oneline version</span>
<span class="token punctuation">[</span><span class="token punctuation">[</span><span class="token table class-name">advanced.headers</span><span class="token punctuation">]</span><span class="token punctuation">]</span>
<span class="token key property">source</span> <span class="token punctuation">=</span> <span class="token string">"*"</span>
<span class="token key property">headers</span> <span class="token punctuation">=</span> <span class="token punctuation">&#123;</span> <span class="token key property">Server</span> <span class="token punctuation">=</span> <span class="token string">"AcoForkCDN"</span> <span class="token punctuation">&#125;</span>

<span class="token comment">#### b. Multiline version</span>
<span class="token comment"># [[advanced.headers]]</span>
<span class="token comment"># source = "/index.html"</span>
<span class="token comment"># [advanced.headers.headers]</span>
<span class="token comment"># Cache-Control = "public, max-age=36000"</span>
<span class="token comment"># Content-Security-Policy = "frame-ancestors 'self'"</span>
<span class="token comment"># Strict-Transport-Security = "max-age=63072000; includeSubDomains; preload"</span>

<span class="token comment">#### c. Multiline version with explicit key (dotted)</span>
<span class="token comment"># [[advanced.headers]]</span>
<span class="token comment"># source = "**/*.&#123;jpg,jpeg,png,ico,gif&#125;"</span>
<span class="token comment"># headers.Strict-Transport-Security = "max-age=63072000; includeSubDomains; preload"</span>


<span class="token comment">### URL Redirects (examples only)</span>

<span class="token comment"># [[advanced.redirects]]</span>
<span class="token comment"># source = "**/*.&#123;jpg,jpeg&#125;"</span>
<span class="token comment"># destination = "/images/generic1.png"</span>
<span class="token comment"># kind = 301</span>

<span class="token comment"># [[advanced.redirects]]</span>
<span class="token comment"># source = "/index.html"</span>
<span class="token comment"># destination = "https://static-web-server.net"</span>
<span class="token comment"># kind = 302</span>

<span class="token comment">### URL Rewrites (examples only)</span>

<span class="token comment"># [[advanced.rewrites]]</span>
<span class="token comment"># source = "**/*.&#123;png,ico,gif&#125;"</span>
<span class="token comment"># destination = "/assets/favicon.ico"</span>
<span class="token comment">## Optional redirection</span>
<span class="token comment"># redirect = 301</span>

<span class="token comment"># [[advanced.rewrites]]</span>
<span class="token comment"># source = "**/*.&#123;jpg,jpeg&#125;"</span>
<span class="token comment"># destination = "/images/sws.png"</span>

<span class="token comment">### Virtual Hosting</span>

<span class="token comment"># [[advanced.virtual-hosts]]</span>
<span class="token comment">## But if the "Host" header matches this...</span>
<span class="token comment"># host = "sales.example.com"</span>
<span class="token comment">## ...then files will be served from here instead</span>
<span class="token comment"># root = "/var/sales/html"</span>

<span class="token comment"># [[advanced.virtual-hosts]]</span>
<span class="token comment"># host = "blog.example.com"</span>
<span class="token comment"># root = "/var/blog/html"</span></code>`,!0),i(u);var d=s(u,4);t(d,()=>`<code class="language-ini"><span class="token section"><span class="token punctuation">[</span><span class="token section-name selector">Unit</span><span class="token punctuation">]</span></span>
<span class="token key attr-name">Description</span><span class="token punctuation">=</span><span class="token value attr-value">Static Web Server (sws)</span>
<span class="token key attr-name">After</span><span class="token punctuation">=</span><span class="token value attr-value">network.target</span>

<span class="token section"><span class="token punctuation">[</span><span class="token section-name selector">Service</span><span class="token punctuation">]</span></span>
<span class="token key attr-name">Type</span><span class="token punctuation">=</span><span class="token value attr-value">simple</span>
<span class="token key attr-name">ExecStart</span><span class="token punctuation">=</span><span class="token value attr-value">/root/sws/static-web-server-v2.42.0-x86_64-unknown-linux-gnu/static-web-server </span>
  --config-file /root/sws/static-web-server-v2.42.0-x86_64-unknown-linux-gnu/sws.toml

<span class="token key attr-name">Restart</span><span class="token punctuation">=</span><span class="token value attr-value">always</span>
<span class="token key attr-name">RestartSec</span><span class="token punctuation">=</span><span class="token value attr-value">5</span>

<span class="token comment"># 安全 &amp; 稳定性</span>
<span class="token key attr-name">LimitNOFILE</span><span class="token punctuation">=</span><span class="token value attr-value">1048576</span>
<span class="token key attr-name">PrivateTmp</span><span class="token punctuation">=</span><span class="token value attr-value">true</span>
<span class="token key attr-name">NoNewPrivileges</span><span class="token punctuation">=</span><span class="token value attr-value">true</span>

<span class="token section"><span class="token punctuation">[</span><span class="token section-name selector">Install</span><span class="token punctuation">]</span></span>
<span class="token key attr-name">WantedBy</span><span class="token punctuation">=</span><span class="token value attr-value">multi-user.target</span>
</code>`,!0),i(d);var f=s(d,4);t(f,()=>`<code class="language-bash">systemctl daemon-reexec
systemctl daemon-reload

systemctl <span class="token builtin class-name">enable</span> sws
systemctl start sws</code>`,!0),i(f);var p=s(f,4);t(p,()=>`<code class="language-bash"><span class="token function">apt</span> <span class="token function">install</span> <span class="token function">cron</span>
<span class="token function">curl</span> https://get.acme.sh <span class="token operator">|</span> <span class="token function">sh</span> <span class="token parameter variable">-s</span> <span class="token assign-left variable">email</span><span class="token operator">=</span>my@example.com</code>`,!0),i(p);var m=s(p,4);t(m,()=>`<code class="language-bash">./acme.sh <span class="token parameter variable">--issue</span> <span class="token parameter variable">--dns</span> dns_cf <span class="token parameter variable">-d</span> 2x.nz <span class="token parameter variable">-d</span> <span class="token string">'*.2x.nz'</span></code>`,!0),i(m);var h=s(m,6);t(h,()=>`<code class="language-bash">acme.sh --install-cert <span class="token parameter variable">-d</span> 2x.nz <span class="token punctuation"></span>
--key-file       /root/ssl/2x_nz_key.pem  <span class="token punctuation"></span>
--fullchain-file /root/ssl/2x_nz_cert.pem <span class="token punctuation"></span>
<span class="token parameter variable">--reloadcmd</span>     <span class="token string">"service sws force-reload"</span></code>`,!0),i(h);var _=s(h,6);t(_,()=>`<code class="language-bash"><span class="token function">git</span> clone <span class="token parameter variable">-b</span> page --single-branch <span class="token parameter variable">--depth</span><span class="token operator">=</span><span class="token number">1</span> https://github.com/afoim/fuwari.git</code>`,!0),i(_);var v=s(_,4);t(v,()=>`<code class="language-bash"><span class="token builtin class-name">cd</span> /root/fuwari
<span class="token function">git</span> fetch origin
<span class="token function">git</span> reset <span class="token parameter variable">--hard</span> origin/page</code>`,!0),i(v);var y=s(v,4);t(y,()=>`<code class="language-bash"><span class="token function">crontab</span> <span class="token parameter variable">-e</span></code>`,!0),i(y);var b=s(y,4);t(b,()=>`<code class="language-bash">* * * * * /root/vps-cicd/build.sh <span class="token operator">>></span> /var/log/vps-cicd-build.log <span class="token operator"><span class="token file-descriptor important">2</span>></span><span class="token file-descriptor important">&amp;1</span></code>`,!0),i(b),a(16),n(e,r)}export{c as t};