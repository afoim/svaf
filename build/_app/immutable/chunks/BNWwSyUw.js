import{n as e}from"./pn1seLaS.js";import{D as t,F as n,L as r,Mt as i,jt as a,ot as o,st as s}from"./R8CaXVlq.js";import"./ZsEnWiqm.js";var c=e({default:()=>y,metadata:()=>l}),l={title:`QQ微信不够私密？自建自己的聊天服务器！`,published:`2025-08-01T16:00:00.000Z`,description:`通过自建Synapse，用户可以通过Element等软件来直接在你的服务器上聊天`,image:`img/2025-08-02-17-20-32-image.avif`,tags:[`Matrix`,`Synapse`],category:`教程`,draft:!1,lang:``},{title:u,published:d,description:f,image:p,tags:m,category:h,draft:g,lang:_}=l,v=r(`<h1>前置环境准备</h1> <p>由于Synapse、Matrix（下文简称”矩阵“）手搓部署非常麻烦。所以请安装 <strong>1Panel面板</strong></p> <h1>部署PostgreSQL</h1> <p>安装并创建名为 <code>synapse</code> 用户名也为 <code>synapse</code> 的数据库</p> <p>前往应用商店安装 <code>PGAdmin4</code></p> <p><img src="img/2025-08-02-17-24-58-image.avif"/></p> <p>接着点击添加服务器</p> <p><img src="img/2025-08-02-17-27-10-image.avif"/></p> <p>相关信息可以在连接信息看到</p> <p><img src="img/2025-08-02-17-27-53-image.avif"/></p> <p><strong>删除</strong>刚刚创建的 <code>synapse</code> 这个数据库</p> <p><img src="img/2025-08-02-17-28-49-image.avif"/></p> <p>重新创建同名数据库</p> <p>设置所有者（即用户名）为 <code>synapse</code></p> <p><img src="img/2025-08-02-17-29-36-image.avif"/></p> <p>将 <code>排序规则</code> 和 <code>字符类型</code> 都改为 <code>C</code></p> <p><img src="img/2025-08-02-17-30-34-image.avif"/></p> <h1>部署Synapse</h1> <p>首先参照1Panel官方的教程去创建一个存储卷，否则安装 <code>synapse</code> 会失败</p> <p><img src="img/2025-08-02-17-32-00-image.avif"/></p> <p>安装 <code>synapse</code></p> <p>导航到文件管理： <code>/var/lib/docker/volumes/synapse-data/_data</code></p> <p>你应该可以看到</p> <p><img src="img/2025-08-02-17-33-50-image.avif"/></p> <p>编辑 <code>homeserver.yaml</code> ，并按需配置</p> <pre class="language-yaml"></pre> <p>按需配置，更多高级配置参阅： <a href="https://element-hq.github.io/synapse/latest/usage/configuration/homeserver_sample_config.html" rel="nofollow">Homeserver Sample Config File - Synapse</a></p> <h1>创建管理员账号</h1> <p>连接上容器的终端然后输入这串命令创建管理员账号</p> <pre class="language-bash"></pre> <h1>开始聊天</h1> <p>前往 <a href="https://app.element.io" rel="nofollow">https://app.element.io</a> 将家服务器改为你的（必须为HTTPS）</p> <p>通过刚刚创建的管理员账号登录</p> <p>其他人可以通过邮箱注册</p>`,1);function y(e){var r=v(),c=s(o(r),50);t(c,()=>`<code class="language-yaml"><span class="token key atrule">server_name</span><span class="token punctuation">:</span> <span class="token string">"家服务器名称，比如：m.2x.nz"</span>
<span class="token key atrule">public_baseurl</span><span class="token punctuation">:</span> <span class="token string">"公共URL，比如：https://m.2x.nz"</span>
<span class="token key atrule">pid_file</span><span class="token punctuation">:</span> /data/homeserver.pid

<span class="token key atrule">serve_server_wellknown</span><span class="token punctuation">:</span> <span class="token boolean important">true</span> <span class="token comment"># 启用联邦</span>

<span class="token key atrule">listeners</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> <span class="token key atrule">port</span><span class="token punctuation">:</span> <span class="token number">8008</span>
    <span class="token key atrule">tls</span><span class="token punctuation">:</span> <span class="token boolean important">false</span>
    <span class="token key atrule">type</span><span class="token punctuation">:</span> http
    <span class="token key atrule">x_forwarded</span><span class="token punctuation">:</span> <span class="token boolean important">true</span>
    <span class="token key atrule">resources</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> <span class="token key atrule">names</span><span class="token punctuation">:</span> <span class="token punctuation">[</span>client<span class="token punctuation">,</span> federation<span class="token punctuation">]</span>
        <span class="token key atrule">compress</span><span class="token punctuation">:</span> <span class="token boolean important">false</span>
    <span class="token key atrule">response_headers</span><span class="token punctuation">:</span>
      <span class="token key atrule">Access-Control-Allow-Origin</span><span class="token punctuation">:</span> <span class="token string">"https://app.element.io"</span>
      <span class="token key atrule">Access-Control-Allow-Methods</span><span class="token punctuation">:</span> <span class="token string">"GET, POST, OPTIONS"</span>
      <span class="token key atrule">Access-Control-Allow-Headers</span><span class="token punctuation">:</span> <span class="token string">"Content-Type, Authorization"</span>

<span class="token key atrule">database</span><span class="token punctuation">:</span>
  <span class="token key atrule">name</span><span class="token punctuation">:</span> psycopg2
  <span class="token key atrule">args</span><span class="token punctuation">:</span>
    <span class="token key atrule">user</span><span class="token punctuation">:</span> synapse
    <span class="token key atrule">password</span><span class="token punctuation">:</span> 你的数据库密码
    <span class="token key atrule">dbname</span><span class="token punctuation">:</span> synapse
    <span class="token key atrule">host</span><span class="token punctuation">:</span> 你的PostgreSQL的容器名称
    <span class="token key atrule">cp_min</span><span class="token punctuation">:</span> <span class="token number">5</span>
    <span class="token key atrule">cp_max</span><span class="token punctuation">:</span> <span class="token number">10</span>

<span class="token key atrule">log_config</span><span class="token punctuation">:</span> <span class="token string">"/data/my.matrix.host.log.config"</span>
<span class="token key atrule">media_store_path</span><span class="token punctuation">:</span> /data/media_store

<span class="token key atrule">registration_shared_secret</span><span class="token punctuation">:</span> <span class="token string">"这里的东西是随机生成的，每个人都不一样，请忽略这一块，并使用你的配置"</span>
<span class="token key atrule">macaroon_secret_key</span><span class="token punctuation">:</span> <span class="token string">"这里的东西是随机生成的，每个人都不一样，请忽略这一块，并使用你的配置"</span>
<span class="token key atrule">form_secret</span><span class="token punctuation">:</span> <span class="token string">"这里的东西是随机生成的，每个人都不一样，请忽略这一块，并使用你的配置"</span>
<span class="token key atrule">signing_key_path</span><span class="token punctuation">:</span> <span class="token string">"/data/my.matrix.host.signing.key"</span>

<span class="token key atrule">report_stats</span><span class="token punctuation">:</span> <span class="token boolean important">false</span>

<span class="token key atrule">trusted_key_servers</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> <span class="token key atrule">server_name</span><span class="token punctuation">:</span> <span class="token string">"matrix.org"</span>

<span class="token comment"># Github OAuth</span>
<span class="token key atrule">oidc_providers</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> <span class="token key atrule">idp_id</span><span class="token punctuation">:</span> github
    <span class="token key atrule">idp_name</span><span class="token punctuation">:</span> Github
    <span class="token key atrule">idp_brand</span><span class="token punctuation">:</span> <span class="token string">"github"</span>  <span class="token comment"># optional: styling hint for clients</span>
    <span class="token key atrule">discover</span><span class="token punctuation">:</span> <span class="token boolean important">false</span>
    <span class="token key atrule">issuer</span><span class="token punctuation">:</span> <span class="token string">"https://github.com/"</span>
    <span class="token key atrule">client_id</span><span class="token punctuation">:</span> <span class="token string">"Ov23liaHxxYHybb0jRoZ"</span> <span class="token comment"># TO BE FILLED</span>
    <span class="token key atrule">client_secret</span><span class="token punctuation">:</span> <span class="token string">"e937f214ea7c132924ab34c76d83f4b7099d696e"</span> <span class="token comment"># TO BE FILLED</span>
    <span class="token key atrule">authorization_endpoint</span><span class="token punctuation">:</span> <span class="token string">"https://github.com/login/oauth/authorize"</span>
    <span class="token key atrule">token_endpoint</span><span class="token punctuation">:</span> <span class="token string">"https://github.com/login/oauth/access_token"</span>
    <span class="token key atrule">userinfo_endpoint</span><span class="token punctuation">:</span> <span class="token string">"https://api.github.com/user"</span>
    <span class="token key atrule">scopes</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">"read:user"</span><span class="token punctuation">]</span>
    <span class="token key atrule">user_mapping_provider</span><span class="token punctuation">:</span>
      <span class="token key atrule">config</span><span class="token punctuation">:</span>
        <span class="token key atrule">subject_claim</span><span class="token punctuation">:</span> <span class="token string">"id"</span>
        <span class="token key atrule">localpart_template</span><span class="token punctuation">:</span> <span class="token string">"&#123;&#123; user.login &#125;&#125;"</span>
        <span class="token key atrule">display_name_template</span><span class="token punctuation">:</span> <span class="token string">"&#123;&#123; user.name &#125;&#125;"</span>

<span class="token comment">### ✅ 邮件配置（确保SMTP验证正常）</span>
<span class="token key atrule">email</span><span class="token punctuation">:</span>
  <span class="token key atrule">smtp_host</span><span class="token punctuation">:</span> <span class="token string">"你的SMTP发件服务器"</span>
  <span class="token key atrule">smtp_port</span><span class="token punctuation">:</span> <span class="token number">465</span>
  <span class="token key atrule">smtp_user</span><span class="token punctuation">:</span> <span class="token string">"你的发件邮箱"</span>
  <span class="token key atrule">smtp_pass</span><span class="token punctuation">:</span> <span class="token string">"你的SMTP密码"</span>
  <span class="token key atrule">force_tls</span><span class="token punctuation">:</span> <span class="token boolean important">true</span>
  <span class="token key atrule">notif_from</span><span class="token punctuation">:</span> <span class="token string">"Matrix &lt;你的发件邮箱>"</span>
  <span class="token key atrule">validation_token_lifetime</span><span class="token punctuation">:</span> <span class="token string">"5m"</span>

<span class="token comment">### ✅ 启用注册 + 邮箱验证 + 密码找回</span>
<span class="token key atrule">enable_registration</span><span class="token punctuation">:</span> <span class="token boolean important">true</span>
<span class="token key atrule">registrations_require_3pid</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> email
<span class="token key atrule">registration_requires_token</span><span class="token punctuation">:</span> <span class="token boolean important">false</span>   <span class="token comment"># 确保不强制邀请码注册（默认关闭）</span>
<span class="token key atrule">password_config</span><span class="token punctuation">:</span>
  <span class="token key atrule">enabled</span><span class="token punctuation">:</span> <span class="token boolean important">true</span>

<span class="token comment">### ✅ 允许邮箱登录</span>
<span class="token key atrule">login_via_existing_session</span><span class="token punctuation">:</span>
  <span class="token key atrule">enabled</span><span class="token punctuation">:</span> <span class="token boolean important">true</span>

<span class="token key atrule">rc_registration</span><span class="token punctuation">:</span>
  <span class="token key atrule">per_second</span><span class="token punctuation">:</span> <span class="token number">0.003</span>  <span class="token comment"># 每秒允许的注册请求（例如：0.003 ≈ 每5分钟一次）</span>
  <span class="token key atrule">burst_count</span><span class="token punctuation">:</span> <span class="token number">1</span>     <span class="token comment"># 同一IP地址的最大注册突发数</span>

  <span class="token comment"># 消息发送速率限制</span>
<span class="token key atrule">rc_message</span><span class="token punctuation">:</span>
  <span class="token key atrule">per_second</span><span class="token punctuation">:</span> <span class="token number">0.2</span>    <span class="token comment"># 每秒允许发送的消息数</span>
  <span class="token key atrule">burst_count</span><span class="token punctuation">:</span> <span class="token number">10</span>    <span class="token comment"># 突发消息缓冲区大小</span>

<span class="token comment"># 房间加入速率限制</span>
<span class="token key atrule">rc_joins</span><span class="token punctuation">:</span>
  <span class="token key atrule">local</span><span class="token punctuation">:</span>
    <span class="token key atrule">per_second</span><span class="token punctuation">:</span> <span class="token number">0.1</span>   <span class="token comment"># 本地用户加入房间的速率</span>
    <span class="token key atrule">burst_count</span><span class="token punctuation">:</span> <span class="token number">10</span>
  <span class="token key atrule">remote</span><span class="token punctuation">:</span>
    <span class="token key atrule">per_second</span><span class="token punctuation">:</span> <span class="token number">0.01</span>  <span class="token comment"># 远程用户加入房间的速率</span>
    <span class="token key atrule">burst_count</span><span class="token punctuation">:</span> <span class="token number">10</span>

<span class="token comment"># 媒体保留设置</span>
<span class="token key atrule">media_retention</span><span class="token punctuation">:</span>
  <span class="token comment"># 本地媒体文件的保留时间</span>
  <span class="token key atrule">local_media_lifetime</span><span class="token punctuation">:</span> 90d
  
  <span class="token comment"># 远程媒体文件的保留时间（来自其他homeserver的媒体）</span>
  <span class="token key atrule">remote_media_lifetime</span><span class="token punctuation">:</span> 14d

<span class="token comment"># 删除陈旧设备的时间</span>
<span class="token key atrule">delete_stale_devices_after</span><span class="token punctuation">:</span> 1y

<span class="token key atrule">auto_join_rooms</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> <span class="token string">"#XXX:你的家服务器URL"</span> <span class="token comment"># 需要自动加入的房间</span></code>`,!0),i(c);var l=s(c,8);t(l,()=>`<code class="language-bash">register_new_matrix_user  http://localhost:8008 <span class="token parameter variable">-c</span> /data/homeserver.yaml  <span class="token parameter variable">-a</span> <span class="token parameter variable">-u</span> 管理员用户名 <span class="token parameter variable">-p</span> 密码</code>`,!0),i(l),a(8),n(e,r)}export{c as t};