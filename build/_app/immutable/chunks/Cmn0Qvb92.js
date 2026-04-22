import{n as e}from"./pn1seLaS.js";import{D as t,F as n,L as r,Mt as i,jt as a,ot as o,st as s}from"./R8CaXVlq.js";import"./ZsEnWiqm.js";var c=e({default:()=>y,metadata:()=>l}),l={title:`手把手教你部署Discourse`,published:`2025-05-01T16:00:00.000Z`,description:`Discourse是一个开源的强大的论坛系统，让你马上就能拥有自己的BBS`,image:`img/2025-05-02-22-03-04-image.avif`,tags:[`Discourse`],category:`教程`,draft:!1,lang:``},{title:u,published:d,description:f,image:p,tags:m,category:h,draft:g,lang:_}=l,v=r(`<h1>正式开始</h1> <p>确保你安装了 <code>Docker</code> 和 <code>Docker-Compose</code></p> <p>选一个目录创建 <code>docker-compose.yml</code></p> <p>写入内容</p> <pre class="language-yaml"></pre> <p>需要修改的部分。配置文件中两份都要改</p> <table><thead><tr><th>需替换值</th><th>解释</th></tr></thead><tbody><tr><td>admin12345</td><td>数据库管理员密码（可选）</td></tr><tr><td>ex_discourse</td><td>数据库用户名（可选）</td></tr><tr><td>user12345</td><td>数据库用户密码（可选）</td></tr><tr><td>example_discourse</td><td>数据库名（可选）</td></tr><tr><td>redis12345</td><td>Redis 密码（可选）</td></tr><tr><td>127.0.0.1:880</td><td>映射端口（可选）</td></tr><tr><td>example.com</td><td>网站IP或域名(不加HTTP)（<strong>必改</strong>）</td></tr><tr><td>siteadmin</td><td>网站管理员用户名（<strong>必改</strong>）</td></tr><tr><td>siteadmin12345</td><td>网站管理员密码（<strong>必改</strong>）</td></tr><tr><td><a href="mailto:siteadmin@gmail.com">siteadmin@gmail.com</a></td><td>网站管理员邮箱（<strong>必改</strong>）</td></tr><tr><td>smtp.mailgun.org</td><td>邮箱HOST（<strong>必改</strong>）</td></tr><tr><td>587</td><td>邮箱端口。只能用587端口（<strong>必改</strong>）</td></tr><tr><td>邮箱用户名</td><td>邮箱用户名（<strong>必改</strong>）</td></tr><tr><td>邮箱密码</td><td>邮箱密码（或者授权码）（<strong>必改</strong>）</td></tr><tr><td>tls</td><td>邮箱协议。只能用TLS协议（<strong>必改</strong>）</td></tr></tbody></table> <p>如果需要一个支持SMTP TLS的邮箱服务可以使用<a href="/posts/exmail-qq/">微信企业邮</a></p> <p>构建：</p> <pre class="language-bash"></pre> <p>如果遇到 <code>docker.io</code> 无法访问。可以使用镜像源</p> <p>部署完毕后查看 <code>discourse-discourse-1</code> 容器的日志</p> <p>如果看到下述日志，则Discourse正在进行预编译资源，稍等几分钟即可</p> <pre class="language-undefined"></pre> <p>如果看到下述日志，证明Discourse已经在容器内3000端口启动了</p> <pre class="language-bash"></pre> <p>接下来访问你设置的域名（如果没有做解析或者网站在内网可以使用Cloudflare Tunnel曲线救国）</p> <p>访问，大功告成</p> <p><img src="img/2025-05-02-22-20-51-image.avif" alt="2025-05-02-22-20-51-image.webp"/></p>`,1);function y(e){var r=v(),c=s(o(r),8);t(c,()=>`<code class="language-yaml"><span class="token key atrule">version</span><span class="token punctuation">:</span> <span class="token string">'2'</span>
<span class="token key atrule">services</span><span class="token punctuation">:</span>
  <span class="token key atrule">postgresql</span><span class="token punctuation">:</span>
    <span class="token key atrule">image</span><span class="token punctuation">:</span> docker.io/bitnami/postgresql<span class="token punctuation">:</span><span class="token number">11</span>
    <span class="token key atrule">volumes</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> <span class="token string">'postgresql_data:/bitnami/postgresql'</span>
    <span class="token key atrule">environment</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> POSTGRESQL_POSTGRES_PASSWORD=admin12345
      <span class="token punctuation">-</span> POSTGRESQL_USERNAME=ex_discourse
      <span class="token punctuation">-</span> POSTGRESQL_PASSWORD=user12345
      <span class="token punctuation">-</span> POSTGRESQL_DATABASE=example_discourse
  <span class="token key atrule">redis</span><span class="token punctuation">:</span>
    <span class="token key atrule">image</span><span class="token punctuation">:</span> docker.io/bitnami/redis<span class="token punctuation">:</span><span class="token number">6.0</span>
    <span class="token key atrule">environment</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> REDIS_PASSWORD=redis12345
    <span class="token key atrule">volumes</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> <span class="token string">'redis_data:/bitnami/redis'</span>
  <span class="token key atrule">discourse</span><span class="token punctuation">:</span>
    <span class="token key atrule">image</span><span class="token punctuation">:</span> docker.io/bitnami/discourse<span class="token punctuation">:</span><span class="token number">2</span>
    <span class="token key atrule">ports</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> <span class="token string">'127.0.0.1:880:3000'</span>
    <span class="token key atrule">volumes</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> <span class="token string">'discourse_data:/bitnami/discourse'</span>
    <span class="token key atrule">depends_on</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> postgresql
      <span class="token punctuation">-</span> redis
    <span class="token key atrule">environment</span><span class="token punctuation">:</span>
      <span class="token comment"># 用户和站点配置</span>
      <span class="token punctuation">-</span> DISCOURSE_HOST=example.com
      <span class="token punctuation">-</span> DISCOURSE_USERNAME=siteadmin
      <span class="token punctuation">-</span> DISCOURSE_PASSWORD=siteadmin12345
      <span class="token punctuation">-</span> DISCOURSE_EMAIL=siteadmin@gmail.com
      <span class="token comment"># 数据库连接配置</span>
      <span class="token punctuation">-</span> DISCOURSE_DATABASE_HOST=postgresql
      <span class="token punctuation">-</span> DISCOURSE_DATABASE_PORT_NUMBER=5432
      <span class="token punctuation">-</span> DISCOURSE_DATABASE_USER=ex_discourse
      <span class="token punctuation">-</span> DISCOURSE_DATABASE_PASSWORD=user12345
      <span class="token punctuation">-</span> DISCOURSE_DATABASE_NAME=example_discourse
      <span class="token comment"># Redis 连接配置</span>
      <span class="token punctuation">-</span> DISCOURSE_REDIS_HOST=redis
      <span class="token punctuation">-</span> DISCOURSE_REDIS_PORT_NUMBER=6379
      <span class="token punctuation">-</span> DISCOURSE_REDIS_PASSWORD=redis12345
      <span class="token comment"># 使用 postgresql-client 为 Discourse 创建数据库</span>
      <span class="token punctuation">-</span> POSTGRESQL_CLIENT_POSTGRES_USER=postgres
      <span class="token punctuation">-</span> POSTGRESQL_CLIENT_POSTGRES_PASSWORD=admin12345
      <span class="token punctuation">-</span> POSTGRESQL_CLIENT_CREATE_DATABASE_NAME=example_discourse
      <span class="token punctuation">-</span> POSTGRESQL_CLIENT_CREATE_DATABASE_EXTENSIONS=hstore<span class="token punctuation">,</span>pg_trgm
      <span class="token comment"># SMTP</span>
      <span class="token punctuation">-</span> DISCOURSE_SMTP_HOST=smtp.mailgun.org
      <span class="token punctuation">-</span> DISCOURSE_SMTP_PORT=587
      <span class="token punctuation">-</span> DISCOURSE_SMTP_USER=邮箱用户名
      <span class="token punctuation">-</span> DISCOURSE_SMTP_PASSWORD=邮箱密码
      <span class="token punctuation">-</span> DISCOURSE_SMTP_PROTOCOL=tls或ssl
      <span class="token punctuation">-</span> DISCOURSE_SMTP_AUTH=login
  <span class="token key atrule">sidekiq</span><span class="token punctuation">:</span>
    <span class="token key atrule">image</span><span class="token punctuation">:</span> docker.io/bitnami/discourse<span class="token punctuation">:</span><span class="token number">2</span>
    <span class="token key atrule">depends_on</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> discourse
    <span class="token key atrule">volumes</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> <span class="token string">'sidekiq_data:/bitnami/discourse'</span>
    <span class="token key atrule">command</span><span class="token punctuation">:</span> /opt/bitnami/scripts/discourse<span class="token punctuation">-</span>sidekiq/run.sh
    <span class="token key atrule">environment</span><span class="token punctuation">:</span>
      <span class="token comment"># 用户和站点配置</span>
      <span class="token punctuation">-</span> DISCOURSE_HOST=example.com
      <span class="token punctuation">-</span> DISCOURSE_USERNAME=siteadmin
      <span class="token punctuation">-</span> DISCOURSE_PASSWORD=siteadmin12345
      <span class="token punctuation">-</span> DISCOURSE_EMAIL=siteadmin@gmail.com
      <span class="token comment"># 数据库连接配置</span>
      <span class="token punctuation">-</span> DISCOURSE_DATABASE_HOST=postgresql
      <span class="token punctuation">-</span> DISCOURSE_DATABASE_PORT_NUMBER=5432
      <span class="token punctuation">-</span> DISCOURSE_DATABASE_USER=ex_discourse
      <span class="token punctuation">-</span> DISCOURSE_DATABASE_PASSWORD=user12345
      <span class="token punctuation">-</span> DISCOURSE_DATABASE_NAME=example_discourse
      <span class="token comment"># Redis 连接配置</span>
      <span class="token punctuation">-</span> DISCOURSE_REDIS_HOST=redis
      <span class="token punctuation">-</span> DISCOURSE_REDIS_PORT_NUMBER=6379
      <span class="token punctuation">-</span> DISCOURSE_REDIS_PASSWORD=redis12345
      <span class="token comment"># SMTP</span>
      <span class="token punctuation">-</span> DISCOURSE_SMTP_HOST=smtp.mailgun.org
      <span class="token punctuation">-</span> DISCOURSE_SMTP_PORT=587
      <span class="token punctuation">-</span> DISCOURSE_SMTP_USER=邮箱用户名
      <span class="token punctuation">-</span> DISCOURSE_SMTP_PASSWORD=邮箱密码
      <span class="token punctuation">-</span> DISCOURSE_SMTP_PROTOCOL=tls或ssl
      <span class="token punctuation">-</span> DISCOURSE_SMTP_AUTH=login
<span class="token key atrule">volumes</span><span class="token punctuation">:</span>
  <span class="token key atrule">postgresql_data</span><span class="token punctuation">:</span>
    <span class="token key atrule">driver</span><span class="token punctuation">:</span> local
  <span class="token key atrule">redis_data</span><span class="token punctuation">:</span>
    <span class="token key atrule">driver</span><span class="token punctuation">:</span> local
  <span class="token key atrule">discourse_data</span><span class="token punctuation">:</span>
    <span class="token key atrule">driver</span><span class="token punctuation">:</span> local
  <span class="token key atrule">sidekiq_data</span><span class="token punctuation">:</span>
    <span class="token key atrule">driver</span><span class="token punctuation">:</span> local</code>`,!0),i(c);var l=s(c,10);t(l,()=>`<code class="language-bash"><span class="token function">docker</span> compose up <span class="token parameter variable">-d</span></code>`,!0),i(l);var u=s(l,8);t(u,()=>`<code class="language-undefined">INFO  ==&gt; Precompiling assets, this may take some time...</code>`,!0),i(u);var d=s(u,4);t(d,()=>`<code class="language-bash">Accessible via: http://0.0.0.0:3000/</code>`,!0),i(d),a(6),n(e,r)}export{c as t};