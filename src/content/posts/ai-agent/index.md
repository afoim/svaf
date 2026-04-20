---
title: AI Agent 二三事
published: 2026-03-05T14:51:54
description: 从实战角度对比 AI IDE 与 AI Agent，并演示如何用 ZCF 快速安装和配置 Codex。
image: img/ai-agent.png
draft: false
lang: ""
ai_level: 1
---
# 引言

了解我的人通常都知道，我平时写代码主要用 AI IDE，比如 Trae、Cursor 等。

AI IDE 的优势很明显：在保留 Git、代码高亮等高效手动工具的同时，把最耗时的代码编写交给 AI，我们只需要用自然语言描述目标即可。*图为 Trae*

![](/public/assets/images/ai-agent-1.png)

# AI Agent 是什么？

简单来说，AI Agent 一般提供的是一个“偏终端化”的工作环境。和 AI IDE 一样，它也能通过自然语言完成开发任务。

看起来好像和 AI IDE 没区别？其实差别很大。

如果你是先用 AI IDE，再切到 AI Agent，通常会感受到明显落差：界面更朴素，交互更直接。

AI Agent 往往只给你一个输入框。你描述目标后，它不仅能写代码，还能借助外部能力给自己“加特技”。

比如接入 **Playwright MCP**，它就可以自动改前端代码并执行自动化调试。

换句话说，AI Agent 的上手门槛看起来更低：你不一定要先理解完整代码结构，也不需要手动管理每一步流程。当然，对熟手来说，这种模式有时会降低精细控制的效率，但确实能省下不少精力。

例如，我们可以把 Git 推送远程仓库这类流程交给 AI：自动生成 commit、自动配置代理、自动 push，并把本次规则和约束持久化，下次就不用重复说明。*图为 Codex*

![](img/ai-agent-2.png)

# 各 AI Agent 的区别

### [OpenCode | 开源 AI 编程代理](https://opencode.ai/zh)

游客可以直接使用免费的公益模型，不需要付费。

![](img/Image_1772724238045_770.png)

### [Claude Code by Anthropic | AI Coding Agent, Terminal, IDE](https://claude.com/product/claude-code)

它需要一个 **POSIX Terminal**（比如 **Git Bash**）。否则很多终端命令无法正常执行，因为它的工作流高度依赖 Bash 命令（如 `cat`、`ls`）。

想要完整发挥体验，通常需要使用 **Claude** 系列模型。在一次会话中，它可能会让不同模型分工处理理解、规划、执行、测试等环节。

![](img/Image_1772724294856_373.png)

### [Codex](https://chatgpt.com/codex)

> 目前我本人在用

限制相对少，在 Windows Terminal（PowerShell）里也能跑得很好。

只需要提供可用的模型 API 即可。

![](img/ai-agent-3.png)

# 如何优雅地使用 AI Agent

当然，你也可以手动配置各种 Agent，其实并不难。

通常只要看文档、找到配置文件（一般是 `.json`），然后手写一份配置，或者让 AI 帮你生成一份。

但目前已经有不少图形化、一键化工具，我更推荐先用这些工具快速上手。

### [CC-Switch](https://github.com/farion1231/cc-switch)

它可以用图形界面为不同 Agent 配置模型。你只需要像填表一样填入 API Endpoint、API Key、模型名，它会自动生成并应用对应 Agent 的 JSON 配置。

同时也支持图形化配置 MCP 和 Skill。

![](img/ai-agent-4.png)

### [ZCF](https://github.com/UfoMiao/zcf)

这个工具可以自动帮你安装 Agent，并一键部署一些主流 MCP，还能设置模型系统提示词预设，并提供基础工作流。

![](img/ai-agent-5.png)

# 从零安装并配置一个 Agent

> 你需要事先准备一个模型 API

先设置 NPM 镜像源：[npmmirror 镜像站](https://npmmirror.com/)

全局安装 zcf（Node 20.x+）：

```bash
npm install -g zcf
```

运行 zcf：

```bash
npx zcf
```

接着把目标 Agent 从 **Claude Code** 切换为 **Codex**。输入 `S` 切换到 Codex。

![](img/ai-agent-6.png)

然后输入 `1` 执行完整初始化，按需勾选即可。

默认情况下，AI Agent 会先在沙盒里执行命令；如果某条指令在沙盒中失败，才会询问你是否允许在正常环境执行。

你也可以使用一个高风险启动参数，让 Codex 进入“无人值守、默认放行”的模式：

> [!caution]
> 使用该参数启动 Codex 后，指令可能被 **默认执行**，并且默认在 **正常环境** 下运行。这非常危险，请务必谨慎。

```bash
codex --dangerously-bypass-approvals-and-sandbox
```

这个命令很长，可以做成别名。

- Bash：

```bash
alias codexfull='codex --dangerously-bypass-approvals-and-sandbox'
```

- PowerShell：

```powershell
# 创建 PS 配置文件
New-Item -Type File -Force $PROFILE

# 用记事本打开 PS 配置文件
notepad $PROFILE
```

加入这一段：

```powershell
function codexfull {
    codex --dangerously-bypass-approvals-and-sandbox $args
}
```

之后在你的项目目录直接输入 `codexfull`，即可启动一个高权限执行模式的 Agent。

![](img/ai-agent-7.png)

接下来你就可以让它做你要做的事：删文件、写文章、修 Bug，甚至从零搭建项目。

![](img/ai-agent-8.png)

![](img/ai-agent-9.png)
