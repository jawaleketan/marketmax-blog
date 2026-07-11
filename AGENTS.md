# MarketMax — Digital Marketing Blog

## Overview
A free digital marketing blog built with Astro + Tailwind CSS v4.
Content in Markdown, managed via Decap CMS. Free hosting on Cloudflare Pages.

## Tech Stack
- **Framework**: Astro 7 (Static Site Generation)
- **Styling**: Tailwind CSS v4 (via @tailwindcss/vite plugin)
- **CMS**: Decap CMS (Git-based, no database)
- **Search**: Pagefind (static search index)
- **Hosting**: Cloudflare Pages (free tier)

## Project Structure
- `src/content/blog/` — Blog posts as Markdown files
- `src/content/config.ts` — Content collection Zod schema
- `src/layouts/` — BaseLayout.astro, PostLayout.astro
- `src/components/` — Header, Footer, BlogCard, Hero, Newsletter, Search
- `src/pages/` — index, blog/, categories/, about, rss.xml
- `src/styles/global.css` — Tailwind v4 + custom styles
- `public/admin/` — Decap CMS admin panel

## Key Commands
- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run preview` — Preview production build
- `npx pagefind --site dist` — Index search after build

## Content Rules
- Categories: seo, social-media, content-marketing, ppc, analytics
- All posts need: title, description, publishDate, category, tags
- Dark theme only — colors from @theme tokens in global.css
