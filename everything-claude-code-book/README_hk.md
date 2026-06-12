# Everything Claude Code —— 完整實戰指南

> 一本書長度、注重實作的指南，講解 **[affaan-m/ecc](https://github.com/affaan-m/ecc)** —— *Everything Claude Code（ECC）*，一套為 AI 輔助軟件開發而設的代理框架（agent-harness）操作系統。

本指南會教你 ECC 是甚麼、由何而來、如何建構，而最重要的是——**怎樣在日常工作中真正運用佢**。本書寫畀從未接觸過呢個 repo 嘅人睇，目標係由零開始，變成一位有信心嘅操作者。

<p align="center">
  <img src="assets/svg/01-what-is-ecc.svg" alt="ECC 是甚麼：在你與每一個 AI 編程工具之間的單一操作層" width="760">
</p>

---

## 關於命名的提醒

如果你搜尋「ECC」係期望搵到 *橢圓曲線密碼學（Elliptic Curve Cryptography）*，咁呢個係另一個完全唔同嘅專案。**`affaan-m/ecc` 會重新導向到 `affaan-m/everything-Claude-code`。** 本書通篇所講嘅 **ECC = Everything Claude Code**。呢度完全冇密碼學成份——佢係一套由代理（agents）、技能（skills）、掛鈎（hooks）同規則（rules）組成嘅系統，用嚟強化 AI 編程助手。

---

## 本書適合邊啲讀者

- **新用戶**：已經安裝咗 ECC（或者諗緊裝），但面對 64 個代理、262 個技能同 84 個指令時感到無從入手。
- **現有的 Claude Code / Cursor / Codex 用戶**：想要一個清晰嘅心智模型，而唔係一堆設定檔。
- **團隊主管**：正評估應唔應該採用 ECC，以及點樣安全咁採用。
- **任何好奇嘅人**：想了解一套認真嘅「代理框架」係點樣設計出嚟。

本書唔假設你事先識得 ECC。如果你對終端機有基本認識，並且至少用過一款 AI 編程工具（Claude Code、Cursor、Codex 等），會有幫助。

---

## 點樣閱讀本書

各章節嘅編排係層層遞進，但每一章亦足夠獨立，可以隨意跳讀。如果你趕時間：

- **只想佢行得到？** 睇第 0 章 → 第 3 章（安裝）→ 第 11 章（日常工作流程）。
- **想先理解佢？** 睇第 1 同第 2 章，然後再深入各組件。
- **擔心安全問題？** 喺安裝任何會執行 hooks 嘅嘢之前，先睇第 15 章（安全）。

---

## 目錄

### 第一部分 —— 入門定向
| # | 章節 | 你會學到甚麼 |
|---|---------|-------------------|
| 0 | [前言與快速上手](chapters/00-preface_hk.md) | 兩分鐘版本：ECC 是甚麼，以及點樣快速試用 |
| 1 | [背景與理念](chapters/01-background-and-philosophy_hk.md) | ECC 的由來、何謂「代理框架」、五大原則 |
| 2 | [心智模型與架構](chapters/02-mental-model-architecture_hk.md) | 四個層級、repo 地圖、各部分如何連接 |

### 第二部分 —— 令佢運作起嚟
| # | 章節 | 你會學到甚麼 |
|---|---------|-------------------|
| 3 | [安裝與設定](chapters/03-installation_hk.md) | 外掛 vs 手動、設定檔（profiles）、規則、解除安裝／重設、揀一條路線 |
| 4 | [核心概念](chapters/04-core-concepts_hk.md) | 六大建構模塊一覽 |

### 第三部分 —— 六大建構模塊
| # | 章節 | 你會學到甚麼 |
|---|---------|-------------------|
| 5 | [代理（Agents）](chapters/05-agents_hk.md) | 子代理、委派、代理檔案的結構、整個陣容 |
| 6 | [技能（Skills）](chapters/06-skills_hk.md) | 標準工作流程介面、SKILL.md 結構、自己動手寫 |
| 7 | [指令（Commands）](chapters/07-commands_hk.md) | 斜線指令、快速參考、為何採取技能優先 |
| 8 | [掛鈎（Hooks）](chapters/08-hooks_hk.md) | 事件生命週期、設定檔、環境變數控制、實用配方 |
| 9 | [規則與記憶](chapters/09-rules-and-memory_hk.md) | 必須遵守的準則、CLAUDE.md、會話持久化 |
| 10 | [MCP 與上下文管理](chapters/10-mcp-and-context_hk.md) | 連接器、上下文視窗預算、<10/<80 規則 |

### 第四部分 —— 操作 ECC
| # | 章節 | 你會學到甚麼 |
|---|---------|-------------------|
| 11 | [日常工作流程](chapters/11-everyday-workflows_hk.md) | 規劃 → TDD → 審查 → 驗證 → 學習，可重用的配方 |
| 12 | [跨框架使用](chapters/12-cross-harness_hk.md) | Claude Code、Cursor、Codex、OpenCode、Copilot 等等 |
| 13 | [持續學習](chapters/13-continuous-learning_hk.md) | 本能（instincts）、信心分數、`/evolve`、自我改進的技能 |
| 14 | [Token 優化與效能](chapters/14-token-optimization_hk.md) | 模型路由、壓縮、並行化、工作樹（worktrees） |

### 第五部分 —— 安全與進階
| # | 章節 | 你會學到甚麼 |
|---|---------|-------------------|
| 15 | [安全](chapters/15-security_hk.md) | 致命三元組、沙箱、AgentShield、真實的 CVE |
| 16 | [ECC 2.0 與 CLI](chapters/16-ecc2-and-cli_hk.md) | Rust 控制平面、`ecc` 操作者 CLI |
| 17 | [儀表板與工具](chapters/17-dashboard-and-tooling_hk.md) | 桌面 GUI、技能建立器、生態系工具 |

### 第六部分 —— 參考
| # | 章節 | 你會學到甚麼 |
|---|---------|-------------------|
| 18 | [疑難排解與常見問題](chapters/18-troubleshooting-faq_hk.md) | 常見的故障模式以及如何修復 |
| 19 | [詞彙表與快速參考](chapters/19-glossary-reference_hk.md) | 所有術語、指令同環境變數一覽 |

---

## 插圖

本書附帶十二幅手繪 SVG 圖表，位於 [`assets/svg/`](assets/svg)。佢哋可以喺 GitHub 同任何 Markdown 檢視器直接呈現。每一章都會嵌入相關嘅圖。完整清單如下：

| 圖表 | 用於 |
|---------|---------|
| [ECC 是甚麼](assets/svg/01-what-is-ecc.svg) | 前言、第 1 章 |
| [架構層級](assets/svg/02-architecture-layers.svg) | 第 2 章 |
| [六大組件](assets/svg/03-six-components.svg) | 第 4 章 |
| [代理編排](assets/svg/04-agent-orchestration.svg) | 第 5 章、第 11 章 |
| [技能 vs 指令 vs 掛鈎](assets/svg/05-surfaces.svg) | 第 4 章、第 7 章 |
| [掛鈎生命週期](assets/svg/06-hook-lifecycle.svg) | 第 8 章 |
| [安裝決策樹](assets/svg/07-install-decision.svg) | 第 3 章 |
| [跨框架地圖](assets/svg/08-cross-harness.svg) | 第 12 章 |
| [記憶與學習](assets/svg/09-memory-learning.svg) | 第 9 章、第 13 章 |
| [安全模型](assets/svg/10-security.svg) | 第 15 章 |
| [功能工作流程](assets/svg/11-feature-workflow.svg) | 第 11 章 |
| [ECC 2.0 控制平面](assets/svg/12-ecc2-control-plane.svg) | 第 16 章 |

---

## 關於準確性與資料來源的說明

本書所有內容，都係喺直接閱讀 ECC 原始碼樹（`README.md`、短／長／安全指南、`SOUL.md`、`RULES.md`、`AGENTS.md`、`agent.yaml`、`hooks/hooks.json`、範例代理同技能、`ecc2/`，以及 `scripts/` 同 `docs/` 目錄）嘅 **2.0.0 版本** 之後寫成。ECC 每週都會發佈更新，所以確切數字（代理／技能／指令）同指令名稱會隨時間變化。請務必同實時 repo 對照核實：

- 原始碼：<https://github.com/affaan-m/ecc>
- repo 內的指南：`the-shortform-guide.md`、`the-longform-guide.md`、`the-security-guide.md`
- 授權：MIT

> *本書內容為教學目的，乃就 ECC repository 及其文件加以摘要及改寫而成。*

準備好喇？由[前言與快速上手 →](chapters/00-preface_hk.md) 開始。
