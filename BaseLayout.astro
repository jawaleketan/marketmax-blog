import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    author: z.string().default("Ketan Jawale"),
    image: z.string().optional(),
    category: z.enum([
      "seo",
      "social-media",
      "content-marketing",
      "ppc",
      "analytics",
    ]),
    tags: z.array(z.string()),
    featured: z.boolean().default(false),
    readingTime: z.string().optional(),
    updatedDate: z.coerce.date().optional(),
    series: z.string().optional(),
  }),
});

export const collections = { blog };
