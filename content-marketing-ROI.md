---
const navLinks = [
  { label: "Home", href: "/" },
  { label: "Blog", href: "/blog" },
  { label: "SEO", href: "/categories/seo" },
  { label: "Social", href: "/categories/social-media" },
  { label: "Content", href: "/categories/content-marketing" },
  { label: "PPC", href: "/categories/ppc" },
  { label: "Analytics", href: "/categories/analytics" },
  { label: "About", href: "/about" },
];

const currentPath = Astro.url.pathname;
---

<header class="floating-nav" id="main-header">
  <div class="header-inner flex items-center justify-between h-12">
    <a href="/" class="flex items-center gap-2 text-sm text-text-primary hover:text-accent-primary transition-colors duration-200">
      <span class="text-accent-primary font-bold font-mono text-xs">&gt;</span>
      <span class="font-semibold tracking-tight text-sm">marketmax</span>
      <span class="text-text-muted font-mono text-xs">~$</span>
    </a>

    <nav class="hidden md:flex items-center gap-0.5">
      {navLinks.map((link) => {
        const isActive = link.href === "/" ? currentPath === "/" : currentPath.startsWith(link.href);
        return (
          <a href={link.href} class={`px-3 py-1.5 rounded-full text-xs font-mono transition-all duration-200 ${isActive ? "text-accent-primary bg-accent-subtle" : "text-text-muted hover:text-text-primary hover:bg-bg-card/50"}`}>
            {isActive ? `> ${link.label.toLowerCase()}` : link.label.toLowerCase()}
          </a>
        );
      })}
    </nav>

    <div class="flex items-center gap-0.5">
      <button onclick="window.__openSearch()" class="hidden sm:flex w-8 h-8 items-center justify-center rounded-full text-text-muted hover:text-accent-primary hover:bg-bg-card/50 transition-all duration-200" aria-label="Search articles (Ctrl+K)">
        <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
        </svg>
      </button>
      <button id="theme-toggle" onclick="window.__themeToggle()" class="w-8 h-8 flex items-center justify-center rounded-full text-text-muted hover:text-accent-primary hover:bg-bg-card/50 transition-all duration-200" aria-label="Toggle theme">
        <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      </button>

      <button id="menu-toggle" class="md:hidden text-text-secondary hover:text-text-primary transition-colors duration-200 relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-bg-card/50" aria-label="Toggle menu">
        <svg id="menu-icon-open" class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>
        </svg>
        <svg id="menu-icon-close" class="w-5 h-5 hidden" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
        </svg>
      </button>
    </div>
  </div>

  <div id="mobile-menu" class="md:hidden border-t border-border-default bg-bg-surface/95 backdrop-blur-xl rounded-2xl mx-2 mb-2">
    <div class="flex flex-col gap-1 py-2 px-2">
      {navLinks.map((link) => {
        const isActive = link.href === "/" ? currentPath === "/" : currentPath.startsWith(link.href);
        return (
          <a href={link.href} class={`px-3 py-2 rounded-xl text-sm font-mono transition-all duration-200 ${isActive ? "text-accent-primary bg-accent-subtle" : "text-text-muted hover:text-text-primary hover:bg-bg-card/50"}`}>
            {isActive ? `> ${link.label.toLowerCase()}` : `$ ${link.label.toLowerCase()}`}
          </a>
        );
      })}
    </div>
  </div>
</header>

<script>
  document.addEventListener("astro:page-load", () => {
    const toggle = document.getElementById("menu-toggle");
    const menu = document.getElementById("mobile-menu");
    const iconOpen = document.getElementById("menu-icon-open");
    const iconClose = document.getElementById("menu-icon-close");
    if (!toggle || !menu) return;

    var focusableLinks = menu.querySelectorAll("a");
    var lastFocused = null;

    function openMenu() {
      menu.classList.add("open");
      iconOpen?.classList.add("hidden");
      iconClose?.classList.remove("hidden");
      lastFocused = document.activeElement;
      var first = focusableLinks[0];
      if (first) setTimeout(function() { first.focus(); }, 50);
    }
    function closeMenu() {
      menu.classList.remove("open");
      iconOpen?.classList.remove("hidden");
      iconClose?.classList.add("hidden");
      if (lastFocused) { lastFocused.focus(); lastFocused = null; }
    }

    toggle.addEventListener("click", () => {
      if (menu.classList.contains("open")) closeMenu(); else openMenu();
    });

    menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

    menu.addEventListener("keydown", function(e) {
      if (e.key !== "Tab") return;
      var links = Array.from(focusableLinks);
      if (links.length === 0) return;
      var first = links[0];
      var last = links[links.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });

    document.addEventListener("click", (e) => {
      if (!toggle.contains(e.target) && !menu.contains(e.target)) closeMenu();
    });

    const header = document.getElementById("main-header");
    if (header) {
      let ticking = false;
      function updateHeader() {
        if (window.scrollY > 50) header.classList.add("scrolled");
        else header.classList.remove("scrolled");
        ticking = false;
      }
      window.addEventListener("scroll", () => {
        if (!ticking) { requestAnimationFrame(updateHeader); ticking = true; }
      });
    }

    const themeBtn = document.getElementById("theme-toggle");
    if (themeBtn) {
      const html = document.documentElement;
      function updateIcon() {
        const isDark = html.getAttribute("data-theme") === "dark";
        themeBtn.innerHTML = isDark
          ? '<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
          : '<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
      }
      updateIcon();
      
      // Cleanup previous observer to prevent duplication / memory leaks
      if (window.__themeObserver) {
        window.__themeObserver.disconnect();
      }
      const observer = new MutationObserver(updateIcon);
      observer.observe(html, { attributes: true, attributeFilter: ["data-theme"] });
      window.__themeObserver = observer;
    }
  });
</script>
