# 第 14 章 —— Token 優化與效能

[← 持續學習](13-continuous-learning_hk.md) · [目錄](../README_hk.md) · [下一章：安全 →](15-security_hk.md)

---

代理式編程可以好快就變到好貴,而且當你填滿上下文視窗時,品質會*下降*。ECC 將成本同上下文當作有真實槓桿可拉嘅工程問題。呢一章將佢哋收集埋一齊。

## 14.1 真正影響大局的設定

加入 `~/.claude/settings.json`：

```json
{
  "model": "sonnet",
  "env": {
    "MAX_THINKING_TOKENS": "10000",
    "CLAUDE_AUTOCOMPACT_PCT_OVERRIDE": "50"
  }
}
```

| 設定 | 預設 | 推薦 | 點解 |
|---------|---------|-------------|-----|
| `model` | opus | **sonnet** | 約削減 60% 成本;處理到 80%+ 嘅編程任務 |
| `MAX_THINKING_TOKENS` | 31,999 | **10,000** | 每個請求約少 70% 隱藏嘅「思考」成本 |
| `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` | 95 | **50** | 更早壓縮 → 長會話中品質更好 |
| `ECC_CONTEXT_MONITOR_COST_WARNINGS` | on | 訂閱用戶設 **off** | 隱藏 API 速率估算,保留上下文／範圍／迴圈警告 |

只喺你需要深度嗰陣先轉上去：`/model opus`。

---

## 14.2 模型路由：將模型配合任務

最大嘅單一成本槓桿,就係**唔好咩都用 Opus**。ECC 推薦嘅路由（長篇指南）：

| 任務 | 模型 | 點解 |
|------|-------|-----|
| 探索／搜尋 | **Haiku** | 快、平、搵檔案足夠用 |
| 簡單單檔編輯 | **Haiku** | 指示清晰、風險低 |
| 多檔實作 | **Sonnet** | 編程嘅最佳平衡 |
| PR 審查 | **Sonnet** | 抵價咁捉到細微之處 |
| 複雜架構 | **Opus** | 深度推理 |
| 安全分析 | **Opus** | 唔可以漏嘢 |
| 除難搞嘅 bug | **Opus** | 必須將成個系統放喺腦中 |
| 寫文件 | **Haiku** | 結構簡單 |

> **約 90% 嘅編程預設用 Sonnet。** 只喺第一次嘗試失敗、任務橫跨 5+ 個檔案、係一個架構決策,或者安全攸關時,先升級到 Opus。

呢個亦係點解**子代理**咁重要（第 5 章）：一個子代理架構,令你可以為*每個子任務指派足夠用嘅最平模型*,而唔使為一次檔案搜尋畀 Opus 嘅價錢。ECC 嘅 `/model-route` 指令同 `harness-optimizer` 代理幫手將呢樣自動化。

---

## 14.3 保護上下文視窗

喺接近上下文上限時,品質會跌落懸崖。守住佢：

- 對於大型重構同多檔功能,**避免用視窗嘅最後約 20%**。單次編輯／文件可以容忍更高嘅使用率。
- **保持 MCP 精簡** —— 啟用 <10 個伺服器 / <80 個工具（第 10 章）。單係咁就可以收回 100k+ token。
- **限制 SessionStart 上下文** —— `ECC_SESSION_START_MAX_CHARS=4000`,或者為本地／低上下文模型用 `ECC_SESSION_START_CONTEXT=off`。
- **策略性壓縮** —— 停用自動壓縮;喺邏輯斷點壓縮（`/compact` 或 `strategic-compact` 技能）。ECC 嘅 `suggest-compact` hook 會提醒你;`PreCompact` 會先儲存狀態。
- **用 `/context-budget`** 睇下 token 去咗邊,並削減開銷。
- **倚靠上下文監視器** —— `post:ecc-context-monitor` hook 就耗盡、成本失控、範圍蔓延同工具迴圈發警告。

---

## 14.4 工具層級的 token 節省

- **`mgrep` 取代 `grep`/ripgrep** —— 喺 ECC 嘅 50 任務基準測試裏面,mgrep + Claude Code 以相近／更好嘅評定品質,大約用咗**少一半嘅 token**。透過外掛 marketplace 安裝;用 `/mgrep` 技能（本地同網絡搜尋）。
- **模組化程式碼庫** —— 檔案以數百行計,而唔係數千行。讀取更平,而且任務更常一擊即中。（亦係一條*規則*。）
- **包進技能的 CLI** 取代常駐 MCP（第 10 章）—— 將工具描述擺出上下文之外。
- **Codemaps** —— 等技能攜帶輕量地圖,令助手唔使重新探索就導航。

---

## 14.5 並行化（第 11 章已講，此處摘要）

並行工作令吞吐量倍增——但 ECC 建議*最低限度可行*嘅並行化：
- **`/fork`** 用於唔重疊嘅唯讀工作（提問／研究），同時主對話編輯程式碼。
- **Git worktrees** 用於重疊嘅程式碼工作——每個 checkout 一個實例;用 `/rename` 為你嘅對話命名。
- **串級方法** —— 最多聚焦 3–4 個任務,由最舊到最新。

反對「因為做得到就開 10 個終端機」嘅指引：每個額外實例都係你要管理嘅上下文。只喺必要時先加一個。

---

## 14.6 驗證效率

因為冇驗證而要重做工作,本身就係一種成本。ECC 嘅評估定位：
- 喺邏輯里程碑做**檢查點評估**;喺重大改動之後做**持續評估**。
- 你只係需要佢行得到嗰陣用 **pass@k**;你需要一致性嗰陣用 **pass^k**。

`eval-harness` 同 `verification-loop` 技能,加上 `/quality-gate`,實作呢個。及早捉到迴歸,遠平過佢出咗街之後先捉。

---

## 14.7 成本可見性

```text
/cost-report      # 成本摘要
/context-budget   # token 開銷分析
```
而 `npm run dashboard` / `ecc status` 會呈現各項指標,令成本唔再係一個謎。metrics-bridge hook 會為狀態列同上下文監視器,維持一個運行中嘅會話彙總。

---

## 14.8 一個「又快又平」的起步設定

如果你想要一個單一推薦嚟開始：

```json
{
  "model": "sonnet",
  "env": {
    "MAX_THINKING_TOKENS": "10000",
    "CLAUDE_AUTOCOMPACT_PCT_OVERRIDE": "50"
  }
}
```
```bash
export ECC_HOOK_PROFILE=standard
export ECC_SESSION_START_MAX_CHARS=4000
# 每個專案保持啟用 < 10 個 MCP 同 < 80 個工具
# 預設用 Sonnet；只喺真正需要時 /model opus
# 用 mgrep；保持檔案模組化；喺邏輯斷點壓縮
```

---

## 14.9 重點摘要

- 設定 **`model: sonnet`**、**`MAX_THINKING_TOKENS: 10000`**、**自動壓縮 50%**,大幅削減成本。
- **按任務路由模型**：Haiku（搜尋）· Sonnet（預設）· Opus（只限艱深／關鍵）。
- **保護上下文**：<10 個 MCP / <80 個工具、限制 SessionStart、策略性壓縮、留意 `/context-budget`。
- **`mgrep`** 同**模組化檔案**實質咁減少 token 用量。
- **適可而止**咁並行化;**及早**驗證（檢查點／持續、pass@k vs pass^k）。

下一章——喺你讓任何嘢自主運行之前要讀嗰一章：**安全。**

---

[← 持續學習](13-continuous-learning_hk.md) · [目錄](../README_hk.md) · [下一章：安全 →](15-security_hk.md)
