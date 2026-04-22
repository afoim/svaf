import{n as e}from"./pn1seLaS.js";import{D as t,F as n,L as r,Mt as i,jt as a,ot as o,st as s}from"./R8CaXVlq.js";import"./ZsEnWiqm.js";var c=e({default:()=>y,metadata:()=>l}),l={title:`教你搭建Chevereto这个超级强大的图床！`,published:`2025-07-15T16:00:00.000Z`,description:`被宝塔开心版的站长推荐了Chevereto这个图床，刚好刚刚嫖了个免费的虚拟主机，让我们开始折腾！`,image:`img/f31ca517-8f5b-4e53-af08-c32aabc224ab.avif`,tags:[`Chevereto`,`图床`],category:`教程`,draft:!1,lang:``},{title:u,published:d,description:f,image:p,tags:m,category:h,draft:g,lang:_}=l,v=r(`<h1>视频教程</h1> <p><a href="https://b23.tv/E8Z34KM" rel="nofollow">https://b23.tv/E8Z34KM</a></p> <h1>正式开始</h1> <p>资源： <a href="https://r2.2x.nz/chevereto_4.3.6-Pro_unlock.zip" rel="nofollow">https://r2.2x.nz/chevereto_4.3.6-Pro_unlock.zip</a> （感谢宝塔开心版站长！）</p> <p>使用 <strong>PHP 8.1.29 & MySQL 8.0.36</strong> 创建一个网站，然后将我们刚刚下载的ZIP上传到站点根目录并解压</p> <p>你就会得到这一坨</p> <p><img src="img/dcb4d5ec-412f-4008-980b-b4f4ac1bc2d2.avif"/></p> <p>这里开始分支！如果你是Apache请什么都不要动，它会自动检测 <code>.htaccess</code> 。如果你是Nginx请配置 <code>nginx.txt</code> 里面的伪静态规则</p> <p>然后根据原 <code>教程.txt</code></p> <pre class="language-bash"></pre> <p>如果你用的虚拟主机跟博主一样，也是ispmanager，请这样设置PHP</p> <p><img src="img/e4bc4d2e-fc42-49bb-b161-92e86f0c6d12.avif"/></p> <p>一切就绪，访问你的站点进行Chevereto的安装向导</p> <h1>疑难解答</h1> <p>如果出现问题，请尝试以管理员身份登录Chevereto，在管理员设置 -> 系统中开启调试模式。这样设置后，Chevereto在出现错误就会告诉你具体发生了什么问题</p> <p><img src="img/00c8ab83-d41c-4ca3-a14a-4a36f0f77b67.avif"/></p> <p>如果我连系统设置都进不去？请自行找你的PHP Error Log来分析问题</p> <h1>我搭建好的</h1> <p><a href="https://chevereto.php.afo.im/upload" rel="nofollow">https://chevereto.php.afo.im/upload</a></p> <p>登录后查看所有图片：</p> <p><a href="https://chevereto.php.afo.im/explore/images" rel="nofollow">https://chevereto.php.afo.im/explore/images</a></p>`,1);function y(e){var r=v(),c=s(o(r),18);t(c,()=>`<code class="language-bash">PHP 需要 <span class="token number">8.1</span> 以上

需要以下PHP扩展：
fileinfo
imagemagick
exif

如果是宝塔 还得删除 PHP 禁用函数
putenv
proc_open 


MYSQL 需要 <span class="token number">8.0</span> 以上

伪静态需要使用我提供的 nginx.txt 里面的</code>`,!0),i(c),a(22),n(e,r)}export{c as t};