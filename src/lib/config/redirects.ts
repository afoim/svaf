import { siteConfig } from './site';

export const redirects: Record<string, { status: number; destination: string }> = {
	'/privacy-policy': {
		status: 302,
		destination: `${siteConfig.url}/posts/privacy-policy/`
	},
	'/long': {
		status: 302,
		destination: 'https://iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii.iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii.in/'
	},
	'/tit': {
		status: 302,
		destination: '/posts/pin/'
	},
	'/q': {
		status: 302,
		destination: '/posts/pin/'
	},
	'/t': {
		status: 302,
		destination: `https://i.${new URL(siteConfig.url).hostname}`
	},
	'/ak': {
		status: 302,
		destination: 'https://akile.io/register?aff_code=503fe5ea-e7c5-4d68-ae05-6de99513680e'
	},
	'/yyb': {
		status: 302,
		destination: 'https://www.rainyun.com/acofork_?s=bilibili'
	},
	'/wly': {
		status: 302,
		destination: 'https://w1.wlylogin.com:8888/#/register?code=FNQwOQBM'
	},
	'/mly': {
		status: 302,
		destination: 'https://muleyun.com/aff/GOTRJLPN'
	},
	'/tly': {
		status: 302,
		destination: 'https://tianlicloud.cn/aff/HNNCFKGP'
	},
	'/kook': {
		status: 302,
		destination: 'https://kook.vip/K29zpT'
	},
	'/gal': {
		status: 302,
		destination: '/posts/gal/'
	},
	'/ok': {
		status: 302,
		destination: 'https://acofork-uptime.zeabur.app/status/acofork'
	},
	'/donate': {
		status: 302,
		destination: '/sponsors'
	},
	'/tg': {
		status: 302,
		destination: 'https://t.me/+_07DERp7k1ljYTc1'
	},
	'/esa': {
		status: 302,
		destination: 'https://tianchi.aliyun.com/specials/promotion/freetier/esa?taskCode=25254&recordId=c856e61228828a0423417a767828d166'
	},
	'/plan': {
		status: 302,
		destination: 'https://acofork.notion.site/2e11e011d4e5800fa050e8f7cf448347'
	},
	'/iku': {
		status: 302,
		destination: 'https://ikuuu.de/'
	},
	'/hnr': {
		status: 302,
		destination: 'https://subspace.shop/products/lin-pianpian-keychain-the-weeping-swan-ten-days-of-the-citys-fall?_pos=1&_sid=5ba9d94dd&_ss=r'
	}
};
