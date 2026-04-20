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

function fixHtmlTags(content) {
    let fixed = content;
    
    // 修复 HTML 标签在代码块外的问题
    // 将 HTML 标签转换为代码块或转义
    
    // 1. 修复单独的 HTML 标签（不在代码块中的）
    // 匹配不在代码块中的 HTML 标签
    const lines = fixed.split('\n');
    let inCodeBlock = false;
    let inHtmlBlock = false;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // 检查是否在代码块中
        if (line.trim().startsWith('```')) {
            inCodeBlock = !inCodeBlock;
            continue;
        }
        
        // 如果在代码块中，跳过
        if (inCodeBlock) {
            continue;
        }
        
        // 检查是否是 HTML 内容行
        if (line.trim().match(/^<[a-zA-Z][^>]*>/)) {
            inHtmlBlock = true;
        }
        
        // 如果在 HTML 块中，将其包装为代码块
        if (inHtmlBlock) {
            // 检查是否是 HTML 块的结束
            if (line.trim().match(/<\/[a-zA-Z]+>/) || line.trim() === '') {
                inHtmlBlock = false;
            }
            
            // 转义 HTML 标签
            lines[i] = line.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }
    }
    
    fixed = lines.join('\n');
    
    // 2. 修复内联的 HTML 链接，转换为 markdown 链接
    // <a href="url">text</a> -> [text](url)
    fixed = fixed.replace(/<a\s+href="([^"]+)"[^>]*>([^<]+)<\/a>/g, '[$2]($1)');
    
    // 3. 修复其他常见的 HTML 标签
    // 将 <br> 转换为换行
    fixed = fixed.replace(/<br\s*\/?>/g, '\n');
    
    // 4. 修复 iframe 标签，将其包装为代码块
    fixed = fixed.replace(/(<iframe[^>]*>.*?<\/iframe>)/gs, '```html\n$1\n```');
    
    // 5. 转义其他 HTML 标签（除了在代码块中的）
    const htmlTagRegex = /<(?!\/?(code|pre|script|style)\b)[a-zA-Z][^>]*>/g;
    fixed = fixed.replace(htmlTagRegex, (match) => {
        // 检查是否在代码块中
        const beforeMatch = fixed.substring(0, fixed.indexOf(match));
        const codeBlockCount = (beforeMatch.match(/```/g) || []).length;
        
        // 如果在代码块中（奇数个```），不转义
        if (codeBlockCount % 2 === 1) {
            return match;
        }
        
        // 否则转义
        return match.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    });
    
    return fixed;
}

function main() {
    const posts = getAllPosts();
    let fixedCount = 0;
    
    console.log(`开始修复 ${posts.length} 篇文章的 HTML 标签...`);
    
    for (const post of posts) {
        const content = fs.readFileSync(post.path, 'utf8');
        const fixedContent = fixHtmlTags(content);
        
        if (content !== fixedContent) {
            fs.writeFileSync(post.path, fixedContent, 'utf8');
            console.log(`已修复: ${post.slug}`);
            fixedCount++;
        }
    }
    
    console.log(`完成！修复了 ${fixedCount} 篇文章的 HTML 标签`);
}

main();