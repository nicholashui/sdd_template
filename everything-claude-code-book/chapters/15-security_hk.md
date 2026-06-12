# 第 15 章 —— 安全

[← Token 優化](14-token-optimization_hk.md) · [目錄](../README_hk.md) · [下一章：ECC 2.0 與 CLI →](16-ecc2-and-cli_hk.md)

---

> 喺你啟用會運行 shell 指令嘅 hooks、連接 MCP 伺服器,或者讓一個代理自主迴圈*之前*,先讀呢一章。ECC 附帶一整份 `the-security-guide.md` 係有原因嘅：代理式工具已經變成一個真實嘅攻擊面。

## 15.1 點解這不是杞人憂天

安全指南以一個發人深省嘅觀點開首：我哋信任嘅工具,亦正正係被**針對**嘅工具。持續運行嘅框架（Claude Code、Codex、OpenClaw）增加咗攻擊面,而代理式系統裏面嘅提示詞注入,已經唔再係一張得意嘅越獄截圖——佢可以變成**shell 執行、秘密資料外洩、工作流程濫用,或者悄無聲息嘅橫向移動**。

<p align="center">
  <img src="../assets/svg/10-security.svg" alt="致命三元組與縱深防禦" width="800">
</p>

指南裏面幾個數字,幫你錨定風險嘅嚴重性（快照;細節喺 repo）：

| 統計 | 詳情 |
|------|--------|
| CVSS **8.7** | Claude Code 信任前執行問題,CVE-2025-59536 |
| **31 間公司 / 14 個行業** | Microsoft 嘅 AI 記憶投毒報告 |
| **3,984 個之中佔 36%** | Snyk ToxicSkills 研究裏面帶提示詞注入嘅公開技能 |
| **1,467** | Snyk 識別出嘅惡意酬載（payloads） |
| **17,470** | Hunt.io 報告嘅外露 OpenClaw 家族實例 |

確切數字會變;重要嘅係*發展方向*。

---

## 15.2 致命三元組（lethal trifecta）

最乾淨嘅心智模型（來自 Simon Willison,指南有引用）：三種成份,**只有當喺同一個執行階段結合時**先危險：

1. **私隱資料** —— 你嘅秘密資料、repos、憑證。
2. **不可信內容** —— 一個 PR 留言、一個電郵附件、一個抓取嘅網頁、一個 MCP 工具嘅輸出。
3. **對外通訊** —— 將資料送出去嘅能力。

任何一個或兩個通常都冇問題。**三個一齊**就係提示詞注入變成資料外洩之時。模型讀嘅每一個 byte 都係可執行上下文——一旦文字進入視窗,「資料」同「指示」之間就冇咗一條牢固嘅界線。

### 你實際面對的攻擊向量
- **電郵／PDF 附件**帶內嵌指示（你嘅代理將佢當作任務嘅一部分嚟讀）。
- **GitHub PR／issues**帶隱藏嘅 diff 留言或惡意連結文件——危險之處在於自動審查機械人會將漏洞利用向下游傳播。
- **MCP 伺服器**有漏洞、惡意,或者單純被過度信任（OWASP 而家有一個 MCP Top 10：工具投毒、上下文酬載注入、命令注入、影子伺服器、秘密資料外露）。
- **記憶投毒** —— 一個酬載被*記住*,稍後再浮現。
- **技能作為供應鏈** —— 喺一項研究裏面,三分一公開技能帶有注入。將匯入嘅技能當作任何相依套件咁對待。

---

## 15.3 真實的 CVE（2026 年 2 月）

Check Point Research 披露咗多個 Claude Code 問題,終結咗「呢個誇大其詞啦」嘅階段：

