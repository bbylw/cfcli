# `cf`：面向整个 Cloudflare API 的智能体 CLI

cf 是为下一代软件开发而打造的 CLI：

- 借助专门定制的搜索与引导，智能体能找到它想用 Cloudflare 做的任何事所需的命令。
- JSON 是默认接口：面向人类时美化打印，面向智能体时压缩输出，最大限度节省上下文。
- cloudflare.config.ts 是整个 Cloudflare 的新配置格式，从 Workers 起步，把 TypeScript 的安全与准确带给开发者，以及智能体的语言服务器协议（LSP）。
- Vite 成为默认选项，带来市面上最好的本地开发服务器，以及面向开发者和框架作者的插件套件。

立即全局安装候选发布版（release candidate），随处运行：

```
npm i -g cf
```

cf 支持每个受支持的 Node.js 主版本的最新次版本。
支持的版本见 [package.json](package.json)。
