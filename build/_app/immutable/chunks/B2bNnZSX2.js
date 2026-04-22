import{n as e}from"./pn1seLaS.js";import{D as t,F as n,L as r,Mt as i,jt as a,ot as o,st as s}from"./R8CaXVlq.js";import"./ZsEnWiqm.js";var c=e({default:()=>_,metadata:()=>l}),l={title:`手搓一个电子邮件订阅器！`,published:`2026-04-03T11:19:05.000Z`,description:`你可曾想过手搓一个基于邮件形式的文章订阅器？读者只需告诉系统邮箱，之后的文章更新都会发一封邮件来通知他们！`,image:`img/email.avif`,draft:!1,lang:``},{title:u,published:d,description:f,image:p,draft:m,lang:h}=l,g=r(`<h1>视频</h1> <p><a href="https://www.bilibili.com/video/BV1hpDKBbES9/" rel="nofollow">https://www.bilibili.com/video/BV1hpDKBbES9/</a></p> <h1>正式开始</h1> <p>众所周知，目前如果你想订阅本博客，可以采用以下几种方式</p> <ul><li><strong>瞪眼法</strong> 在多次浏览中通过大脑的逻辑中枢来判断有哪些新文章，或有哪些文章更新了</li> <li><strong>简易瞪眼法</strong> 在多次浏览中，若文章状态变化，右下角的小铃铛则会显示相应通知，点击后甚至可以看到高级的DIFF <img src="img/email-posts-sub.avif"/></li> <li><strong>RSS</strong> 通过RSS订阅器订阅本博客的RSS XML文件，由第三方告知文章更新状态 <img src="img/email-posts-sub-1.avif"/></li> <li><strong>加入群组</strong> 通过置顶文章加入群组，群内会有Bot在文章更新时广播一条消息 <img src="img/email-posts-sub-2.avif"/></li> <li><strong>催更法</strong> 想办法要到我的联系方式，催更，大概率我会在你要求的新文章发布后踹你一脚</li></ul> <p>emm，看似很多，的确很多，但是由于多多益善，可得还不够多，所以我们准备再添加一个古法订阅</p> <p>那就是 <strong>电子邮件通知</strong></p> <p>实现它在现在其实非常简单，由于我们已经有了一个 <a href="/forum/">论坛</a> ，可以直接在用户个人中心添加一个选项卡，勾选后即可接收后续的文章通知</p> <p>我们甚至无需担心垃圾邮件，因为在注册论坛时已经有了相对严格的验证</p> <p>那么接下来就是架构的设置，正如上文提到的，我们有一个提醒文章更新的Bot</p> <p>实际上，最终的电子邮件发送的东西和这个东西差不多</p> <p>也就是说，我们只需要让Bot在发送消息的同时，将要发送的内容推送给我们</p> <p><em>至于Bot是如何做到文章更新推送消息的，请参见 <a href="/posts/github-webhook/">这里</a></em></p> <p>那么不难想象，我们只需要在后端创建一个WebHook端点，接受Bot发送的WebHook消息，然后将正文作为邮件正文发送给订阅后的用户</p> <p>最终，架构如下</p> <pre class="language-mermaid"></pre> <p>ok！思路清晰了，实践就简单了</p> <p>首先前往Bot插件，将 <code>blog_post.py</code> 插件添加一个二次WebHook的功能</p> <p>再为论坛后端添加一个接受WebHook的端点，并绑定发邮事件。顺便再加一个API用于控制用户是否为 <strong>订阅者</strong></p> <p>最终在前端对接后端API，以及添加新UI控件支持用户在论坛的个人信息页配置是否要接受新文章推送</p> <p>测试！</p> <p><img src="img/c9bb51ef1f6e3c994f76c55ae7854fb5.avif"/></p> <p><img src="img/email-posts-sub-3.avif"/></p> <p><img src="img/a570d8792d2823cabbe41834d0a64405.avif"/></p>`,1);function _(e){var r=g(),c=s(o(r),30);t(c,()=>`<code class="language-mermaid">flowchart TD
    A[Git Push 特殊事件&lt;br/&gt;posts: / update:] --&gt; B[GitHub WebHook]
    B --&gt; C[Bot WebHook 接收端点]

    C --&gt; D[延迟队列 / 定时器]

    D --&gt; E[Bot 向群内推送消息]
    D --&gt; F[二次 WebHook 请求]

    F --&gt; G[论坛后端 WebHook 端点]

    G --&gt; H[封装邮件正文]
    H --&gt; I[异步邮件发送服务]
    I --&gt; J[所有订阅用户]</code>`,!0),i(c),a(16),n(e,r)}export{c as t};