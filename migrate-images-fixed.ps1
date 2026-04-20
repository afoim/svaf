# 批量迁移文章图片脚本
$posts = Get-ChildItem "src/content/posts/*/index.md"
$totalPosts = $posts.Count
$processedCount = 0

Write-Host "开始处理 $totalPosts 篇文章的图片迁移..."

foreach ($postFile in $posts) {
    $processedCount++
    $slug = $postFile.Directory.Name
    $imgDir = $postFile.Directory.FullName + "\img"
    
    Write-Host "[$processedCount/$totalPosts] 处理文章: $slug"
    
    # 读取文章内容
    $content = Get-Content $postFile.FullName -Raw -Encoding UTF8
    
    # 提取所有图片引用
    $imageMatches = [regex]::Matches($content, '!\[.*?\]\(([^)]+)\)')
    $imageReferences = @()
    
    foreach ($match in $imageMatches) {
        $imagePath = $match.Groups[1].Value
        if ($imagePath -match '/public/assets/images/(.+)') {
            $imageReferences += $Matches[1]
        }
    }
    
    # 提取 frontmatter 中的 image 字段
    if ($content -match 'image:\s*([^\r\n]+)') {
        $frontmatterImage = $Matches[1].Trim()
        if ($frontmatterImage -match 'public/public/assets/images/(.+)') {
            $imageReferences += $Matches[1]
        } elseif ($frontmatterImage -match '/public/assets/images/(.+)') {
            $imageReferences += $Matches[1]
        }
    }
    
    # 去重
    $imageReferences = $imageReferences | Sort-Object -Unique
    
    if ($imageReferences.Count -gt 0) {
        Write-Host "  找到 $($imageReferences.Count) 个图片引用"
        
        # 复制图片文件
        foreach ($imageFile in $imageReferences) {
            $sourcePath = "demo\assets\images\$imageFile"
            $targetPath = "$imgDir\$imageFile"
            
            if (Test-Path $sourcePath) {
                Copy-Item $sourcePath $targetPath -Force
                Write-Host "    已复制: $imageFile"
            } else {
                Write-Host "    未找到: $imageFile" -ForegroundColor Yellow
            }
        }
        
        # 更新文章内容中的图片路径
        $updatedContent = $content
        $updatedContent = $updatedContent -replace '/public/assets/images/([^)]+)', 'img/$1'
        $updatedContent = $updatedContent -replace 'image:\s*public/public/assets/images/([^\r\n]+)', 'image: img/$1'
        $updatedContent = $updatedContent -replace 'image:\s*/public/assets/images/([^\r\n]+)', 'image: img/$1'
        
        # 写回文件
        Set-Content $postFile.FullName $updatedContent -Encoding UTF8
        Write-Host "    已更新图片路径"
    } else {
        Write-Host "  无图片引用"
    }
}

Write-Host "迁移完成！处理了 $totalPosts 篇文章"