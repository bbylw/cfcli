import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const docs = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/docs" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    group: z.string(),
    order: z.number(),
    tag: z.string().optional(),
    /** 是否出现在文档首页的精选卡片里。显式声明，避免靠 order 截断。 */
    featured: z.boolean().default(false),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.coerce.date(),
    author: z.string(),
    role: z.string().optional(),
    minutes: z.number(),
  }),
});

export const collections = { docs, blog };
