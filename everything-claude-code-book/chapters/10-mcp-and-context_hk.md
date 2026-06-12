# 第 10 章 —— MCP 與上下文管理

[← 規則與記憶](09-rules-and-memory_hk.md) · [目錄](../README_hk.md) · [下一章：日常工作流程 →](11-everyday-workflows_hk.md)

---

## 10.1 何謂 MCP

**MCP**（Model Context Protocol,模型上下文協定）係一個將你嘅助手連接到外部服務嘅標準方式——GitHub、資料庫、部署平台、瀏覽器。一個 MCP 伺服器會暴露模型可以直接呼叫嘅*工具*。咁就唔使你將一個 SQL 結果複製貼上入對話,而係模型自己查詢資料庫。

短篇指南形容得好好：一個 MCP 係 *「圍住一個 API 嘅提示詞驅動包裝器」*——唔係 API 嘅替代品,而係模型用嚟駕馭佢嘅一個靈活方式。例子：Supabase MCP 令助手可以唔離開會話,就喺上游列出資料表同跑 SQL。

ECC 將 MCP 設定放喺 `mcp-configs/mcp-servers.json`,並只附帶**一個預設連接器**：`chrome-devtools`（瀏覽器控制）。其餘所有嘢都係可選加入——要麼係一個包住 CLI／REST API 嘅技能,要麼係一個你刻意啟用嘅目錄項目。呢個係一個*政策*,記載喺 `docs/MCP-CONNECTOR-POLICY.md`,佢之所以存在,係為咗保護呢一章真正講緊嘅嘢：你嘅**上下文視窗**。

---

## 10.2 上下文視窗問題（讀兩次）

呢度係成個 ECC 裏面最重要嘅操作課題,而佢令幾乎所有人都意外：

> **每一個 MCP 工具描述,喺你做任何工作之前,就已經消耗緊你上下文視窗嘅 token。** 太多啟用咗嘅 MCP,可以將一個 200k 嘅視窗縮細到大約 70k,而當你接近上限時,品質會急劇下降。

每一個啟用咗嘅 MCP 伺服器都會宣傳佢嘅工具,而每個工具嘅描述都永久咁佔住上下文。啟用十幾個多嘴嘅 MCP 伺服器,你就喺一啲你可能永遠唔會用嘅選單上,花咗三分一個視窗。

### 經驗法則
來自各指南：
- 保持**少於 10 個 MCP 伺服器啟用**。
- 保持**少於 80 個工具活躍**。
- *設定咗* 20–30 個 MCP 係無問題嘅——只係要**喺每個專案停用你冇用嗰啲**。

```bash
# 睇下啟用咗啲乜
/mcp

# 停用冇用嗰啲（Claude Code 會持久化到 ~/.claude.json）
```

> 注意：`/mcp` 係可靠嘅實時開關。編輯 `.claude/settings.json` **唔係**一個可靠嘅方法去關閉已經載入嘅 MCP 伺服器——用 `/mcp`。

---

## 10.3 用 CLI 取代 MCP 的技巧

長篇指南分享咗一個犀利嘅優化：**好多 MCP 都係可以替代嘅。** 版本控制（GitHub）、資料庫（Supabase）同部署（Vercel、Railway）已經有極佳嘅 **CLI**,而 MCP 本質上就係喺包住佢哋。所以與其成日載入 GitHub MCP：

- 建立一個包住你需要嘅 CLI 嘅**技能或指令**（例如一個用你偏好旗標跑 `gh pr create` 嘅 `/gh-pr`）。
- 你得到便利,而冇咗常駐嘅上下文成本。

呢個減少*上下文壓力*嘅程度,大過佢減少*token 用量*嘅程度——但配合延遲載入,上下文視窗問題就大致解決咗。對於任何有好 CLI 嘅嘢,「CLI 包進技能」係推薦嘅預設;將 MCP 留畀嗰啲工具呼叫人體工學真係有幫助嘅服務。

---

## 10.4 在 ECC 中設定 MCP

因為外掛安裝唔會自動啟用附帶嘅 MCP,所以你要選擇加入：

