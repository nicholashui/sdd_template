# 第 13 章 —— 持續學習

[← 跨框架使用](12-cross-harness_hk.md) · [目錄](../README_hk.md) · [下一章：Token 優化 →](14-token-optimization_hk.md)

---

## 13.1 它解決的問題

你哋全部都試過呢樣：你連續三日就同一件事糾正個助手。佢撞到同一個 bug,你畀返佢同一個變通方法,佢又忘記,周而復始。咁就係**浪費 token、浪費上下文、浪費時間**。

ECC 嘅答案：當助手發現咗某啲唔簡單嘅嘢——一個除錯技巧、一個專案特有嘅怪癖、一個變通方法——佢應該**將佢儲存做可重用嘅知識**,咁下次嗰個模式就自動載入。目錄會由你自己嘅使用中成長。

<p align="center">
  <img src="../assets/svg/09-memory-learning.svg" alt="記憶持久化與持續學習迴圈" width="800">
</p>

> **記憶 vs. 學習**（唔好溝埋——佢哋係嗰幅圖嘅右半同引擎）：
> - **記憶**（第 9 章）= *呢個專案嘅狀態*,喺各會話之間攜帶。
> - **持續學習** = *耐用模式*,被提取入 instincts 同技能,跨會話、跨專案咁適用。

---

## 13.2 兩個世代

ECC 附帶兩個系統,你應該知道你用緊邊個：

| | continuous-learning（v1） | continuous-learning-v2 |
|---|---------------------------|------------------------|
| 機制 | Stop-hook 將模式提取入已學技能 | **基於 instinct**,帶信心評分 |
| 強項 | 簡單、經驗證 | 匯入／匯出、演化、評分 |
| 何時保留 v1 | 你明確想要舊版已學技能流程 | — |
| 預設 | — | **偏向 v2** |

v2 系統住喺 `skills/continuous-learning-v2/`,係推薦嘅路線。只喺你特別想要佢嘅 Stop-hook 已學技能行為時,先保留 v1（`skills/continuous-learning/`）。

---

## 13.3 Instincts：學習的單位

一個 **instinct（本能）**係一小塊有評分嘅已學行為：一個觀察加一個動作,連同一個**信心分數**同支持證據／範例。當你工作嗰陣,instincts 會靜靜咁累積（`observe-runner` hooks 擷取工具使用訊號），而你用指令去管理佢哋：

```text
/instinct-status     # 顯示已學 instincts 連信心分數（專案 + 全域）
/instinct-import     # 由檔案或 URL（或由隊友）匯入 instincts
/instinct-export     # 匯出你的 instincts 以供共享
/prune               # 刪除過期的待定 instincts（30 日 TTL）
/promote             # 將專案範圍的 instincts 提升至全域範圍
/projects            # 列出已知專案及其 instinct 統計
```

Instincts 有範圍：喺一個專案學到嘅 instinct,會保持*專案範圍*,直至你 `/promote` 佢去*全域*。咁可以防止專案怪癖洩漏到處,同時仍然畀真正普遍嘅課題畢業。

> **關於內部機制嘅注意：** instinct 儲存同會話記憶係分開嘅——預設喺 `~/.local/share/ecc-homunculus`（可透過 `CLV2_HOMUNCULUS_DIR` 覆寫）。所以清除會話唔會抹走你學到嘅嘢。

---

## 13.4 由 instincts 到技能：`/evolve`

個別 instincts 好有用,但真正嘅魔法係**將相關嘅 instincts 聚類成一個全新嘅技能**。咁正正係 `/evolve` 做嘅嘢：

```text
/learn          # 由當前會話提取可重用模式
/learn-eval     # 提取模式，並喺儲存前自我評估佢哋嘅品質
/evolve         # 分析已學 instincts → 建議演化出嘅技能結構
```

由頭到尾嘅迴圈：

```text
觀察到重複模式（hooks）
        ↓
存做一個 instinct（+信心）
        ↓
/evolve 聚類相關 instincts → 一個新的 SKILL.md
        ↓
下次情況相符時，新技能自動載入
```

呢個就係一個通用助手點樣變成*你嘅*助手：你不斷教佢嘅嘢,凝結成永遠都喺度嘅技能。

---

## 13.5 由 git 歷史生成技能

一條唔使等 instincts 累積嘅互補路線——開採你現有嘅 repo：

```bash
/skill-create               # 分析當前 repo git 歷史 → SKILL.md 檔案
/skill-create --instincts   # 同時為 continuous-learning-v2 生成 instincts
```

佢喺本地讀你嘅 commit 歷史,並將模式提取入即用嘅技能。對於超大型 repo（10k+ commits）、團隊共享或自動 PR,有一條進階 GitHub App 路線（ECC Tools），但 `/skill-create` 喺冇外部服務嘅情況下,已經涵蓋咗常見情況。

你亦可以審計你累積知識嘅健康狀況：
```text
/skill-health      # 帶分析的技能組合健康儀表板
/skill-stocktake   # 審計技能／指令的品質（一個技能）
/rules-distill     # 掃描技能、提取橫切原則 → 蒸餾成規則
```

---

## 13.6 點解用 Stop hook，而唔係每個提示詞

值得重複,因為呢個係一個深思熟慮嘅設計選擇：學習擷取喺 **Stop** 事件運行（會話結束時一次），而唔係 **UserPromptSubmit**（每條訊息）。逐條訊息運行佢,會為*每一個*提示詞增加延遲。Stop 運行一次、輕量、亦唔阻你手腳。`observe-runner` hooks 確實喺會話期間擷取輕量訊號（非同步、短逾時），但繁重嘅提取喺結尾先發生。

---

## 13.7 一條實用的採用路徑

你唔需要第一日就做嗮以上所有嘢。一個合理嘅爬升：

1. **第 1 週：** 淨係工作。等 instincts 累積。偶爾跑 `/instinct-status` 睇下佢留意到啲乜。
2. **第 2 週：** 喺有料嘅會話結尾,跑 `/learn-eval`,然後 `/save-session`。
3. **第 3 週：** 跑 `/evolve` 將一簇簇 instincts 變成技能;`/skill-health` 檢查品質。
4. **持續：** `/promote` 真正普遍嘅課題去全域;`/instinct-export` 同隊友共享;`/prune` 保持整潔。

---

## 13.8 重點摘要

- 持續學習將**重複嘅糾正**變成**耐用、自動載入嘅知識**。
- 偏向 **continuous-learning-v2**（instincts + 信心）多過 v1 嘅 Stop-hook 流程。
- 用 `/instinct-status|import|export|prune|promote` 管理 instincts;instincts 喺提升之前係**專案範圍**。
- **`/evolve`** 將 instincts 聚類成新技能;**`/skill-create`** 開採 git 歷史。
- 擷取喺 **Stop hook** 運行,以避免逐提示詞延遲。

下一章：令以上所有嘢又快又平。

---

[← 跨框架使用](12-cross-harness_hk.md) · [目錄](../README_hk.md) · [下一章：Token 優化 →](14-token-optimization_hk.md)
