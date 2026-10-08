// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

// 部署前必须设置 SITE_URL，否则 canonical / og:url / sitemap 会指向占位域名。
const site = process.env.SITE_URL;

if (!site) {
  console.warn(
    "[astro.config] 未设置 SITE_URL，canonical 与 og:url 将回退到 http://localhost:4321",
  );
}

// https://astro.build/config
export default defineConfig({
  site: site ?? "http://localhost:4321",
  integrations: [react(), mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      theme: "vesper",
      wrap: true,
    },
  },
});
