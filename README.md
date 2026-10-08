# cf：面向整个 Cloudflare API 的智能体 CLI

`cf` 是 Cloudflare 推出的新一代命令行工具：命令直接从 API 文档与 SDK 共用的 OpenAPI 模式生成，一次覆盖 3,000+ 操作——从 Workers、D1、R2、KV，到 DNS、WAF、Access 与域名注册。

> 本仓库是 `cf` 的中文介绍页，内容整理自 Cloudflare 官方 README、发布公告与开发者文档。`cf` 目前处于**公开测试**阶段，命令、配置与构建输出在稳定版发布前仍可能变化。

## 为什么是 cf

Wrangler 由各产品团队手工构建，只有约 280 条命令路径，术语与模式却难以统一——同一件事在 D1、Hyperdrive、Workflows 里是三种写法：

```
d1 info / hyperdrive get / workflows describe
```

`cf` 换了一条路：命令由同一份模式生成，新增的 API 能力自动出现在 CLI 中，命名与参数不再各说各话。

## 核心能力

- **智能体自己找到命令**——用自然语言描述目标，`cf cli search` 按 API 描述与参数返回可用命令，不必先记住命令名。
- **JSON 才是默认输出**——对人类美化排版，对智能体压缩成单行，省下的是上下文。
- **配置也能被类型检查**——`cloudflare.config.ts` 取代 TOML，人类、编辑器与智能体的 LSP 都读得懂。
- **Vite 成为默认构建**——具备 HMR 的开发服务器、基于 Rolldown 的构建、可直接复用的 Vite 插件生态。
- **从 Wrangler 迁移只要一条命令**——`cf migrate` 自动转换配置；稳定版发布后 Wrangler 仍有 18 个月维护支持。

## 安装

```sh
npm i -g cf
```

也支持 `bun` / `pnpm` / `yarn` 全局安装。需要 Node.js 运行时（加载 `cloudflare.config.ts` 需要 Node.js 22.18+，不支持 Bun 运行时）。

## 登录

```sh
cf auth login
```

在远程机器、SSH 会话或容器中加上 `--no-browser`，只打印链接而不打开浏览器。无人值守环境（CI）改用 `CLOUDFLARE_API_TOKEN` 环境变量。注意 `cf` 维护自己的凭据，不会复用 Wrangler 的登录状态。

## 上手三步

```sh
# 1. 找到命令：用自然语言描述任务
cf cli search "create D1 database"

# 2. 创建项目并本地开发
cf init my-worker
cf dev

# 3. 部署到你的 Cloudflare 账号
cf deploy
```

先看参数再执行：`cf schema d1 create` 查看请求结构，`--dry-run` 安全预演。

## 相关链接

- 官方仓库：https://github.com/cloudflare/cf
- Cloudflare 开发者文档：https://developers.cloudflare.com/

## 商标归属

`cf` 及 Cloudflare 商标归 Cloudflare, Inc. 所有。本仓库为社区中文介绍页，与 Cloudflare 官方无关。
