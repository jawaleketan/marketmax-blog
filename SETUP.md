---
import BaseLayout from "../layouts/BaseLayout.astro";
import Header from "../components/Header.astro";
import Footer from "../components/Footer.astro";
import { getCollection } from "astro:content";
import BlogCard from "../components/BlogCard.astro";

const allPosts = await getCollection("blog");
const sortedPosts = allPosts.sort((a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime());
const latestPosts = sortedPosts.slice(0, 3);
---

<BaseLayout title="404, Not Found" description="Page not found.">
  <Header />
  <main class="container-blog pt-24 pb-20 sm:pt-28 sm:pb-24 animate-fade-in-up">
    <div class="max-w-lg mx-auto text-center">
      <div class="inline-flex items-center gap-3 mb-8">
        <span class="text-6xl font-mono font-bold text-accent-primary">404</span>
      </div>
      <h1 class="text-2xl font-extrabold tracking-[-0.03em] mb-3">Page not found</h1>
      <p class="text-sm font-mono text-text-muted mb-8">The page you're looking for doesn't exist or has moved.</p>
      <div class="flex flex-wrap items-center justify-center gap-3 mb-12">
        <a href="/" class="btn-primary font-mono text-sm">
          <span>$</span> cd ~/home
        </a>
        <a href="/blog" class="btn-secondary font-mono text-sm">
          <span>&rarr;</span> all articles
        </a>
      </div>

      <div class="border-t border-dashed border-border-default my-8"></div>

      <p class="text-xs font-mono text-text-muted mb-6">Try a category:</p>
      <div class="flex flex-wrap justify-center gap-2">
        {(["seo", "social-media", "content-marketing", "ppc", "analytics"] as const).map((cat) => (
          <a href={`/categories/${cat}`} class="px-3 py-1.5 rounded-full border border-border-default text-[11px] font-mono text-text-secondary hover:text-accent-primary hover:border-accent-primary/30 transition-all duration-200">
            {cat.replace("-", " ")}
          </a>
        ))}
      </div>

      {latestPosts.length > 0 && (
        <>
          <div class="border-t border-dashed border-border-default my-8"></div>
          <p class="text-xs font-mono text-text-muted mb-6">Latest articles:</p>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            {latestPosts.map((post) => (
              <BlogCard post={post} />
            ))}
          </div>
        </>
      )}
    </div>
  </main>
  <Footer />
</BaseLayout>
