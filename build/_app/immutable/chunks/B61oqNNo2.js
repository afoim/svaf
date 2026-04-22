import{n as e}from"./pn1seLaS.js";import{D as t,F as n,L as r,Mt as i,jt as a,ot as o,st as s}from"./R8CaXVlq.js";import"./ZsEnWiqm.js";var c=e({default:()=>v,metadata:()=>l}),l={title:`Codex！无限剑制！`,published:`2026-03-06T05:48:05.000Z`,description:`多的不说，仅做记录`,image:`img/codex.avif`,draft:!1,lang:``,ai_level:1},{title:u,published:d,description:f,image:p,draft:m,lang:h,ai_level:g}=l,_=r(`<h1>原理</h1> <pre class="language-mermaid"></pre> <h1>实操</h1> <p>首先，获得“魔法”，获得大量 OAuth Token</p> <p><img src="img/codex-unlimited-blade-works.avif"/></p> <p>安装 <a href="https://github.com/router-for-me/CLIProxyAPI" rel="nofollow">router-for-me/CLIProxyAPI: Wrap Gemini CLI, Antigravity, ChatGPT Codex, Claude Code, Qwen Code, iFlow as an OpenAI/Gemini/Claude/Codex compatible API service, allowing you to enjoy the free Gemini 2.5 Pro, GPT 5, Claude, Qwen model through API</a>。前往 <code>/management.html</code></p> <p>上传认证文件</p> <p><img src="img/codex-unlimited-blade-works-1.avif"/></p> <p>添加 API Key</p> <p><img src="img/codex-unlimited-blade-works-2.avif"/></p> <p>查看可用模型</p> <p><img src="img/codex-unlimited-blade-works-4.avif"/></p> <p>导入 Claude Code</p> <p><img src="img/codex-unlimited-blade-works-3.avif"/></p> <p>用</p> <p><img src="img/codex-unlimited-blade-works-5.avif"/></p>`,1);function v(e){var r=_(),c=s(o(r),2);t(c,()=>`<code class="language-mermaid">flowchart TD
    A[&quot;通过“魔法”获得大量 OAuth Token&quot;]

    subgraph CPA
        B[&quot;批量导入 OAuth Token 到 CPA&quot;]
        C[&quot;CPA 创建虚拟 API 端点&quot;]
        D[&quot;生成 API Key&quot;]
        E[&quot;获得 OpenAI 兼容 API&quot;]

        B --&gt; C --&gt; D --&gt; E
    end

    F[&quot;接入 Claude Code / Codex&quot;]

    A --&gt; B
    E --&gt; F</code>`,!0),i(c),a(28),n(e,r)}export{c as t};