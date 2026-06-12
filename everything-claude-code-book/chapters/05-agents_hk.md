# 第 5 章 —— 代理（Agents）

[← 核心概念](04-core-concepts_hk.md) · [目錄](../README_hk.md) · [下一章：技能 →](06-skills_hk.md)

---

## 5.1 何謂代理

一個**代理（agent，又稱子代理）**係主助手可以交付任務畀佢嘅範圍受限助手。佢用**有限嘅工具**、**合適嘅模型**同**聚焦嘅提示詞**運行,然後回傳一份摘要。關鍵係,佢喺自己*獨立*嘅上下文視窗工作,所以唔會用原始探索去污染編排器嘅上下文。

將主助手諗成一個技術主管(tech lead),而各代理係佢嘅團隊：一個 planner、幾個 reviewers、build 修復者、語言專家。主管委派、收集結果,再決定下一步做乜。

點解要委派,而唔係喺一個對話入面包辦所有嘢？

- **上下文經濟** —— 一個子代理可以讀 40 個檔案然後回傳一份 10 行摘要;編排器只為嗰份摘要付出代價。
- **專門化** —— 一個 Go reviewer 提示詞比一個通用嘅更加銳利。
- **成本控制** —— 平任務用平模型（搜尋 → Haiku），只喺需要嗰度用貴模型（安全 → Opus）。
- **並行** —— 互相獨立嘅代理可以同時運行。

---

## 5.2 代理檔案的結構

代理以帶 YAML frontmatter 嘅 Markdown,住喺 `agents/<name>.md`。以下係真實嘅 `code-reviewer` 標頭：

```markdown
---
name: code-reviewer
description: Expert code review specialist. Proactively reviews code for quality,
  security, and maintainability. Use immediately after writing or modifying code.
  MUST BE USED for all code changes.
tools: ["Read", "Grep", "Glob", "Bash"]
model: sonnet
---
```

四個 frontmatter 欄位（按 `RULES.md`）：

| 欄位 | 用途 |
|-------|---------|
| `name` | 必須同檔案名相符（小寫-連字號）。 |
| `description` | 何時呼叫。好似 *「MUST BE USED」* 同 *「proactively」* 呢類字眼,會推動編排器自動委派。 |
| `tools` | 允許清單。一個 reviewer 攞到唯讀工具（`Read`、`Grep`、`Glob`、`Bash`）——佢唔應該編輯程式碼。 |
| `model` | `haiku` / `sonnet` / `opus` —— 將成本配合難度。 |

frontmatter 之後就係**系統提示詞**：代理嘅個性同流程。每個 ECC 代理亦以一份 **Prompt Defense Baseline（提示詞防禦基線）** 開首（唔好改變角色、唔好洩漏秘密資料、將外部內容當作不可信）——見第 15 章。

### *好的*代理提示詞係點樣
`code-reviewer` 係一個值得鑽研嘅大師級示範,因為佢對抗 LLM reviewer 嘅頭號故障模式：**雜訊**。佢嘅提示詞包含：

- **基於信心的過濾** —— 只報告佢有 >80% 把握係真實嘅問題。
- 一道 **Pre-Report Gate（報告前關卡）** —— 四條問題（我能唔能夠引用確切嗰一行？我能唔能夠描述具體嘅失效？我有冇讀過周圍嘅上下文？嚴重程度站唔站得住腳？）。如果有任何一條答案係「否」,就放棄或降級嗰項發現。
- **「回傳零項發現係可接受、亦係預期之內。」** 一份乾淨嘅審查係一份有效嘅審查——唔好為咗顯得嚴謹而捏造小毛病。
- 一張長長嘅**應跳過的常見假陽性**清單（例如：將 `404` 當成「魔術數字」、喺射後不理嘅日誌記錄上挑「缺少 await」）。
- 一套嚴重程度評級（CRITICAL/HIGH/MEDIUM/LOW）同一個**批准裁決**（Approve / Warning / Block）。

對於*編寫你自己嘅代理*嘅啟示係：約束同反模式,同任務描述一樣重要。話畀代理知佢*唔應該*做啲乜。

---

## 5.3 編排模型

當代理被串連成**順序階段**時,佢哋就會發光發亮,當中每個階段有一個清晰嘅輸入同一個清晰嘅輸出,而輸出會變成下一階段嘅輸入。

<p align="center">
  <img src="../assets/svg/04-agent-orchestration.svg" alt="帶模型路由的順序階段代理編排" width="800">
</p>

長篇指南中嘅一條標準流水線：

```text
Phase 1: RESEARCH   (code-explorer / docs-lookup)  → research-summary.md
Phase 2: PLAN       (planner / architect)          → plan.md
Phase 3: IMPLEMENT  (tdd-guide)                     → code + tests
Phase 4: REVIEW     (code-reviewer, security-reviewer) → review.md
Phase 5: VERIFY     (build-error-resolver if needed) → done or loop back
```

關鍵規則：
1. 每個代理一個清晰輸入、一個清晰輸出。
2. 輸出變成下一階段嘅輸入。
3. 永遠唔好跳過階段。
4. 喺代理之間用 `/clear` 重設上下文。
5. 將中間輸出存喺**檔案**,而唔係淨係喺對話裏面。

