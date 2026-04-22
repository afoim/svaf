import fs from 'fs';
import path from 'path';

// 获取所有文章文件
const postsDir = 'src/content/posts';
const demoImagesDir = 'demo/assets/images';

function getAllPosts() {
    const posts = [];
    const postDirs = fs.readdirSync(postsDir);
    
    for (const dir of postDirs) {
        const indexPath = path.join(postsDir, dir, 'index.md');
        if (fs.existsSync(indexPath)) {
            posts.push({
                slug: dir,
                path: indexPath,
                imgDir: path.join(postsDir, dir, 'img')
            });
        }
    }
    
    return posts;
}

function extractImageReferences(content) {
    const imageReferences = new Set();
    
    // 提取 markdown 图片引用
    const markdownImages = content.match(/!\[.*?\]\(([^)]+)\)/g);
    if (markdownImages) {
        for (const match of markdownImages) {
            const pathMatch = match.match(/!\[.*?\]\(([^)]+)\)/);
            if (pathMatch) {
                const imagePath = pathMatch[1];
                if (imagePath.includes('/public/assets/images/')) {
                    const filename = imagePath.split('/public/assets/images/')[1];
                    imageReferences.add(filename);
                }
            }
        }
    }
    
    // 提取 frontmatter 中的 image 字段
    const frontmatterMatch = content.match(/image:\s*([^\r\n]+)/);
    if (frontmatterMatch) {
        const imagePath = frontmatterMatch[1].trim();
        if (imagePath.includes('public/public/assets/images/')) {
            const filename = imagePath.split('public/public/assets/images/')[1];
            imageReferences.add(filename);
        } else if (imagePath.includes('/public/assets/images/')) {
            const filename = imagePath.split('/public/assets/images/')[1];
            imageReferences.add(filename);
        }
    }
    
    return Array.from(imageReferences);
}

function updateImagePaths(content) {
    // 更新 markdown 图片路径
    content = content.replace(/\/public\/assets\/images\/([^)]+)/g, 'img/$1');
    
    // 更新 frontmatter 图片路径
    content = content.replace(/image:\s*public\/public\/assets\/images\/([^\r\n]+)/g, 'image: img/$1');
    content = content.replace(/image:\s*\/public\/assets\/images\/([^\r\n]+)/g, 'image: img/$1');
    
    return content;
}

function copyImage(sourceFile, targetFile) {
    try {
        const targetDir = path.dirname(targetFile);
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }
        fs.copyFileSync(sourceFile, targetFile);
        return true;
    } catch (error) {
        console.error(`复制失败 ${sourceFile} -> ${targetFile}:`, error.message);
        return false;
    }
}

function main() {
    const posts = getAllPosts();
    console.log(`开始处理 ${posts.length} 篇文章的图片迁移...`);
    
    let totalImages = 0;
    let copiedImages = 0;
    
    for (let i = 0; i < posts.length; i++) {
        const post = posts[i];
        console.log(`[${i + 1}/${posts.length}] 处理文章: ${post.slug}`);
        
        // 读取文章内容
        const content = fs.readFileSync(post.path, 'utf8');
        
        // 提取图片引用
        const imageReferences = extractImageReferences(content);
        
        if (imageReferences.length > 0) {
            console.log(`  找到 ${imageReferences.length} 个图片引用`);
            totalImages += imageReferences.length;
            
            // 复制图片文件
            for (const imageFile of imageReferences) {
                const sourcePath = path.join(demoImagesDir, imageFile);
                const targetPath = path.join(post.imgDir, imageFile);
                
                if (fs.existsSync(sourcePath)) {
                    if (copyImage(sourcePath, targetPath)) {
                        console.log(`    已复制: ${imageFile}`);
                        copiedImages++;
                    }
                } else {
                    console.log(`    未找到: ${imageFile}`);
                }
            }
            
            // 更新文章内容中的图片路径
            const updatedContent = updateImagePaths(content);
            fs.writeFileSync(post.path, updatedContent, 'utf8');
            console.log(`    已更新图片路径`);
        } else {
            console.log(`  无图片引用`);
        }
    }
    
    console.log(`\n迁移完成！`);
    console.log(`处理了 ${posts.length} 篇文章`);
    console.log(`总共 ${totalImages} 个图片引用，成功复制 ${copiedImages} 个图片`);
}

main();