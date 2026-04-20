import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const siteUrl = 'https://2x.nz';
const hostname = new URL(siteUrl).hostname;

const redirects = {
	'/privacy-policy': `${siteUrl}/posts/privacy-policy/`,
	'/long': 'https://iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii.iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii.in/',
	'/tit': '/posts/pin/',
	'/q': '/posts/pin/',
	'/t': `https://i.${hostname}`,
	'/ak': 'https://akile.io/register?aff_code=503fe5ea-e7c5-4d68-ae05-6de99513680e',
	'/yyb': 'https://www.rainyun.com/acofork_?s=bilibili',
	'/wly': 'https://w1.wlylogin.com:8888/#/register?code=FNQwOQBM',
	'/mly': 'https://muleyun.com/aff/GOTRJLPN',
	'/tly': 'https://tianlicloud.cn/aff/HNNCFKGP',
	'/kook': 'https://kook.vip/K29zpT',
	'/gal': '/posts/gal/',
	'/ok': 'https://acofork-uptime.zeabur.app/status/acofork',
	'/donate': '/sponsors',
	'/tg': 'https://t.me/+_07DERp7k1ljYTc1',
	'/esa': 'https://tianchi.aliyun.com/specials/promotion/freetier/esa?taskCode=25254&recordId=c856e61228828a0423417a767828d166',
	'/plan': 'https://acofork.notion.site/2e11e011d4e5800fa050e8f7cf448347',
	'/iku': 'https://ikuuu.de/',
	'/hnr': 'https://subspace.shop/products/lin-pianpian-keychain-the-weeping-swan-ten-days-of-the-citys-fall?_pos=1&_sid=5ba9d94dd&_ss=r'
};

function generateRedirectHTML(destination) {
	return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
	<meta charset="UTF-8">
	<meta http-equiv="refresh" content="0;url=${destination}">
	<meta name="robots" content="noindex">
	<link rel="canonical" href="${destination}">
	<title>重定向中...</title>
	<script>window.location.href="${destination}";</script>
</head>
<body>
	<p>正在跳转到 <a href="${destination}">${destination}</a></p>
</body>
</html>`;
}

// 生成重定向文件
for (const [path, destination] of Object.entries(redirects)) {
	const outputPath = join(__dirname, '..', 'static', path.slice(1));
	
	// 创建目录（包括父目录）
	mkdirSync(outputPath, { recursive: true });
	
	// 写入 index.html
	const htmlPath = join(outputPath, 'index.html');
	writeFileSync(htmlPath, generateRedirectHTML(destination));
	
	console.log(`✓ Generated redirect: ${path} -> ${destination}`);
}

console.log('\n✓ All redirects generated successfully!');
