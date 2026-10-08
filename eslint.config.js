import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import astro from "eslint-plugin-astro";

export default [
  {
    ignores: ["dist/**", ".astro/**", "node_modules/**", "coverage/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  {
    languageOptions: {
      globals: {
        process: "readonly",
        console: "readonly",
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        location: "readonly",
      },
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // TerminalDemo 的播放进度由 setTimeout 驱动，属于"订阅外部系统"的
      // effect，setState 出现在 effect 里是预期行为。
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    // Astro frontmatter 是 TS，模板不是；模板里的标签由 astro 插件处理
    files: ["**/*.astro"],
    rules: {
      "no-undef": "off",
    },
  },
];