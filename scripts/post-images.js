import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
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

function getFileHash(filePath) {
  const stat = fs.statSync(filePath);
  return `${stat.size}:${stat.mtimeMs}`;
}

function getCachePath(srcPath, cacheDir) {
  const hash = crypto.createHash('md5').update(srcPath).digest('hex');
  return path.join(cacheDir, `${hash}.avif`);
}

async function convertToAvif(srcPath, destPath, cacheDir) {
  try {
    const srcHash = getFileHash(srcPath);
    const cachePath = getCachePath(srcPath, cacheDir);
    const metaPath = `${cachePath}.meta`;
    
    // 检查缓存
    if (fs.existsSync(cachePath) && fs.existsSync(metaPath)) {
      try {
        const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
        if (meta.srcHash === srcHash) {
          // 从缓存复制
          fs.copyFileSync(cachePath, destPath);
          const stat = fs.statSync(cachePath);
          return { skipped: true, srcSize: meta.srcSize, outSize: stat.size };
        }
      } catch {}
    }
    
    // 压缩并缓存
    const srcStat = fs.statSync(srcPath);
    await sharp(srcPath, { failOn: 'none' })
      .rotate()
      .avif(AVIF_OPTIONS)
      .toFile(cachePath);
    
    const outStat = fs.statSync(cachePath);
    
    // 保存元数据
    fs.writeFileSync(metaPath, JSON.stringify({
      srcPath,
      srcHash,
      srcSize: srcStat.size,
      outSize: outStat.size,
      timestamp: Date.now()
    }), 'utf8');
    
    // 复制到目标
    fs.copyFileSync(cachePath, destPath);
    
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

async function main() {
  const postsDir = path.join(process.cwd(), 'src/content/posts');
  const outputDir = path.join(process.cwd(), 'build/posts');
  const cacheDir = path.join(process.cwd(), '.image-cache');

  if (!fs.existsSync(postsDir)) {
    console.log('[post-images] src/content/posts 不存在，跳过');
    return;
  }
  if (!fs.existsSync(path.join(process.cwd(), 'build'))) {
    console.error('[post-images] build/ 目录不存在，请先执行 vite build');
    process.exit(1);
  }

  // 创建缓存目录
  fs.mkdirSync(cacheDir, { recursive: true });

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

  if (tasks.length === 0) {
    console.log('[post-images] 没有需要处理的图片');
    return;
  }

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
      const r = await convertToAvif(task.srcPath, task.destPath, cacheDir);
      done++;
      if (r.skipped) {
        skipped++;
        if (r.srcSize) totalSrc += r.srcSize;
        if (r.outSize) totalOut += r.outSize;
        console.log(`[post-images] (${done}/${total}) 缓存 ${rel}`);
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
    `[post-images] AVIF 转换完成: 转换 ${converted}, 缓存 ${skipped}, 复制 ${copied}, 节省 ${ratio}% (${(totalSrc / 1024 / 1024).toFixed(2)}MB → ${(totalOut / 1024 / 1024).toFixed(2)}MB), 耗时 ${cost}s`
  );
}

main().catch((err) => {
  console.error('[post-images] 失败:', err);
  process.exit(1);
});
