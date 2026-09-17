# 部署说明（维护者向）

对外访问地址见 README。本文档只记录**不含敏感信息**的构建备忘；
服务器拓扑、部署目标等内部细节见维护者的私有笔记（Obsidian `02-Projects/itony.net.md`）。

## 构建注意事项

- 需要 Hugo **extended** 版（主题使用 Sass）：`brew install hugo`，版本锁定 `0.166.0`
- 平台侧（Vercel / Cloudflare Pages）需同步设置 Hugo 版本与 Node 版本，
  具体值以 `.github/workflows/main.yml` 为准
- `hugo --gc --minify` 异常中断可能残留 `.hugo_build.lock` 导致后续构建卡死，
  删掉该文件即可（`hugo server` 不受影响）

## 评论系统

- 文章页评论区为自托管 Waline（免登录），前端静态资源本地托管于 `static/lib/waline/`，
  服务地址在 `config.toml` 的 `[params.comments]`；管理面板入口见其 `walineServer` 域名加 `/ui`
- `/discuss/` 页面为 giscus（GitHub 用户）；front matter `comment: false` 关闭评论、
  `comment: giscus` 单篇切换

## 写作工作流（维护备忘）

```bash
hugo new content post/文章标题.md   # 新建草稿
hugo server -D                      # 本地预览 http://localhost:1313
```

发布：把文章的 `draft` 改为 `false`，push 到 `main` 即自动构建部署。
front matter 常用字段见 `archetypes/default.md` 与既有文章。

## Node 辅助脚本

Hugo 站点本身不依赖 Node，`package.json` 只服务 `scripts/` 下的本地
Markdown 处理脚本。需要 Node.js 24.x（本地 20+ 一般也能跑）。
