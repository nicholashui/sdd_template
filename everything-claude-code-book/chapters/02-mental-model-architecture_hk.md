# 第 2 章 —— 心智模型與架構

[← 背景與理念](01-background-and-philosophy_hk.md) · [目錄](../README_hk.md) · [下一章：安裝 →](03-installation_hk.md)

---

## 2.1 四個層級

要*理解* ECC（而唔係死記）,最快嘅方法就係將佢睇成四個疊起嘅層級。每個層級回答一個唔同嘅問題,而每個層級都由上面嗰個層級塑造。

<p align="center">
  <img src="../assets/svg/02-architecture-layers.svg" alt="ECC 的四個層級：身份、目錄、轉接器、執行階段" width="780">
</p>

### 第 1 層 —— 身份與治理（「ECC 係邊個」）
三個細小嘅根目錄檔案訂立咗憲法：

- **`SOUL.md`** —— 核心身份同五大原則。
- **`RULES.md`** —— 硬性嘅「必須永遠／必須永不」約束,加上代理、技能同 hooks 所需嘅格式。
- **`AGENTS.md`** 同 **`CLAUDE.md`** —— 助手會讀嘅指示,包括代理陣容、安全準則同工作流程。

呢一層就係*點解*其餘所有嘢會以某種方式運作嘅原因。

### 第 2 層 —— 組件目錄（「可重用嘅嘢」）
repo 嘅核心——你會安裝同呼叫嘅嘢：

```text
agents/        skills/        commands/        rules/        mcp-configs/
```

本書大部分內容都係關於呢一層（第 5–10 章）。

### 第 3 層 —— 框架轉接器與安裝器（「點樣落到磁碟上」）
目錄係*通用*嘅。每款 AI 工具都想佢嘅設定放喺唔同嘅位置同格式。呢一層負責翻譯：

- `install.sh` / `install.ps1` / `npx ecc-install` —— 入口點。
- `manifests/` + `scripts/install-plan.js` + `scripts/install-apply.js` —— 選擇性安裝引擎。
- 一個**狀態儲存**會記錄安裝咗啲乜,從而支援乾淨嘅更新同解除安裝。
- 目標：`.claude/`、`.cursor/`、`.codex/`、`.opencode/`、`.gemini/`、`.zed/`、`.github/`、`.qwen/`、`.codebuddy/`……

### 第 4 層 —— 執行階段與強制執行（「你工作期間發生甚麼」）
當一個會話真正運行嗰陣,呢一層就會活躍起嚟：

- `hooks/hooks.json` 將事件對應到 `scripts/hooks/` 裏面嘅 **Node.js 腳本**。
- Hooks 會格式化程式碼、掃描秘密資料、把守品質、持久化記憶,並擷取學習訊號。
- 各項指標同可觀測性會餵入 **`ecc` CLI** 同 **ECC 2.0 控制平面**（`ecc2/`）。

> **心智捷徑：** 身份*治理*目錄 → 目錄由轉接器*塑造* → 轉接器將佢*落地* → 執行階段*強制執行*佢。上層治理下層。

---

## 2.2 儲存庫地圖

以下係頂層樹狀結構嘅附註導覽。當中大部分你都唔會直接接觸,但了解地形可以消除好多神秘感。

```text
ECC/
├── SOUL.md, RULES.md, AGENTS.md, CLAUDE.md   # 第 1 層：身份與治理
├── VERSION                                   # 2.0.0
│
├── agents/            # 64 個專門子代理（帶 frontmatter 的 *.md）
├── skills/            # 262+ 個技能，每個位於 skills/<name>/SKILL.md
├── commands/          # 84 個斜線指令（向後相容；技能優先）
├── legacy-command-shims/  # 已退役短名稱的可選封存庫（/tdd、/eval……）
├── rules/             # common/ + 各語言（typescript、python、golang、swift、php、arkts）
├── hooks/             # hooks.json + memory-persistence/ + README
├── mcp-configs/       # mcp-servers.json —— MCP 連接器定義
├── contexts/          # dev.md / review.md / research.md —— 系統提示注入
│
├── scripts/           # 跨平台 Node.js 管路
│   ├── hooks/             # 實際的 hook 實作
│   ├── lib/               # 共用工具、套件管理器偵測
│   ├── ecc.js             # 操作者 CLI（consult、doctor、repair、status……）
│   ├── install-plan.js    # 選擇性安裝規劃器
│   ├── install-apply.js   # 選擇性安裝套用器（亦即 `ecc-install` bin）
│   └── …（編排、會話、發佈、審計）
│
├── ecc2/              # ECC 2.0 —— Rust 控制平面原型（alpha）
├── ecc_dashboard.py   # Tkinter 桌面 GUI
│
├── install.sh / install.ps1    # 安裝器入口點
├── manifests/         # 選擇性安裝的安裝清單
├── schemas/           # 用於驗證的 JSON schema
├── tests/             # 測試套件（node tests/run-all.js）
├── examples/          # 範例 CLAUDE.md 設定（SaaS、Go、Django、Rust……）
│
├── the-shortform-guide.md      # 「先讀呢個」設定指南
├── the-longform-guide.md       # 進階模式
├── the-security-guide.md       # 代理式安全
├── COMMANDS-QUICK-REF.md       # 斜線指令速查表
├── docs/              # 深入文件（架構、發佈、各框架指南、i18n）
│
└── 各框架設定目錄：
    .claude/  .cursor/  .codex/  .opencode/  .gemini/  .zed/  .github/  .qwen/  .codebuddy/  .trae/
```

