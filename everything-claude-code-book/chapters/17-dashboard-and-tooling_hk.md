# 第 17 章 —— 儀表板與生態系工具

[← ECC 2.0 與 CLI](16-ecc2-and-cli_hk.md) · [目錄](../README_hk.md) · [下一章：疑難排解與常見問題 →](18-troubleshooting-faq_hk.md)

---

ECC 主要係一個終端機體驗,但佢亦附帶一道圖形化大門,同一個小小嘅伴隨工具生態系。呢一短章講啲友善嘅介面。

## 17.1 桌面儀表板

`ecc_dashboard.py` 係一個 **Tkinter 桌面 GUI**,用嚟視覺化咁探索目錄裏面所有嘢。啟動佢：

```bash
npm run dashboard
# 或者
python3 ./ecc_dashboard.py
```

功能：
- **分頁介面** —— Agents、Skills、Commands、Rules、Settings。
- 橫跨所有組件嘅**搜尋同過濾**。
- **深色／淺色主題**切換。
- **字體自訂**（字族同大小）。
- 標頭同工作列裏面嘅專案標誌。

呢個係瀏覽 64 個代理同 262 個技能而唔使 `cat` Markdown 檔案嘅最易方法,亦係一個新隊友定向上手嘅好方法。

> 佢需要有 Tkinter 可用嘅 Python 3。如果 `npm run dashboard` 搵唔到佢,直接運行 `python3 ./ecc_dashboard.py`,並確認你嘅 Python 裝咗 Tkinter。

---

## 17.2 技能建立器（Skill Creator）

兩種由 repository 生成技能嘅方式（第 13 章亦有講）：

- **本地（內建）：** `/skill-create` 喺本地分析你嘅 git 歷史,並寫 `SKILL.md` 檔案。加 `--instincts` 可以同時為 continuous-learning-v2 播種。冇外部服務。
- **GitHub App（進階）：** ECC Tools,用於超大型 repo（10k+ commits）、自動 PR 同團隊共享——透過 `ecc.tools` 嘅 marketplace 應用。

兩者都會由你嘅 commit 歷史產出即用嘅技能、instinct 集合同模式提取。

---

## 17.3 AgentShield

喺[第 15 章](15-security_hk.md)深入講過。一句話：一個為你代理設定而設嘅安全審計器,可以用 `npx ecc-agentshield scan` 運行,帶一個 `--opus` 紅隊／藍隊／審計員模式同一個對 CI 友善嘅退出碼。喺框架內用 `/security-scan`。

---

## 17.4 技能／框架健康與審計

一簇工具令你嘅設定隨時間保持誠實：

```text
/skill-health         # 帶分析的技能組合健康儀表板
/skill-stocktake      # 審計技能同指令的品質
/harness-audit        # 為框架可靠性、評估就緒度、風險評分
/rules-distill        # 由技能提取橫切原則 → 規則
```
```bash
npm run harness:audit          # /harness-audit 的 CLI 形式
npm run observability:ready    # 可觀測性就緒度
npm run operator:dashboard     # 操作者就緒度儀表板
```

當你嘅目錄成長時,呢啲就係你防止技能蔓延同設定漂移嘅方法。

---

## 17.5 套件管理器設定

ECC 會按優先次序自動偵測你嘅套件管理器（npm/pnpm/yarn/bun）：`CLAUDE_PACKAGE_MANAGER` 環境變數 → `.claude/package-manager.json` → `package.json` 嘅 `packageManager` 欄位 → lock 檔案 → 全域設定 → 第一個可用嘅。如要明確設定：

```bash
export CLAUDE_PACKAGE_MANAGER=pnpm
node scripts/setup-package-manager.js --global pnpm
node scripts/setup-package-manager.js --project bun
node scripts/setup-package-manager.js --detect
# 或者喺框架內：
/setup-pm
```

---

## 17.6 編輯器配搭（一則生產力說明）

短篇指南對編輯器好有主見,因為編輯器塑造 Claude Code 嘅體驗：
- **Zed**（作者嘅偏好）—— Rust 般快、透過佢嘅 agent 面板實時追蹤檔案變更、快速指令面板、低資源使用（跑 Opus 嗰陣好重要）。
- **VS Code / Cursor** —— 運作良好;用終端機配 `/ide` 做 LSP,或者用整合擴充功能。

與編輯器無關嘅貼士：分割畫面（助手 + 編輯器）、啟用自動儲存令檔案讀取係最新嘅、用 git 整合喺 commit 前審查 diff,並確認檔案監視器會自動重新載入已更改嘅檔案。

---

## 17.7 生態系一覽

| 工具 | 佢係乜 | 入口 |
|------|-----------|-------|
| 桌面儀表板 | 瀏覽目錄的 Tkinter GUI | `npm run dashboard` |
| 技能建立器 | 由 git 歷史生成技能 | `/skill-create` |
| AgentShield | 安全審計器 | `npx ecc-agentshield scan` / `/security-scan` |
| ECC Tools（GitHub App） | 託管分析、PR 審計、私有 repo | `ecc.tools` / marketplace |
| NanoClaw v2 | 帶路由 + 指標的持久化 REPL | `/claw` / `npm run claw` |
| `ecc` CLI | 操作者／生命週期 | `npx ecc …` |
| ECC 2.0（`ecc2/`） | Rust 控制平面（alpha） | `cargo run` |

> OSS repo 採用 MIT 授權,永遠免費。ECC Pro / ECC Tools（託管嘅 GitHub App）同 GitHub Sponsors 資助呢項工作——一個單一維護者就係咁可以每週橫跨多個框架發佈。你永遠*唔需要*付費部分,都用到本書裏面所有嘢。

---

## 17.8 重點摘要

- **`npm run dashboard`** 打開一個 Tkinter GUI,瀏覽 agents/skills/commands/rules。
- **`/skill-create`** 由你嘅 git 歷史生成技能（喺本地,唔使服務）。
- 用 **`/skill-health`、`/skill-stocktake`、`/harness-audit`、`/rules-distill`** 令你嘅設定保持健康。
- 透過 **`/setup-pm`** 或 `CLAUDE_PACKAGE_MANAGER` 設定你嘅套件管理器。
- OSS 核心免費;託管工具係可選。

下一章：當出事嗰陣——疑難排解同常見問題。

---

[← ECC 2.0 與 CLI](16-ecc2-and-cli_hk.md) · [目錄](../README_hk.md) · [下一章：疑難排解與常見問題 →](18-troubleshooting-faq_hk.md)