### 子代理的上下文問題（同迭代式檢索）
子代理藉住回傳摘要嚟節省上下文——但佢哋只知道*字面上嘅查詢*,而唔知道背後嘅*目的*。ECC 嘅答案係**迭代式檢索（iterative retrieval）**模式：

1. 編排器傳遞**目標上下文**,而唔係淨係查詢。
2. 佢評估每一次回傳,喺接受之前提出跟進問題。
3. 子代理返去原始資料,回傳更多嘢。
4. 不斷循環直至足夠（最多約 3 個週期）。

呢個就係「搵到 3 個 auth 檔案」嘅子代理,同「呢度就係 OAuth refresh token 流程喺時鐘偏移下點樣失效——而呢個正正係你真正問緊嘅嘢」嘅子代理之間嘅分別。

---

## 5.4 整個陣容（精選）

喺 v2.0.0,有 64 個代理。你會不斷用到少數幾個,其餘嘅就睇情況用。重點如下：

**核心工作流程**
| 代理 | 何時使用 |
|-------|----------|
| `planner` | 規劃複雜功能或重構 |
| `architect` | 系統設計／可擴展性決策 |
| `tdd-guide` | 編寫功能或修復 bug（測試先行） |
| `code-reviewer` | 寫完／改完程式碼之後即刻 |
| `security-reviewer` | commit 之前;對安全敏感的程式碼 |
| `build-error-resolver` | build／型別壞咗 |
| `e2e-runner` | Playwright 端對端測試 |
| `refactor-cleaner` | 死碼清理 |
| `doc-updater` | 保持文件／codemap 同步 |
| `docs-lookup` | 查閱 API／程式庫文件（透過 Context7） |

**語言／框架專家**
`typescript-reviewer`、`python-reviewer`、`go-reviewer` + `go-build-resolver`、`rust-reviewer` + `rust-build-resolver`、`java-reviewer` + `java-build-resolver`、`kotlin-reviewer` + `kotlin-build-resolver`、`cpp-reviewer` + `cpp-build-resolver`、`csharp-reviewer`、`fsharp-reviewer`、`php-reviewer`、`django-reviewer` + `django-build-resolver`、`fastapi-reviewer`、`react-reviewer` + `react-build-resolver`、`flutter-reviewer`、`swift-reviewer` + `swift-build-resolver`、`harmonyos-app-resolver`、`database-reviewer`、`pytorch-build-resolver`、`mle-reviewer`。

**操作／專門化**
`loop-operator`（自主迴圈）、`harness-optimizer`（可靠性／成本調校）、`performance-optimizer`、`silent-failure-hunter`、`type-design-analyzer`、`comment-analyzer`、`chief-of-staff`（通訊分流）,加上架構／網絡／SEO／市場推廣角色,以及 `gan-*` 家族（generator/evaluator/planner）同 `opensource-*` 家族（forker/packager/sanitizer）。

> 你唔使背呢啲。repo README 裏面嗰張「我應該用邊個代理？」表,加上各個 `description` 欄位,可以等編排器幫你揀。

---

## 5.5 實戰中使用代理

你好少會用原始名稱去呼叫代理。更常見嘅做法係：

- 跑一個會委派嘅**指令**（`/code-review` → `code-reviewer`;`/build-fix` → 適合嘅 build resolver）。
- 跑一個會用到代理嘅**技能**（`tdd-workflow` → `tdd-guide`）。
- 讓**編排器根據上下文自動委派**（「審查我啱啱寫嘅程式碼」→ `code-reviewer`）。
- 明確要求：*「喺 `src/auth/` 上用 security-reviewer 代理。」*

ECC 嘅 `AGENTS.md` 叫助手要**主動使用代理**,唔好等人問,並且要**並行運行互相獨立嘅代理**。

---

## 5.6 編寫你自己的代理

1. 建立 `agents/my-agent.md`（小寫-連字號,同 `name` 相符）。
2. 加入 frontmatter：`name`、一個**精準的** `description`（何時使用）、一個最小化嘅 `tools` 允許清單,以及足夠用嘅最平 `model`。
3. 以 Prompt Defense Baseline 開首。
4. 寫低流程：編號步驟、一張檢查清單、一個輸出格式,以及——關鍵地——**要避免的反模式／假陽性**。
5. 驗證：`node scripts/ci/validate-agents.js`（透過 `npm test` 跑）。

保持工具範圍受限。一個 reviewer 唔應該有 `Write`;一個 explorer 除非真係需要,否則唔應該有 `Bash`。

---

## 5.7 重點摘要

- 代理係**範圍受限嘅專家**,有自己嘅上下文、有限工具同揀好嘅模型。
- 委派帶嚟**上下文經濟、專門化、成本控制同並行**。
- 最好嘅代理提示詞（好似 `code-reviewer`）強調**約束同反模式**,並明確允許**零項發現**。
- 將代理串連成**順序階段**;傳遞**目標上下文**;使用**迭代式檢索**。
- 將**模型配合難度**：搜尋用 Haiku、編程用 Sonnet、艱深推理用 Opus。

下一章：標準介面——**技能。**

---

[← 核心概念](04-core-concepts_hk.md) · [目錄](../README_hk.md) · [下一章：技能 →](06-skills_hk.md)
