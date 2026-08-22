---
title: 让 AI 干完活自己喊一声：Windows 下给 Codex、Claude Code、OpenCode 加 TTS 提示
description: 不用 Beep，也不额外维护 .ps1 文件，让三个终端 AI 工具在响应结束后用 PowerShell 内置 TTS 播报完成提示。
image: img/windows-ai-agent-tts.svg
published: 2026-08-22
draft: false
pinned: false
tags: [AI, Windows]
---
> [!NOTE] 本文由 GPT-5（Codex）根据给定教程和官方文档生成，并经过人工整理。文中的配置按 2026 年 8 月的文档口径编写，工具更新后字段可能变化。

## 先说结论

我很讨厌把任务丢给 AI 以后去刷网页。回来以后，第一件事不是看它写得怎么样，而是先确认：**它到底是在认真干活，还是早就停在那里等我了？**

终端里盯着光标看当然也能知道，但那种感觉很像守着洗衣机等它脱水。Windows 自带语音合成，正好可以把这件事变成一句人话：

```text
ChatGPT工作完成
Claude Code工作完成
Open Code工作完成
```

这篇记录一套比较克制的做法：不使用 `Beep`，不创建额外的 `.ps1` 文件，不启动一堆后台 PowerShell worker，只在原来的 Hook 或插件里替换完成命令。

![Windows 下给三个 AI 编程工具添加语音完成提示](img/windows-ai-agent-tts.svg)

## 三个工具的“完成”不是一回事

先把事件选对，不然最后会得到一个非常勤快、但非常吵的电脑。

| 工具 | 配置位置 | 推荐事件 | 它更接近什么 |
|---|---|---|---|
| Codex | `%USERPROFILE%\.codex\hooks.json` | `Stop` | 一次代理回合停止 |
| Claude Code | `%USERPROFILE%\.claude\settings.json` | `Stop` | 主代理完成一次响应 |
| OpenCode | `%USERPROFILE%\.config\opencode\plugins\*.ts` | `session.idle` | 会话进入空闲状态 |

