# 第 18 章 —— 疑難排解與常見問題

[← 儀表板與工具](17-dashboard-and-tooling_hk.md) · [目錄](../README_hk.md) · [下一章：詞彙表與參考 →](19-glossary-reference_hk.md)

---

一份你實際會撞到嘅問題嘅實戰指南,大致按佢哋有幾常見排序。repo 自己嘅 `TROUBLESHOOTING.md` 同 FAQ 為呢一章提供咗資訊。

## 18.1 「所有嘢睇落都重複咗／ECC 感覺干擾或壞咗」

**成因：** 你疊埋多種安裝方法——外掛**同埋**完整安裝器。外掛已經載入技能／指令／hooks;安裝器又再複製多次。

**修復（按次序）：**
```bash
node scripts/ecc.js list-installed      # 睇下有啲乜
node scripts/ecc.js doctor              # 診斷
node scripts/ecc.js repair              # 還原受管理的檔案
# 如果仲係亂：
node scripts/uninstall.js --dry-run
node scripts/uninstall.js
```
然後：移除外掛安裝 → 由 repo 解除安裝 → 刪除額外嘅手動複製規則資料夾 → **重新安裝一次,只用一條路線。**（第 3 章,§3.7。）

---

## 18.2 「Duplicate hooks file detected」／hooks 唔運作

**成因：** Claude Code v2.1+ 會**自動載入**外掛嘅 `hooks/hooks.json`。你要麼喺 `plugin.json` 宣告咗 `"hooks"`,要麼喺裝咗外掛之上將 `hooks.json` 複製入 `settings.json`。

**修復：**
- 唔好喺 `.claude-plugin/plugin.json` 加入 `"hooks"` 欄位（有一個迴歸測試強制執行呢點）。
- 外掛用戶：唔好將 hooks 複製入 `settings.json`。
- 手動用戶：透過 `./install.sh --target claude --modules hooks-runtime` 安裝 hooks。

（歷史 issues：#29、#52、#103。）

---

## 18.3 「我嘅上下文視窗縮緊水／Claude 用盡上下文」

**成因：** 啟用咗太多 MCP 伺服器／工具——每個工具描述都食你個視窗。一個 200k 嘅視窗可以跌到大約 70k。

**修復：**
```text
/mcp     # 停用冇用的伺服器（持久化到 ~/.claude.json）
```
保持 **<10 個 MCP / <80 個工具**。亦要限制 SessionStart 上下文（`ECC_SESSION_START_MAX_CHARS=4000` 或 `ECC_SESSION_START_CONTEXT=off`）、策略性壓縮,並檢查 `/context-budget`。注意：編輯 `.claude/settings.json` **唔係**一個可靠嘅方法去停用已載入嘅 MCP——用 `/mcp`。

---

## 18.4 「Hooks 太嘈／太嚴／太慢」

喺執行階段調校——唔使改檔案：
```bash
export ECC_HOOK_PROFILE=minimal                 # 更安靜（或 'strict' 取最大）
export ECC_DISABLED_HOOKS="pre:bash:tmux-reminder,post:edit:typecheck"
export ECC_CONTEXT_MONITOR_COST_WARNINGS=off    # 保留警告，丟低成本估算
```
或者安裝 **`minimal` 設定檔**（無 `hooks-runtime`），稍後再用 `--modules hooks-runtime` 加返 hooks。

---

## 18.5 「我裝咗外掛，但我冇規則」

**預期之內。** Claude Code 外掛**無法分發規則**。手動複製佢哋：
```bash
git clone https://github.com/affaan-m/ECC.git && cd ECC
mkdir -p ~/.claude/rules/ecc
cp -r rules/common ~/.claude/rules/ecc/
cp -r rules/typescript ~/.claude/rules/ecc/   # 你的技術棧
```
複製成個語言目錄,而唔係個別檔案。

---

## 18.6 「`/multi-plan`（或其他 `multi-*`）唔運作」

**成因：** `multi-*` 指令需要外部嘅 `ccg-workflow` 執行階段,而基本安裝唔提供佢。

**修復：**
```bash
npx ccg-workflow
```
咁會設定 `~/.claude/bin/codeagent-wrapper`、`~/.claude/.ccg/prompts/*` 等等。

