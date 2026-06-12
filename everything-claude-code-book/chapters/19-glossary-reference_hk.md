# 第 19 章 —— 詞彙表與快速參考

[← 疑難排解與常見問題](18-troubleshooting-faq_hk.md) · [目錄](../README_hk.md)

---

大約一版紙嘅速查表。將呢一章加入書籤。

## 19.1 詞彙表

| 術語 | 意思 |
|------|---------|
| **ECC** | Everything Claude Code——代理框架操作系統（本專案）。*唔係*橢圓曲線密碼學。 |
| **Harness（框架）** | 包住模型、令佢可以行動嘅程式（Claude Code、Cursor、Codex、OpenCode……）。 |
| **Agent（代理／子代理）** | 編排器委派工作畀嘅範圍受限專家;自己嘅上下文、有限工具、揀好嘅模型。 |
| **Orchestrator（編排器）** | 委派畀代理並組合結果嘅主助手。 |
| **Skill（技能）** | 標準嘅可重用工作流程單位（`skills/<name>/SKILL.md`）。 |
| **Command（指令）** | 打出嚟嘅斜線入口（`/plan`）;技能之上嘅相容層。 |
| **Hook（掛鈎）** | 由工具／會話事件觸發嘅自動化（`hooks/hooks.json` → Node 腳本）。 |
| **Rule（規則）** | 每個會話都載入嘅常駐準則（`rules/common/` + 各語言）。 |
| **MCP** | Model Context Protocol——一個暴露模型可呼叫工具嘅伺服器（GitHub、DB、瀏覽器）。 |
| **Instinct（本能）** | 一小塊有信心評分嘅已學行為（continuous-learning-v2）。 |
| **Codemap** | 一個程式碼庫嘅輕量地圖,令助手唔使重新探索就導航。 |
| **Profile（設定檔）** | 一個安裝組合：`minimal`、`core`、`full`。 |
| **Target（目標）** | 一次安裝所針對嘅框架：`--target claude|cursor|codex|opencode|zed|…`。 |
| **Agent data home** | ECC 會話／記憶／指標資料嘅根目錄（預設 `~/.claude`;`ECC_AGENT_DATA_HOME`）。 |
| **Lethal trifecta（致命三元組）** | 私隱資料 + 不可信內容 + 對外通訊處於同一個執行階段 = 外洩風險。 |
| **AgentShield** | ECC 附帶嘅安全審計器（`npx ecc-agentshield`）。 |
| **Prompt Defense Baseline** | 每個代理同 `CLAUDE.md` 裏面都有嘅反注入規則區塊。 |
| **ECC 2.0 / `ecc2/`** | 用嚟管理多個會話嘅 Rust 控制平面原型（alpha）。 |
| **pass@k / pass^k** | 「k 次中至少一次成功」對比「k 次全部成功」——評估可靠性指標。 |

---

## 19.2 ECC 的三個名

| 情境 | 識別碼 |
|---------|-----------|
| GitHub repo | `affaan-m/ECC`（別名 `affaan-m/ecc`） |
| 外掛／marketplace | `ecc@ecc` |
| npm 套件 | `ecc-universal` |

---

## 19.3 安裝快速參考

```bash
# 外掛（喺 Claude Code 內）
/plugin marketplace add https://github.com/affaan-m/ECC
/plugin install ecc@ecc

# 手動 / CLI
git clone https://github.com/affaan-m/ECC.git && cd ECC && npm install
./install.sh --profile minimal --target claude          # minimal = 無 hooks
./install.sh --profile core --without baseline:hooks --target claude
./install.sh --target claude --modules hooks-runtime    # 稍後加 hooks
npx ecc-install --profile minimal --target claude        # 唔使 clone

# 搵應該裝咩
npx ecc consult "security reviews" --target claude

# 規則（永遠手動）
mkdir -p ~/.claude/rules/ecc
cp -r rules/common ~/.claude/rules/ecc/
cp -r rules/typescript ~/.claude/rules/ecc/

# 生命週期 / 重設
node scripts/ecc.js list-installed | doctor | repair
node scripts/uninstall.js --dry-run
node scripts/uninstall.js

# 其他框架
./install.sh --target cursor typescript
bash scripts/sync-ecc-to-codex.sh
./install.sh --profile minimal --target zed
opencode      # 喺 repo 內，自動偵測 .opencode/
```

> **黃金法則：** 揀一條路線。切勿外掛 + 完整安裝器一齊用。

---

## 19.4 指令快速參考（按工作）

