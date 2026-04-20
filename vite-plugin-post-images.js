import fs from 'fs';
import path from 'path';

export function postImagesPlugin() {
  return {
    name: 'post-images',
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
            
            // 设置正确的 Content-Type
            const mimeTypes = {
              '.webp': 'image/webp',
              '.png': 'image/png',
              '.jpg': 'image/jpeg',
              '.jpeg': 'image/jpeg',
              '.gif': 'image/gif',
              '.svg': 'image/svg+xml'
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
    
    generateBundle() {
      // 构建时收集所有图片并复制到输出目录
      const postsDir = path.join(process.cwd(), 'src/content/posts');
      const outputDir = path.join(process.cwd(), 'build/posts');
      
      if (!fs.existsSync(postsDir)) return;
      
      const postDirs = fs.readdirSync(postsDir);
      
      for (const postDir of postDirs) {
        const imgDir = path.join(postsDir, postDir, 'img');
        
        if (fs.existsSync(imgDir)) {
          const outputImgDir = path.join(outputDir, postDir, 'img');
          
          // 确保输出目录存在
          fs.mkdirSync(outputImgDir, { recursive: true });
          
          // 复制所有图片文件
          const images = fs.readdirSync(imgDir);
          for (const image of images) {
            const srcPath = path.join(imgDir, image);
            const destPath = path.join(outputImgDir, image);
            
            if (fs.statSync(srcPath).isFile()) {
              fs.copyFileSync(srcPath, destPath);
            }
          }
          
          console.log(`复制图片: ${postDir} (${images.length} 个文件)`);
        }
      }
    }
  };
}