<div id="search-overlay" class="search-overlay" role="dialog" aria-modal="true" aria-label="Search articles">
  <div class="search-overlay-backdrop"></div>
  <div class="search-overlay-panel">
    <div class="search-overlay-header">
      <div class="search-overlay-input-wrapper">
        <svg class="search-overlay-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
        </svg>
        <input id="search-overlay-input" type="text" placeholder="$ search articles..." autocomplete="off" autocorrect="off" spellcheck="false" />
        <kbd class="search-overlay-kbd">ESC</kbd>
      </div>
    </div>
    <div id="search-overlay-results" class="search-overlay-results">
      <div class="search-overlay-hint">Type at least 2 characters to search</div>
    </div>
  </div>
</div>

<script>
  document.addEventListener('astro:page-load', () => {
    const overlay = document.getElementById("search-overlay");
    const input = document.getElementById("search-overlay-input");
    const results = document.getElementById("search-overlay-results");
    let pagefindLoaded = false;

    function openSearch() {
      if (!overlay || !input) return;
      overlay.classList.add("open");
      document.body.style.overflow = "hidden";
      setTimeout(() => { input.focus(); }, 100);
      if (!pagefindLoaded) {
        loadPagefind();
      }
    }

    function closeSearch() {
      if (!overlay) return;
      overlay.classList.remove("open");
      document.body.style.overflow = "";
      if (input) input.value = "";
      if (results) results.innerHTML = '<div class="search-overlay-hint">Type at least 2 characters to search</div>';
    }

    function loadPagefind() {
      if (pagefindLoaded) return;
      const script = document.createElement("script");
      script.src = "/pagefind/pagefind.js";
      script.async = true;
      script.onload = () => { pagefindLoaded = true; };
      document.head.appendChild(script);
    }

    window.__openSearch = openSearch;
    window.__closeSearch = closeSearch;

    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (overlay && overlay.classList.contains("open")) {
          closeSearch();
        } else {
          openSearch();
        }
      }
      if (e.key === "Escape" && overlay && overlay.classList.contains("open")) {
        closeSearch();
      }
    });

    if (overlay) {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay || e.target.classList.contains("search-overlay-backdrop")) {
          closeSearch();
        }
      });
    }

    if (input && results) {
      let debounceTimer;
      input.addEventListener("input", () => {
        clearTimeout(debounceTimer);
        const query = input.value.trim();
        if (query.length < 2) {
          results.innerHTML = '<div class="search-overlay-hint">Type at least 2 characters to search</div>';
          return;
        }
        debounceTimer = setTimeout(() => performSearch(query), 200);
      });

      input.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeSearch();
        const items = results.querySelectorAll("a");
        if (e.key === "ArrowDown") {
          e.preventDefault();
          const first = items[0];
          if (first) first.focus();
        }
      });

      results.addEventListener("keydown", (e) => {
        const items = Array.from(results.querySelectorAll("a"));
        if (items.length === 0) return;
        const currentIdx = items.indexOf(document.activeElement);
        if (e.key === "ArrowDown") {
          e.preventDefault();
          const next = (currentIdx + 1) % items.length;
          items[next].focus();
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          const prev = currentIdx <= 0 ? items.length - 1 : currentIdx - 1;
          items[prev].focus();
        } else if (e.key === "Escape") {
          closeSearch();
        }
      });
    }

    async function performSearch(query) {
      if (typeof window.Pagefind === "undefined" || !window.Pagefind) {
        results.innerHTML = '<div class="search-overlay-hint">Loading search index...</div>';
        if (!pagefindLoaded) loadPagefind();
        const checkReady = setInterval(() => {
          if (typeof window.Pagefind !== "undefined" && window.Pagefind) {
            clearInterval(checkReady);
            performSearch(query);
          }
        }, 300);
        setTimeout(() => clearInterval(checkReady), 10000);
        return;
      }
      try {
        const search = await window.Pagefind.search(query);
        if (!search || !search.results || search.results.length === 0) {
          results.innerHTML = '<div class="search-overlay-empty">// no results for "' + query + '"</div>';
          return;
        }
        const items = await Promise.all(
          search.results.slice(0, 8).map(async (r) => {
            const data = await r.data();
            const cat = data.meta && data.meta.category ? data.meta.category : "";
            const catBadge = cat ? '<span class="search-result-cat">' + cat + "</span>" : "";
            return '<a href="' + data.url + '" class="search-result-item" tabindex="0">' +
              '<div class="search-result-title">' + data.title + "</div>" +
              '<div class="search-result-excerpt">' + data.excerpt + "</div>" +
              catBadge +
              "</a>";
          })
        );
        results.innerHTML = '<div class="search-result-list">' + items.join("") + "</div>";
        const first = results.querySelector("a");
        if (first) first.setAttribute("data-first", "true");
      } catch (err) {
        results.innerHTML = '<div class="search-overlay-empty">// search error, try again</div>';
      }
    }
  });
</script>
