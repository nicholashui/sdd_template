# 第 0 章 —— 前言與快速上手

[← 返回目錄](../README_hk.md) · [下一章：背景與理念 →](01-background-and-philosophy_hk.md)

---

## 兩分鐘版本

你會用 AI 編程助手——Claude Code、Cursor、Codex、OpenCode，總之就係某一款。佢開箱即用，係一個聰明但*善忘*嘅通才。佢每次會話都要重新探索你嘅程式碼庫，會忘記你尋日教過佢嘅慣例，會開開心心咁 commit 一句 `console.log`，偶爾仲會做啲有風險嘅嘢，因為冇任何嘢阻止過佢。

**Everything Claude Code（ECC）** 係一個單一、可重用嘅層，你將佢放喺嗰個助手前面，就可以一次過修正以上所有問題。佢畀到助手：

- **可委派的專家**（64 個 *agents*：planner、code-reviewer、security-reviewer、build-error-resolver……）。
- **可重複的工作流程**（262 個 *skills*：測試驅動開發、安全審查、API 設計……）。
- **自動護欄**（*hooks*：幫你格式化程式碼、掃描秘密資料、儲存你嘅上下文）。
- **常駐標準**（*rules*：不可變性、80% 測試覆蓋率、慣例式 commit、不硬編碼秘密資料）。
- **記憶**：可以跨會話留存，加上一個**學習迴圈**，將重複出現嘅模式轉化成新技能。
- **安全**：沙箱指引同內建掃描器（AgentShield）。

而且佢可以**跨多款工具**做到呢啲——你只需編寫一次，ECC 就會將佢翻譯成每個框架嘅原生設定格式。

<p align="center">
  <img src="../assets/svg/01-what-is-ecc.svg" alt="ECC 是在你與每一個 AI 編程工具之間的單一操作層" width="760">
</p>

如果你睇完成本書只記得一句嘢，請記住呢句：

> **ECC 會將一個聰明但通用嘅 AI 助手，變成一位有紀律嘅資深工程師，配備一隊專家、一份記憶同一名保安。**

---

## 「ECC」*不是*甚麼

- 佢**不是**橢圓曲線密碼學。簡短嘅 repo 名 `affaan-m/ecc` 會重新導向到 `affaan-m/everything-Claude-code`。
- 佢**不是**一個模型或 API。佢係跑*喺*你已經用緊嘅 AI 工具*之上*。
- 佢**不**鎖定喺 Claude。雖然個名係咁,但佢支援 Cursor、Codex、OpenCode、Gemini、Zed、GitHub Copilot 等等。

---

## 五分鐘內試用（Claude Code）

> 完整安裝、其他選擇同其他框架,會喺[第 3 章](03-installation_hk.md)講解。呢度只係最快嘅順利路徑。

**1. 加入 marketplace 並安裝外掛**（喺 Claude Code 內）：

```text
/plugin marketplace add https://github.com/affaan-m/ECC
/plugin install ecc@ecc
```

**2. 加入你關心嘅規則**（外掛無法附帶規則,所以要手動複製）：

```bash
git clone https://github.com/affaan-m/ECC.git
cd ECC
mkdir -p ~/.claude/rules/ecc
cp -r rules/common ~/.claude/rules/ecc/
cp -r rules/typescript ~/.claude/rules/ecc/   # 揀返你嘅技術棧
```

**3. 用佢：**

```text
/ecc:plan "Add user authentication with OAuth"
```

成個迴圈就係咁：你描述意圖,ECC 為你規劃,委派畀適合嘅專家,強制執行測試同標準,並記住發生過嘅嘢。

唔肯定要裝啲乜?喺任何專案中向附帶嘅顧問發問：

```bash
npx ecc consult "security reviews" --target claude
```

---

## 安裝 ECC 的黃金法則

安裝有兩條路線（外掛同手動安裝器）。**請只揀其中一條。** 最常見嘅損壞設定,就係將兩者疊埋一齊——裝咗外掛,*之後又*再跑完整安裝器——咁會令技能同 hooks 重複。我哋喺第 3 章會再三強調呢一點,但你而家就要記入腦。

---

## 本書其餘部分的脈絡

```text
第一部分   入門定向          →  是甚麼與為何          （第 0–2 章）
第二部分   令佢運作起嚟      →  安裝與概念            （第 3–4 章）
第三部分   建構模塊          →  agents…MCP            （第 5–10 章）
第四部分   操作 ECC          →  日常工作流程          （第 11–14 章）
第五部分   安全與進階        →  安全、ECC 2.0         （第 15–17 章）
第六部分   參考              →  疑難排解、詞彙表      （第 18–19 章）
```

揭去下一頁,了解 ECC *為何*存在,以及塑造當中每一個檔案嘅理念。

---

[← 返回目錄](../README_hk.md) · [下一章：背景與理念 →](01-background-and-philosophy_hk.md)