---

## 18.7 「技能／指令冇出現」

- **檢查安裝：** `/plugin list ecc@ecc`（外掛）或 `node scripts/ecc.js list-installed`（手動）。
- **技能放置：** Claude Code 只會由 `~/.claude/skills/` 嘅**直接子項**載入技能。唔好嵌套喺 `~/.claude/skills/ecc/` 之下。
- **版本：** 確保 Claude Code CLI 係 **v2.1.0+**（`claude --version`）。
- **Codex 外掛路線喺上游好脆弱**——偏向用 `scripts/sync-ecc-to-codex.sh` 多過 Codex 外掛 marketplace。

---

## 18.8 「我本地嘅 Claude 設定被清空咗——我使唔使重新購買 ECC？」

**唔使。** 喺重新安裝之前,先跑 `node scripts/ecc.js list-installed`,然後 `doctor` 同 `repair`——咁通常會還原 ECC 管理嘅檔案。ECC Tools 嘅帳單／帳戶恢復,同 OSS 檔案係兩件唔同嘅事。

---

## 18.9 「Cursor 同 Claude Code 互相覆蓋對方嘅記憶」

為 Cursor 設定一個獨立嘅 agent 資料 home：
```bash
export ECC_AGENT_DATA_HOME="$HOME/.cursor/ecc"
```
（Cursor 安裝會嘗試透過一個 `sessionStart` hook + `.cursor/ecc-agent-data.json` 自動做呢樣。）如要刻意*共享*記憶,將兩者都指向 `~/.claude`。

---

## 18.10 快速常見問題

**我可唔可以只用部分組件（淨係用 agents）？**
得——手動安裝並複製你想要嘅嘢。每個組件都係獨立嘅：`cp agents/*.md ~/.claude/agents/`。

**佢同我嘅 IDE/CLI 夾唔夾？**
Claude Code（原生）、Cursor、Codex（app+CLI）、OpenCode、Gemini、Zed、GitHub Copilot、Antigravity、JoyCode/CodeBuddy、Qwen,以及一條畀其他工具嘅手動路線。見第 12 章。

**我可唔可以喺自訂 API 端點上跑 ECC？**
得——設定 `ANTHROPIC_BASE_URL` 同 `ANTHROPIC_AUTH_TOKEN`;一旦 `claude` 行得到,ECC 就同供應商無關。（要留意 `ANTHROPIC_BASE_URL` 騎劫嘅 CVE——只信任你自己嘅閘道。）

**我點樣檢查裝咗啲乜？**
`/plugin list ecc@ecc` 或 `node scripts/ecc.js list-installed`。

**我點樣貢獻一個技能／代理？**
Fork → 加 `skills/your-skill/SKILL.md` 或 `agents/your-agent.md` 連 frontmatter → `npm test` → PR。見 `CONTRIBUTING.md`。

**佢真係免費？**
repo 永遠採用 MIT 授權。ECC Pro / ECC Tools（託管 GitHub App）同 Sponsors 資助開發,但唔係必要。

---

## 18.11 「有嘢怪怪哋時第一樣要跑」的序列

```bash
node scripts/ecc.js list-installed   # 裝咗咩
node scripts/ecc.js doctor           # 出咗咩問題
node scripts/ecc.js repair           # 修受管理的檔案
node tests/run-all.js                # repo 本身健唔健康？
npx ecc status --markdown --write status.md   # 完整就緒度快照
```

---

## 18.12 重點摘要

- 大部分問題都追溯到**疊埋嘅安裝**或**重複載入嘅 hooks**——用 `doctor`/`repair` 診斷,切勿喺上面再裝。
- 上下文問題 → **削減 MCP**（`/mcp`、<10/<80）同限制 SessionStart 上下文。
- 用外掛時冇規則係**預期之內**——手動複製佢哋。
- `multi-*` 指令需要 **`npx ccg-workflow`**。
- 有疑問時：`list-installed → doctor → repair`。

最後,係參考章節——所有術語、指令同環境變數一覽。

---

[← 儀表板與工具](17-dashboard-and-tooling_hk.md) · [目錄](../README_hk.md) · [下一章：詞彙表與參考 →](19-glossary-reference_hk.md)
