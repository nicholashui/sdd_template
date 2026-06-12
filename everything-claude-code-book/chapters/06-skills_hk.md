# 第 6 章 —— 技能（Skills）

[← 代理](05-agents_hk.md) · [目錄](../README_hk.md) · [下一章：指令 →](07-commands_hk.md)

---

## 6.1 為何技能是 ECC 的核心

如果話代理係*邊個*做嘢,咁**技能就係嘢*點樣*被做出嚟**。一個技能係一個可重用、自成一體嘅工作流程：步驟、結構、範例、陷阱,有時仲有支援檔案同「codemaps」（程式碼庫嘅輕量地圖,等助手可以導航而唔使燒 token 重新探索）。

ECC 斬釘截鐵咁強調**技能係標準（canonical）工作流程介面**：

> *新工作流程嘅開發,應該首先落喺 `skills/`。*

指令仍然為咗相容性而存在,但耐用嘅邏輯應該屬於技能。原因就係第 1 章嘅複利工作流程理念：一個技能會被永遠重用,跨專案、跨會話,而且隨住模型進步而變得更好。

技能被使用的三種方式：
1. **你按名呼叫**佢。
2. 當佢嘅 `description` 同你做緊嘅嘢相符時,佢**被自動建議**。
3. **一個代理重用佢** —— 一個可以執行你部分技能嘅子代理,可以被委派任務並自主使用呢啲技能。

---

## 6.2 SKILL.md 的結構

每個技能住喺自己嘅目錄：`skills/<name>/SKILL.md`。frontmatter（按 `RULES.md`）好細：

```markdown
---
name: tdd-workflow
description: Use this skill when writing new features, fixing bugs, or refactoring
  code. Enforces test-driven development with 80%+ coverage including unit,
  integration, and E2E tests.
origin: ECC
---
```

| 欄位 | 意思 |
|-------|---------|
| `name` | 技能 id（同目錄相符）。 |
| `description` | 「何時使用」嘅觸發器——驅動自動選擇,所以要具體。 |
| `origin` | 第一方用 `ECC`,匯入／貢獻嘅用 `community`。 |

主體應該包含實用指引、經過測試嘅範例,以及一個清晰嘅**「何時使用（When to Use）」**章節。一個技能資料夾可以容納多過一個 `SKILL.md`——額外嘅參考檔案、模板同 codemaps。

---

## 6.3 拆解一個真實技能：`tdd-workflow`

`tdd-workflow` 技能係 ECC 裏面最重要嘅其中一個,亦係你自己技能嘅絕佳模板。佢嘅結構：

1. **何時啟動** —— 新功能、修復 bug、重構、新端點／組件。
2. **核心原則** —— 程式碼之前先寫測試;80%+ 覆蓋率;三種測試類型（單元、整合、E2E）。
3. **Git 檢查點** —— 喺每個 TDD 階段之後 commit,訊息裏面附帶證據,喺當前分支上。
4. **7 個步驟：**
   - 寫用戶旅程 → 生成測試案例 → **跑測試（佢哋必須失敗 FAIL）** → 實作最小程式碼 → **跑測試（佢哋通過）** → 重構 → 驗證覆蓋率。
5. **RED 關卡** —— 對「咩先算係一個有效嘅失敗測試」嘅謹慎定義（執行階段 RED 或編譯階段 RED），令你冇得作假。*「一個只係寫咗但未經編譯同執行嘅測試,唔算係 RED。」*
6. **測試模式** —— 具體嘅 Jest/Vitest、API 整合同 Playwright 範例。
7. **Mocking** 範例、**覆蓋率門檻**、**要避免的常見錯誤**（唔好測試實作細節;用語意化選擇器;隔離測試），以及**成功指標**。

留意呢個技能有幾多係*嚴謹性*：佢唔係淨係話「寫測試」,而係確切定義咩先算一個有效嘅失敗測試,並拒絕畀你跳過 RED 步驟。嗰種精準度,正正令一個技能可信到足以委派畀代理。

---

## 6.4 技能目錄（導覽，而非清單）

有 262+ 個技能。背佢哋係無意義嘅;知道*分類*先至有威力。具代表性嘅幾簇：

**工程核心**
`tdd-workflow`、`verification-loop`、`eval-harness`、`security-review`、`security-scan`、`coding-standards`、`api-design`、`backend-patterns`、`frontend-patterns`、`database-migrations`、`deployment-patterns`、`docker-patterns`、`e2e-testing`、`error-handling`、`git-workflow`。

