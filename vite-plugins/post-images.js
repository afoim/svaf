import fs from 'fs';
import path from 'path';

/**
 * Dev 模式下让 /posts/{slug}/img/{filename} 直接从源目录读取。
 * 生产构建的 AVIF 转换由 scripts/post-images.js 在 vite build 之后单独执行
 * （因为 adapter-static 会在 closeBundle 之后清理/重建 build 目录）。
 */
export function postImagesPlugin() {
  return {
    name: 'post-images',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/posts', (req, res, next) => {
        const urlPath = req.url;
        const match = urlPath.match(/^\/([^\/]+)\/img\/(.+)$/);
        if (match) {
          const [, slug, filename] = match;
          const imagePath = path.join(process.cwd(), 'src/content/posts', slug, 'img', filename);

          if (fs.existsSync(imagePath)) {
            const stat = fs.statSync(imagePath);
            const ext = path.extname(filename).toLowerCase();

            const mimeTypes = {
              '.webp': 'image/webp',
              '.png': 'image/png',
              '.jpg': 'image/jpeg',
              '.jpeg': 'image/jpeg',
              '.gif': 'image/gif',
              '.svg': 'image/svg+xml',
              '.avif': 'image/avif'
            };

            res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
            res.setHeader('Content-Length', stat.size);

            const stream = fs.createReadStream(imagePath);
            stream.pipe(res);
            return;
          }
        }

        next();
      });
    }
  };
}
