# AI Agent 开发规则

## 核心原则
- **效率至上**：快速单元式开发
- **不写文档**：只写代码，不创建 README、GUIDE 等文档文件
- **改完即退**：完成代码修改后立即退出，用户会手动测试
- **单元提交**：每个功能/修改单独提交到 Git
- **闭嘴**：非用户要求不输出任何内容，静默更改代码完毕后直接退出

## 工作流程
1. 理解需求
2. 编写/修改代码
3. 创建 Git 提交
4. 退出（不等待测试结果）

## 提交规范
- `feat:` - 新功能
- `fix:` - 修复 bug
- `refactor:` - 代码重构
- `style:` - 样式调整
- `perf:` - 性能优化
- `chore:` - 构建/工具/配置更新

---

# 项目知识

## 项目结构
- **前端**：Svelte 5 + SvelteKit + adapter-static，位于 `C:\Users\acofo\Documents\GitHub\svaf`
- **生图后端**：Node.js / Express + TypeScript，部署位置只记录在私有运维配置。
- **论坛后端**：Cloudflare Worker，源码位于 `C:\Users\acofo\Documents\GitHub\acofork_forum_backend`
- **数据存储**：由独立后端管理，不在公开仓库记录生产路径。
- **ComfyUI**：工作流与模型目录通过后端配置获取。

## 后端访问

生产主机、账号、密钥位置与部署路径只保存在私有运维配置；不要提交到公开文档。

## ByoLora 系统
- 用户通过 `LoraApplyDialog.svelte` 提交 Lora 申请
- 管理员在 `/draw/admin/` 的 "Lora审批" tab 中审批
- 审批通过后后端自动：请求 proxy 服务 → 下载 .safetensors → 存入 loras 目录 → 从**已有角色工作流克隆**（仅改 Lora 路径+触发词）创建新工作流
- 类型映射：`Illustrious（WAI）` → WAI 目录，`Anima` → ANIMA 目录
- 申请数据存于 `lora_applications.json`
- API: `/api/lora/{apply,my-submissions,cancel,admin/pending,admin/approve,admin/reject}`

## 工作流生成（createWorkflow）
- ❌ 旧方案：从 `无Lora.json` 插入 LoraLoader 节点（连线操作复杂易错）
- ✅ 当前方案：找同类型已有角色工作流当模板，只替换 LoraLoader 的 `lora_name` 和正向 CLIPTextEncode 的触发词
- 模板优先级：同分类 → 异环 → 鸣潮

## SvelteKit 静态站 popstate 问题
- 根因：SvelteKit Router 只处理 `event.state?.the === 'yes'` 的 popstate，初始页 `state=null` 被跳过
- 修复：`+layout.svelte` 中添加全局 popstate 监听，`event.state?.the !== 'yes'` 时 `location.reload()`
- 不能比 `$page.url` 后再 reload（会与 SvelteKit 异步导航冲突导致重复刷新）

## 部署
- 前端：`pnpm run deploy`（build + wrangler deploy）
- 前端推送后自动触发 Cloudflare 部署
- 后端在远程服务器，不推送

## 目录路由
- `/draw/` — AI 生图页面，使用 hash 路由（`#tab/subtab/subsubtab`）
- `/draw/admin/` — 管理后台
- `/forum/` — 论坛
- `/posts/` — 博客
