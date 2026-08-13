<p align="center">
  <a href="https://itony.net">
    <img width="200" src="https://cdn.jsdelivr.net/gh/tonyc726/tonyc726.github.io@main/static/android-chrome-192x192.png">
  </a>
</p>

<h1 align="center"><a href="//itony.net"><strong>iTony.net</strong></a><br/><i>Life & Code</i></h1>

## 博客简介

[![made-with-Go](https://img.shields.io/badge/Made%20with-hugo-1f425f.svg)](https://gohugo.io/)
![Deploy on push events](https://github.com/tonyc726/tonyc726.github.io/workflows/Deploy%20on%20push%20events/badge.svg?branch=main)

基于 Hugo，使用 Github Actions 自动构建，部署到：

- Tcloud: https://itony.net
- Github Page: https://tonyc726.github.io

## Node 辅助脚本

Hugo 站点本身不依赖 Node。`package.json` 只服务 `scripts/` 下的本地 Markdown 处理脚本（当前针对 `content/post/hugo-img-qiniu.md` 做 AST 解析/改写实验）。

需要 Node.js 20+（建议 22 LTS）。安装与运行：

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