Codex 的 [Hooks 官方文档](https://learn.chatgpt.com/docs/hooks) 将 `Stop` 列为回合生命周期事件；当前版本还支持 `commandWindows` 作为 Windows 专用命令覆盖。需要注意的是，Codex 会加载多个匹配的 Hook，同一个事件的多个命令也可能并行启动，所以旧配置里的重复提醒最好清理掉。

Claude Code 的 [`Stop`](https://code.claude.com/docs/en/hooks#stop) 是“主代理完成响应”，不是“整个复杂任务从此彻底结束”。多步骤任务中，模型可能先停一次，随后又被 Hook 或后台任务唤醒。因此它是最接近的事件，不是严格的一次性任务完成信号。

OpenCode 的插件事件里有 [`session.idle`](https://dev.opencode.ai/docs/plugins/#send-notifications)，官方示例也用它做会话完成通知。当前文档说明，放在 `.opencode/plugins/` 或用户目录 `~/.config/opencode/plugins/` 下的本地插件会被自动加载，不必为了一个本地文件再写一层命令模板。

## PowerShell 内置 TTS

Windows 自带的语音组件是：

```powershell
System.Speech.Synthesis.SpeechSynthesizer
```

先在 PowerShell 里手动测试一个可读版本：

```powershell
powershell.exe -NoProfile -NonInteractive -Command 'Add-Type -AssemblyName System.Speech; $tts = New-Object System.Speech.Synthesis.SpeechSynthesizer; try { $tts.Speak(("ChatGPT" + [char]0x5DE5 + [char]0x4F5C + [char]0x5B8C + [char]0x6210)) } finally { $tts.Dispose() }'
```

这里没有直接把中文写进命令，而是把“工作完成”拆成 Unicode 码点：

```text
[char]0x5DE5 = 工
[char]0x4F5C = 作
[char]0x5B8C = 完
[char]0x6210 = 成
```

这样做有点丑，但可以绕开配置文件编码、终端代码页和多层引号带来的麻烦。`Speak()` 是同步调用，短句播完以后才退出；这比每次事件都 `Start-Process` 一个新的 PowerShell 稳定得多。

只想换播报名称的话，把 `ChatGPT` 换成：

```powershell
"Claude Code"
```

或者：

```powershell
"Open Code"
```

## 为什么要用 EncodedCommand

把 PowerShell 直接塞进 JSON 或 TypeScript，容易撞上几层解析器：

- JSON 自己要处理双引号；
- PowerShell 里的 `$tts` 可能被外层提前展开；
- TypeScript 模板字符串还会再处理一遍反引号和插值；
- Bash、cmd、PowerShell 对引号和转义的规则不一样；
- Hook 如果误读 stdin，会一直等输入，最后看起来像卡死。

所以真正放进配置文件的命令使用：

```powershell
powershell.exe -NoProfile -NonInteractive -EncodedCommand <BASE64字符串>
```

`EncodedCommand` 不是普通 UTF-8 Base64，它要求先用 UTF-16LE（PowerShell 里的 `[Text.Encoding]::Unicode`）编码。

用下面的生成器得到编码字符串：

```powershell
$label = 'ChatGPT'

$ttsCommand = 'Add-Type -AssemblyName System.Speech; $tts = New-Object System.Speech.Synthesis.SpeechSynthesizer; try { $tts.Speak(("' + $label + '" + [char]0x5DE5 + [char]0x4F5C + [char]0x5B8C + [char]0x6210)) } finally { $tts.Dispose() }'

[Convert]::ToBase64String(
    [Text.Encoding]::Unicode.GetBytes($ttsCommand)
)
```

分别把 `$label` 改成 `ChatGPT`、`Claude Code`、`Open Code`，保存三份输出。不要手动折行，也不要把尖括号一起填进配置。

## 给 Codex 加语音提醒

### 配置文件

用户级配置一般在：

```text
%USERPROFILE%\.codex\hooks.json
```

当前 Codex 也支持在 `config.toml` 里写内联 Hook；如果同一层同时存在两种写法，文档建议只保留一种。这里沿用更容易搬运的 `hooks.json`。

### 配置结构

把 `<CHATGPT_TTS_BASE64>` 换成刚才生成的字符串：

```json
{
  "description": "Speak when a Codex agent turn stops.",
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "powershell.exe -NoProfile -NonInteractive -EncodedCommand <CHATGPT_TTS_BASE64>",
            "commandWindows": "powershell.exe -NoProfile -NonInteractive -EncodedCommand <CHATGPT_TTS_BASE64>",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

`commandWindows` 是 Windows 专用覆盖；在纯 Windows 配置里保留 `command` 作为回退也没关系。

### 这里最容易忘的两件事

第一，如果 `config.toml` 里还留着旧的 `notify = [...]`，或者你自己写过 `turn-ended`、后台 worker 一类的完成提醒，不要让它和 `Stop` 同时播报。同一件事只保留一个声音来源。

第二，修改 Hook 后不是保存文件就结束。重启 Codex，在 `/hooks` 里重新检查并信任这个变更。当前 Codex 会按 Hook 定义的哈希记录信任状态，改过的命令可能会被标记为需要重新审核。

这个 TTS 命令不会读取 stdin，也不会向 stdout 输出普通文本。这样既不会因为等待输入卡住，也不会把无效文本塞进 `Stop` 事件的输出通道。

## 给 Claude Code 加语音提醒

### 配置文件

```text
%USERPROFILE%\.claude\settings.json
```

如果原来已经有 `Stop` Hook，不要把整个文件覆盖掉，只替换原来播放 Beep 的那一项 `command`。

例如：

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "async": true,
            "command": "powershell.exe -NoProfile -NonInteractive -EncodedCommand <CLAUDE_CODE_TTS_BASE64>",
            "timeout": 5,
            "type": "command"
          }
        ]
      }
    ]
  }
}
```

这里保留了 `async: true`，因为播报一句短提示没有必要阻塞 Claude Code。代价是：如果连续触发多个 `Stop`，语音可能重叠。只配置一个短句通常够用；如果你需要绝对不重叠，就要额外做互斥或单实例队列。

Claude Code 的 Stop Hook 不会在用户主动中断时触发，API 错误则会走 `StopFailure`，所以它表达的是“正常完成了一次响应”，不是“所有情况都收到了完成通知”。

## 给 OpenCode 加语音提醒

OpenCode 的完成提示是插件逻辑，不是 `opencode.json` 里的普通命令模板。

### 插件文件

推荐放在：

```text
%USERPROFILE%\.config\opencode\plugins\done-sound.ts
```

当前 OpenCode 会自动加载这个目录下的本地插件。项目级插件则放进项目的：

```text
.opencode\plugins\done-sound.ts
```

把生成好的编码字符串填到 `TTS_BASE64`：

```typescript
const TTS_BASE64 = "<OPEN_CODE_TTS_BASE64>"

export const DoneSound = async ({ $ }) => {
  return {
    event: async ({ event }) => {
      if (event.type !== "session.idle") return

      await $`powershell.exe -NoProfile -NonInteractive -EncodedCommand ${TTS_BASE64}`
    },
  }
}
```

这里通过 Bun 的 `$` Shell API 执行 PowerShell，并把 Base64 作为插值传入，避免在 TypeScript 模板字符串里再手动处理引号。

如果你使用的是旧版本，已经在 `opencode.json` 里显式注册了本地插件路径，可以继续保留原来的注册方式；但不要把下面这种普通命令模板当成事件 Hook：

```json
{
  "command": {
    "done": {
      "description": "播放任务完成提示音",
      "template": "..."
    }
  }
}
```

这只是一个可调用的命令模板。真正监听 `session.idle` 并执行 TTS 的，是 `plugins/done-sound.ts`。

另外，OpenCode 桌面版本身也可能在响应完成或会话出错时发送系统通知。如果你已经打开了桌面通知，又启用了 TTS，最好先关掉其中一套，免得一次任务收到两份提醒。

## 我之前踩过的坑

### 同时使用多个完成事件

错误结构通常长这样：

```text
notify → turn-ended → PowerShell worker → TTS
```

同时又加了：

```text
Stop Hook → TTS
```

一次任务可能触发两条链路，最后不是“提醒完成”，而是电脑开始自言自语。先决定你想监听的是“响应结束”还是“会话空闲”，然后只留一条链。

### 把每个小回合当成整个任务完成

多步骤 Agent 的真实过程经常是：

```text
模型响应
→ 工具调用
→ 中间回合
→ 继续推理
→ 最终响应
```

Codex 和 Claude Code 的 `Stop` 都更接近“当前回合停了”。如果你的要求是“复杂任务全部结束后只响一次”，就需要额外的去重、冷却时间或状态管理。OpenCode 的 `session.idle` 在语义上更接近这个目标，但也不等于跨所有版本的绝对一次性保证。

### 用 Start-Process 启动一堆语音进程

容易出问题的写法：

```powershell
Start-Process powershell.exe ...
```

每个事件都开一个新进程，多个短句会重叠，旧进程还可能在下一次任务开始时继续说话。短提示直接调用：

```powershell
$tts.Speak("工作完成")
$tts.Dispose()
```

播完退出，生命周期最简单。

### 让 Hook 读取 stdin

如果你的语音命令根本不需要事件 JSON，就不要写：

```powershell
[Console]::In.ReadToEnd()
```

Hook 的输入流什么时候结束并不总是符合你的直觉。只执行固定 TTS 时，读 stdin 没有任何收益，只有卡死的可能。

### 三层引号互相打架

这种命令本身就已经经过了配置文件、外层 Shell 和 PowerShell 三层解析：

```powershell
powershell.exe -Command "$tts.Speak(...)"
```

外层 PowerShell 可能先把 `$tts` 展开，最后真正启动的进程拿到的是一条残缺命令。手动测试时可以用单引号包住 `-Command`，真正写进 Hook 时则统一用 `-EncodedCommand`。

## 推荐的实施顺序

1. 先手动执行可读版本，确认能听到语音、播报内容正确、PowerShell 能正常返回。
2. 用 `$label` 生成对应的 UTF-16LE Base64。
3. 只替换现有 Hook 的 `command`，不要一边加新 Hook，一边保留旧的 Beep 链路。
4. 按工具重新加载：Codex 重启并在 `/hooks` 里重新信任；Claude Code 开新会话；OpenCode 重启以加载插件。
5. 只执行一次真实任务验证，别同时手动播放、手动触发 Hook、再跑一遍真实任务，否则很容易把三次声音误判成重复事件。

## 最后

如果你的目标是“每次 AI 给出一个可见响应后提醒”：

- Codex 用 `Stop`；
- Claude Code 用 `Stop`；
- OpenCode 用 `session.idle`。

如果你的目标是“整个复杂任务彻底结束后只提醒一次”，那就不要把 `Stop` 误当成任务级事件。Codex 和 Claude Code 需要额外去重，OpenCode 的 `session.idle` 更合适，但仍然应该避免同时启用桌面通知、插件通知和旧的 worker 链路。

核心 PowerShell 结构始终就这么几行：

```powershell
Add-Type -AssemblyName System.Speech
$tts = New-Object System.Speech.Synthesis.SpeechSynthesizer

try {
    $tts.Speak(("应用名称" + [char]0x5DE5 + [char]0x4F5C + [char]0x5B8C + [char]0x6210))
}
finally {
    $tts.Dispose()
}
```

剩下的只是决定：**什么时候算完成，以及你想让谁来喊。**
