# 第 3 章 —— 安裝與設定

[← 心智模型與架構](02-mental-model-architecture_hk.md) · [目錄](../README_hk.md) · [下一章：核心概念 →](04-core-concepts_hk.md)

---

呢一章係你要*完全做啱*嗰一章,因為馬虎嘅安裝係「ECC 感覺壞咗／重複咗」嘅頭號成因。好消息係：規則好簡單。

## 3.1 防止大部分問題的唯一規則

> **只揀一條安裝路線。永遠唔好疊埋一齊。**

有兩條路線：
1. **外掛**（Claude Code 嘅推薦預設）。
2. **手動安裝器／CLI**（`install.sh`、`install.ps1`、`npx ecc-install`）。

經典嘅損壞設定係：跑咗 `/plugin install` *之後又*跑 `./install.sh --profile full`。外掛已經載入咗 ECC 嘅技能、指令同 hooks;完整安裝器跟住又將同樣嘅嘢複製入你嘅用戶目錄——令你出現**重複技能同重複嘅執行階段行為**。如果你已經咁做咗,喺做任何其他嘢之前,跳去 [§3.7 重設](#37-重設與解除安裝)。

<p align="center">
  <img src="../assets/svg/07-install-decision.svg" alt="選擇 ECC 安裝路線的決策樹" width="780">
</p>

---

## 3.2 需求

- **Claude Code CLI v2.1.0 或更新版本**（`claude --version`）。外掛嘅 hook 自動載入行為依賴佢。
- **Node.js**（hooks 同腳本以 Node 為基礎;喺 Windows／macOS／Linux 跨平台）。
- 一個套件管理器——npm、pnpm、yarn 或 bun。ECC 會自動偵測你用緊邊個。

---

## 3.3 路線 A —— 外掛（Claude Code 推薦）

喺一個 Claude Code 會話內：

```text
/plugin marketplace add https://github.com/affaan-m/ECC
/plugin install ecc@ecc
```

或者喺 `~/.claude/settings.json` 以宣告式方式接駁佢：

```json
{
  "extraKnownMarketplaces": {
    "ecc": { "source": { "source": "github", "repo": "affaan-m/ECC" } }
  },
  "enabledPlugins": { "ecc@ecc": true }
}
```

咁即時畀到你各個代理、技能、指令同 hooks。**但唔包括規則**——見 §3.5。

> **重要的 hook 陷阱（給貢獻者）：** **唔好**喺 `.claude-plugin/plugin.json` 加入 `"hooks"` 欄位。Claude Code v2.1+ 會按慣例自動載入外掛嘅 `hooks/hooks.json`;再宣告一次會引致 *「Duplicate hooks file detected」* 錯誤。有一個迴歸測試專門守住呢點,正正因為佢一再咬親個 repo。

### 低上下文／無 hooks 變體
如果你覺得 hooks 太干擾,又或者你只想要規則／代理／指令／核心技能,咁就唔好用外掛,改用最精簡嘅手動設定檔（見路線 B）。Hooks 已刻意喺 `minimal` 排除咗。

---

## 3.4 路線 B —— 手動安裝器／CLI

Clone、安裝相依套件,然後用一個**設定檔（profile）**同一個**目標（target）**跑安裝器：

```bash
git clone https://github.com/affaan-m/ECC.git
cd ECC
npm install        # 或 pnpm / yarn / bun

# 最精簡（無 hooks-runtime），目標為 Claude Code：
./install.sh --profile minimal --target claude
```

Windows PowerShell：

```powershell
.\install.ps1 --profile minimal --target claude
# 或者，唔使 clone：
npx ecc-install --profile minimal --target claude
```

### 設定檔（Profiles）
| 設定檔 | 大致得到甚麼 |
|---------|----------------------|
| `minimal` | 規則、代理、指令、核心工作流程技能。**無 `hooks-runtime`。** |
| `core` | 標準組合。用 `--without baseline:hooks` 可以保留 core 但停用 hooks。 |
| `full` | 全部。*只*喺完全手動嘅路線上用——切勿喺裝咗外掛之後用。 |

### 精準增刪組件（選擇性安裝）
ECC v1.9+ 有一個由安裝清單驅動嘅選擇性安裝器。你可以加入單一功能或模組：

```bash
# 稍後只加入 hooks runtime：
./install.sh --target claude --modules hooks-runtime

# 保留 core 但略過 hooks：
./install.sh --profile core --without baseline:hooks --target claude

# 喺 minimal 之上加入一個 ML 功能：
npx ecc install --profile minimal --target claude --with capability:machine-learning
```

### 唔知要裝啲乜？問顧問。
```bash
npx ecc consult "security reviews" --target claude
npx ecc consult "mlops training model deployment" --target claude
```
佢會回傳相符嘅組件、相關設定檔,以及預覽／安裝指令。如果你想檢視確切嘅檔案計劃,可以喺安裝前先預覽。

---

## 3.5 規則需要手動複製（永遠如此）

呢點絆親所有人：**Claude Code 外掛無法分發 `rules`**（上游限制）。所以無論你揀邊條路線,如果你想要 ECC 嘅常駐準則,都要自己複製：

```bash
# 用戶層級（套用至所有專案）
mkdir -p ~/.claude/rules/ecc
cp -r rules/common ~/.claude/rules/ecc/
cp -r rules/typescript ~/.claude/rules/ecc/   # 揀返你的技術棧
cp -r rules/python   ~/.claude/rules/ecc/
cp -r rules/golang   ~/.claude/rules/ecc/

# 或者專案層級（只限呢個專案）
mkdir -p .claude/rules/ecc
cp -r rules/common .claude/rules/ecc/
```

經驗法則：
- 由 **`rules/common`** 加上**一個**你實際會用嘅語言套裝開始。
- **複製成個語言目錄**（例如 `rules/golang`）,而唔係入面嘅檔案,咁相對引用同檔案名先唔會撞。
- 除非你真係想載入嗮所有嗰啲上下文,否則唔好複製*每一個*規則目錄。

---

## 3.6 正確安裝 hooks（手動路線）

**唔好**手動將 repo 嘅 `hooks/hooks.json` 複製入 `~/.claude/settings.json`。嗰個檔案係面向外掛／repo 嘅;唔支援原樣複製。用安裝器,咁指令路徑先會被正確改寫：

```bash
# macOS / Linux
bash ./install.sh --target claude --modules hooks-runtime
```
```powershell
# Windows
pwsh -File .\install.ps1 --target claude --modules hooks-runtime
```

咁會將解析後嘅 hooks 寫入 `~/.claude/hooks/hooks.json`,同時唔郁你嘅 `settings.json`。如果你用咗**外掛**,你已經自動載入咗 hooks——**唔好**再將佢哋複製入 `settings.json`。

> Windows 注意：Claude 設定目錄係 `%USERPROFILE%\.claude`。

---

## 3.7 重設與解除安裝

如果 ECC 感覺重複咗、太干擾或者壞咗,**唔好喺佢自己之上再裝多次。** 先診斷同清理。

**生命週期包裝器（由呢度開始）：**
```bash
node scripts/ecc.js list-installed   # 裝咗啲乜
node scripts/ecc.js doctor           # 診斷
node scripts/ecc.js repair           # 還原 ECC 管理的檔案
node scripts/ecc.js uninstall --dry-run
```

**直接解除安裝：**
```bash
node scripts/uninstall.js --dry-run   # 預覽
node scripts/uninstall.js             # 移除 ECC 管理的檔案
```

ECC 只會移除佢喺安裝狀態裏面記錄低嘅檔案;唔會刪除無關嘅檔案。

**如果你疊埋多種方法,按以下次序清理：**
1. 移除 Claude Code 外掛安裝。
2. 喺 repo 根目錄跑 ECC 解除安裝（移除受狀態管理嘅檔案）。
3. 刪除任何你手動複製過嘅額外規則資料夾。
4. 用單一路線,重新安裝一次。

> 如果你本地嘅 Claude 設定被清空咗,你**唔需要**重新購買任何嘢。重新安裝之前先跑 `list-installed` → `doctor` → `repair`。ECC Pro 嘅帳單／帳戶恢復係另一件事。

---

## 3.8 MCP 伺服器係可選加入

外掛安裝刻意**唔會**自動啟用 ECC 附帶嘅 MCP 伺服器定義（咁避免喺嚴格嘅閘道上出現過長嘅工具名,並保護你嘅上下文視窗）。ECC 只附帶**一個**預設連接器（`chrome-devtools`）;其餘所有嘢都係包住 CLI／REST API 嘅技能,或者係可選加入嘅目錄項目。

要加入 MCP 伺服器：
- 用 Claude Code 嘅 `/mcp` 指令做即時改動（持久化到 `~/.claude.json`）。
- 如要 repo 本地存取,將你想要嘅伺服器由 `mcp-configs/mcp-servers.json` 複製入一個專案 `.mcp.json`。
- 如果你已經跑緊自己嘅副本,設定 `export ECC_DISABLED_MCPS="chrome-devtools"`,咁安裝／同步流程就會略過佢哋。

將任何 `YOUR_*_HERE` 佔位符換成真正嘅金鑰。（上下文視窗紀律喺第 10 章講解。）

---

## 3.9 多模型指令需要額外設定

那些 `multi-*` 指令（`/multi-plan`、`/multi-execute`、`/multi-backend`、`/multi-frontend`、`/multi-workflow`）**唔包括**喺基本安裝裏面。佢哋依賴 `ccg-workflow` 執行階段：

```bash
npx ccg-workflow
```
咁提供呢啲指令所期望嘅外部相依套件（例如 `~/.claude/bin/codeagent-wrapper`、`~/.claude/.ccg/prompts/*`）。冇咗佢,`multi-*` 指令就唔會正確運行。

---

## 3.10 驗證你的安裝

```bash
# 喺 Claude Code 內：列出外掛提供咗啲乜
/plugin list ecc@ecc

# 由 repo：跑測試套件
node tests/run-all.js

# 操作者就緒快照（寫出一份可攜的交接檔）
npx ecc status --markdown --write status.md
```

成功嘅手動安裝會透過 `node scripts/ecc.js list-installed` 顯示 ECC 管理嘅檔案。

---

## 3.11 其他框架（快速指引）

完整嘅跨框架細節喺[第 12 章](12-cross-harness_hk.md),但目標旗標係關鍵：

```bash
./install.sh --target cursor typescript          # Cursor
./install.sh --profile minimal --target zed       # Zed
bash scripts/sync-ecc-to-codex.sh                  # Codex（合併入 ~/.codex）
opencode                                           # OpenCode（自動偵測 .opencode/）
```

---

## 3.12 重點摘要

- **只揀一條路線。** 外掛*或者*手動安裝器——切勿兩者皆用。
- 外掛 = 最快;**規則仍然需要手動複製**（`rules/common` + 一個語言套裝）。
- 設定檔：`minimal`（無 hooks）· `core` · `full`（只限手動）。
- 唔肯定要裝啲乜就用 `npx ecc consult "<需求>"`。
- 重新安裝之前,先用 `list-installed → doctor → repair` 重設,然後 `uninstall --dry-run`。
- MCP 伺服器同 `multi-*` 指令係刻意設為可選加入。

裝好 ECC 之後,我哋嚟學下術語：六大建構模塊。

---

[← 心智模型與架構](02-mental-model-architecture_hk.md) · [目錄](../README_hk.md) · [下一章：核心概念 →](04-core-concepts_hk.md)
