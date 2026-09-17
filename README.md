<p align="center">
  <a href="https://itony.net">
    <img width="200" src="https://cdn.jsdelivr.net/gh/tonyc726/tonyc726.github.io@main/static/android-chrome-192x192.png">
  </a>
</p>

<h1 align="center"><a href="//itony.net"><strong>iTony.net</strong></a><br/><i>Life & Code</i></h1>

## 博客简介

[![made-with-Go](https://img.shields.io/badge/Made%20with-hugo-1f425f.svg)](https://gohugo.io/)
![Deploy on push events](https://github.com/tonyc726/tonyc726.github.io/workflows/Deploy%20on%20push%20events/badge.svg?branch=main)

基于 Hugo（extended 版，锁定 `0.166.0`），push 到 `main` 后由 GitHub Actions 自动构建并部署，见下文「部署架构」。

## 部署架构

```
push → main
  └─ GitHub Actions (.github/workflows/main.yml)
       ├─ hugo --gc --minify  (Hugo extended 0.166.0)
       ├─ → gh-pages 分支 ── GitHub Pages: https://tonyc726.github.io
       │                    └─ Cloudflare Pages（项目 itony）监听 gh-pages 自动发布
       └─ rsync → Tcloud 服务器: https://itony.net  (secrets.DEPLOY_*)
```

注意（平台侧设置，仓库文件无法覆盖，改动需到各平台控制台）：

- **Vercel**：自动识别为 Hugo 项目时默认安装远古版本 0.58.2，解析不了 `config.toml` 的 dotted key，也无法兼容主题 API。需在 Project Settings → **Environment Variables** 设置 `HUGO_VERSION=0.166.0`（改后需 Redeploy 生效）。
- **Cloudflare Pages**：项目 Node.js Version 不能是已停用的旧版（曾因 `18.x` 被拒，需在 Project Settings → Build & deployment 设为 `24.x`）。
- **升级 Hugo 时**：同步更新两处 —— `main.yml` 的 `hugo-version` 和 Vercel 的 `HUGO_VERSION`。

## 写作工作流

本地需要 Hugo **extended** 版（主题使用 Sass）：`brew install hugo`。

```bash
# 新建文章（draft: true，不会发布）
hugo new content post/文章标题.md

# 本地预览（含草稿，改动即刷新）：http://localhost:1313
hugo server -D

# 发布：把文章的 draft 改为 false（或删掉该行），push 到 main 即自动构建部署
```

文章 front matter 可用字段参考 `archetypes/default.md` 与既有文章；常用：`title`、`date`、`draft`、`tags`、`categories`、`toc`、`mathjax`。

> 注意：`hugo --gc --minify` 异常中断可能残留 `.hugo_build.lock` 导致后续构建卡死，删掉该文件即可（`hugo server` 不受影响）。

## Node 辅助脚本

Hugo 站点本身不依赖 Node。`package.json` 只服务 `scripts/` 下的本地 Markdown 处理脚本（当前针对 `content/post/hugo-img-qiniu.md` 做 AST 解析/改写实验）。

需要 Node.js 24.x（`package.json` `engines` / `.nvmrc`；本地 20+ 一般也能跑脚本）。安装与运行：

```bash
npm install

# remark / unified：解析并再序列化一篇文章
npm start

# commonmark：遍历 AST 并改写图片 destination
npm run start:commonmark

# 静态检查
npm run typecheck
npm run lint
npm run format
```

VS Code 调试 `scripts/*.ts` 时使用 `.vscode/launch.json` 里的 **TS File Debug**（通过 `tsx` 加载）。

## 版权声明

本博客所有文章除特别声明外，均采用 [CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/) 许可协议。
转载请注明出处！

---

Made by Tony ([blog](https://itony.net))
