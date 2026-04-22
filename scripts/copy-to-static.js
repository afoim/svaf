import fs from 'fs';
import path from 'path';

// 复制图片到 static 目录供 Web 访问
const postsDir = 'src/content/posts';
const staticDir = 'static/posts';

function copyToStatic() {
    const posts = fs.readdirSync(postsDir);
    let totalCopied = 0;
    
    console.log(`开始复制图片到 static 目录...`);
    
    for (const slug of posts) {
        const postImgDir = path.join(postsDir, slug, 'img');
        const staticImgDir = path.join(staticDir, slug, 'img');
        
        if (fs.existsSync(postImgDir)) {
            // 创建目标目录
            if (!fs.existsSync(staticImgDir)) {
                fs.mkdirSync(staticImgDir, { recursive: true });
            }
            
            // 复制所有图片
            const images = fs.readdirSync(postImgDir);
            for (const image of images) {
                const sourcePath = path.join(postImgDir, image);
                const targetPath = path.join(staticImgDir, image);
                
                fs.copyFileSync(sourcePath, targetPath);
                totalCopied++;
            }
            
            console.log(`${slug}: 复制了 ${images.length} 个图片`);
        }
    }
    
    console.log(`完成！总共复制了 ${totalCopied} 个图片到 static 目录`);
}

copyToStatic();