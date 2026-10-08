import type { APIRoute } from "astro";

export const prerender = true;

export const GET: APIRoute = ({ site, url }) => {
  const origin = site ?? new URL(url.origin);
  const sitemap = new URL("sitemap-index.xml", origin);

  return new Response(
    ["User-agent: *", "Allow: /", "", `Sitemap: ${sitemap.href}`].join("\n"),
    {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    },
  );
};