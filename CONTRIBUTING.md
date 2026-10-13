# 參與這個專案

<!-- freedom-repository-guide:start -->
## 自由工坊：從一個成果到一個 PR

自由工坊公開原始碼導覽頁的產生器。 已有受限公開 repo 目錄與靜態 HTML 產生器；目前的目錄資料是導覽清單。

先看[本倉 Issues](https://github.com/FreeTWAI/FreeTWAI.github.io/issues)與[現有 PR](https://github.com/FreeTWAI/FreeTWAI.github.io/pulls)。提出問題、這一輪範圍、完成條件與可投入時間，在 Issue 認領並協調重疊工作；維護者已直接派工時不必重複等待，將約定連回交接即可。使用自己的 fork／分支，PR 送到 **FreeTWAI/FreeTWAI.github.io:main**。

交給 Agent 前先讓它讀 [AGENTS.md](AGENTS.md)。PR 寫明變更用途、使用者可見結果、驗證命令、限制與原 Issue；附上可公開的合成案例或重現方式。Issue／PR 是程式協作的記錄，平台名片與公會身分不取代 repo 維護者的審查。

只列可公開的 GitHub 來源與真實狀態；中央平台才保存會員與作品 import 事實。不要在這裡接收 session、token 或私人商品資料。

### 這個模組怎麼驗證

選擇與修改範圍相符的既有入口：

```sh
npm test
npm run build
```

命令列在這裡不表示本輪已執行。先核對依賴與環境，再記錄實際結果；缺工具、桌面、媒體或授權時寫 `not_run` 與原因，不能補造成功。純文件修改以連結／路徑核對與 `git diff --check` 為主。

### 署名與上游

本 repo 的維護者負責「自由工坊公開原始碼導覽頁的產生器。」這個模組；公會職稱與自填 GitHub slug 不授予寫入權。 保留原作者與授權檔，另列真正完成文件、測試、設計、程式或協作的人。使用 AI 時如實交代協作範圍；只有實際 GitHub PR／review／合併紀錄可以作為對應貢獻證據，不能靠自填帳號推定。

自願貢獻不保證案源、XP、收益或雇用。若產生付費合作，由當事人另定條款與 Seller 外部收款；平台不代收。秘密、客戶資料、真實交易單據與未授權素材不進公開 Issue／PR。
<!-- freedom-repository-guide:end -->

## 合併佇列與目錄建置驗證

`main` 使用 GitHub merge queue。PR 的必要來源與建置檢查通過後，以
「Merge when ready」加入佇列；GitHub 會對包含最新 `main` 與前方變更的
`merge_group` 再跑必要檢查，通過後才合併。請勿使用 bypass 或直接推送 `main`。

- 來源檢查由中央固定版本 `a254a2048b8470a2c1bc6a04e59e61b8531161df` 提供。
- 目錄建置檢查由中央固定版本 `5b471fe730f11a85700d5ab3225d6c862cee7bc3` 提供，
  在隔離環境實際執行建置並核對產物；通過既定案例不代表任意輸入或所有功能均已驗證。
- 佇列採 ALLGREEN、最多同時建置及合併兩筆；檢查逾時為 10 分鐘，
  最少合併一筆，使用 merge commit。失敗時保留檢查紀錄，修正後重新提交。
- 合併後既有 Pages workflow 才發布目錄與 Discord bot 隱私頁；
  必須另外確認該次部署成功，不能把建置通過當成已發布。

組合失敗拒絕與後續正常變更的驗收記錄見
[中央 PR #129](https://github.com/FreeTWAI/freedom-platform/pull/129)。
這項設定適用本目錄倉，不代表其他倉的 merge queue 或整體治理已完成。