### 三份指南係金礦
repo 講得好直白：*「呢個 repo 只係原始程式碼。指南先解釋一切。」* 三個 `the-*-guide.md` 檔案係作者自己嘅教學材料,值得直接拜讀：

- **`the-shortform-guide.md`** —— 基礎：技能、hooks、子代理、MCP、外掛。*先讀呢個。*
- **`the-longform-guide.md`** —— token 經濟學、記憶持久化、評估（evals）、並行化。
- **`the-security-guide.md`** —— 攻擊向量、沙箱、CVE、AgentShield。

本書濃縮並整理咗呢三份指南（第 11、13、14、15 章）,但原文寫得極之出色。

---

## 2.3 一個請求如何流經 ECC

我哋追蹤一下,當你打一個請求嗰陣實際發生咩事。假設你執行 `/ecc:plan "add OAuth login"`：

1. **治理載入。** 規則同 `AGENTS.md` 已經喺上下文裏面,所以助手知道各項標準（TDD、不可變性、安全）。
2. **SessionStart hook**（如果有裝）已經注入咗先前會話嘅記憶,並偵測到你嘅套件管理器。
3. **指令／技能觸發。** `/plan` 對應到規劃邏輯,佢可能會**委派畀 `planner` 代理**。
4. **代理喺一個範圍受限嘅上下文中工作**,只有有限工具同合適嘅模型,然後回傳一份 `plan.md`。
5. **你確認。** 先規劃後執行,意味住佢會等你。
6. **實作進行**,大概會透過 `tdd-workflow` 技能同 `tdd-guide` 代理。
7. **Hooks 持續觸發** —— 每次編輯都格式化、型別檢查、秘密資料掃描、console.log 警告。
8. **審查**：透過 `/code-review`（`code-reviewer` 代理）同 `/security-scan`。
9. **Stop hook** 寫低一份會話摘要,並擷取任何學習所得。

每一層都參與咗。嗰種編排正正就係重點所在——我哋會喺第 5 章睇到佢嘅圖解。

---

## 2.4 兩個家：原始碼 repo vs. 已安裝設定

一個常見嘅混淆來源：**ECC 住喺兩個地方**。

| | 原始碼 repo | 你已安裝的設定 |
|---|------------------|------------------------|
| 位置 | `~/code/ECC`（一個 `git clone`） | `~/.claude/`、`.cursor/` 等 |
| 包含 | 完整目錄、腳本、指南 | 只有你安裝咗的組件 |
| 你何時編輯 | 貢獻／自訂原始碼嗰陣 | 調整你的實時設定嗰陣 |
| 由甚麼更新 | `git pull` | 重新跑安裝器／外掛更新 |

安裝器會由原始碼 repo（或外掛快取）讀取,並將解析後嘅檔案寫入你嘅設定目錄。**狀態儲存**會記住對應關係,令 `doctor`、`repair` 同 `uninstall` 可以精準運作。

> **外掛用戶注意：** 用 Claude Code 外掛時,「原始碼」係一個位於 `~/.claude/plugins/…` 下、受管理嘅快取,而唔係由你維護嘅 clone。如果你想複製 `rules/`,仍然需要另外 clone repo（外掛無法分發規則——見第 3 章）。

---

## 2.5 你會見到的命名（同點解咁混亂）

ECC 有**三個刻意唔同**嘅公開識別碼：

| 情境 | 識別碼 |
|---------|-----------|
| GitHub 原始碼 repo | `affaan-m/ECC`（同短別名 `affaan-m/ecc`） |
| Claude marketplace／外掛 | `ecc@ecc` |
| npm 套件 | `ecc-universal` |

所以 `npm install` 同 `/plugin install` *刻意用唔同名*。外掛 id 保持簡短（`ecc@ecc`）以滿足嚴格嘅驗證器;npm 套件保留咗原本嘅 `ecc-universal` 名。較舊嘅帖文可能顯示一個較長嘅舊版 marketplace id——當佢已經棄用就得。

---

## 2.6 重點摘要

- ECC 係四層：**身份 → 目錄 → 轉接器 → 執行階段**,上層治理下層。
- **目錄**（`agents/ skills/ commands/ rules/ mcp-configs/`）就係你安裝同呼叫嘅嘢。
- **安裝器 + 安裝清單 + 狀態儲存**將通用目錄翻譯落每個框架。
- **執行階段**（hooks → Node 腳本）就係實時強制執行標準嘅嘢。
- 有**兩個家**：原始碼 repo 同你已安裝嘅設定。
- 三個名——`affaan-m/ECC`、`ecc@ecc`、`ecc-universal`——指向同一個專案。

而家你有咗地圖,我哋第一次就將佢正確咁安裝好。

---

[← 背景與理念](01-background-and-philosophy_hk.md) · [目錄](../README_hk.md) · [下一章：安裝 →](03-installation_hk.md)
