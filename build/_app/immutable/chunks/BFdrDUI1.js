import{n as e}from"./pn1seLaS.js";import{D as t,F as n,L as r,Mt as i,jt as a,ot as o,st as s}from"./R8CaXVlq.js";import"./ZsEnWiqm.js";var c=e({default:()=>y,metadata:()=>l}),l={category:`教程`,description:`使用R2存储图片，通过Workers连接，最后使用a标签或img标签在网页中嵌入展示，全链路上云`,draft:!1,image:`img/QmVgqgoC7G8NLS21WvR8j9gf5amu33XvuV68ZrgM5B9iFf.avif`,lang:``,published:`2025-03-04T16:00:00.000Z`,tags:[`Cloudflare R2`,`Cloudflare Workers`],title:`Cloudflare R2+Workers！马上搭建自己的云上图床！`},{category:u,description:d,draft:f,image:p,lang:m,published:h,tags:g,title:_}=l,v=r(`<h3><strong>结果图</strong></h3> <p><img src="img/408795f3ec1a5a9baf91b6cd7564d6f1d7dbc5bd.avif" alt="QmVgqgoC7G8NLS21WvR8j9gf5amu33XvuV68ZrgM5B9iFf.webp"/></p> <h3><strong>原理</strong></h3> <p>图源由 Cloudflare R2 托管，通过两个 Workers 连接 R2 以展示随机横屏/竖屏图片，静态页面引用 Workers 的 URL 以实现以上界面</p> <h3><strong>创建 Cloudflare R2 存储桶</strong></h3> <p>R2 实际上是一个对象存储。Cloudflare 提供 10G 的免费存储和每月 1000 万次的免费访问</p> <ol><li><p>进入<a href="https://dash.cloudflare.com/" rel="nofollow">Cloudflare 仪表盘</a>，进入 R2 页面，如图</p> <p><img src="img/0ffb86d36ab0f3fcc24ef7b3d64c4bc72b6b53e7.avif" alt="QmU7u2JHUcevyHnwsCdAZfs7X7Fcdh3KJhn6eoy24Q5dGC.webp"/></p></li> <li><p>选择创建存储桶<img src="img/26d3b3e26b9e2f641a2eea98c2ddb8891a0b7f6a.avif" alt="QmX3eCaCVEgE8AN29D9t2VpQ5t5SrZGKb8EcZv9oKpCqf2.webp"/></p></li> <li><p>为你的存储桶起一个名字，然后单击创建<img src="img/7fa96a023d7969ab168d467ab6d05646e5241884.avif" alt="QmVad5eoJCLpSNZ4HCvTPJfD8rpg4aePMzZ7j2DZATn1XD.webp"/></p></li> <li><p>进入如下页面就已经创建完毕了<img src="img/719f2dfe59c73fa820ffc6cc2d9749ca14b9bece.avif" alt="QmSdzwBJpw2L4a8LJ3eM3VMJs3d5oV5iFCxCMtv69VZmYH.webp"/></p></li> <li><p>返回 R2 首页。因为在下文我们需要使用 API 来进行文件传输，所以需要创建你的 R2 API 令牌，单击管理 R2 API 令牌<img src="img/9b1a338acae642ce7ce71dd41454903b1cfeafd0.avif" alt="QmbS8zjJTESwsmycKBSC9kmabAA9dtSCUX8nbUDWg4BWRX.webp"/></p></li> <li><p>单击创建 API 令牌，如图<img src="img/9512f23e08a60948e721848118f5eb096449909b.avif" alt="QmPzJEHVAm4z3S1SHY4k99TugrPyTB9DXpyRR8Loj22bz3.webp"/></p></li> <li><p>因为我们需要该 API 来管理单个 R2 存储桶，所以选择<strong>对象读和写</strong>，详细配置如图<img src="img/0361e2b00351559eaebb18f3e6bb15a94b8578e9.avif" alt="QmNY9p8hksi18B9R8TVfdGgu336oQ3cPmghyfYXE9CDGD4.webp"/></p></li> <li><p>创建 API 令牌后，新页面会展示令牌的详细信息，<strong>仅会展示一次！！！</strong> 保持这个页面，直到你将该页面的所有信息都已经妥善保存，不要关闭界面，否则，你需要轮转 API 令牌以禁用之前的旧密钥，如图<img src="img/f4214f6fdf67fa7bf694d0a1501ecc21aef45a90.avif" alt="QmZTUwbycqbJhVP6PatD3psYy7ej9PDDoiXbmDWoakPhwx.webp"/></p></li> <li><p>确保你已经妥善保存你的 R2 API 令牌，然后进行下一步</p></li></ol> <h3><strong>为你的存储桶添加文件</strong></h3> <p>因为 Web 界面传输文件较慢且不支持传输大于 300MB 的文件。这里使用本地部署 AList 然后连接你的 R2 存储桶实现高速上传</p> <ol><li><p>笔者使用 Windows。前往<a href="https://github.com/alist-org/alist/releases" rel="nofollow">AList - Github Release</a>下载适用于 Windows 的最新可执行文件，如图<img src="img/a2d1f289e464a9fb6367e2b7ff0b695916742698.avif" alt="QmPDRDJGeGStreyZMXVYofbE9FCs1T1MyDek3KUbB3Kk5b.webp"/></p></li> <li><p>将下载的压缩包解压，并将其中的<code>alist.exe</code>放入一个空文件夹</p></li> <li><p>单击搜索框，输入 cmd 并回车，如图</p></li> <li><p><img src="img/3abdda195c58812866d49879c683a044e8acf7f8.avif" alt="QmSt8aFtaeEprJHASEiNPB67UHcHoSxsbhhHUPxW6QkWSo.webp"/></p> <p><img src="img/f90fccfe1db62aff7a0a722cd3c5c319da563ae2.avif" alt="QmNkMhDhpPLkYCpVhE1ov7Q6A34uWDvraCqNvuTqaCkujT.webp"/></p> <p>在 cmd 中输入<code>alist.exe server</code>并且不要关闭窗口，运行成功后如图<img src="img/2c0ec8fb4de7f2a9a1b8107e3506cb5a8d7d7eff.avif" alt="QmdzyY8xbic8jdnZEXegefoZPeizqHa4ZkdMnRKoguBMkf.webp"/></p></li> <li><p>打开浏览器，输入<code>localhost:5244</code>即可进入 AList 控制台，如图<img src="img/867fe02a124c886777d4ba64f6d1e4498c686709.avif" alt="QmUBFKu7mCiRneCrsTNPxTH6S4gxwtXf9cwLzf4dKW9LLR.webp"/></p></li> <li><p>用户名：<code>admin</code>密码：<code>在cmd窗口中，如图</code>。你可以使用鼠标左键在终端中框选内容然后单击鼠标右键进行复制操作<img src="img/8cedc3475cd8358507587de8a6b2a91980fe9af4.avif" alt="QmVH3qZYo3QE6anNHymwkikq5MSeJphrZNR7RCH5jpP3wn.webp"/></p></li> <li><p>注意，在 cmd 中，鼠标左键点击或拖动 cmd 的终端界面会导致进入选择状态，程序将会被系统阻塞，<strong>需要在终端界面点按鼠标右键解除</strong>。若进程被阻塞，cmd 的进程名会多一个<strong>选择</strong>，请注意。如图是程序被阻塞的例子，<strong>在终端界面点按鼠标右键即可解除</strong> <img src="img/afb945ff610c0463ee0db97f52bc42a865b00603.avif" alt="QmapESiqSEvbYq3AJs15yYvhemRxSHrJaccjTFr99muX6Z.webp"/></p></li> <li><p>现在，你已经成功以管理员身份登入了 AList单击最下面的<strong>管理</strong><img src="img/eb0c3753205f42133445dfcee5f1291debd6c649.avif" alt="QmfNE53GThdjVrh4q64MJcZqwcGPD7UtcYTNw9bVBaSEaF.webp"/></p></li> <li><p>你会进入到如图界面。尽管 AList 运行在本地，也建议更改你的用户名和密码<img src="img/3bde577194580e4d17aa457231360733175e2b0d.avif" alt="QmNdD8UU8fkVDBz5dXdJhCF2fZg8P1FwrcMaaTsG6a7ENy.webp"/></p></li> <li><p>更改账密，重新以新账密登录<img src="img/a5ba3b6cc73002f3e96b6aab8c4e252f697802da.avif" alt="Qmas7pMiPR2FNTXheBT1xGNUpzDiSzv7J7yd6oCuT17yad.webp"/></p></li> <li><p>进入控制台，然后单击存储，如图<img src="img/bb8fc961e43dffa99994c0d0e703ba98fc01b85a.avif" alt="QmS4gGyCM1j3RXgHEPuZ1zTbLAvGtVBEiPXJe9QMF3dD2D.webp"/></p></li> <li><p>选择添加，如图<img src="img/2807d1dbc07fed008c8177cd3b2b89bfd03cc8be.avif" alt="QmRDVxt8WbrVkHavgFNXj3qC86ysw6sSZhPy3Uf2ixKp2E.webp"/></p></li> <li><p>详细配置如图。挂载路径即 AList 展示路径，推荐使用<code>/R2/你的存储桶名字</code>，地区为<code>auto</code><img src="img/2024-10-16-11-37-53-image.avif"/>回到主页，如图<img src="img/65265d29e91f146ecbe3d92218eb9af49eac1c8b.avif" alt="QmSnR9Ptrssx4nqk9qCvhFUNKQyQqJiN7GRscwoj4Dczgj.webp"/></p></li> <li><p>尝试上传文件，如图<img src="img/061c995a66c34ebc341f692d4eb82d5657d791d6.avif" alt="QmPqFsmZNNnh4jNyLS7X3h8Zr6ZCVqTqGVwTxmPDdbmrGW.webp"/></p></li> <li><p>可以看到，速度非常快<img src="img/51d0a617cbda108ce6c12fb25f71fb5223a0cddb.avif" alt="QmXfGK6aZjz741GrY8RfFfKMkUzDMB3xhx93PGZ9S1QycT.webp"/></p></li> <li><p>为你的图床创建目录以分类横屏和竖屏图等，以便下文使用 Workers 连接 R2 来调用。后文我将使用R2的<code>/ri/h</code> 路径作为横屏随机图目录、<code>/ri/v</code> 路径作为竖屏随机图目录</p></li></ol> <p><img src="img/3bde577194580e4d17aa457231360733175e2b0d.avif" alt="QmNdD8UU8fkVDBz5dXdJhCF2fZg8P1FwrcMaaTsG6a7ENy.webp"/></p> <h3><strong>创建 Workers，连接 R2</strong></h3> <ol><li><p>进入<a href="https://dash.cloudflare.com/" rel="nofollow">Cloudflare 仪表盘</a>，进入 Workers 和 Pages 页面，如图<img src="img/49ccd51771082fdc94eecb270caf987d257cd987.avif" alt="QmW5UaUap8T2R37u5dzmKGLmUgk4qKnSMFwHBVHqvVbkVA.webp"/></p></li> <li><p>单击创建，选择创建 Workers，名称自取，单击部署<img src="img/95102dd09752a103d8022b1f281538e729b7a448.avif" alt="QmVvLv5n41QQfDfYiVWYRpsfw7TVNGy1BYuv5e8vBRhKLA.webp"/></p></li> <li><p>选择编辑代码<img src="img/fa78af856b3ff3798c77a55be15b2644dec944c1.avif" alt="QmTbRifzXQ593DGyjFQMbA9exyNp2iAeAg4zbVrfFimQc4.webp"/></p></li> <li><p>粘贴代码（创建随机横屏图）：</p></li></ol> <p>新代码：</p> <pre class="language-undefined"></pre> <p>旧代码：</p> <pre class="language-undefined"></pre> <ol start="5"><li><p>点击左侧的文件图标<img src="img/b02f29fbafb44ad36a0fa770d013069a374394a8.avif" alt="QmQGQTiTXSESU2TSJ6tc3KrzWU4KABKqn6QZ1GdWqKnWmc.webp"/></p></li> <li><p>在<code>wrangler.toml</code>中填入：</p></li></ol> <pre class="language-undefined"></pre> <ol start="7"><li><p>保存修改，点击右上角的部署<img src="img/6751c7b5122b938e01087d1bed629fcad1182a10.avif" alt="QmP7hXdtenrJrzJRRePHQATGtyAsZEr5MkMsboXvmNUxTx.webp"/></p></li> <li><p>在设置 - 变量找到 R2 存储桶绑定，添加你的存储桶，变量名即上文的<code>MY_BUCKET</code><img src="img/572f1c9946b5b6de5350c708e579d9887949b6e9.avif" alt="QmStitSyATnA8sY9tTgZaXXqmqkGPUtZmMxn9KjbFQzgTc.webp"/></p></li> <li><p>在设置 - 触发器添加你的自定义域名以便访问<img src="img/706b3acbb372307713e38c96fc867f4e96234fd7.avif" alt="QmUMxtkCiKsgFw8afRUGREFztXE9D5W6FmCbAUB7DaVH5o.webp"/></p> <p><img src="img/1a6fa505881591a294f0b4ef4a1940e40fe57ab9.avif" alt="QmPF9iCoq6n8Jj2Z6kPkdJSCm45VJystZoYcir55yceCQo.webp"/></p></li> <li><p>访问效果，每次刷新都不一样<img src="img/0ba1efee8174e0d3db761bbd613a7b94b9738cee.avif" alt="QmQgEdjXxF9oph2jYKzFMJToX9WfG11jUmPiNJnjhYVN4N.webp"/></p></li></ol> <h3><strong>通过使用 HTML 的 <code>&lt;img&gt;</code> 标签引用即可达到开头的效果</strong></h3> <p>如：<code>&lt;img src="你的域名" alt=""&gt;</code></p> <img title="" src="https://hpic.072103.xyz" alt="loading-ag-4760"/>`,1);function y(e){var r=v(),c=s(o(r),28);t(c,()=>`<code class="language-undefined">export default &#123;
  async fetch(request, env, ctx) &#123;
    const bucket = env.MY_BUCKET;
    const url = new URL(request.url);
    const hostname = url.hostname;

    // 初始化prefix
    let prefix = &#39;&#39;;
    
    // 根据域名判断prefix
    if (hostname === &#39;hpic.072103.xyz&#39; || hostname === &#39;api-hpic.072103.xyz&#39;) &#123;
      prefix = &#39;ri/h/&#39;;
    &#125; else if (hostname === &#39;vpic.072103.xyz&#39; || hostname === &#39;api-vpic.072103.xyz&#39;) &#123;
      prefix = &#39;ri/v/&#39;;
    &#125; else &#123;
      return new Response(&#39;Invalid domain&#39;, &#123; status: 400 &#125;);
    &#125;

    try &#123;
      // 如果是API域名，只返回数量
      if (hostname.startsWith(&#39;api-&#39;)) &#123;
        const objects = await bucket.list(&#123; prefix: prefix &#125;);
        const count = objects.objects.length;
        const headers = new Headers(&#123;
          &#39;Access-Control-Allow-Origin&#39;: &#39;*&#39;,
          &#39;Content-Type&#39;: &#39;text/plain&#39;
        &#125;);
        return new Response(count.toString(), &#123; headers &#125;);
      &#125;

      // 原有的随机图片逻辑
      const objects = await bucket.list(&#123; prefix: prefix &#125;);
      const items = objects.objects;
      
      if (items.length === 0) &#123;
        return new Response(&#39;No images found&#39;, &#123; status: 404 &#125;);
      &#125;
      
      const randomItem = items[Math.floor(Math.random() * items.length)];
      const object = await bucket.get(randomItem.key);

      if (!object) &#123;
        return new Response(&#39;Image not found&#39;, &#123; status: 404 &#125;);
      &#125;

      const headers = new Headers();
      headers.set(&#39;Content-Type&#39;, object.httpMetadata.contentType || &#39;image/jpeg&#39;);

      return new Response(object.body, &#123; headers &#125;);
    &#125; catch (error) &#123;
      console.error(&#39;Error:&#39;, error);
      return new Response(&#39;Internal Server Error&#39;, &#123; status: 500 &#125;);
    &#125;
  &#125;,
&#125;;</code>`,!0),i(c);var l=s(c,4);t(l,()=>`<code class="language-undefined">export default &#123;
  async fetch(request, env, ctx) &#123;
    // R2 bucket 配置
    const bucket = env.MY_BUCKET;

    try &#123;
      // 列出 /ri/h 目录下的所有对象
      const objects = await bucket.list(&#123; prefix: &#39;ri/h/&#39; &#125;);

      // 从列表中随机选择一个对象
      const items = objects.objects;
      if (items.length === 0) &#123;
        return new Response(&#39;No images found&#39;, &#123; status: 404 &#125;);
      &#125;
      const randomItem = items[Math.floor(Math.random() * items.length)];

      // 获取选中对象
      const object = await bucket.get(randomItem.key);

      if (!object) &#123;
        return new Response(&#39;Image not found&#39;, &#123; status: 404 &#125;);
      &#125;

      // 设置适当的 Content-Type
      const headers = new Headers();
      headers.set(&#39;Content-Type&#39;, object.httpMetadata.contentType || &#39;image/jpeg&#39;);

      // 返回图片内容
      return new Response(object.body, &#123; headers &#125;);
    &#125; catch (error) &#123;
      console.error(&#39;Error:&#39;, error);
      return new Response(&#39;Internal Server Error&#39;, &#123; status: 500 &#125;);
    &#125;
  &#125;,
&#125;;</code>`,!0),i(l);var u=s(l,4);t(u,()=>`<code class="language-undefined">[[r2_buckets]]
binding = &quot;MY_BUCKET&quot;
bucket_name = &quot;114514&quot;</code>`,!0),i(u),a(8),n(e,r)}export{c as t};