import fs from 'fs';
import path from 'path';

// 获取所有文章文件
const postsDir = 'src/content/posts';
const demoImagesDir = 'demo/assets/images';
const staticDir = 'static/posts';

function getAllPosts() {
    const posts = [];
    const postDirs = fs.readdirSync(postsDir);
    
    for (const dir of postDirs) {
        const indexPath = path.join(postsDir, dir, 'index.md');
        if (fs.existsSync(indexPath)) {
            posts.push({
                slug: dir,
                path: indexPath,
                imgDir: path.join(postsDir, dir, 'img'),
                staticImgDir: path.join(staticDir, dir, 'img')
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
                if (imagePath.startsWith('img/')) {
                    const filename = imagePath.replace('img/', '');
                    imageReferences.add(filename);
                }
            }
        }
    }
    
    // 提取 frontmatter 中的 image 字段
    const frontmatterMatch = content.match(/image:\s*([^\r\n]+)/);
    if (frontmatterMatch) {
        const imagePath = frontmatterMatch[1].trim();
        if (imagePath.startsWith('img/')) {
            const filename = imagePath.replace('img/', '');
            imageReferences.add(filename);
        }
    }
    
    return Array.from(imageReferences);
}

function main() {
    const posts = getAllPosts();
    let totalMissing = 0;
    let totalImages = 0;
    const missingFiles = [];
    
    console.log(`检查 ${posts.length} 篇文章的图片文件...`);
    console.log('');
    
    for (const post of posts) {
        const content = fs.readFileSync(post.path, 'utf8');
        const imageReferences = extractImageReferences(content);
        
        if (imageReferences.length > 0) {
            totalImages += imageReferences.length;
            const postMissing = [];
            
            for (const imageFile of imageReferences) {
                const sourceExists = fs.existsSync(path.join(demoImagesDir, imageFile));
                const targetExists = fs.existsSync(path.join(post.imgDir, imageFile));
                const staticExists = fs.existsSync(path.join(post.staticImgDir, imageFile));
                
                if (!sourceExists || !targetExists || !staticExists) {
                    postMissing.push({
                        file: imageFile,
                        sourceExists,
                        targetExists,
                        staticExists
                    });
                }
            }
            
            if (postMissing.length > 0) {
                console.log(`${post.slug} (${postMissing.length}/${imageReferences.length} 缺失):`);
                for (const missing of postMissing) {
                    console.log(`  - ${missing.file}`);
                    console.log(`    源文件: ${missing.sourceExists ? '✓' : '✗'} | 目标: ${missing.targetExists ? '✓' : '✗'} | Static: ${missing.staticExists ? '✓' : '✗'}`);
                    missingFiles.push({
                        slug: post.slug,
                        file: missing.file,
                        ...missing
                    });
                }
                console.log('');
                totalMissing += postMissing.length;
            }
        }
    }
    
    console.log(`总结:`);
    console.log(`- 总图片数: ${totalImages}`);
    console.log(`- 缺失图片数: ${totalMissing}`);
    console.log(`- 成功率: ${((totalImages - totalMissing) / totalImages * 100).toFixed(1)}%`);
    
    // 生成修复脚本
    const fixScript = missingFiles
        .filter(item => item.sourceExists && (!item.targetExists || !item.staticExists))
        .map(item => {
            const sourcePath = path.join(demoImagesDir, item.file);
            const targetPath = path.join(postsDir, item.slug, 'img', item.file);
            const staticPath = path.join(staticDir, item.slug, 'img', item.file);
            
            return `
# ${item.slug}/${item.file}
if (!fs.existsSync(path.dirname('${targetPath}'))) {
    fs.mkdirSync(path.dirname('${targetPath}'), { recursive: true });
}
if (!fs.existsSync(path.dirname('${staticPath}'))) {
    fs.mkdirSync(path.dirname('${staticPath}'), { recursive: true });
}
if (fs.existsSync('${sourcePath}')) {
    fs.copyFileSync('${sourcePath}', '${targetPath}');
    fs.copyFileSync('${sourcePath}', '${staticPath}');
    console.log('复制: ${item.slug}/${item.file}');
}`;
        }).join('\n');
    
    if (fixScript) {
        fs.writeFileSync('fix-missing-images-script.js', `
import fs from 'fs';
import path from 'path';

console.log('开始修复缺失的图片...');
${fixScript}
console.log('修复完成！');
        `, 'utf8');
        
        console.log('\n已生成修复脚本: fix-missing-images-script.js');
        console.log('运行: node fix-missing-images-script.js');
    }
}

main();