- **CVE-2025-59536** —— 專案內含嘅程式碼可以喺信任對話框被接受*之前*運行（喺 `1.0.111` 之前已修復）。
- **CVE-2026-21852** —— 一個惡意專案可以覆寫 **`ANTHROPIC_BASE_URL`**、重新導向 API 流量,並喺信任確認之前洩漏 API 金鑰（手動更新者：請用 `2.0.65`+）。
- **MCP 同意濫用** —— 受 repo 控制嘅 MCP 設定,可以喺目錄被有意義咁信任之前,自動批准專案 MCP 伺服器。

ECC 得出嘅課題：**專案設定、hooks、MCP 設定同環境變數,都係執行面嘅一部分。** `.claude/` 同 `.mcp.json` 透過原始碼控制共享,並由一條信任邊界守護——而呢個正正係攻擊者針對嘅目標。（呢個亦係點解你應該謹慎咁 clone 同打開不可信嘅 repos。）

---

## 15.4 縱深防禦（實用劇本）

呢份指南難得咁具體。五層,由最易見效嘅開始：

### 1. 分隔身份
唔好畀代理用*你嘅*帳戶。建立 `agent@yourdomain.com`、一個獨立嘅機械人用戶、一個短壽命嘅範圍受限 token。*如果你嘅代理同你有相同嘅帳戶,一個被入侵嘅代理就係你。*

### 2. 隔離不可信工作
喺一個容器、VM 或 devcontainer 裏面,運行不可信嘅 repos／附件繁多／外來內容嘅工作。預設**冇網絡外送（egress）**：
```yaml
services:
  agent:
    build: .
    user: "1000:1000"
    working_dir: /workspace
    volumes: ["./workspace:/workspace:rw"]
    cap_drop: ["ALL"]
    security_opt: ["no-new-privileges:true"]
    networks: ["agent-internal"]
networks:
  agent-internal:
    internal: true        # 被入侵嘅代理唔可以打電話返屋企
```
對於一次性審查,即使一個簡單嘅 `--network=none` 容器都好過你嘅主機：
```bash
docker run -it --rm -v "$(pwd)":/workspace -w /workspace --network=none node:20 bash
```

### 3. 限制工具同路徑（最高 ROI、最易）
如果你嘅框架支援權限,就由環繞明顯敏感材料嘅拒絕規則開始：
```json
{
  "permissions": {
    "deny": [
      "Read(~/.ssh/**)", "Read(~/.aws/**)", "Read(**/.env*)",
      "Write(~/.ssh/**)", "Write(~/.aws/**)",
      "Bash(curl * | bash)", "Bash(ssh *)", "Bash(scp *)", "Bash(nc *)"
    ]
  }
}
```
畀一個工作流程只係佢需要嘅嘢：讀一個 repo 兼測試,唔應該讀你嘅 home 目錄;一個單一 repo 嘅 token 唔應該有橫跨整個組織嘅寫入權。

### 4. 淨化輸入
模型讀嘅所有嘢都係可執行上下文。提防隱藏 unicode／零寬度／雙向（bidi）字元、HTML 註解酬載,以及內嵌喺附件或連結內容嘅指示。喺模型睇到之前*先*淨化附件。ECC 嘅 **Prompt Defense Baseline**（第 9 章）就係呢樣嘅提示詞內層次。

### 5. 批准邊界、日誌與緊急停止掣
對於會改變狀態嘅動作,保持有人類喺迴圈中;**記錄**工具／MCP 呼叫（ECC 嘅 governance-capture 同 MCP-audit hooks 幫到手）;並準備一個**緊急停止掣**。預設賦予最少嘅自主權（least agency）。

---

## 15.5 AgentShield —— 附帶的掃描器

ECC 附帶 **AgentShield**,一個為你代理設定而設嘅安全審計器。零安裝運行佢：

```bash
npx ecc-agentshield scan            # 快速掃描
npx ecc-agentshield scan --fix       # 自動修復安全問題
npx ecc-agentshield scan --opus --stream   # 深度三代理分析
npx ecc-agentshield init             # 由零生成一個安全設定
```