**實時，喺 Claude Code 內：**
```text
/mcp           # 新增 / 啟用 / 停用伺服器；持久化到 ~/.claude.json
```

**Repo 本地：** 將你想要嘅伺服器由 `mcp-configs/mcp-servers.json` 複製入一個專案 `.mcp.json`,並將任何 `YOUR_*_HERE` 佔位符換成真正嘅金鑰。

**如果你已經跑緊 ECC 附帶 MCP 的自己副本：**
```bash
export ECC_DISABLED_MCPS="chrome-devtools"
```
ECC 安裝／同步流程之後就會略過／移除嗰啲附帶伺服器,而唔係重新加入重複嘅。（`ECC_DISABLED_MCPS` 係一個安裝／同步過濾器,唔係一個實時 Claude 開關。）

ECC 認識嘅一組具代表性 MCP 伺服器（你會喺每個專案啟用少數幾個）：GitHub、Supabase、Context7（實時文件）、Exa（神經搜尋）、Memory、Playwright、Sequential Thinking、Vercel、Railway、Cloudflare、ClickHouse、Firecrawl,加上預設嘅 `chrome-devtools`。

---

## 10.5 其他節省上下文的工具

上下文紀律唔淨止係關於 MCP。ECC 同各指南推薦幾個習慣：

- **用 `mgrep` 取代 `grep`/ripgrep** —— 一個語意搜尋,喺 ECC 嘅 50 任務基準測試裏面,以相近或更好嘅品質,大約用咗**少一半嘅 token**。透過外掛 marketplace 安裝,並使用 `/mgrep` 技能。
- **模組化程式碼庫** —— 檔案以數百行計,而唔係數千行。檔案愈細 = 讀取愈平、首次嘗試成功率愈高。（呢個亦係一條*規則*。）
- **策略性壓縮** —— 停用自動壓縮,喺邏輯間隔壓縮（`/compact`,或者 `strategic-compact` 技能）。ECC 嘅 `suggest-compact` hook 會喺好嘅時機提醒你,而 `PreCompact` 會先儲存狀態。
- **上下文監視器** —— `post:ecc-context-monitor` hook 會喺上下文耗盡、成本失控、範圍蔓延同工具迴圈咬到你之前,警告你。
- **`/context-budget`** —— 分析你嘅 token 去咗邊,並削減開銷。

SessionStart 上下文注入本身亦有上限（預設 8000 字元），可以透過 `ECC_SESSION_START_MAX_CHARS`,或者為低上下文設定用 `ECC_SESSION_START_CONTEXT=off` 嚟調校。

---

## 10.6 外掛（MCP 的近親）

外掛將工具打包以便容易安裝——一個外掛可以捆綁技能、hooks、MCP 伺服器或 LSP 整合。同樣嘅上下文警告適用：啟用好多外掛（同佢哋嘅 MCP／工具）會食你個視窗。作者保持裝住大約 14 個外掛,但同一時間只**啟用 4–5 個**。

特別有用嘅外掛類型：
- **LSP 外掛**（`typescript-lsp`、`pyright-lsp`）—— 當你喺 IDE 以外運行助手時,提供實時型別檢查同跳到定義。
- **`hookify`** —— 用對話方式建立 hooks。
- **`mgrep`** —— 更好嘅搜尋。
- **`context7`** —— 實時文件。

---

## 10.7 重點摘要

- **MCP** 將模型連接到外部服務,作為可呼叫嘅工具;ECC 預設只附帶 `chrome-devtools`。
- **每個啟用嘅 MCP 都預先消耗上下文 token** —— 保持啟用**<10 個伺服器 / <80 個工具**;設定多、啟用少。
- 用 **`/mcp`** 作為實時開關（唔係 `settings.json`）。
- 對於有好 CLI 嘅服務,偏向**包進技能的 CLI**多過常駐 MCP。
- 用 **`mgrep`、模組化檔案、策略性壓縮、上下文監視器同 `/context-budget`** 保護上下文。

而家我哋將以上所有嘢拼合成你每日真正會跑嘅工作流程。

---

[← 規則與記憶](09-rules-and-memory_hk.md) · [目錄](../README_hk.md) · [下一章：日常工作流程 →](11-everyday-workflows_hk.md)
