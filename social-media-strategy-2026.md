---
import type { CollectionEntry } from "astro:content";

export interface Props {
  series: string;
  allPosts: CollectionEntry<"blog">[];
  currentSlug: string;
}

const { series, allPosts, currentSlug } = Astro.props;

const seriesPosts = allPosts
  .filter((p) => p.data.series === series)
  .sort((a, b) => a.data.publishDate.getTime() - b.data.publishDate.getTime());
---

<section class="mb-10 rounded-lg border border-border-default bg-bg-card overflow-hidden">
  <div class="px-5 py-4 border-b border-border-default bg-bg-surface">
    <div class="flex items-center gap-2">
      <span class="w-1.5 h-1.5 rounded-full bg-accent-primary"></span>
      <h2 class="text-[11px] font-mono font-semibold uppercase tracking-widest text-text-muted">Series: {series}</h2>
    </div>
  </div>
  <ol class="divide-y divide-border-default">
    {seriesPosts.map((p, i) => {
      const isCurrent = p.id === currentSlug;
      return (
        <li class={`flex items-center gap-3 px-5 py-3 ${isCurrent ? "bg-accent-subtle" : ""}`}>
          <span class={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-mono font-semibold border ${isCurrent ? "bg-accent-primary text-black border-accent-primary" : "border-border-default text-text-muted"}`}>
            {i + 1}
          </span>
          <div class="flex-1 min-w-0">
            {isCurrent ? (
              <span class="text-sm font-medium text-accent-primary font-mono">{p.data.title}</span>
            ) : (
              <a href={`/blog/${p.id}`} class="text-sm font-medium text-text-muted hover:text-accent-primary transition-colors font-mono">{p.data.title}</a>
            )}
          </div>
          {isCurrent && <span class="text-[10px] font-mono text-accent-primary">reading</span>}
        </li>
      );
    })}
  </ol>
</section>
