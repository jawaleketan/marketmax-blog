# MarketMax — Digital Marketing Blog

## Overview
A free digital marketing blog built with Astro 7 + Tailwind CSS v4.
Content in Markdown, managed via Decap CMS. Hosted on Netlify (free tier).

## Tech Stack
- **Framework**: Astro 7 (Static Site Generation)
- **Styling**: Tailwind CSS v4 (via @tailwindcss/vite plugin)
- **CMS**: Decap CMS (Git-based, Netlify Identity + Git Gateway auth)
- **Search**: Pagefind (static search index)
- **Hosting**: Netlify (free tier, auto-deploy from GitHub)
- **Auth**: Netlify Identity — GitHub as external provider

## Project Structure
- `src/content/blog/` — Blog posts as Markdown files
- `src/content.config.ts` — Content collection Zod schema (Astro 7 glob loader)
- `src/layouts/` — BaseLayout.astro, PostLayout.astro
- `src/components/` — Header, Footer, BlogCard, Hero, Newsletter, Search
- `src/pages/` — index, blog/, categories/, about, rss.xml
- `src/styles/global.css` — Tailwind v4 + custom styles
- `public/admin/` — Decap CMS admin panel (config.yml + index.html)

## Design System
- **Dark theme only** — near-black background (#0a0a0b), layered surfaces
- **Accent color**: Amber (#f59e0b / #fbbf24) — NOT cyan
- **Theme tokens** defined in `@theme` block in global.css
- **Category colors**: SEO=emerald, Social=purple, Content=amber, PPC=blue, Analytics=pink
- **Background**: Subtle dot-grid pattern (via body::before pseudo-element)
- **Typography**: System font stack (no external fonts), article body 18px/1.8 line-height
- **Animations**: fade-in-up on sections, staggered card delays, smooth hover transitions

## Key Commands
- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run preview` — Preview production build
- `npx pagefind --site dist` — Index search after build

## Content Collections (Astro 7)
Blog posts use the new `src/content.config.ts` with `glob()` loader:
```ts
import { defineCollection, z } from "astro:content";
const blog = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({...})
});
export const collections = { blog };
```
Render posts with: `import { render } from "astro:content"; const { Content } = await render(post);`

## Content Rules
- Categories: seo, social-media, content-marketing, ppc, analytics
- All posts need: title, description, publishDate, category, tags
- Frontmatter fields: title, description, publishDate, author, image?, category, tags[], featured?, readingTime?
- Writing posts: Use Decap CMS at /admin/ or create .md files in src/content/blog/

## UI Components
- Header: sticky, backdrop-blur, mobile menu with animated slide + hamburger/X toggle
- Hero: centered, gradient text (amber→rose), CTA buttons, category pill links
- BlogCard: card with category tag, title, description, date+readtime; hover lifts + amber glow
- Newsletter: gradient card with email input
- Footer: 3-column grid (brand, categories, connect), copyright
- Search: Pagefind-powered search input with dropdown results
- Progress bar: 3px amber gradient at top showing scroll position
- Scroll-to-top: floating amber button, appears after 400px scroll

## Key Pages
- `/` — Hero + featured post + latest articles (3-col grid) + newsletter
- `/blog` — All articles with search bar
- `/blog/[slug]` — Article with back-link, category tag, author bio, related posts, newsletter
- `/categories/[category]` — Filtered by category with color-coded gradient banner
- `/about` — Author bio
- `/rss.xml` — RSS feed
- `/sitemap-index.xml` — Auto-generated sitemap

## Decap CMS Admin
- URL: /admin/ (login with GitHub via Netlify Identity)
- Backend: git-gateway (commits directly to GitHub)
- Netlify auto-deploys on every commit to main branch
