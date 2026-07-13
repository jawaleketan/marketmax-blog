<section id="popular-posts" aria-label="Popular articles">
  <p class="text-[11px] font-mono font-semibold uppercase tracking-widest text-text-muted mb-4">Popular</p>
  <div id="popular-list" class="space-y-3">
    <div class="text-xs font-mono text-text-muted skeleton-box">Loading...</div>
  </div>
</section>

<script>
  document.addEventListener('astro:page-load', () => {
    var list = document.getElementById("popular-list");
    if (!list) return;

    // Abort previous request on re-nav
    if (window.__popularAbort) window.__popularAbort.abort();
    window.__popularAbort = new AbortController();

    fetch("/api/view-count", { signal: window.__popularAbort.signal })
      .then(function(r) { return r.json(); })
      .then(function(counts) {
        var slugs = Object.keys(counts);
        slugs.sort(function(a, b) { return (counts[b] || 0) - (counts[a] || 0); });
        var top = slugs.slice(0, 3);
        if (top.length === 0) {
          list.innerHTML = '<div class="text-xs font-mono text-text-muted">No data yet</div>';
          return;
        }
        list.innerHTML = top.map(function(slug) {
          var title = slug.replace(/[-]/g, " ").replace(/\b\w/g, function(c) { return c.toUpperCase(); });
          return '<a href="/blog/' + slug + '" class="block card-hover p-3 rounded-md border border-border-default bg-bg-card hover:bg-bg-hover transition-all"><div class="text-xs font-medium text-text-primary font-mono leading-snug">' + title + '</div><div class="text-[10px] font-mono text-text-muted mt-1">' + counts[slug] + ' views</div></a>';
        }).join("");
      })
      .catch(function(err) {
        if (err.name === 'AbortError') return;
        list.innerHTML = '<div class="text-xs font-mono text-text-muted">Could not load</div>';
      });
  });
</script>
