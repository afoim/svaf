import{n as e}from"./pn1seLaS.js";import{D as t,F as n,L as r,Mt as i,jt as a,ot as o,st as s}from"./R8CaXVlq.js";import"./ZsEnWiqm.js";var c=e({default:()=>y,metadata:()=>l}),l={title:`大陆直连TG Web？触手可及！`,published:`2025-08-01T16:00:00.000Z`,description:`TG Web采用前后端分离，前端可以部署到静态托管平台，而后端可以用各种服务反代`,image:`img/2025-08-02-18-10-18-image.avif`,tags:[`Telegram Web`,`反向代理`],category:`记录`,draft:!1,lang:``},{title:u,published:d,description:f,image:p,tags:m,category:h,draft:g,lang:_}=l,v=r(`<h1>注意，将该项目直接绑定到你的域名会吃Abuse</h1> <p>推荐将 <code>index.html</code> 重命名。让别人访问根路径无法访问到正常页面即可，但不保证永远不会吃Abuse</p> <p>然后创建一个新的 <code>index.html</code> 写入：</p> <pre class="language-html"></pre> <p><img src="img/2025-08-02-18-30-40-75bf069f14b199651db36b1bda015bc2_720.avif"/></p> <h1>原理</h1> <p>TG Web采用前后端分离</p> <p>前端为静态资产，可以直接部署到Cloudflare Page</p> <p>后端有高达10个API，反代一下即可</p> <p>然后将前端请求的 <code>.web.telegram.org</code> 改为你的域名即可</p> <h1>正式开始</h1> <blockquote><p>以 TG Web K举例子</p></blockquote> <p>TG 后端API共有10个，分别为</p> <pre class="language-bash"></pre> <p>假如我的域名是 <code>072103.xyz</code> ，则为 <code>pluto.web.072103.xyz</code> 。其他的以此类推</p> <p>Fork 仓库： <a href="https://github.com/morethanwords/tweb" rel="nofollow">morethanwords/tweb: Telegram Web K, GPL v3</a></p> <p>全局搜索 <code>.web.telegram.org</code> 替换为 <code>.web.072103.xyz</code></p> <p>将该仓库部署到Cloudflare Page，构建命令为 <code>pnpm build</code> ，构建输出目录为 <code>public</code></p> <h1>成功</h1> <p><img src="img/2025-08-02-18-21-46-0c8fc3ac93604c65401132aaa59c803d_720.avif"/></p>`,1);function y(e){var r=v(),c=s(o(r),6);t(c,()=>`<code class="language-html"><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>html</span><span class="token punctuation">></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>head</span><span class="token punctuation">></span></span>
	<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>title</span><span class="token punctuation">></span></span>Welcome to nginx!<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>title</span><span class="token punctuation">></span></span>
	<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>style</span><span class="token punctuation">></span></span>
		body &#123;
			width: 35em;
			margin: 0 auto;
			font-family: Tahoma, Verdana, Arial, sans-serif;
		&#125;
	<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>style</span><span class="token punctuation">></span></span>
	<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>style</span> <span class="token attr-name">data-id</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>immersive-translate-input-injected-css<span class="token punctuation">"</span></span><span class="token punctuation">></span></span>.immersive-translate-input &#123;
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  z-index: 2147483647;
  display: flex;
  justify-content: center;
  align-items: center;
&#125;
.immersive-translate-attach-loading::after &#123;
  content: " ";

  --loading-color: #f78fb6;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: block;
  margin: 12px auto;
  position: relative;
  color: white;
  left: -100px;
  box-sizing: border-box;
  animation: immersiveTranslateShadowRolling 1.5s linear infinite;

  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-2000%, -50%);
  z-index: 100;
&#125;

.immersive-translate-loading-spinner &#123;
  vertical-align: middle !important;
  width: 10px !important;
  height: 10px !important;
  display: inline-block !important;
  margin: 0 4px !important;
  border: 2px rgba(221, 244, 255, 0.6) solid !important;
  border-top: 2px rgba(0, 0, 0, 0.375) solid !important;
  border-left: 2px rgba(0, 0, 0, 0.375) solid !important;
  border-radius: 50% !important;
  padding: 0 !important;
  -webkit-animation: immersive-translate-loading-animation 0.6s infinite linear !important;
  animation: immersive-translate-loading-animation 0.6s infinite linear !important;
&#125;

@-webkit-keyframes immersive-translate-loading-animation &#123;
  from &#123;
    -webkit-transform: rotate(0deg);
  &#125;

  to &#123;
    -webkit-transform: rotate(359deg);
  &#125;
&#125;

@keyframes immersive-translate-loading-animation &#123;
  from &#123;
    transform: rotate(0deg);
  &#125;

  to &#123;
    transform: rotate(359deg);
  &#125;
&#125;

.immersive-translate-input-loading &#123;
  --loading-color: #f78fb6;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: block;
  margin: 12px auto;
  position: relative;
  color: white;
  left: -100px;
  box-sizing: border-box;
  animation: immersiveTranslateShadowRolling 1.5s linear infinite;
&#125;

@keyframes immersiveTranslateShadowRolling &#123;
  0% &#123;
    box-shadow: 0px 0 rgba(255, 255, 255, 0), 0px 0 rgba(255, 255, 255, 0),
      0px 0 rgba(255, 255, 255, 0), 0px 0 rgba(255, 255, 255, 0);
  &#125;

  12% &#123;
    box-shadow: 100px 0 var(--loading-color), 0px 0 rgba(255, 255, 255, 0),
      0px 0 rgba(255, 255, 255, 0), 0px 0 rgba(255, 255, 255, 0);
  &#125;

  25% &#123;
    box-shadow: 110px 0 var(--loading-color), 100px 0 var(--loading-color),
      0px 0 rgba(255, 255, 255, 0), 0px 0 rgba(255, 255, 255, 0);
  &#125;

  36% &#123;
    box-shadow: 120px 0 var(--loading-color), 110px 0 var(--loading-color),
      100px 0 var(--loading-color), 0px 0 rgba(255, 255, 255, 0);
  &#125;

  50% &#123;
    box-shadow: 130px 0 var(--loading-color), 120px 0 var(--loading-color),
      110px 0 var(--loading-color), 100px 0 var(--loading-color);
  &#125;

  62% &#123;
    box-shadow: 200px 0 rgba(255, 255, 255, 0), 130px 0 var(--loading-color),
      120px 0 var(--loading-color), 110px 0 var(--loading-color);
  &#125;

  75% &#123;
    box-shadow: 200px 0 rgba(255, 255, 255, 0), 200px 0 rgba(255, 255, 255, 0),
      130px 0 var(--loading-color), 120px 0 var(--loading-color);
  &#125;

  87% &#123;
    box-shadow: 200px 0 rgba(255, 255, 255, 0), 200px 0 rgba(255, 255, 255, 0),
      200px 0 rgba(255, 255, 255, 0), 130px 0 var(--loading-color);
  &#125;

  100% &#123;
    box-shadow: 200px 0 rgba(255, 255, 255, 0), 200px 0 rgba(255, 255, 255, 0),
      200px 0 rgba(255, 255, 255, 0), 200px 0 rgba(255, 255, 255, 0);
  &#125;
&#125;

.immersive-translate-toast &#123;
  display: flex;
  position: fixed;
  z-index: 2147483647;
  left: 0;
  right: 0;
  top: 1%;
  width: fit-content;
  padding: 12px 20px;
  margin: auto;
  overflow: auto;
  background: #fef6f9;
  box-shadow: 0px 4px 10px 0px rgba(0, 10, 30, 0.06);
  font-size: 15px;
  border-radius: 8px;
  color: #333;
&#125;

.immersive-translate-toast-content &#123;
  display: flex;
  flex-direction: row;
  align-items: center;
&#125;

.immersive-translate-toast-hidden &#123;
  margin: 0 20px 0 72px;
  text-decoration: underline;
  cursor: pointer;
&#125;

.immersive-translate-toast-close &#123;
  color: #666666;
  font-size: 20px;
  font-weight: bold;
  padding: 0 10px;
  cursor: pointer;
&#125;

@media screen and (max-width: 768px) &#123;
  .immersive-translate-toast &#123;
    top: 0;
    padding: 12px 0px 0 10px;
  &#125;
  .immersive-translate-toast-content &#123;
    flex-direction: column;
    text-align: center;
  &#125;
  .immersive-translate-toast-hidden &#123;
    margin: 10px auto;
  &#125;
&#125;

.immersive-translate-modal &#123;
  display: none;
  position: fixed;
  z-index: 2147483647;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgb(0, 0, 0);
  background-color: rgba(0, 0, 0, 0.4);
  font-size: 15px;
&#125;

.immersive-translate-modal-content &#123;
  background-color: #fefefe;
  margin: 10% auto;
  padding: 40px 24px 24px;
  border-radius: 12px;
  width: 350px;
  font-family: system-ui, -apple-system, "Segoe UI", "Roboto", "Ubuntu",
    "Cantarell", "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
    "Segoe UI Symbol", "Noto Color Emoji";
  position: relative;
&#125;

@media screen and (max-width: 768px) &#123;
  .immersive-translate-modal-content &#123;
    margin: 50% auto !important;
  &#125;
&#125;

.immersive-translate-modal .immersive-translate-modal-content-in-input &#123;
  max-width: 500px;
&#125;
.immersive-translate-modal-content-in-input .immersive-translate-modal-body &#123;
  text-align: left;
  max-height: unset;
&#125;

.immersive-translate-modal-title &#123;
  text-align: center;
  font-size: 16px;
  font-weight: 700;
  color: #333333;
&#125;

.immersive-translate-modal-body &#123;
  text-align: center;
  font-size: 14px;
  font-weight: 400;
  color: #333333;
  margin-top: 24px;
&#125;

@media screen and (max-width: 768px) &#123;
  .immersive-translate-modal-body &#123;
    max-height: 250px;
    overflow-y: auto;
  &#125;
&#125;

.immersive-translate-close &#123;
  color: #666666;
  position: absolute;
  right: 16px;
  top: 16px;
  font-size: 20px;
  font-weight: bold;
&#125;

.immersive-translate-close:hover,
.immersive-translate-close:focus &#123;
  text-decoration: none;
  cursor: pointer;
&#125;

.immersive-translate-modal-footer &#123;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 24px;
&#125;

.immersive-translate-btn &#123;
  width: fit-content;
  color: #fff;
  background-color: #ea4c89;
  border: none;
  font-size: 14px;
  margin: 0 8px;
  padding: 9px 30px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s ease;
&#125;

.immersive-translate-btn-container &#123;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
&#125;

.immersive-translate-btn:hover &#123;
  background-color: #f082ac;
&#125;
.immersive-translate-btn:disabled &#123;
  opacity: 0.6;
  cursor: not-allowed;
&#125;
.immersive-translate-btn:disabled:hover &#123;
  background-color: #ea4c89;
&#125;

.immersive-translate-link-btn &#123;
  background-color: transparent;
  color: #ea4c89;
  border: none;
  cursor: pointer;
  height: 30px;
  line-height: 30px;
&#125;

.immersive-translate-cancel-btn &#123;
  /* gray color */
  background-color: rgb(89, 107, 120);
&#125;

.immersive-translate-cancel-btn:hover &#123;
  background-color: hsl(205, 20%, 32%);
&#125;

.immersive-translate-action-btn &#123;
  background-color: transparent;
  color: #ea4c89;
  border: 1px solid #ea4c89;
&#125;

.immersive-translate-btn svg &#123;
  margin-right: 5px;
&#125;

.immersive-translate-link &#123;
  cursor: pointer;
  user-select: none;
  -webkit-user-drag: none;
  text-decoration: none;
  color: #ea4c89;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
&#125;

.immersive-translate-primary-link &#123;
  cursor: pointer;
  user-select: none;
  -webkit-user-drag: none;
  text-decoration: none;
  color: #ea4c89;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
&#125;

.immersive-translate-modal input[type="radio"] &#123;
  margin: 0 6px;
  cursor: pointer;
&#125;

.immersive-translate-modal label &#123;
  cursor: pointer;
&#125;

.immersive-translate-close-action &#123;
  position: absolute;
  top: 2px;
  right: 0px;
  cursor: pointer;
&#125;

.imt-image-status &#123;
  background-color: rgba(0, 0, 0, 0.5) !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  border-radius: 16px !important;
&#125;
.imt-image-status img,
.imt-image-status svg,
.imt-img-loading &#123;
  width: 28px !important;
  height: 28px !important;
  margin: 0 0 8px 0 !important;
  min-height: 28px !important;
  min-width: 28px !important;
  position: relative !important;
&#125;
.imt-img-loading &#123;
  background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAA4CAMAAACfWMssAAAAtFBMVEUAAAD////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////oK74hAAAAPHRSTlMABBMIDyQXHwyBfFdDMSw+OjXCb+5RG51IvV/k0rOqlGRM6KKMhdvNyZBz9MaupmxpWyj437iYd/yJVNZeuUC7AAACt0lEQVRIx53T2XKiUBCA4QYOiyCbiAsuuGBcYtxiYtT3f6/pbqoYHVFO5r+iivpo6DpAWYpqeoFfr9f90DsYAuRSWkFnPO50OgR9PwiCUFcl2GEcx+N/YBh6pvKaefHlUgZd1zVe0NbYcQjGBfzrPE8Xz8aF+71D8gG6DHFPpc4a7xFiCDuhaWgKgGIJQ3d5IMGDrpS4S5KgpIm+en9f6PlAhKby4JwEIxlYJV9h5k5nee9GoxHJ2IDSNB0dwdad1NAxDJ/uXDHYmebdk4PdbkS58CIVHdYSUHTYYRWOJblWSyu2lmy3KNFVJNBhxcuGW4YBVCbYGRZwIooipHsNqjM4FbgOQqQqSKQQU9V8xmi1QlgHqQQ6DDBvRUVCDirs+EzGDGOQTCATgtYTnbCVLgsVgRE0T1QE0qHCFAht2z6dLvJQs3Lo2FQoDxWNUiBhaP4eRgwNkI+dAjVOA/kUrIDwf3CG8NfNOE0eiFotSuo+rBiq8tD9oY4Qzc6YJw99hl1wzpQvD7ef2M8QgnOGJfJw+EltQc+oX2yn907QB22WZcvlUpd143dqQu+8pCJZuGE4xCuPXJqqcs5sNpsI93Rmzym1k4Npk+oD1SH3/a3LOK/JpUBpWfqNySxWzCfNCUITuDG5dtuphrUJ1myeIE9bIsPiKrfqTai5WZxbhtNphYx6GEIHihyGFTI69lje/rxajdh0s0msZ0zYxyPLhYCb1CyHm9Qsd2H37Y3lugVwL9kNh8Ot8cha6fUNQ8nuXi5z9/ExsAO4zQrb/ev1yrCB7lGyQzgYDGuxq1toDN/JGvN+HyWNHKB7zEoK+PX11e12G431erGYzwmytAWU56fkMHY5JJnDRR2eZji3AwtIcrEV8Cojat/BdQ7XOwGV1e1hDjGGjXbdArm8uJZtCH5MbcctVX8A1WpqumJHwckAAAAASUVORK5CYII=");
  background-size: 28px 28px;
  animation: image-loading-rotate 1s linear infinite !important;
&#125;

.imt-image-status span &#123;
  color: var(--bg-2, #fff) !important;
  font-size: 14px !important;
  line-height: 14px !important;
  font-weight: 500 !important;
  font-family: "PingFang SC", Arial, sans-serif !important;
&#125;

@keyframes image-loading-rotate &#123;
  from &#123;
    transform: rotate(360deg);
  &#125;
  to &#123;
    transform: rotate(0deg);
  &#125;
&#125;
<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>style</span><span class="token punctuation">></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>head</span><span class="token punctuation">></span></span>
	<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>body</span><span class="token punctuation">></span></span>
	<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>h1</span><span class="token punctuation">></span></span>Welcome to nginx!<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>h1</span><span class="token punctuation">></span></span>
	<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">></span></span>If you see this page, the nginx web server is successfully installed and
	working. Further configuration is required.<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>p</span><span class="token punctuation">></span></span>
	
	<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">></span></span>For online documentation and support please refer to
	<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>a</span> <span class="token attr-name">href</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>http://nginx.org/<span class="token punctuation">"</span></span><span class="token punctuation">></span></span>nginx.org<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>a</span><span class="token punctuation">></span></span>.<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>br</span><span class="token punctuation">></span></span>
	Commercial support is available at
	<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>a</span> <span class="token attr-name">href</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>http://nginx.com/<span class="token punctuation">"</span></span><span class="token punctuation">></span></span>nginx.com<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>a</span><span class="token punctuation">></span></span>.<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>p</span><span class="token punctuation">></span></span>
	
	<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>em</span><span class="token punctuation">></span></span>Thank you for using nginx.<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>em</span><span class="token punctuation">></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>p</span><span class="token punctuation">></span></span>
	
	
	<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">id</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>screenity-ui<span class="token punctuation">"</span></span><span class="token punctuation">></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">class</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>screenity-shadow-dom<span class="token punctuation">"</span></span><span class="token punctuation">></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span><span class="token punctuation">></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">class</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>screenity-scrollbar<span class="token punctuation">"</span></span><span class="token punctuation">></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">class</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>screenity-scrollbar<span class="token punctuation">"</span></span><span class="token punctuation">></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>style</span> <span class="token attr-name">type</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>text/css<span class="token punctuation">"</span></span><span class="token punctuation">></span></span>
			#screenity-ui, #screenity-ui div &#123;
				background-color: unset;
				padding: unset;
				width: unset;
				box-shadow: unset;
				display: unset;
				margin: unset;
				border-radius: unset;
			&#125;
			.screenity-outline &#123;
				position: absolute;
				z-index: 99999999999;
				border: 2px solid #3080F8;
				outline-offset: -2px;
				pointer-events: none;
				border-radius: 5px!important;
			&#125;
		.screenity-blur &#123;
			filter: blur(10px)!important;
		&#125;
			.screenity-shadow-dom * &#123;
				transition: unset;
			&#125;
			.screenity-shadow-dom .TooltipContent &#123;
  border-radius: 30px!important;
	background-color: #29292F!important;
  padding: 10px 15px!important;
  font-size: 12px;
	margin-bottom: 10px!important;
	bottom: 100px;
  line-height: 1;
	font-family: 'Satoshi-Medium', sans-serif;
	z-index: 99999999!important;
  color: #FFF;
  box-shadow: hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px!important;
  user-select: none;
	transition: opacity 0.3 ease-in-out;
  will-change: transform, opacity;
	animation-duration: 400ms;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform, opacity;
&#125;

.screenity-shadow-dom .hide-tooltip &#123;
	display: none!important;
&#125;

.screenity-shadow-dom .tooltip-tall &#123;
	margin-bottom: 20px;
&#125;

.screenity-shadow-dom .tooltip-small &#123;
	margin-bottom: 5px;
&#125;

.screenity-shadow-dom .TooltipContent[data-state='delayed-open'][data-side='top'] &#123;
	animation-name: slideDownAndFade;
&#125;
.screenity-shadow-dom .TooltipContent[data-state='delayed-open'][data-side='right'] &#123;
  animation-name: slideLeftAndFade;
&#125;
.screenity-shadow-dom.TooltipContent[data-state='delayed-open'][data-side='bottom'] &#123;
  animation-name: slideUpAndFade;
&#125;
.screenity-shadow-dom.TooltipContent[data-state='delayed-open'][data-side='left'] &#123;
  animation-name: slideRightAndFade;
&#125;

@keyframes slideUpAndFade &#123;
  from &#123;
    opacity: 0;
    transform: translateY(2px);
  &#125;
  to &#123;
    opacity: 1;
    transform: translateY(0);
  &#125;
&#125;

@keyframes slideRightAndFade &#123;
  from &#123;
    opacity: 0;
    transform: translateX(-2px);
  &#125;
  to &#123;
    opacity: 1;
    transform: translateX(0);
  &#125;
&#125;

@keyframes slideDownAndFade &#123;
  from &#123;
    opacity: 0;
    transform: translateY(-2px);
  &#125;
  to &#123;
    opacity: 1;
    transform: translateY(0);
  &#125;
&#125;

@keyframes slideLeftAndFade &#123;
  from &#123;
    opacity: 0;
    transform: translateX(2px);
  &#125;
  to &#123;
    opacity: 1;
    transform: translateX(0);
  &#125;
&#125;

#screenity-ui [data-radix-popper-content-wrapper] &#123; z-index: 999999999999!important; &#125; 

.screenity-shadow-dom .CanvasContainer &#123;
	position: fixed;
	pointer-events: all!important;
	top: 0px!important;
	left: 0px!important;
	z-index: 99999999999!important;
&#125;
.screenity-shadow-dom .canvas &#123;
	position: fixed;
	top: 0px!important;
	left: 0px!important;
	z-index: 99999999999!important;
	background: transparent!important;
&#125;
.screenity-shadow-dom .canvas-container &#123;
	top: 0px!important;
	left: 0px!important;
	z-index: 99999999999;
	position: fixed!important;
	background: transparent!important;
&#125;

.ScreenityDropdownMenuContent &#123;
	z-index: 99999999999!important;
  min-width: 200px;
  background-color: white;
  margin-top: 4px;
  margin-right: 8px;
  padding-top: 12px;
  padding-bottom: 12px;
  border-radius: 15px;
  z-index: 99999;
  font-family: 'Satoshi-Medium', sans-serif;
  color: #29292F;
  box-shadow: 0px 10px 38px -10px rgba(22, 23, 24, 0.35),
    0px 10px 20px -15px rgba(22, 23, 24, 0.2);
  animation-duration: 400ms;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform, opacity;
&#125;
.ScreenityDropdownMenuContent[data-side="top"] &#123;
  animation-name: slideDownAndFade;
&#125;
.ScreenityDropdownMenuContent[data-side="right"] &#123;
  animation-name: slideLeftAndFade;
&#125;
.ScreenityDropdownMenuContent[data-side="bottom"] &#123;
  animation-name: slideUpAndFade;
&#125;
.ScreenityDropdownMenuContent[data-side="left"] &#123;
  animation-name: slideRightAndFade;
&#125;
.ScreenityItemIndicator &#123;
  position: absolute;
  right: 12px; 
  width: 18px;
  height: 18px;
  background: #3080F8;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
&#125;
.ScreenityDropdownMenuItem,
.ScreenityDropdownMenuRadioItem &#123;
  font-size: 14px;
  line-height: 1;
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 5px;
  position: relative;
  padding-left: 22px;
  padding-right: 22px;
  user-select: none;
  outline: none;
&#125;
.ScreenityDropdownMenuItem:hover &#123;
    background-color: #F6F7FB !important;
    cursor: pointer;
&#125;
.ScreenityDropdownMenuItem[data-disabled] &#123;
  color: #6E7684; !important;
  cursor: not-allowed;
  background-color: #F6F7FB !important;
&#125;



@keyframes slideUpAndFade &#123;
  from &#123;
    opacity: 0;
    transform: translateY(2px);
  &#125;
  to &#123;
    opacity: 1;
    transform: translateY(0);
  &#125;
&#125;

@keyframes slideRightAndFade &#123;
  from &#123;
    opacity: 0;
    transform: translateX(-2px);
  &#125;
  to &#123;
    opacity: 1;
    transform: translateX(0);
  &#125;
&#125;

@keyframes slideDownAndFade &#123;
  from &#123;
    opacity: 0;
    transform: translateY(-2px);
  &#125;
  to &#123;
    opacity: 1;
    transform: translateY(0);
  &#125;
&#125;

@keyframes slideLeftAndFade &#123;
  from &#123;
    opacity: 0;
    transform: translateX(2px);
  &#125;
  to &#123;
    opacity: 1;
    transform: translateX(0);
  &#125;
&#125;

<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>style</span><span class="token punctuation">></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>body</span><span class="token punctuation">></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">id</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>immersive-translate-popup<span class="token punctuation">"</span></span> <span class="token attr-name">style</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>all: initial<span class="token punctuation">"</span></span><span class="token punctuation">></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>html</span><span class="token punctuation">></span></span></code>`,!0),i(c);var l=s(c,20);t(l,()=>`<code class="language-bash">pluto.web.telegram.org
venus.web.telegram.org
aurora.web.telegram.org
vesta.web.telegram.org
flora.web.telegram.org
pluto-1.web.telegram.org
venus-1.web.telegram.org
aurora-1.web.telegram.org
vesta-1.web.telegram.org
flora-1.web.telegram.org</code>`,!0),i(l),a(12),n(e,r)}export{c as t};