**語言／框架套裝**（每個技術棧的 patterns + security + TDD + verification）
Python、Go、Rust、Java（Spring Boot、Quarkus、JPA）、Kotlin（coroutines、Ktor、Exposed、Compose Multiplatform）、Swift（concurrency 6.2、actors、protocol DI、SwiftUI、Liquid Glass、裝置端 Foundation Models）、C++、Perl、Django、Laravel、NestJS、React（patterns/performance/testing）、Next.js + Turbopack、Bun、Flutter/Dart、Android clean architecture。

**上下文與成本工程**
`strategic-compact`、`context-budget`、`token-budget-advisor`、`iterative-retrieval`、`cost-aware-llm-pipeline`、`content-hash-cache-pattern`、`regex-vs-llm-structured-text`。

**學習與後設（meta）**
`continuous-learning`、`continuous-learning-v2`、`skill-stocktake`、`rules-distill`、`agent-eval`、`agent-harness-construction`、`codebase-onboarding`、`configure-ecc`。

**編排與迴圈**
`autonomous-loops`、`continuous-agent-loop`、`dmux-workflows`、`plan-orchestrate`、`nanoclaw-repl`、`claude-devfleet`。

**研究、內容與操作者**
`deep-research`、`search-first`、`market-research`、`article-writing`、`content-engine`、`crosspost`、`investor-materials`、`frontend-slides`、`videodb`、`video-editing`、`fal-ai-media`,加上各領域套裝（醫療、物流、海關、能源、製造）同 Itô 預測市場套裝。

> 呢個導覽嘅重點：無論你做緊乜,好可能都有一個技能啱用。用 `npx ecc consult "<你的需求>"` 去搵佢。

---

## 6.5 技能儲存在哪（放置政策）

ECC 區分**精選（curated）**技能（喺 repo 嘅 `skills/`）同**生成／匯入（generated/imported）**技能（喺你嘅 home 設定下,例如 `~/.claude/skills/`）。放置政策：

- Claude Code 只會由 `~/.claude/skills/` 嘅**直接子項**載入技能。唔好將手動安裝嵌套喺 `~/.claude/skills/ecc/` 之下。
- 對於做手動安裝嘅新用戶：複製核心／通用技能,加上 `search-first`,只喺需要時先加冷門套裝。
- 生成嘅技能（來自 `/skill-create`）同學到嘅技能,會落喺你嘅 agent 資料 home。

權威規則請睇 repo 裏面嘅 `docs/SKILL-PLACEMENT-POLICY.md` 同 `docs/SKILL-DEVELOPMENT-GUIDE.md`。

---

## 6.6 建立技能

兩條路線：

**手動** —— 建立 `skills/my-skill/SKILL.md`,帶 frontmatter（`name`、`description`、`origin`），主體包含「何時使用」、步驟同經測試嘅範例。用 `node scripts/ci/validate-skills.js`（`npm test` 嘅一部分）驗證。

**由你的 git 歷史生成** —— 等 ECC 開採你嘅 repo：
```bash
/skill-create               # 分析當前 repo → SKILL.md 檔案
/skill-create --instincts   # 同時為 continuous-learning-v2 生成 instincts
```
咁會喺本地讀你嘅 commit 歷史,並提取可重用嘅模式。（對於超大型 repo 同團隊共享,仲有一條進階 GitHub App 路線。）

---

## 6.7 重點摘要

- **技能係標準、耐用嘅工作流程介面** —— 新邏輯應該放呢度。
- 一個技能 = 一個帶 `SKILL.md` 嘅目錄（frontmatter `name`/`description`/`origin`）+ 主體 + 可選 codemaps。
- 出色嘅技能係**嚴謹**嘅—— `tdd-workflow` 甚至定義咗咩先算一個有效嘅失敗測試。
- 橫跨工程、語言套裝、上下文工程、學習、編排同操作者領域,有 262+ 個技能。
- 用 `npx ecc consult` 搵技能;手動或者用 `/skill-create` 建立佢哋。

下一章：你打出嚟嘅斜線指令——**指令。**

---

[← 代理](05-agents_hk.md) · [目錄](../README_hk.md) · [下一章：指令 →](07-commands_hk.md)