```text
PLAN/BUILD   /plan  /plan-prd  /multi-plan  /multi-execute  /orch-build-mvp  /orch-add-feature
TEST         tdd-workflow(skill)  /test-coverage  /go-test  /rust-test  /cpp-test  /react-test
REVIEW       /code-review  /python-review  /go-review  /rust-review  /security-scan
BUILD-FIX    /build-fix  /go-build  /rust-build  /kotlin-build  /gradle-build
VERIFY       /quality-gate  eval-harness(skill)  verification-loop(skill)
SESSIONS     /save-session  /resume-session  /sessions  /checkpoint  /aside  /context-budget
LEARN        /learn  /learn-eval  /evolve  /promote  /instinct-status  /instinct-import
             /instinct-export  /skill-create  /skill-health  /rules-distill  /prune
DOCS         /docs  /update-docs  /update-codemaps
LOOPS        /loop-start  /loop-status  /claw
HARNESS      /harness-audit  /model-route  /pm2  /setup-pm  /cost-report  /hookify
PR           /pr  /review-pr  /prp-prd  /prp-plan  /prp-implement  /prp-commit  /prp-pr
```
外掛形式會以命名空間作前綴,例如 `/ecc:plan`。

---

## 19.5 環境變數參考

| 變數 | 效果 |
|----------|--------|
| `ECC_HOOK_PROFILE` | Hook 嚴格程度：`minimal` / `standard`（預設）/ `strict` |
| `ECC_DISABLED_HOOKS` | 要停用的 hook id（逗號分隔） |
| `ECC_SESSION_START_MAX_CHARS` | 限制 SessionStart 注入的上下文（預設 8000） |
| `ECC_SESSION_START_CONTEXT` | `off` 完全停用 SessionStart 上下文 |
| `ECC_SESSION_RETENTION_DAYS` | 會話修剪時間窗（0/off/never = 全部保留） |
| `ECC_CONTEXT_MONITOR_COST_WARNINGS` | `off` 隱藏 API 速率成本估算 |
| `ECC_AGENT_DATA_HOME` | 會話／記憶／指標資料的根目錄（按框架隔離） |
| `ECC_DISABLED_MCPS` | 略過附帶 MCP 伺服器的安裝／同步過濾器 |
| `ECC_GOVERNANCE_CAPTURE` | `1` 啟用治理事件擷取 |
| `CLV2_HOMUNCULUS_DIR` | Continuous-learning-v2 instinct 儲存（預設 `~/.local/share/ecc-homunculus`） |
| `CLAUDE_PACKAGE_MANAGER` | 強制套件管理器（npm/pnpm/yarn/bun） |
| `ANTHROPIC_BASE_URL` / `ANTHROPIC_AUTH_TOKEN` | 自訂閘道／端點（只信任你自己嘅） |

---

## 19.6 Token 優化預設

```json
// ~/.claude/settings.json
{ "model": "sonnet",
  "env": { "MAX_THINKING_TOKENS": "10000", "CLAUDE_AUTOCOMPACT_PCT_OVERRIDE": "50" } }
```
路由：**Haiku**（搜尋／簡單）· **Sonnet**（預設編程）· **Opus**（架構／安全／難搞除錯）。保持 **<10 個 MCP / <80 個工具**。用 `mgrep`。保持檔案模組化。

---

## 19.7 安全最低門檻

1. 分隔身份（`agent@…`、範圍受限 token）。
2. 隔離不可信工作（容器／VM、`internal: true`）。
3. 為 `~/.ssh`、`~/.aws`、`.env`、`curl|bash`、`ssh`、`scp`、`nc` 設拒絕規則。
4. 按工作流程限定工具範圍;最小權限。
5. 淨化輸入;保持 Prompt Defense Baseline。
6. 批准 + 日誌 + 緊急停止掣。
7. `npx ecc-agentshield scan`（修復關鍵項）。
8. 唔好喺你嘅主機上 clone 同打開不可信嘅 repos。

---

## 19.8 一張圖看懂心智模型

```text
        身份與治理   (SOUL / RULES / AGENTS —— 憲法)
                  │ 治理
        組件目錄     (agents · skills · commands · rules · mcp)
                  │ 塑造
        轉接器與安裝器  (install.sh · manifests · 狀態儲存 · --target)
                  │ 落地並由其強制執行
        執行階段      (hooks → scripts; 記憶; 學習; 指標; ecc2)
```

五大原則橫切所有層級：**代理優先 · 測試驅動 · 安全優先 · 不可變性 · 先規劃後執行。**

---

## 19.9 接下來去哪

- repo 自己嘅指南：`the-shortform-guide.md`（先讀）、`the-longform-guide.md`、`the-security-guide.md`。
- `COMMANDS-QUICK-REF.md` 睇實時指令清單。
- `docs/` 睇深入內容（架構、發佈、各框架指南、i18n）。
- 原始碼：<https://github.com/affaan-m/ecc>

---

*你已經去到結尾。你而家知道咗 ECC 係乜、點解佢存在、佢點樣建構、點樣乾淨咁安裝、點樣喺日常跨框架咁操作、點樣令佢學習、點樣令佢保持快速,以及點樣令佢保持安全。去建構啦——並讓技能複利下去。*

[← 疑難排解與常見問題](18-troubleshooting-faq_hk.md) · [目錄](../README_hk.md)
