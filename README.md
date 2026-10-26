# FreeTWAI public project directory

<!-- freedom-repository-guide:start -->
## 在自由工坊的位置

[自由工坊](https://freetwai.com) 讓會員先完成定位、選擇公會並領取 Repo 技能書，再以供貨、商店、開源作品、行銷與小隊共同完成成果。

自由工坊公開原始碼導覽頁的產生器。 已有受限公開 repo 目錄與靜態 HTML 產生器；目前的目錄資料是導覽清單。

本 repo 不包含會員 Portal、中央 project registry 或 signed-status 服務；本機 build 不代表 Pages 已部署。

本 repo 的維護者負責「自由工坊公開原始碼導覽頁的產生器。」這個模組；公會職稱與自填 GitHub slug 不授予寫入權。

程式／內容入口：[data/directory.json](data/directory.json)、[src/index.mjs](src/index.mjs)、[scripts/build.mjs](scripts/build.mjs)、[test/](test/)。協作先讀 [CONTRIBUTING.md](CONTRIBUTING.md)，讓 Agent 讀 [AGENTS.md](AGENTS.md)；從[本倉 Issues](https://github.com/FreeTWAI/FreeTWAI.github.io/issues)認領、[查看既有 PR](https://github.com/FreeTWAI/FreeTWAI.github.io/pulls)避免重工。

只列可公開的 GitHub 來源與真實狀態；中央平台才保存會員與作品 import 事實。不要在這裡接收 session、token 或私人商品資料。 跨 repo 的協定由[中央平台](https://github.com/FreeTWAI/freedom-platform)維護。
<!-- freedom-repository-guide:end -->

Source for a simple directory of the nine Freedom repositories, plus the privacy policy of the 自由工坊 Discord bot (小妹). Pushes to `main` build `dist/` and publish it to the organization GitHub Pages site (https://freetwai.github.io/) through `.github/workflows/pages.yml`; the privacy policy is served at https://freetwai.github.io/privacy/discord-bot/.

With Node 24:

```sh
npm test
npm run build
```

The artifacts are `dist/index.html` and `dist/privacy/discord-bot/index.html` (policy text in `data/privacy-discord-bot.json`). Entries in `data/directory.json` link only to public GitHub source repositories and state the current limitations. The directory does not claim that a linked project is deployed, reviewed, official or commercially ready. It does not load Platform member sessions, private projects, API credentials or a second project database.

For an individual project's introduction page, use `freedom-project-page` with its checked public manifest. This source navigation list is not a copy of the canonical project registry or a signed-status service. Publishing this directory on GitHub Pages does not publish or certify any linked project.

## Architecture and Deployment

### Static Site Build Steps
The project uses a custom Node.js build script (`scripts/build.mjs`) to generate static HTML.
- Run `npm run build` to read the directory data from `data/directory.json` and privacy policy from `data/privacy-discord-bot.json`.
- The output is written to the `dist/` directory as static HTML files (`dist/index.html` and `dist/privacy/discord-bot/index.html`).

### GitHub Pages Workflow
Deployment is automated via GitHub Actions in `.github/workflows/pages.yml`.
- Pushing to the `main` branch triggers the workflow.
- The workflow installs dependencies, runs tests (`npm test`), and executes the build script.
- The resulting `dist/` folder is uploaded as a Pages artifact and deployed to the `github-pages` environment (https://freetwai.github.io/).

### Asset Optimization Pipeline
There is currently no automated asset optimization pipeline (e.g., image compression or JS/CSS minification) since the project outputs minimal, statically generated HTML.
