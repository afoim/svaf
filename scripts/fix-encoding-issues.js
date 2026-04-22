import fs from 'fs';
import path from 'path';

// 获取所有文章文件
const postsDir = 'src/content/posts';
const demoDir = 'demo/posts';

function getAllPosts() {
    const posts = [];
    const postDirs = fs.readdirSync(postsDir);
    
    for (const dir of postDirs) {
        const indexPath = path.join(postsDir, dir, 'index.md');
        const demoPath = path.join(demoDir, `${dir}.md`);
        
        if (fs.existsSync(indexPath) && fs.existsSync(demoPath)) {
            posts.push({
                slug: dir,
                currentPath: indexPath,
                originalPath: demoPath
            });
        }
    }
    
    return posts;
}

function hasEncodingIssues(content) {
    // 检查是否有大量的问号字符，这通常表示编码问题
    const questionMarks = (content.match(/\?/g) || []).length;
    const totalChars = content.length;
    
    // 如果问号字符超过总字符数的5%，可能有编码问题
    return questionMarks > totalChars * 0.05;
}

function fixImagePaths(content) {
    return content.replace(/\/public\/assets\/images\//g, 'img/');
}

function main() {
    const posts = getAllPosts();
    let fixedCount = 0;
    
    console.log(`开始检查 ${posts.length} 篇文章的编码问题...`);
    
    for (const post of posts) {
        const currentContent = fs.readFileSync(post.currentPath, 'utf8');
        
        if (hasEncodingIssues(currentContent)) {
            console.log(`发现编码问题: ${post.slug}`);
            
            // 重新从原始文件复制
            const originalContent = fs.readFileSync(post.originalPath, 'utf8');
            const fixedContent = fixImagePaths(originalContent);
            
            fs.writeFileSync(post.currentPath, fixedContent, 'utf8');
            console.log(`已修复: ${post.slug}`);
            fixedCount++;
        }
    }
    
    console.log(`完成！修复了 ${fixedCount} 篇文章的编码问题`);
}

main();