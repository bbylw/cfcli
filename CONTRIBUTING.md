# 本站开发指南

本站是 `cf` 的**非官方中文文档站**（线上地址 https://cfcli.ndjp.net），面向贡献者的开发说明集中在这里。关于 `cf` CLI 本身的介绍见 [README.md](./README.md)。

## 技术栈

Astro 7（静态输出）· React 19（仅首页终端演示一个 island）· Tailwind CSS 4 · MDX 内容集合

## 开发

```
bun install
bun run dev
```

| 命令 | 作用 |
| --- | --- |
| `bun run dev` | 本地开发服务器 |
| `bun run build` | 构建到 `dist/` |
| `bun run preview` | 预览构建产物 |
| `bun run check` | Astro / TypeScript 类型检查 |
| `bun run lint` | ESLint（含 astro 与 react-hooks 插件） |
| `bun run test` | Vitest 单测 |
| `bun run verify` | 上述四项依次执行，提交前跑这个 |

## 部署

**必须设置 `SITE_URL`**，否则 canonical、`og:url` 与 sitemap 会指向 `localhost`：

```
SITE_URL=https://cfcli.ndjp.net bun run build
```

输出为纯静态文件，由 GitHub Actions 构建并部署到 GitHub Pages
（自定义域 `cfcli.ndjp.net`，配置见 `.github/workflows/deploy.yml`
与 `public/CNAME`）。

## 内容结构

```
src/content/docs/*.mdx   文档，frontmatter 的 order 决定侧栏顺序
src/content/blog/*.mdx   博客
```

文档 frontmatter：

| 字段 | 说明 |
| --- | --- |
| `order` | 全站排序，同时决定上一篇 / 下一篇 |
| `group` | 侧栏分组标题 |
| `tag` | 页面顶部的徽标文案 |
| `featured` | `true` 时出现在文档首页精选卡片 |

`featured` 是显式开关，不要靠 `order` 截断前 N 条 —— 新增文档会静默改变精选结果。

## 站点约定

- 深色主题锁定，强调色只有 Cloudflare 橙，色板定义在 `src/styles/global.css` 的 `@theme`。
- 前景色需满足 WCAG AA 对比度 ≥ 4.5:1；`fog-600` 是元信息色，改动时请复算。
- tab / radio 组必须走 `src/scripts/roving.ts` 的 roving tabindex，或直接用原生 `<input type="radio">`。
- 正文排版类 `.prose-cf` 的特异性高于 Tailwind 工具类，组件若需要自己的外边距要在样式表里声明。

## 第三方内容归属

`cf` 及 Cloudflare 商标归 Cloudflare, Inc. 所有。本站为社区翻译站点。