**佢掃描咩：** `CLAUDE.md`、`settings.json`、MCP 設定、hooks、代理定義同技能,橫跨五個類別——秘密資料偵測（14 種模式）、權限審計、hook 注入分析、MCP 伺服器風險剖析,以及代理設定審查。

**`--opus` 旗標**運行三個 Opus 代理,作為一條**紅隊／藍隊／審計員**流水線：攻擊者搵漏洞利用鏈、防禦者評估防護、審計員綜合出一份優先排序嘅風險評估。嗰個係對抗式推理,而唔係淨係模式匹配。

**輸出：** 終端機（A–F 評級）、JSON（CI）、Markdown、HTML。**遇到關鍵發現時退出碼 2**,咁你就可以把守 build。喺框架內,用 `/security-scan` 運行佢;喺 CI,用 GitHub Action。AgentShield 喺 Claude Code Hackathon（Cerebral Valley × Anthropic）建成,報告有 1282 個測試、約 98% 覆蓋率、102 條靜態分析規則。

---

## 15.6 最低門檻檢查清單

喺你讓 ECC（或任何代理框架）以真實權限運行之前：

- [ ] 代理使用**獨立身份**（唔係你嘅個人帳戶）。
- [ ] 不可信工作喺一個**隔離**容器／VM 中運行,**預設冇外送**。
- [ ] **拒絕規則**保護 `~/.ssh`、`~/.aws`、`.env`,同危險 bash（`curl | bash`、`ssh`、`scp`、`nc`）。
- [ ] 工具被**限定範圍**至每個工作流程所需;token 短壽命且最小權限。
- [ ] 輸入被**淨化**;Prompt Defense Baseline 在場。
- [ ] 改變狀態嘅動作需要**批准**;工具／MCP 呼叫被**記錄**;你有一個**緊急停止掣**。
- [ ] 你跑咗 **`npx ecc-agentshield scan`**（並修復咗關鍵項）。
- [ ] 啟用 **< 10 個 MCP / < 80 個工具**;你信任每一個。
- [ ] 你**唔會喺你嘅主機上 clone 同打開不可信嘅 repos**。

---

## 15.7 ECC 內建的安全姿態

ECC 唔淨係關於安全嘅*建議*——佢焗入咗好多嘢：
- 每個代理同 `CLAUDE.md` 裏面嘅 **Prompt Defense Baseline**。
- **安全優先**作為核心原則;強制性嘅 commit 前檢查（冇硬編碼秘密資料、輸入驗證、SQLi/XSS/CSRF 防範、auth 檢查、速率限制、日誌中冇敏感資料）。
- 一個 **`security-reviewer`** 代理同 `security-review` 技能（對齊 OWASP）。
- 用於秘密資料偵測、設定保護、治理擷取同 MCP 健康嘅 **hooks**。
- 一個供應鏈 IOC 掃描（`npm run security:ioc-scan`）同諮詢來源工具。

---

## 15.8 重點摘要

- **致命三元組**（私隱資料 + 不可信內容 + 對外通訊）就係注入變成外洩之時。
- 專案設定、hooks、MCP 設定同環境變數係**執行面**——真實嘅 CVE（59536、21852）證明咗呢點。
- 縱深防禦：**分隔身份 → 隔離 → 限制工具／路徑 → 淨化 → 批准／記錄／停止**。
- 跑 **`npx ecc-agentshield scan`**（或 `/security-scan`）;用 `--opus` 做對抗式分析;喺退出碼 2 把守 CI。
- 將**技能同 MCP 伺服器當作供應鏈**。唔好喺你嘅主機上 clone 同打開不可信嘅 repos。

下一章：凌駕個別安裝之上嘅操作者層次—— ECC 2.0 同 CLI。

---

[← Token 優化](14-token-optimization_hk.md) · [目錄](../README_hk.md) · [下一章：ECC 2.0 與 CLI →](16-ecc2-and-cli_hk.md)
