# 博客功能使用指南

## 文章存放位置

所有文章存放在 `src/content/posts/` 目录下，文件名即为文章的 slug（URL 路径）。

例如：`src/content/posts/hello-world.md` 对应的 URL 为 `/posts/hello-world`

## 文章格式

每篇文章必须包含 YAML frontmatter 元数据，格式如下：

```markdown
---
title: 文章标题
image: /public/assets/images/cover.webp
published: 2025-05-23T16:00:00
pinned: true
description: 文章简短描述
---

# 文章内容

这里是文章的正文内容...
```

## 元数据字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `title` | string | ✅ | 文章标题 |
| `image` | string | ✅ | 文章封面图片路径 |
| `published` | string | ✅ | 发布日期时间（ISO 8601 格式） |
| `pinned` | boolean | ✅ | 是否置顶（true/false） |
| `description` | string | ✅ | 文章描述（用于列表展示和 SEO） |

## 添加新文章

1. 在 `src/content/posts/` 目录下创建新的 `.md` 文件
2. 文件名使用小写字母和连字符，例如：`my-new-post.md`
3. 添加 frontmatter 元数据
4. 编写文章内容（支持标准 Markdown 语法）
5. 保存文件

文章会自动出现在博客列表中！

## 文章排序规则

1. 置顶文章（`pinned: true`）始终显示在最前面
2. 其他文章按发布日期降序排列（最新的在前）

## 图片资源

建议将图片放在 `static/assets/images/` 目录下，然后在文章中使用绝对路径引用：

```markdown
![图片描述](/assets/images/my-image.webp)
```

或者使用外部图片 URL：

```markdown
![图片描述](https://example.com/image.webp)
```

## 支持的 Markdown 语法

- 标题（H1-H6）
- 段落和换行
- 粗体和斜体
- 链接
- 图片
- 列表（有序和无序）
- 引用块
- 代码块
- 表格
- 水平分割线

## 示例文章

参考 `src/content/posts/pin.md` 查看完整示例。

## 路由说明

- 博客列表页：`/blog`
- 文章详情页：`/posts/[slug]`

其中 `[slug]` 是文章的文件名（不含 `.md` 扩展名）。
