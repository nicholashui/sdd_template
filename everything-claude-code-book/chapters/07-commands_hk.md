# 第 7 章 —— 指令（Commands）

[← 技能](06-skills_hk.md) · [目錄](../README_hk.md) · [下一章：掛鈎 →](08-hooks_hk.md)

---

## 7.1 指令是甚麼（以及它們去向何方）

一個**指令（command）**係你喺框架裏面打嘅斜線指令—— `/plan`、`/code-review`、`/build-fix`。每一個對應到 `commands/<name>.md` 嘅一個 Markdown 檔案,並觸發一個工作流程。

但呢度有個重要嘅定位：**指令係一個相容層。** ECC 刻意將耐用嘅邏輯遷移入*技能*,並將 `commands/` 視為「遷移期間維護嘅斜線指令相容」。已退役嘅短名稱（好似 `/tdd` 同 `/eval`）已經搬入 `legacy-command-shims/`,只供明確選擇加入。

咁點解指令仍然存在？因為打 `/plan` 比起描述一個工作流程更快、更易被發現,亦因為跨框架嘅一致性,有時需要一個有名嘅入口。將指令諗成真正引擎（技能）之上嘅**人體工學捷徑**。

<p align="center">
  <img src="../assets/svg/05-surfaces.svg" alt="技能 vs 指令 vs 掛鈎" width="780">
</p>

### 外掛 vs 手動命名
- **外掛安裝**用標準嘅命名空間形式：`/ecc:plan`。
- **手動安裝**保留較短嘅斜線形式：`/plan`。

兩者都通往相同嘅邏輯。

---

## 7.2 指令速查表

repo 附帶 `COMMANDS-QUICK-REF.md`。以下係按工作分組嘅指令。（確切嘅可用性取決於你嘅安裝同框架;打 `/` 睇下有咩係實時可用。）

### 核心工作流程
| 指令 | 佢做啲乜 |
|---------|-------------|
| `/plan` | 重述需求、評估風險、寫一個逐步計劃—— **喺動程式碼之前等你確認** |
| `/code-review` | 對已更改檔案進行完整嘅品質 + 安全 + 可維護性審查 |
| `/build-fix` | 偵測同修復 build 錯誤;委派畀適合嘅 build-resolver |
| `/quality-gate` | 對照專案標準跑驗證關卡 |
| `/refactor-clean` | 移除死碼、合併重複部分 |

### 測試
`/test-coverage`,加上語言 TDD 入口：`/go-test`、`/rust-test`、`/kotlin-test`、`/cpp-test`、`/react-test`、`/flutter-test`。（通用嘅 `/tdd` 住喺 `legacy-command-shims/`;偏向用 `tdd-workflow` 技能。）

### 程式碼審查（各語言）
`/python-review`、`/go-review`、`/rust-review`、`/kotlin-review`、`/cpp-review`、`/react-review`、`/fastapi-review`、`/flutter-review`。

### Build 修復者（各語言）
`/go-build`、`/rust-build`、`/kotlin-build`、`/cpp-build`、`/gradle-build`、`/react-build`、`/flutter-build`。

### 規劃與多代理
`/plan`、`/plan-prd`、`/multi-plan`、`/multi-execute`、`/multi-backend`、`/multi-frontend`、`/multi-workflow`,以及 `orch-*` 家族（`/orch-build-mvp`、`/orch-add-feature`、`/orch-fix-defect`、`/orch-change-feature`、`/orch-refine-code`）。

### 會話與上下文
`/save-session`、`/resume-session`、`/sessions`、`/checkpoint`、`/aside`（喺唔失去當前任務嘅情況下快速問一條旁支問題）、`/context-budget`。

### 學習與改進
`/learn`、`/learn-eval`、`/evolve`、`/promote`、`/instinct-status`、`/instinct-import`、`/instinct-export`、`/skill-create`、`/skill-health`、`/rules-distill`、`/prune`、`/projects`。

### 文件與研究
`/docs`（Context7 查閱）、`/update-docs`、`/update-codemaps`。

### 迴圈與自動化
`/loop-start`、`/loop-status`、`/claw`（NanoClaw v2 REPL）、`/santa-loop`。

### 框架與基礎設施
`/harness-audit`、`/model-route`、`/pm2`、`/setup-pm`、`/cost-report`、`/auto-update`、`/hookify`（+ `/hookify-list`、`/hookify-configure`、`/hookify-help`）、`/project-init`。

### PR 工作流程
`/pr`、`/review-pr`、`/pr-test-analyzer`（代理），以及 `prp-*` 家族（`/prp-prd`、`/prp-plan`、`/prp-implement`、`/prp-commit`、`/prp-pr`）。

---

## 7.3 快速決策指南

由速查表演化出嚟、一張好用嘅心智流程圖：

```text
開始一個新功能？                  → 先 /plan，然後用 tdd-workflow 技能
啱啱寫完程式碼？                  → /code-review
Build 壞咗？                       → /build-fix
需要實時文件？                    → /docs <library>
會話就嚟完？                      → /save-session （或 /learn-eval）
第二日繼續？                      → /resume-session
上下文變得沉重？                  → /context-budget 然後 /checkpoint
想擷取你學到嘅嘢？                → /learn-eval 然後 /evolve
跑緊重複任務？                    → /loop-start
```

---

## 7.4 舊版墊片（legacy shims）：改了甚麼

部分舊愛將被退役,唔再係獨立短指令,而家會指你去用對應嘅技能：

| 舊墊片 | 改為偏向使用 |
|----------|----------------|
| `/tdd` | `tdd-workflow` 技能 |
| `/e2e` | `e2e-testing` 技能 |
| `/eval` | `eval-harness` 技能 |
| `/verify` | `verification-loop` 技能 |
| `/orchestrate` | `dmux-workflows` 或 `/multi-workflow` |

佢哋住喺 `legacy-command-shims/`,屬於可選加入。如果你嘅肌肉記憶想用 `/tdd`,複製嗰個單一墊片就得——但要知道技能先係真嘢。

---

## 7.5 編寫一個指令

指令係最簡單嘅模塊：一個 Markdown 檔案,frontmatter 裏面有 `description`,主體放提示詞／指示。不過按 ECC 嘅政策,**只喺真係需要一個墊片**嚟做遷移或跨框架一致性時,先增加或更新一個指令——否則就將邏輯放入技能。用 `node scripts/ci/validate-commands.js` 驗證。

---

## 7.6 重點摘要

- 指令係打出嚟嘅斜線捷徑;ECC 係**技能優先**,所以佢哋係一個相容層。
- 外掛形式係 `/ecc:plan`;手動形式係 `/plan`——同一個引擎。
- `COMMANDS-QUICK-REF.md` 按工作將佢哋分組;打 `/` 睇下裝咗啲乜。
- 已退役嘅短名稱住喺 `legacy-command-shims/`,並指返去技能。
- 偏向建立**技能**多過新指令。

下一章：唔使你出手就觸發嘅自動化——**掛鈎。**

---

[← 技能](06-skills_hk.md) · [目錄](../README_hk.md) · [下一章：掛鈎 →](08-hooks_hk.md)
