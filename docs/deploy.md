# 部署说明（维护者向）

对外访问地址见 README。本文档记录内部构建/部署细节与平台侧设置备忘。

## 构建与部署流程

```
push → main
  └─ GitHub Actions (.github/workflows/main.yml)
       ├─ hugo --gc --minify  (Hugo extended 0.166.0)
       ├─ → gh-pages 分支 ── GitHub Pages: https://tonyc726.github.io
       │                    └─ Cloudflare Pages（项目 itony）监听 gh-pages 自动发布
       └─ rsync → Tcloud 服务器: https://itony.net  (secrets.DEPLOY_*)
```

## 平台侧设置（仓库文件无法覆盖，改动需到各平台控制台）

- **Vercel**：自动识别为 Hugo 项目时默认安装远古版本 0.58.2，解析不了
  `config.toml` 的 dotted key，也无法兼容主题 API。需在
  Project Settings → **Environment Variables** 设置 `HUGO_VERSION=0.166.0`
  （改后需 Redeploy 生效）。
- **Cloudflare Pages**：项目 Node.js Version 不能是已停用的旧版
  （曾因 `18.x` 被拒，需在 Project Settings → Build & deployment 设为 `24.x`）。
- **升级 Hugo 时**：同步更新两处 —— `main.yml` 的 `hugo-version` 和
  Vercel 的 `HUGO_VERSION`。

## 写作工作流（维护备忘）

本地需要 Hugo **extended** 版（主题使用 Sass）：`brew install hugo`。

```bash
hugo new content post/文章标题.md   # 新建草稿
hugo server -D                      # 本地预览 http://localhost:1313
```

发布：把文章的 `draft` 改为 `false`，push 到 `main` 即自动构建部署。
front matter 常用字段见 `archetypes/default.md` 与既有文章。

> `hugo --gc --minify` 异常中断可能残留 `.hugo_build.lock` 导致后续构建卡死，
> 删掉该文件即可（`hugo server` 不受影响）。

## Node 辅助脚本

Hugo 站点本身不依赖 Node，`package.json` 只服务 `scripts/` 下的本地
Markdown 处理脚本。需要 Node.js 24.x（本地 20+ 一般也能跑）。

