import{n as e}from"./pn1seLaS.js";import{D as t,F as n,L as r,Mt as i,ot as a,st as o}from"./R8CaXVlq.js";import"./ZsEnWiqm.js";var s=e({default:()=>_,metadata:()=>c}),c={title:`配置 Vercel.json 以支持服务器级别的重定向`,published:`2025-09-01T22:33:27.000Z`,description:`如果你的站点（无论静态/动态）正在使用Vercel，则配置重定向是一件非常轻松的事情`,image:`img/2025-09-02-06-34-54-image.avif`,tags:[`Vercel`,`重定向`],draft:!1,lang:``},{title:l,published:u,description:d,image:f,tags:p,draft:m,lang:h}=c,g=r(`<h1>正式开始</h1> <blockquote><p>官方文档： <a href="https://vercel.com/docs/redirects" rel="nofollow">Redirects</a></p></blockquote> <p>在你的仓库根目录创建 <code>vercel.json</code> 写入重定向规则</p> <p><code>source</code> 为要重定向的路径，<code>destination</code> 为重定向到的路径/URL，<code>permanent</code> 为一个可选的布尔值，用于在永久重定向和临时重定向之间切换（默认为\xA0<code>true</code>）。当\xA0<code>true</code>\xA0时，状态代码为\xA0<a href="https://developer.mozilla.org/docs/Web/HTTP/Status/308" rel="nofollow">308</a>。当\xA0<code>false</code>\xA0时，状态代码为\xA0<a href="https://developer.mozilla.org/docs/Web/HTTP/Status/307" rel="nofollow">307</a>。</p> <pre class="language-json"></pre>`,1);function _(e){var r=g(),s=o(a(r),8);t(s,()=>`<code class="language-json"><span class="token punctuation">&#123;</span>
  <span class="token property">"redirects"</span><span class="token operator">:</span> <span class="token punctuation">[</span>
    <span class="token punctuation">&#123;</span>
      <span class="token property">"source"</span><span class="token operator">:</span> <span class="token string">"/ak"</span><span class="token punctuation">,</span>
      <span class="token property">"destination"</span><span class="token operator">:</span> <span class="token string">"https://akile.io/register?aff_code=503fe5ea-e7c5-4d68-ae05-6de99513680e"</span><span class="token punctuation">,</span>
      <span class="token property">"permanent"</span><span class="token operator">:</span> <span class="token boolean">false</span>
    <span class="token punctuation">&#125;</span><span class="token punctuation">,</span>
    <span class="token punctuation">&#123;</span>
      <span class="token property">"source"</span><span class="token operator">:</span> <span class="token string">"/kook"</span><span class="token punctuation">,</span>
      <span class="token property">"destination"</span><span class="token operator">:</span> <span class="token string">"https://kook.vip/K29zpT"</span><span class="token punctuation">,</span>
      <span class="token property">"permanent"</span><span class="token operator">:</span> <span class="token boolean">false</span>
    <span class="token punctuation">&#125;</span><span class="token punctuation">,</span>
    <span class="token punctuation">&#123;</span>
      <span class="token property">"source"</span><span class="token operator">:</span> <span class="token string">"/long"</span><span class="token punctuation">,</span>
      <span class="token property">"destination"</span><span class="token operator">:</span> <span class="token string">"https://iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii.iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii.in/"</span><span class="token punctuation">,</span>
      <span class="token property">"permanent"</span><span class="token operator">:</span> <span class="token boolean">false</span>
    <span class="token punctuation">&#125;</span><span class="token punctuation">,</span>
    <span class="token punctuation">&#123;</span>
      <span class="token property">"source"</span><span class="token operator">:</span> <span class="token string">"/mly"</span><span class="token punctuation">,</span>
      <span class="token property">"destination"</span><span class="token operator">:</span> <span class="token string">"https://muleyun.com/aff/GOTRJLPN"</span><span class="token punctuation">,</span>
      <span class="token property">"permanent"</span><span class="token operator">:</span> <span class="token boolean">false</span>
    <span class="token punctuation">&#125;</span><span class="token punctuation">,</span>
    <span class="token punctuation">&#123;</span>
      <span class="token property">"source"</span><span class="token operator">:</span> <span class="token string">"/tg"</span><span class="token punctuation">,</span>
      <span class="token property">"destination"</span><span class="token operator">:</span> <span class="token string">"https://t.me/+_07DERp7k1ljYTc1"</span><span class="token punctuation">,</span>
      <span class="token property">"permanent"</span><span class="token operator">:</span> <span class="token boolean">false</span>
    <span class="token punctuation">&#125;</span><span class="token punctuation">,</span>
    <span class="token punctuation">&#123;</span>
      <span class="token property">"source"</span><span class="token operator">:</span> <span class="token string">"/tit"</span><span class="token punctuation">,</span>
      <span class="token property">"destination"</span><span class="token operator">:</span> <span class="token string">"/posts/pin/"</span><span class="token punctuation">,</span>
      <span class="token property">"permanent"</span><span class="token operator">:</span> <span class="token boolean">false</span>
    <span class="token punctuation">&#125;</span><span class="token punctuation">,</span>
    <span class="token punctuation">&#123;</span>
      <span class="token property">"source"</span><span class="token operator">:</span> <span class="token string">"/tly"</span><span class="token punctuation">,</span>
      <span class="token property">"destination"</span><span class="token operator">:</span> <span class="token string">"https://tianlicloud.cn/aff/HNNCFKGP"</span><span class="token punctuation">,</span>
      <span class="token property">"permanent"</span><span class="token operator">:</span> <span class="token boolean">false</span>
    <span class="token punctuation">&#125;</span><span class="token punctuation">,</span>
    <span class="token punctuation">&#123;</span>
      <span class="token property">"source"</span><span class="token operator">:</span> <span class="token string">"/wly"</span><span class="token punctuation">,</span>
      <span class="token property">"destination"</span><span class="token operator">:</span> <span class="token string">"https://wl.awcmam.com/#/register?code=FNQwOQBM"</span><span class="token punctuation">,</span>
      <span class="token property">"permanent"</span><span class="token operator">:</span> <span class="token boolean">false</span>
    <span class="token punctuation">&#125;</span><span class="token punctuation">,</span>
    <span class="token punctuation">&#123;</span>
      <span class="token property">"source"</span><span class="token operator">:</span> <span class="token string">"/yyb"</span><span class="token punctuation">,</span>
      <span class="token property">"destination"</span><span class="token operator">:</span> <span class="token string">"https://www.rainyun.com/acofork_?s=bilibili"</span><span class="token punctuation">,</span>
      <span class="token property">"permanent"</span><span class="token operator">:</span> <span class="token boolean">false</span>
    <span class="token punctuation">&#125;</span>
  <span class="token punctuation">]</span>
<span class="token punctuation">&#125;</span></code>`,!0),i(s),n(e,r)}export{s as t};