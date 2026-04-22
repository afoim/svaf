# 简化的图片迁移脚本
$posts = Get-ChildItem "src/content/posts/*/index.md"
Write-Host "找到 $($posts.Count) 篇文章"

foreach ($postFile in $posts) {
    $slug = $postFile.Directory.Name
    $imgDir = Join-Path $postFile.Directory.FullName "img"
    
    Write-Host "处理文章: $slug"
    
    # 读取文章内容
    $content = Get-Content $postFile.FullName -Raw -Encoding UTF8
    
    # 查找图片引用
    $imageReferences = @()
    
    # 查找 markdown 图片
    $imageMatches = [regex]::Matches($content, '!\[.*?\]\(([^)]+)\)')
    foreach ($match in $imageMatches) {
        $imagePath = $match.Groups[1].Value
        if ($imagePath -match '/public/assets/images/(.+)') {
            $imageReferences += $Matches[1]
        }
    }
    
    # 查找 frontmatter 图片
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
        Write-Host "  找到 $($imageReferences.Count) 个图片"
        
        # 复制图片
        foreach ($imageFile in $imageReferences) {
            $sourcePath = Join-Path "demo\assets\images" $imageFile
            $targetPath = Join-Path $imgDir $imageFile
            
            if (Test-Path $sourcePath) {
                Copy-Item $sourcePath $targetPath -Force
                Write-Host "    复制: $imageFile"
            } else {
                Write-Host "    未找到: $imageFile" -ForegroundColor Yellow
            }
        }
        
        # 更新路径
        $updatedContent = $content -replace '/public/assets/images/([^)]+)', 'img/$1'
        $updatedContent = $updatedContent -replace 'image:\s*public/public/assets/images/([^\r\n]+)', 'image: img/$1'
        $updatedContent = $updatedContent -replace 'image:\s*/public/assets/images/([^\r\n]+)', 'image: img/$1'
        
        Set-Content $postFile.FullName $updatedContent -Encoding UTF8
        Write-Host "    已更新路径"
    } else {
        Write-Host "  无图片引用"
    }
}

Write-Host "完成！"