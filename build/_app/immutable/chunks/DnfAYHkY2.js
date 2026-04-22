import{n as e}from"./pn1seLaS.js";import{D as t,F as n,L as r,Mt as i,jt as a,ot as o,st as s}from"./R8CaXVlq.js";import"./ZsEnWiqm.js";var c=e({default:()=>_,metadata:()=>l}),l={title:`完全免费！从架构，开发到部署，一条龙实打实的教你做一言/随机图等随机URL的最佳实践`,published:`2025-12-29T02:10:40.000Z`,description:`我曾于2024搭建了第一个随机图网站，最近几周又深度研究了类似项目，发现这类项目有很多坑也有很多神秘的捷径，并且某些架构还可以做到“永生”...`,image:`img/random-url-gen.avif`,draft:!1,lang:``},{title:u,published:d,description:f,image:p,draft:m,lang:h}=l,g=r(`<h1>探索架构</h1> <p>我们先不讲一个抽象的概念，我们首先来做一个小项目</p> <p><strong>一个随机图API，每次请求都返回不同的图片</strong></p> <p>你会怎么做？</p> <p>有非常多的解决方案，就拿最简单的一说，我们可以先搞来一个服务器，然后往里面塞图片，最后写一个脚本创建一个Web服务器，接收客户端请求，每一个请求都从图片库里抽一张图返回</p> <p>能实现吗？</p> <p>当然可以！这是你的流程图！</p> <pre class="language-mermaid"></pre> <p>但也会带来一些问题，比如，图片存在本地，给客户端响应图片的时候走的是你机子的流量，那么你就需要一个 <strong>高带宽</strong> 的服务器，这无疑是一个 <strong>高昂</strong> 的成本</p> <p>那可能你会有新的方案： <strong>前后端分离</strong> （逻辑与资产分离），只将返回这个图片的逻辑存放在服务器上，而图片存到其他地方，如对象存储（Cloudflare R2）、IPFS等等</p> <pre class="language-mermaid"></pre> <p>那么问题又来了，假如说你的项目太多人用了，那你的服务器性能可能不够，在后期，你仍然需要一个 <strong>高昂</strong> 的 <strong>维护成本</strong></p> <p>那么那么那么，现在是 <strong>2025</strong> 年，传统的架构已经无法满足我们了，我们不妨可以试试 <strong>云函数</strong> 仍然是前后端分离，我们现在将逻辑放到一个函数上面，如Cloudflare Worker、EdgeOne Function、Vercel Function等等</p> <pre class="language-mermaid"></pre> <p>那么现在是不是无敌了？</p> <p>并非，虽然前端因为使用了 <strong>云函数</strong> 也就是直接接入了CDN，高并发已经不是问题了，但是由于资产并不直接托管在 <strong>云函数</strong> 中，<strong>云函数</strong> 仍然需要创建一个长连接从你的后端，如对象存储获取图片，这样一折腾，你的服务可能并不算快</p> <p>有人就会说了，那既然现在我都把我服务器丢了，前端在云，后端也在云，为什么不直接让前端的云直接存储后端的资产呢？</p> <p>当然可以！你已经非常接近最佳实践了！</p> <p>绝大部分 <strong>云函数</strong> 都支持动静结合，也就是支持你在他们的云存放一些动态脚本，再顺便 <strong>存放静态资产</strong></p> <p>那么接下来，你就得到了一个完全不需要你买服务器托管，也不需要你担心存储爆仓导致天价账单的随机图…了吗？</p> <pre class="language-mermaid"></pre> <h1>探索随机图（随机URL）的本质</h1> <p>我们刚刚只是在抽象的说明某种架构 <strong>好像</strong> 可行，<strong>好像</strong> 又有什么问题，然后又有一种什么新思路 <strong>好像</strong> 可以解决这个问题</p> <p>但我们要走的路才刚刚开始，我们不妨思考一下，随机图，又或者说随机URL这类项目，服务器（如果有）究竟发送了什么给客户端，客户端又对服务器发回的报文执行了什么动作</p> <p>你肯定知道，如果想要客户端每次请求同一个URL，都返回不同的东西，那肯定是服务器针对每一个请求都返回了不同的响应，它可以是内部的，比如直接在响应体塞图片，又或者也可以是 <strong>重定向</strong></p> <p>直接在响应体塞图片很简单，在客户端是不可见的，当客户端请求API时，服务器直接将选中的图片作为响应体发出，在客户端看来，就好像是请求了一张图片，只不过每次刷新都不一样</p> <p>而响应 <strong>重定向</strong> 就更简单了，只需要让服务器发送一个 <strong>临时重定向</strong> 的状态码，比如 <strong>302</strong></p> <p>有人就会说了，为什么必须要 <strong>临时重定向</strong> ？</p> <p>因为你肯定是想要客户端每次刷新都返回不同的图，一旦你使用了 <strong>永久重定向</strong> 如 <strong>301</strong> ，客户端在收到 <strong>301</strong> 的那一刻就会在浏览器里写一个记录：<strong>下次访问这个URL直接重定向，不再请求服务器</strong> ，这就会导致你的随机图API真的就变成一张图片了</p> <p>那么，这两种方法哪种更好呢？</p> <p>各有利弊，一句话说明：<strong>直接返回MIME类型是连请求复用，仅需一次请求即可得到图片。而返回302重定向至少需要客户端请求两次</strong></p> <p>这得看你的实际架构，如果说你是前后端分离，即逻辑和资产不在一个地方，肯定是 302 好，因为如果你直接在响应体塞图片，就相当于你的服务器作为 <strong>代理</strong> 让客户端访问你的资产，流量全部走你服务器</p> <p>而如果说你前后端都在一起，正常情况下来说，一次请求复用肯定是比两次连接更快的，不过为了方便管理和统计，我的大部分API仍然使用 <strong>302 重定向</strong></p> <p><a href="https://github.com/afoim/EdgeOne_Function_PicAPI" rel="nofollow">afoim/EdgeOne_Function_PicAPI</a></p> <p>上线的API： <a href="https://eopfapi.acofork.com/pic?img=ua" rel="nofollow">https://eopfapi.acofork.com/pic?img=ua</a></p> <h1>奇技淫巧1：利用Cloudflare Origin Rules实现无计费的随机URL</h1> <blockquote><p>Video: <a href="https://www.bilibili.com/video/BV19ZBzB8EDQ/" rel="nofollow">https://www.bilibili.com/video/BV19ZBzB8EDQ/</a> 起因于有一天一位粉丝在我视频下留言 <img src="img/random-url-gen-9.avif"/></p></blockquote> <p>他提到的仓库为</p> <p><a href="https://github.com/Mabbs/cf-hitokoto" rel="nofollow">Mabbs/cf-hitokoto</a></p> <p>大致为，Cloudflare在规则提供一个方法，该方法可以在规则层生成一个UUID，而UUID每次都是随机的，我们可以依据此来在规则层做随机URL</p> <p>理论可行，实践开始</p> <p>首先，我们要知道UUID是一串带有连字符的随机数，而每一位有16种可能，我们可以仅截取前4位，也就是 16^4 ，共能存储65536张图，每一张图可以分配到一个唯一的UUID，接下来让CF边缘在收到请求的时候，生成UUID，然后直接拼接URL请求静态资产，如 <code>/img/0000.webp</code> ，再返回给客户端即可</p> <p>那如果说我图比这多呢？加一位，16^5 = 1048576，够用了吧
那如果说我图比这少呢？那我们可以让图片填充，说个极端的例子，假如你只有2张图，每张图创建32768个副本即可，依此类推</p> <pre class="language-mermaid"></pre> <p><a href="https://github.com/afoim/cf-rule-random-url" rel="nofollow">afoim/cf-rule-random-url</a></p> <p>上线的API： <a href="https://img.072103.xyz/h" rel="nofollow">https://img.072103.xyz/h</a> | <a href="https://img.072103.xyz/v" rel="nofollow">https://img.072103.xyz/v</a></p> <h1>奇技淫巧2：丢掉后端，让前端JS自己拼URL</h1> <blockquote><p>Video: <a href="https://www.bilibili.com/video/BV1tNB4BEEaE/" rel="nofollow">https://www.bilibili.com/video/BV1tNB4BEEaE/</a> Video2: <a href="https://www.bilibili.com/video/BV1mMBKBREkB/" rel="nofollow">https://www.bilibili.com/video/BV1mMBKBREkB/</a></p></blockquote> <p>把思路打开，我们真的需要一个 <strong>请求一个端点，返回一个随机内容</strong> 的东西吗</p> <p>如果只是想在我们的网站上用上随机图，那是不是可以让客户端JavaScript代劳呢</p> <p>大致原理为编写一个客户端JS，生成一个随机数，然后拼接URL得到最终的随机图，然后寻找需要替换为随机图的img容器或者背景图容器，替换其中内容</p> <pre class="language-mermaid"></pre> <p><a href="https://github.com/afoim/Static_RandomPicAPI" rel="nofollow">afoim/Static_RandomPicAPI</a></p> <p>上线的 API： <a href="https://pic1.acofork.com" rel="nofollow">https://pic1.acofork.com</a></p> <h1>总结</h1> <p>我们共探索了三种流派</p> <ul><li>传统派：中规中矩，在边缘函数找图，取图</li> <li>极客派：通过CF的规则实现在边缘找图，取图，但是不计费</li> <li>环保派：通过客户端JS直接在浏览器上实现找图，取图，改图</li></ul>`,1);function _(e){var r=g(),c=s(o(r),14);t(c,()=>`<code class="language-mermaid">flowchart TD
    A[客户端请求&lt;br/&gt;GET /random]
    B[Web 服务器接收请求]
    C[从图片目录读取图片列表]
    D[随机选择一张图片]
    E[读取图片文件内容]
    F[构造 HTTP 响应&lt;br/&gt;Content-Type: image/*]
    G[返回图片给客户端]

    A --&gt; B
    B --&gt; C
    C --&gt; D
    D --&gt; E
    E --&gt; F
    F --&gt; G</code>`,!0),i(c);var l=s(c,6);t(l,()=>`<code class="language-mermaid">flowchart TD
    A[客户端请求&lt;br/&gt;GET /random]
    B[随机图逻辑服务器]
    C[读取图片索引 / 元数据]
    D[随机选择一张图片]
    E[生成图片访问地址&lt;br/&gt;R2 / IPFS / 对象存储]
    F[返回 302 重定向&lt;br/&gt;Location: 图片URL]
    G[客户端请求图片资源]
    H[对象存储 / IPFS / CDN]
    I[返回图片数据给客户端]

    A --&gt; B
    B --&gt; C
    C --&gt; D
    D --&gt; E
    E --&gt; F
    F --&gt; G
    G --&gt; H
    H --&gt; I</code>`,!0),i(l);var u=s(l,6);t(u,()=>`<code class="language-mermaid">flowchart LR

    Client[客户端]

    subgraph Logic[逻辑层（云函数 / API）]
        A[接收 /random 请求]
        B[读取图片索引]
        C[随机选择图片]
        D[生成访问地址]
        E[返回 302 重定向]
    end

    subgraph Assets[资产层（静态资源）]
        F[CDN / IPFS Gateway]
        G[对象存储&lt;br/&gt;R2 / S3 / COS]
    end

    Client --&gt; A
    A --&gt; B
    B --&gt; C
    C --&gt; D
    D --&gt; E
    E --&gt; Client

    Client --&gt; F
    F --&gt; G</code>`,!0),i(u);var d=s(u,14);t(d,()=>`<code class="language-mermaid">flowchart TB

    C1[客户端1]
    C2[客户端2]
    C3[客户端3]

    A1[请求API]
    A2[请求API]
    A3[请求API]

    F1[云函数节点1]
    F2[云函数节点2]
    F3[云函数节点3]

    R1&#123;抽选一张图片&#125;
    R2&#123;抽选一张图片&#125;
    R3&#123;抽选一张图片&#125;

    S[云函数静态资产]

    C1 --&gt; A1 --&gt; F1 --&gt; R1
    C2 --&gt; A2 --&gt; F2 --&gt; R2
    C3 --&gt; A3 --&gt; F3 --&gt; R3

    R1 --&gt; S
    R2 --&gt; S
    R3 --&gt; S</code>`,!0),i(d);var f=s(d,46);t(f,()=>`<code class="language-mermaid">flowchart TD

A[客户端请求&lt;br/&gt;GET /h]
B[Cloudflare 边缘节点]
C&#123;Transform Rules&lt;br/&gt;是否匹配?&#125;

D[Rewrite URL&lt;br/&gt;动态重写 Path]
E[按原路径处理]

F[生成随机字符串&lt;br/&gt;uuidv4 + random_seed]
G[取前三位十六进制字符&lt;br/&gt;substring 0~3]
H[拼接新路径&lt;br/&gt;/h/abc.jpg]

I[Cloudflare Pages 静态站点]
J[命中 dist/h/abc.jpg]
K[直接返回图片资源]
L[客户端接收随机图片]

A --&gt; B
B --&gt; C

C -- 是 --&gt; D
C -- 否 --&gt; E

D --&gt; F
F --&gt; G
G --&gt; H
H --&gt; I
I --&gt; J
J --&gt; K
K --&gt; L</code>`,!0),i(f);var p=s(f,16);t(p,()=>`<code class="language-mermaid">flowchart LR
  subgraph build[&quot;构建期&quot;]
    direction LR
    src[&quot;原始图片&quot;] --&gt; buildjs[&quot;build.js&quot;]
    buildjs --&gt; static[&quot;静态图片库&quot;]
    buildjs --&gt; randomjs[&quot;random.js&quot;]
  end

  subgraph runtime[&quot;运行期（浏览器）&quot;]
    direction LR
    exec[&quot;random.js 执行&quot;] --&gt; pick[&quot;随机选图&quot;] --&gt; dom[&quot;DOM 注入&quot;]
  end

  randomjs --&gt; exec
</code>`,!0),i(p),a(10),n(e,r)}export{c as t};