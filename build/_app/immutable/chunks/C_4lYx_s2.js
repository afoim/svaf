import{n as e}from"./pn1seLaS.js";import{D as t,F as n,L as r,Mt as i,ot as a,st as o}from"./R8CaXVlq.js";import"./ZsEnWiqm.js";var s=e({default:()=>g,metadata:()=>c}),c={title:`你真的懂了浏览器跨域吗？COOP，COEP，CORP，CORS都是管什么的？`,published:`2026-02-02T20:54:03.000Z`,description:`你是否在浏览或开发网站时在浏览器控制台看到过“由于跨域XXX，已阻止加载XXX”，或“200 Failed”状态？今天带你搞懂浏览器的跨域安全模型`,image:`img/coxp.avif`,draft:!1,lang:``},{title:l,published:u,description:d,image:f,draft:p,lang:m}=c,h=r(`<h1>正式开始</h1> <p>如果你做过网站（HTML），你就会知道，一个网页除了自身提供内容，如 <code>&lt;p&gt;hello world&lt;/p&gt;</code> ，还可以 <strong>内嵌外链资源</strong> ，如 <code>&lt;img src="https://othersite.com/hello.webp"&gt;</code></p> <p>一方面，HTML允许我们非常自由的引用资源，另一方面，这也会造成一些问题</p> <p>我们不妨设想一下，你有一个图库站点，里面全都是高清大图，网站访问量也特别高。如果这个时候有人眼红了，也想做一个这样的站点，它可以直接通过HTML做个壳，把品牌改成自己的，然后引用你的图片，这样，它只需要托管很少的文本文件（HTML壳），而无需托管实际图片</p> <p>那我们肯定不能让他这样，怎么办呢，所以我们需要让我们的图片在被拉取时返回一个 <strong>CORP 响应头</strong>，并且值为 <strong>same-site</strong> ，这样，只要不是你的域名写 <code>&lt;img&gt;</code> ，浏览器会统统阻断加载</p> <p><img src="img/coxp-1.avif"/></p> <p>这就是 <strong>CORP（Cross-Origin-Resource-Policy） - 跨域资源策略</strong>，它管的是 <strong>资源给不给用</strong></p> <table><thead><tr><th align="center">值</th><th align="center">描述</th></tr></thead><tbody><tr><td align="center">same-origin</td><td align="center">同源。仅允许 <code>example.com</code> 拉取对应资源</td></tr><tr><td align="center">same-site</td><td align="center">同站。仅允许 <code>*.example.com</code> <code>example.com</code> 拉取资源</td></tr><tr><td align="center">cross-origin</td><td align="center"><strong>默认值</strong>。允许所有源，任何人都可以拉取</td></tr></tbody></table> <p>好的，我们解决了图片被滥用的问题。接下来更棘手的来了，我们还有一个其他网站，不过它并不提供媒体资源，而是在访问的时候获取访客IP</p> <p>本来这只是你自用的一个网站，但是你发现最近后端的日志有很多乱七八糟的IP，经过一番盘查，你发现有一个网站的底部会显示访客IP，通过F12查看网络请求发现这就是请求的你的网站！</p> <p>接着你查看了一下这个API返回的响应头，发现你之前为了跨域调用方便设置了 <code>Access-Control-Allow-Origin: *</code> ，该头会允许任何人调用你的API并且获取响应</p> <p>再然后，你将该头的值改为了 <code>yoursite.com</code> 这样，就只允许你自己的网站来调用该API了。其他人调用依旧会被浏览器拦截</p> <p><img src="img/coxp-4.avif"/></p> <p>接着，你又做了个网站，并且为各个地区访问的访客配置了不同的CDN图床，你想让该网站告诉用户您正在使用什么CDN</p> <p>于是你灵机一动，想到各家CDN返回的响应头 <strong>Server</strong> 的值都不一样，于是就写了一点JS读取响应头并回写到页面上，但是你发现页面上并未显示，并且网络请求是一个奇怪的状态 <strong>200 Failed</strong></p> <p>于是你思考了一下，哦！对了！由于是不同的CDN图床，且主站域名为 <code>blog.yoursite.com</code> ，图床域名为 <code>img.yoursite.com</code> ，会触发跨域！</p> <p>虽然你已经经过上次的教训正确设置了 <strong>Access-Control-Allow-Origin</strong> 头，但是对于浏览器来说，你只是允许了别人读取我的响应体，并没有规定响应体，然后你打印了一下JS获取到的所有响应头，你发现只能读到 <code>Content-Type</code> 等几个无关响应头，JS根本看不见 <strong>Server</strong> 头</p> <p>然后你费劲千辛万苦，终于在各大CDN都配置了返回 <code>Access-Control-Expose-Headers: server</code> ，然后，你的代码终于工作了！</p> <p><img src="img/coxp-2.avif"/></p> <p>接着，随着你的网站越做越大，你想给网站添加一个访问量显示模块，但是由于网站本身是静态的，你又不想在全是前端代码的项目里面插后端代码，于是你很聪明，想到了搭建另一个服务，Umami，然后将追踪JS嵌入你的网站，你再通过客户端JS读取Umami的公开页面获取访问量</p> <p>尽管Umami的公开页面是公开的，但并不是一次请求就能成功，首先你需要先请求一个端点拿到游客token，接着携带这个游客token访问Umami访问量端点，拿到最终的访问量</p> <p>不过这对你来说都不是什么难事，只需要在JS写好这一整套逻辑再封装一下函数即可</p> <p>但是实际跑起来的时候又出问题了，由于一个是 <code>blog.yoursite.com</code> ，而另一个是 <code>umami.yoursite.com</code> ，由于你正确配置了 <strong>Access-Control-Allow-Origin 响应头</strong>，所以第一个请求成功发出，JS也如期拿到了游客token</p> <p>问题就在第二个请求，你发现你的请求又又又被浏览器拦截了，显示 <strong>请求头: x-umami-share-token 不被对端允许</strong></p> <p>你思考了一下，哦！尽管我们配置了 <strong>Access-Control-Allow-Origin 响应头</strong> ，但也只是允许获取响应体，浏览器对于 <strong>发请求头</strong> ，需要在Umami再配置一条 <strong>Access-Control-Allow-Headers 响应头</strong></p> <p>接着，你配置了该响应头，为了方便，你直接写了 <code>Access-Control-Allow-Headers: *</code> ，终于，你的代码成功工作了，也拿到了正确的访问量</p> <p><img src="img/coxp-3.avif"/></p> <p>这就是 <strong>CORS（Cross-Origin Resource Sharing）- 跨域资源共享</strong> ，它管的是 <strong>API给不给调，只能给谁调</strong></p> <ul><li>Access-Control-Allow-Origin（谁能跨域访问资源？<strong>默认谁都不能</strong>）</li></ul> <table><thead><tr><th align="center">值</th><th align="center">描述</th></tr></thead><tbody><tr><td align="center"><code>*</code></td><td align="center">允许<strong>任意源</strong>访问资源（⚠️ 不能与 <code>Allow-Credentials: true</code> 同时使用）</td></tr><tr><td align="center"><code>https://example.com</code></td><td align="center">仅允许<strong>指定源</strong>访问资源</td></tr><tr><td align="center"><code>null</code></td><td align="center">允许 <code>Origin: null</code>（如 <code>file://</code>、沙盒 iframe）</td></tr></tbody></table> <ul><li>Access-Control-Allow-Methods（跨域访问允许的请求方式？<strong>默认都不允许</strong>）</li></ul> <table><thead><tr><th align="center">值</th><th align="center">描述</th></tr></thead><tbody><tr><td align="center"><code>GET</code></td><td align="center">允许 GET 请求</td></tr><tr><td align="center"><code>POST</code></td><td align="center">允许 POST 请求</td></tr><tr><td align="center"><code>PUT</code></td><td align="center">允许 PUT 请求</td></tr><tr><td align="center"><code>DELETE</code></td><td align="center">允许 DELETE 请求</td></tr><tr><td align="center"><code>PATCH</code></td><td align="center">允许 PATCH 请求</td></tr><tr><td align="center"><code>OPTIONS</code></td><td align="center">允许预检请求</td></tr><tr><td align="center"><code>GET, POST, OPTIONS</code></td><td align="center">允许多个方法（逗号分隔）</td></tr></tbody></table> <ul><li>Access-Control-Allow-Headers（跨域访问允许带的请求头？<strong>默认只允许带 <a href="https://developer.mozilla.org/zh-CN/docs/Glossary/CORS-safelisted_request_header" rel="nofollow">列入 CORS 白名单的请求标头 - MDN Web 文档术语表：Web 相关术语的定义 | MDN</a></strong> ）</li></ul> <table><thead><tr><th align="center">值</th><th align="center">描述</th></tr></thead><tbody><tr><td align="center"><code>Content-Type</code></td><td align="center">允许携带 <code>Content-Type</code> 请求头</td></tr><tr><td align="center"><code>Authorization</code></td><td align="center">允许携带认证头</td></tr><tr><td align="center"><code>X-Custom-Header</code></td><td align="center">允许指定的自定义请求头</td></tr><tr><td align="center"><code>*</code></td><td align="center">允许<strong>所有请求头</strong>（现代浏览器支持，主要用于非凭据请求）</td></tr></tbody></table> <ul><li>Access-Control-Allow-Credentials（跨域访问是否允许携带凭据？<strong>默认不允许</strong> ）</li></ul> <table><thead><tr><th align="center">值</th><th align="center">描述</th></tr></thead><tbody><tr><td align="center"><code>true</code></td><td align="center">允许携带凭据（Cookie / Authorization / TLS client cert）</td></tr><tr><td align="center">（不返回）</td><td align="center"><strong>默认</strong>不允许携带凭据</td></tr></tbody></table> <ul><li>Access-Control-Expose-Headers（跨域访问时能读到的响应头？<strong>默认只能读到 <a href="https://developer.mozilla.org/zh-CN/docs/Glossary/CORS-safelisted_response_header" rel="nofollow">列入 CORS 白名单的响应标头 - MDN Web 文档术语表：Web 相关术语的定义 | MDN</a></strong></li></ul> <table><thead><tr><th align="center">值</th><th align="center">描述</th></tr></thead><tbody><tr><td align="center"><code>X-Request-Id</code></td><td align="center">允许 JS 读取该响应头</td></tr><tr><td align="center"><code>Content-Length</code></td><td align="center">允许 JS 读取内容长度</td></tr><tr><td align="center"><code>X-A, X-B</code></td><td align="center">暴露多个响应头（逗号分隔）</td></tr></tbody></table> <ul><li>Access-Control-Max-Age（跨域访问时预检请求结果缓存多长时间（秒）？ <strong>默认不缓存</strong> ）</li></ul> <table><thead><tr><th align="center">值</th><th align="center">描述</th></tr></thead><tbody><tr><td align="center"><code>0</code></td><td align="center">不缓存预检请求</td></tr><tr><td align="center"><code>600</code></td><td align="center">预检结果缓存 10 分钟</td></tr><tr><td align="center"><code>86400</code></td><td align="center">缓存 24 小时（浏览器可能有上限）</td></tr></tbody></table> <p>而对于 <strong>COOP和COEP</strong> ，他们都是配在 <strong>用户正在访问的HTML上面</strong> ，分别用于以下情况</p> <ul><li>Cross-Origin-Opener-Policy（COOP）</li></ul> <p><strong>COOP（Cross-Origin Opener Policy）</strong> 是一种浏览器安全机制，用于控制<strong>不同页面之间是否可以共享同一个浏览器窗口上下文（browsing context）</strong>。它主要影响页面与通过 <code>window.open()</code> 打开的其他页面之间的关系，以及这些页面是否能够互相访问 <code>window.opener</code>。</p> <p>当页面启用 COOP 后，浏览器会根据策略将跨源页面强制隔离到不同的浏览器进程中，使它们无法共享执行环境。这种隔离可以有效降低侧信道攻击（如 Spectre）的风险，同时防止跨站页面通过 <code>window.opener</code> 进行劫持或信息泄露。</p> <p>COOP 关注的是<strong>页面与页面之间的隔离关系</strong>，并不参与资源（如图片、脚本、视频）的加载或校验。</p> <table><thead><tr><th>值</th><th>是否默认</th><th>行为描述</th><th>主要影响</th></tr></thead><tbody><tr><td><code>unsafe-none</code></td><td>✅ 是</td><td>不启用任何隔离</td><td>跨源页面可共享 browsing context 与 <code>window.opener</code></td></tr><tr><td><code>same-origin</code></td><td>❌</td><td>仅允许同源页面共享窗口与进程</td><td>跨源 <code>window.opener</code> 被置为 <code>null</code>，强制进程隔离</td></tr><tr><td><code>same-origin-allow-popups</code></td><td>❌</td><td>自身隔离，但允许弹出窗口</td><td>常用于 OAuth / 支付弹窗场景</td></tr></tbody></table> <ul><li>Cross-Origin-Embedder-Policy（COEP）</li></ul> <p><strong>COEP（Cross-Origin Embedder Policy）</strong> 是一种用于限制页面<strong>如何加载和使用跨源资源</strong>的安全策略。当页面启用 COEP 后，所有被嵌入的跨源资源都必须明确表态“允许被使用”，否则浏览器会阻止这些资源被页面消费。</p> <p>COEP 的核心目标是确保页面不会在不知情的情况下加载不受信任的跨源资源，从而避免利用共享进程或共享内存进行的攻击。它通常与资源侧声明（如 CORS 或 Cross-Origin-Resource-Policy）配合使用。</p> <p>COEP 并不会阻止浏览器发起网络请求，但会在资源返回后决定该资源是否可以被页面使用。</p> <table><thead><tr><th>值</th><th>是否默认</th><th>行为描述</th><th>主要影响</th></tr></thead><tbody><tr><td><code>unsafe-none</code></td><td>✅ 是</td><td>不启用嵌入限制</td><td>页面可加载任意跨源资源</td></tr><tr><td><code>require-corp</code></td><td>❌</td><td>仅允许明确授权的跨源资源</td><td>跨源资源必须满足 CORP 或 CORS</td></tr></tbody></table> <hr/> <h3>什么时候浏览器才会检查 COOP 和 COEP？</h3> <p>这两个标头<strong>只有在页面被作为“文档（document）加载”时才会被浏览器检查</strong>，通常包括：</p> <ul><li>顶级页面导航（在地址栏中直接打开页面）</li> <li>iframe 中加载的文档页面</li> <li>弹出窗口（<code>window.open()</code> 打开的页面）</li></ul> <p>对于图片、音频、视频、脚本等<strong>非文档资源</strong>，浏览器不会检查其响应中的 COOP 或 COEP 标头，这些资源即使返回 200 OK，也不会因此自动获得跨源使用权限。</p> <p>需要注意的是：</p> <ul><li><strong>COOP</strong> 在页面创建或连接 browsing context 时生效，用于决定页面之间是否可以共享窗口和进程。</li> <li><strong>COEP</strong> 在页面尝试使用嵌入资源时生效，用于判断跨源资源是否满足安全要求。</li></ul> <hr/> <h3>COOP 与 COEP 的联合效果</h3> <p>当一个页面同时启用了 COOP 和 COEP，并且所有嵌入资源都满足对应要求时，浏览器会将该页面视为<strong>跨源隔离（cross-origin isolated）</strong>状态。在这种状态下，页面可以安全地使用一些高权限 Web API，例如 <code>SharedArrayBuffer</code> 和高精度计时器。</p> <h1>浏览器安全模型完整流程图</h1> <pre class="language-mermaid"></pre>`,1);function g(e){var r=h(),s=o(a(r),124);t(s,()=>`<code class="language-mermaid">flowchart TD
    Start([浏览器发起请求]) --&gt; CheckSameOrigin&#123;是否同源?/协议+域名+端口都相同?&#125;
    
    CheckSameOrigin --&gt;|是| SameOriginSuccess[同源请求/直接发送]:::success
    SameOriginSuccess --&gt; End1([请求成功]):::success
    
    CheckSameOrigin --&gt;|否| CrossOrigin[跨域请求]
    
    CrossOrigin --&gt; CheckRequestType&#123;请求类型判断&#125;
    
    CheckRequestType --&gt; SimpleCheck&#123;是否为简单请求?/方法: GET/HEAD/POST/头部仅限安全字段/Content-Type仅限三种&#125;
    
    SimpleCheck --&gt;|是| SimpleRequest[简单请求/直接发送实际请求]
    SimpleCheck --&gt;|否| PreflightRequest[非简单请求/需要预检]
    
    PreflightRequest --&gt; SendPreflight[发送OPTIONS预检请求/包含Origin等头部]
    
    SendPreflight --&gt; ServerPreflight&#123;服务器响应预检&#125;
    
    ServerPreflight --&gt;|无CORS头或不匹配| PreflightFail[预检失败/请求被阻止]:::failure
    PreflightFail --&gt; End2([请求失败]):::failure
    
    ServerPreflight --&gt;|有效CORS头| CheckPreflightHeaders&#123;检查预检响应头/Allow-Origin/Methods/Headers&#125;
    
    CheckPreflightHeaders --&gt;|不匹配| PreflightFail
    CheckPreflightHeaders --&gt;|匹配| PreflightPass[预检通过]:::success
    
    PreflightPass --&gt; SendActualRequest[发送实际请求]
    SimpleRequest --&gt; SendActualRequest
    
    SendActualRequest --&gt; ServerResponse[服务器处理并返回响应]
    
    ServerResponse --&gt; CheckCORS&#123;检查CORS响应头&#125;
    
    CheckCORS --&gt; CheckOriginHeader&#123;Access-Control-Allow-Origin/是否存在且匹配?&#125;
    
    CheckOriginHeader --&gt;|否| CORSFail[CORS验证失败/响应被阻止]:::failure
    CORSFail --&gt; End3([请求失败]):::failure
    
    CheckOriginHeader --&gt;|是| CheckCredentials&#123;请求是否携带凭证?/cookies或HTTP认证&#125;
    
    CheckCredentials --&gt;|否| CORSPass[CORS验证通过]:::success
    
    CheckCredentials --&gt;|是| CheckAllowCredentials&#123;Allow-Credentials/是否为true?&#125;
    
    CheckAllowCredentials --&gt;|否| CredentialsFail[凭证验证失败/响应被阻止]:::failure
    CredentialsFail --&gt; End4([请求失败]):::failure
    
    CheckAllowCredentials --&gt;|是| CheckWildcard&#123;Allow-Origin/是否为通配符*?&#125;
    
    CheckWildcard --&gt;|是| WildcardFail[通配符冲突/不能与凭证同时使用]:::failure
    WildcardFail --&gt; End5([请求失败]):::failure
    
    CheckWildcard --&gt;|否-具体源| CORSPass
    
    CORSPass --&gt; CheckResourceType&#123;资源类型判断&#125;
    
    CheckResourceType --&gt; CheckCORP&#123;是否需要检查CORP?/跨域嵌入资源&#125;
    
    CheckCORP --&gt;|不需要| ResponseSuccess[响应可用]:::success
    
    CheckCORP --&gt;|需要| CheckCORPHeader&#123;Cross-Origin-Resource-Policy/响应头检查&#125;
    
    CheckCORPHeader --&gt;|未设置| CheckCOEP&#123;嵌入页面是否设置/COEP: require-corp?&#125;
    
    CheckCOEP --&gt;|否| ResponseSuccess
    CheckCOEP --&gt;|是| CORPFail[CORP策略阻止/资源被阻止]:::failure
    CORPFail --&gt; End6([请求失败]):::failure
    
    CheckCORPHeader --&gt;|same-origin| CheckCORPSameOrigin&#123;是否同源?&#125;
    CheckCORPSameOrigin --&gt;|是| ResponseSuccess
    CheckCORPSameOrigin --&gt;|否| CORPFail
    
    CheckCORPHeader --&gt;|same-site| CheckCORPSameSite&#123;是否同站?/相同eTLD+1&#125;
    CheckCORPSameSite --&gt;|是| ResponseSuccess
    CheckCORPSameSite --&gt;|否| CORPFail
    
    CheckCORPHeader --&gt;|cross-origin| CheckCrossOriginAttrs&#123;检查资源标签属性/crossorigin属性&#125;
    
    CheckCrossOriginAttrs --&gt;|未设置| CORPFail
    CheckCrossOriginAttrs --&gt;|已设置| ResponseSuccess
    
    ResponseSuccess --&gt; CheckCOOP&#123;检查COOP策略/Cross-Origin-Opener-Policy&#125;
    
    CheckCOOP --&gt; CheckCOOPValue&#123;COOP值检查&#125;
    
    CheckCOOPValue --&gt;|unsafe-none默认| AllowOpener[允许opener访问]:::success
    
    CheckCOOPValue --&gt;|same-origin| CheckCOOPSameOrigin&#123;打开者与被打开页面/是否同源?&#125;
    CheckCOOPSameOrigin --&gt;|是| AllowOpener
    CheckCOOPSameOrigin --&gt;|否| BlockOpener[隔离浏览上下文/opener=null]:::warning
    
    CheckCOOPValue --&gt;|same-origin-allow-popups| CheckPopup&#123;是否为弹窗?&#125;
    CheckPopup --&gt;|是| AllowOpener
    CheckPopup --&gt;|否| BlockOpener
    
    AllowOpener --&gt; FinalSuccess([请求完全成功/数据可用]):::success
    BlockOpener --&gt; FinalPartial([请求成功但受限/部分功能隔离]):::warning
    
    classDef success fill:#90EE90,stroke:#006400,stroke-width:3px,color:#000
    classDef failure fill:#FFB6C6,stroke:#8B0000,stroke-width:3px,color:#000
    classDef warning fill:#FFE4B5,stroke:#FF8C00,stroke-width:2px,color:#000</code>`,!0),i(s),n(e,r)}export{s as t};