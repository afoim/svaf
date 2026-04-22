import fs from 'fs';
import path from 'path';

// 获取所有文章文件
const postsDir = 'src/content/posts';

function getAllPosts() {
    const posts = [];
    const postDirs = fs.readdirSync(postsDir);
    
    for (const dir of postDirs) {
        const indexPath = path.join(postsDir, dir, 'index.md');
        if (fs.existsSync(indexPath)) {
            posts.push({
                slug: dir,
                path: indexPath
            });
        }
    }
    
    return posts;
}

function fixCustomSyntax(content) {
    // 替换 ::github{repo="owner/repo"} 或 ::github{repo=owner/repo}
    content = content.replace(/:::?github\{repo[=:]"?([^"}]+)"?\}/g, (match, repo) => {
        return `[${repo}](https://github.com/${repo})`;
    });
    
    // 替换 ::url{href="url"} 或 ::url{href=url}
    content = content.replace(/:::?url\{href[=:]"?([^"}]+)"?\}/g, (match, url) => {
        // 如果 URL 不以 http 开头，添加 https://
        const cleanUrl = url.replace(/^["']|["']$/g, '');
        const finalUrl = cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`;
        return `[${finalUrl}](${finalUrl})`;
    });
    
    return content;
}

function main() {
    const posts = getAllPosts();
    let fixedCount = 0;
    
    console.log(`开始修复 ${posts.length} 篇文章的自定义语法...`);
    
    for (const post of posts) {
        const content = fs.readFileSync(post.path, 'utf8');
        const fixedContent = fixCustomSyntax(content);
        
        if (content !== fixedContent) {
            fs.writeFileSync(post.path, fixedContent, 'utf8');
            console.log(`已修复: ${post.slug}`);
            fixedCount++;
        }
    }
    
    console.log(`完成！修复了 ${fixedCount} 篇文章的自定义语法`);
}

main();