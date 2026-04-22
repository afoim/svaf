import fs from 'fs';
import path from 'path';
import os from 'os';
import sharp from 'sharp';

// 可转换为 AVIF 的栅格图扩展名
const CONVERTIBLE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp']);
// 不转换、原样复制的扩展名（动图、矢量图等）
const COPY_EXTS = new Set(['.gif', '.svg', '.ico', '.bmp', '.tiff']);

const AVIF_OPTIONS = {
  quality: 50,
  effort: 4,
  chromaSubsampling: '4:2:0'
};

/**
 * 将单张图片转换为 AVIF；若已存在且新于源文件则跳过。
 */
async function convertToAvif(srcPath, destPath) {
  try {
    const srcStat = fs.statSync(srcPath);
    if (fs.existsSync(destPath)) {
      const destStat = fs.statSync(destPath);
      if (destStat.mtimeMs >= srcStat.mtimeMs) return { skipped: true };
    }
    await sharp(srcPath, { failOn: 'none' })
      .rotate()
      .avif(AVIF_OPTIONS)
      .toFile(destPath);
    const outStat = fs.statSync(destPath);
    return { skipped: false, srcSize: srcStat.size, outSize: outStat.size };
  } catch (err) {
    console.warn(`[post-images] AVIF 转换失败 ${srcPath}: ${err.message}，回退为原文件复制`);
    fs.copyFileSync(srcPath, destPath);
    return { skipped: false, fallback: true };
  }
}

async function processWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let i = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const idx = i++;
      if (idx >= items.length) return;
      results[idx] = await worker(items[idx], idx);
    }
  });
  await Promise.all(runners);
  return results;
}

export function postImagesPlugin() {
  let isSsrBuild = false;
  return {
    name: 'post-images',
    apply: undefined, // 同时作用于 dev 和 build
    config(_config, env) {
      isSsrBuild = !!env.isSsrBuild;
    },
    configResolved(config) {
      isSsrBuild = !!config.build?.ssr;
    },
    configureServer(server) {
      // 开发模式下处理图片请求
      server.middlewares.use('/posts', (req, res, next) => {
        const urlPath = req.url;

        // 匹配 /posts/{slug}/img/{filename} 格式
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
    },

    async closeBundle() {
      // 仅在生产构建的客户端阶段执行一次（避免 SSR/客户端各跑一遍）
      if (process.env.NODE_ENV !== 'production') return;
      if (isSsrBuild) return;

      const postsDir = path.join(process.cwd(), 'src/content/posts');
      const outputDir = path.join(process.cwd(), 'build/posts');

      if (!fs.existsSync(postsDir)) return;

      const tasks = [];
      const postDirs = fs.readdirSync(postsDir);

      for (const postDir of postDirs) {
        const imgDir = path.join(postsDir, postDir, 'img');
        if (!fs.existsSync(imgDir)) continue;

        const outputImgDir = path.join(outputDir, postDir, 'img');
        fs.mkdirSync(outputImgDir, { recursive: true });

        const images = fs.readdirSync(imgDir);
        for (const image of images) {
          const srcPath = path.join(imgDir, image);
          if (!fs.statSync(srcPath).isFile()) continue;

          const ext = path.extname(image).toLowerCase();
          const baseName = path.basename(image, ext);

          if (CONVERTIBLE_EXTS.has(ext)) {
            const destPath = path.join(outputImgDir, `${baseName}.avif`);
            tasks.push({ type: 'avif', postDir, srcPath, destPath });
          } else if (COPY_EXTS.has(ext) || ext === '.avif') {
            const destPath = path.join(outputImgDir, image);
            tasks.push({ type: 'copy', postDir, srcPath, destPath });
          } else {
            const destPath = path.join(outputImgDir, image);
            tasks.push({ type: 'copy', postDir, srcPath, destPath });
          }
        }
      }

      if (tasks.length === 0) return;

      const start = Date.now();
      let totalSrc = 0;
      let totalOut = 0;
      let converted = 0;
      let skipped = 0;
      let copied = 0;

      const concurrency = Math.max(2, Math.min(8, os.cpus?.().length || 4));
      const total = tasks.length;
      let done = 0;

      await processWithConcurrency(tasks, concurrency, async (task) => {
        const rel = path.relative(postsDir, task.srcPath).replace(/\\/g, '/');
        if (task.type === 'avif') {
          const r = await convertToAvif(task.srcPath, task.destPath);
          done++;
          if (r.skipped) {
            skipped++;
            console.log(`[post-images] (${done}/${total}) 跳过 ${rel}`);
          } else {
            converted++;
            if (r.srcSize) totalSrc += r.srcSize;
            if (r.outSize) totalOut += r.outSize;
            const saved = r.srcSize && r.outSize
              ? ` ${(r.srcSize / 1024).toFixed(0)}KB → ${(r.outSize / 1024).toFixed(0)}KB (-${((1 - r.outSize / r.srcSize) * 100).toFixed(0)}%)`
              : '';
            console.log(`[post-images] (${done}/${total}) 转换 ${rel}${saved}`);
          }
        } else {
          fs.copyFileSync(task.srcPath, task.destPath);
          copied++;
          done++;
          console.log(`[post-images] (${done}/${total}) 复制 ${rel}`);
        }
      });

      const cost = ((Date.now() - start) / 1000).toFixed(2);
      const ratio = totalSrc > 0 ? ((1 - totalOut / totalSrc) * 100).toFixed(1) : '0.0';
      console.log(
        `[post-images] AVIF 转换完成: 转换 ${converted}, 跳过 ${skipped}, 复制 ${copied}, 节省 ${ratio}% (${(totalSrc / 1024 / 1024).toFixed(2)}MB → ${(totalOut / 1024 / 1024).toFixed(2)}MB), 耗时 ${cost}s`
      );
    }
  };
}
