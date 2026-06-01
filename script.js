/**
 * script.js — Shaurya Deals Public Website
 * Handles navigation, product rendering, search, filters, AI assistant, etc.
 */

"use strict";

// ─── Constants ────────────────────────────────────────────────────────────────
const PRODUCTS_PER_PAGE = 12;

// ─── State ────────────────────────────────────────────────────────────────────
let allProducts       = [];
let filteredProducts  = [];
let currentPage       = 1;
let currentCategory   = "all";
let currentSort       = "newest";
let searchQuery       = "";
let firebaseReady     = false;

// ─── DOM Ready ────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  initNavbar();
  initScrollTop();
  initAIAssistant();
  initFirebaseAndLoad();
});

// ─── Firebase Init ────────────────────────────────────────────────────────────
function initFirebaseAndLoad() {
  const { ShauryaFirebase: SF } = window;
  if (!SF) {
    console.warn("firebase-config.js not loaded.");
    return;
  }
  const result = SF.initFirebase();
  if (!result) return;
  firebaseReady = true;

  // Route-based initialization
  const path = window.location.pathname;
  if (path.includes("products.html")) {
    initProductsPage();
  } else if (path.includes("product-details.html")) {
    initProductDetailPage();
  } else {
    // index.html
    initHomePage();
  }
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function initNavbar() {
  const navbar    = document.getElementById("navbar");
  const hamburger = document.getElementById("nav-hamburger");
  const mobileNav = document.getElementById("nav-mobile");

  // Scroll effect
  window.addEventListener("scroll", () => {
    if (navbar) {
      navbar.classList.toggle("scrolled", window.scrollY > 20);
    }
    updateScrollTopVisibility();
  }, { passive: true });

  // Hamburger
  if (hamburger && mobileNav) {
    hamburger.addEventListener("click", () => {
      const isOpen = hamburger.classList.toggle("open");
      mobileNav.classList.toggle("open", isOpen);
      hamburger.setAttribute("aria-expanded", isOpen);
    });
  }

  // Active link
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-link").forEach(link => {
    const href = link.getAttribute("href") || "";
    if (href === currentPath || (currentPath === "" && href === "index.html")) {
      link.classList.add("active");
    }
  });

  // Nav search
  const navSearchInput = document.getElementById("nav-search-input");
  if (navSearchInput) {
    navSearchInput.addEventListener("keydown", e => {
      if (e.key === "Enter" && navSearchInput.value.trim()) {
        window.location.href = `products.html?q=${encodeURIComponent(navSearchInput.value.trim())}`;
      }
    });
  }
}

// ─── Scroll-to-top button ─────────────────────────────────────────────────────
function initScrollTop() {
  const btn = document.getElementById("scroll-top");
  if (!btn) return;
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

function updateScrollTopVisibility() {
  const btn = document.getElementById("scroll-top");
  if (btn) btn.classList.toggle("visible", window.scrollY > 400);
}

// ─── Home Page ────────────────────────────────────────────────────────────────
async function initHomePage() {
  const SF = window.ShauryaFirebase;

  // Hero search
  const heroSearchInput = document.getElementById("hero-search-input");
  const heroSearchBtn   = document.getElementById("hero-search-btn");
  if (heroSearchInput) {
    const doSearch = () => {
      const q = heroSearchInput.value.trim();
      if (q) window.location.href = `products.html?q=${encodeURIComponent(q)}`;
    };
    heroSearchBtn?.addEventListener("click", doSearch);
    heroSearchInput.addEventListener("keydown", e => { if (e.key === "Enter") doSearch(); });
  }

  // Load featured products
  await loadFeaturedProducts();

  // Load trending products
  await loadTrendingProducts();

  // Load categories
  await loadHomeCategories();

  // Animate stats counter
  animateCounters();
}

async function loadFeaturedProducts() {
  const container = document.getElementById("featured-products-grid");
  if (!container) return;

  showGridSkeleton(container, 4);

  try {
    const products = await window.ShauryaFirebase.getFeaturedProducts(8);
    if (!products.length) {
      container.innerHTML = `<div class="empty-state"><div class="empty-icon">🛍️</div><p>No featured products yet.</p></div>`;
      return;
    }
    container.innerHTML = products.map(p => renderProductCard(p)).join("");
    container.querySelectorAll(".product-card").forEach(applyCardEntryAnimation);
  } catch (err) {
    console.error("loadFeaturedProducts:", err);
    container.innerHTML = `<div class="empty-state"><p>Could not load products.</p></div>`;
  }
}

async function loadTrendingProducts() {
  const container = document.getElementById("trending-products-grid");
  if (!container) return;

  showGridSkeleton(container, 4);

  try {
    const products = await window.ShauryaFirebase.getTrendingProducts(8);
    if (!products.length) {
      container.innerHTML = `<div class="empty-state"><div class="empty-icon">🔥</div><p>No trending products yet.</p></div>`;
      return;
    }
    container.innerHTML = products.map(p => renderProductCard(p)).join("");
    container.querySelectorAll(".product-card").forEach(applyCardEntryAnimation);
  } catch (err) {
    console.error("loadTrendingProducts:", err);
    container.innerHTML = `<div class="empty-state"><p>Could not load products.</p></div>`;
  }
}

async function loadHomeCategories() {
  const container = document.getElementById("home-categories");
  if (!container) return;

  try {
    const categories = await window.ShauryaFirebase.getCategories();
    if (!categories.length) return;

    const icons = getCategoryIcon;
    container.innerHTML = categories.map(cat => `
      <a href="products.html?category=${encodeURIComponent(cat)}" class="category-chip">
        ${icons(cat)} ${cat}
      </a>
    `).join("") + `<a href="products.html" class="category-chip">🔍 All Products</a>`;
  } catch (err) {
    console.error("loadHomeCategories:", err);
  }
}

// ─── Products Page ────────────────────────────────────────────────────────────
async function initProductsPage() {
  const SF = window.ShauryaFirebase;

  // Parse URL params
  const params = new URLSearchParams(window.location.search);
  searchQuery     = params.get("q") || "";
  currentCategory = params.get("category") || "all";

  // Set search input value
  const searchInput = document.getElementById("search-input");
  if (searchInput && searchQuery) searchInput.value = searchQuery;

  // Load all products
  try {
    showGridSkeleton(document.getElementById("products-grid"), PRODUCTS_PER_PAGE);
    allProducts = await SF.getAllProducts();
    filteredProducts = [...allProducts];

    // Apply initial filters from URL
    applyFiltersAndRender();

    // Build category chips
    buildCategoryChips();
  } catch (err) {
    console.error("initProductsPage:", err);
    const grid = document.getElementById("products-grid");
    if (grid) grid.innerHTML = `<div class="empty-state"><p>Failed to load products. Check your Firebase config.</p></div>`;
  }

  // Search input
  if (searchInput) {
    searchInput.addEventListener("input", debounce(() => {
      searchQuery = searchInput.value.trim();
      currentPage = 1;
      applyFiltersAndRender();
    }, 300));
  }

  // Sort select
  const sortSelect = document.getElementById("sort-select");
  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      currentSort = sortSelect.value;
      currentPage = 1;
      applyFiltersAndRender();
    });
  }

  // Load more button
  const loadMoreBtn = document.getElementById("load-more-btn");
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", () => {
      currentPage++;
      renderProductsGrid(false);
    });
  }
}

function buildCategoryChips() {
  const container = document.getElementById("category-chips");
  if (!container) return;

  const cats = [...new Set(allProducts.map(p => p.category).filter(Boolean))].sort();

  container.innerHTML = `
    <button class="category-chip ${currentCategory === "all" ? "active" : ""}" data-cat="all">
      All Products
    </button>
    ${cats.map(cat => `
      <button class="category-chip ${currentCategory === cat ? "active" : ""}" data-cat="${escapeHtml(cat)}">
        ${getCategoryIcon(cat)} ${escapeHtml(cat)}
      </button>
    `).join("")}
  `;

  container.querySelectorAll(".category-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      container.querySelectorAll(".category-chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      currentCategory = chip.dataset.cat;
      currentPage = 1;
      applyFiltersAndRender();
    });
  });
}

function applyFiltersAndRender() {
  let products = [...allProducts];

  // Category filter
  if (currentCategory !== "all") {
    products = products.filter(p => p.category === currentCategory);
  }

  // Search filter
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    products = products.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    );
  }

  // Sort
  switch (currentSort) {
    case "newest":
      products.sort((a, b) => toTimestamp(b.dateAdded) - toTimestamp(a.dateAdded));
      break;
    case "oldest":
      products.sort((a, b) => toTimestamp(a.dateAdded) - toTimestamp(b.dateAdded));
      break;
    case "name-asc":
      products.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      break;
    case "name-desc":
      products.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
      break;
    case "featured":
      products.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
      break;
  }

  filteredProducts = products;

  // Update result count
  const countEl = document.getElementById("results-count");
  if (countEl) countEl.textContent = `${products.length} product${products.length !== 1 ? "s" : ""}`;

  currentPage = 1;
  renderProductsGrid(true);
}

function renderProductsGrid(replace = true) {
  const grid        = document.getElementById("products-grid");
  const loadMoreBtn = document.getElementById("load-more-btn");
  if (!grid) return;

  const start    = 0;
  const end      = currentPage * PRODUCTS_PER_PAGE;
  const slice    = filteredProducts.slice(start, end);
  const hasMore  = end < filteredProducts.length;

  if (!filteredProducts.length) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-icon">🔍</div>
        <h3>No products found</h3>
        <p>Try adjusting your search or filters.</p>
      </div>`;
    if (loadMoreBtn) loadMoreBtn.style.display = "none";
    return;
  }

  if (replace) {
    grid.innerHTML = slice.map(p => renderProductCard(p)).join("");
  } else {
    const start2 = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const newSlice = filteredProducts.slice(start2, end);
    newSlice.forEach(p => {
      const div = document.createElement("div");
      div.innerHTML = renderProductCard(p);
      const card = div.firstElementChild;
      card.style.animation = "fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both";
      grid.appendChild(card);
    });
  }

  grid.querySelectorAll(".product-card").forEach((card, i) => {
    card.style.animationDelay = `${i * 0.04}s`;
  });

  if (loadMoreBtn) {
    loadMoreBtn.style.display = hasMore ? "inline-flex" : "none";
    loadMoreBtn.textContent = `Load More (${filteredProducts.length - end} remaining)`;
  }
}

// ─── Product Detail Page ──────────────────────────────────────────────────────
async function initProductDetailPage() {
  const SF = window.ShauryaFirebase;
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  if (!productId) {
    showDetailError("No product ID provided.");
    return;
  }

  try {
    const product = await SF.getProductById(productId);
    if (!product) {
      showDetailError("Product not found.");
      return;
    }

    renderProductDetail(product);

    // Load related products
    await loadRelatedProducts(product.category, productId);

    // Update meta tags dynamically
    updateMetaTags(product);
  } catch (err) {
    console.error("initProductDetailPage:", err);
    showDetailError("Failed to load product.");
  }
}

function renderProductDetail(product) {
  // Image
  const imgEl = document.getElementById("detail-image");
  if (imgEl) {
    imgEl.src    = product.imageUrl || "https://via.placeholder.com/600x600?text=No+Image";
    imgEl.alt    = product.name || "Product Image";
    imgEl.loading = "lazy";
  }

  // Fields
  setTextContent("detail-category",    product.category || "");
  setTextContent("detail-title",       product.name || "Unnamed Product");
  setTextContent("detail-description", product.description || "No description available.");
  setTextContent("detail-date",        formatDate(product.dateAdded));

  // Featured badge
  const badgeEl = document.getElementById("detail-badge");
  if (badgeEl) badgeEl.style.display = product.featured ? "inline-flex" : "none";

  // Affiliate buy button
  const buyBtn = document.getElementById("detail-buy-btn");
  if (buyBtn && product.affiliateLink) {
    buyBtn.addEventListener("click", async () => {
      await window.ShauryaFirebase.trackProductClick(product.id);
      window.open(product.affiliateLink, "_blank", "noopener,noreferrer");
    });
  }

  // View deal button (secondary)
  const dealBtn = document.getElementById("detail-deal-btn");
  if (dealBtn && product.affiliateLink) {
    dealBtn.href   = product.affiliateLink;
    dealBtn.target = "_blank";
    dealBtn.rel    = "noopener noreferrer nofollow";
    dealBtn.addEventListener("click", () => window.ShauryaFirebase.trackProductClick(product.id));
  }

  // Share button
  const shareBtn = document.getElementById("share-btn");
  if (shareBtn) {
    shareBtn.addEventListener("click", () => {
      if (navigator.share) {
        navigator.share({ title: product.name, url: window.location.href });
      } else {
        navigator.clipboard.writeText(window.location.href);
        showToast("Link copied to clipboard!", "success");
      }
    });
  }

  // Page title
  document.title = `${product.name} — Shaurya Deals`;
}

async function loadRelatedProducts(category, excludeId) {
  const container = document.getElementById("related-products-grid");
  if (!container) return;

  try {
    const products = await window.ShauryaFirebase.getProductsByCategory(category);
    const related = products.filter(p => p.id !== excludeId).slice(0, 4);

    if (!related.length) {
      container.parentElement.style.display = "none";
      return;
    }

    container.innerHTML = related.map(p => renderProductCard(p)).join("");
  } catch (err) {
    console.error("loadRelatedProducts:", err);
  }
}

function updateMetaTags(product) {
  document.title = `${product.name} — Shaurya Deals`;
  setMeta("description", product.description?.substring(0, 160) || "");
  setMeta("og:title", product.name);
  setMeta("og:description", product.description?.substring(0, 200) || "");
  setMeta("og:image", product.imageUrl || "");
  setMeta("og:url", window.location.href);
}

function showDetailError(msg) {
  const container = document.getElementById("product-detail-container");
  if (container) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">😕</div>
        <h3>${msg}</h3>
        <a href="products.html" class="btn btn-secondary" style="margin-top:1rem">Browse Products</a>
      </div>`;
  }
}

// ─── Product Card Renderer ────────────────────────────────────────────────────
function renderProductCard(product) {
  const image    = product.imageUrl || "https://via.placeholder.com/400x300?text=No+Image";
  const name     = escapeHtml(product.name || "Unnamed Product");
  const desc     = escapeHtml(product.description?.substring(0, 120) || "");
  const category = escapeHtml(product.category || "General");
  const link     = `product-details.html?id=${product.id}`;
  const affLink  = product.affiliateLink || "#";

  const featuredBadge = product.featured
    ? `<span class="badge badge-featured">⭐ Featured</span>`
    : "";

  return `
    <article class="product-card animate-fade-up" role="article" aria-label="${name}">
      <div class="product-card-image">
        <img
          src="${escapeHtml(image)}"
          alt="${name}"
          loading="lazy"
          onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'"
        />
        <div class="img-overlay"></div>
        <div class="product-card-badges">${featuredBadge}</div>
      </div>
      <div class="product-card-body">
        <span class="product-card-category">${category}</span>
        <h3 class="product-card-title">
          <a href="${link}" style="color:inherit;text-decoration:none">${name}</a>
        </h3>
        <p class="product-card-desc">${desc}</p>
        <div class="product-card-footer">
          <a href="${link}" class="btn btn-secondary btn-sm">View Details</a>
          <a
            href="${escapeHtml(affLink)}"
            target="_blank"
            rel="noopener noreferrer nofollow"
            class="btn btn-primary btn-sm"
            onclick="trackClick('${product.id}')"
          >Buy Now ↗</a>
        </div>
      </div>
    </article>
  `;
}

// Global click tracker (called from inline handler in card)
window.trackClick = async function(productId) {
  try {
    await window.ShauryaFirebase?.trackProductClick(productId);
  } catch (e) { /* silent */ }
};

// ─── AI Assistant ─────────────────────────────────────────────────────────────
function initAIAssistant() {
  const fab    = document.getElementById("ai-fab-btn");
  const panel  = document.getElementById("ai-chat-panel");
  const close  = document.getElementById("ai-chat-close");
  const input  = document.getElementById("ai-chat-input");
  const send   = document.getElementById("ai-chat-send");
  const msgs   = document.getElementById("ai-chat-messages");

  if (!fab || !panel) return;

  fab.addEventListener("click", () => {
    panel.classList.toggle("open");
    if (panel.classList.contains("open")) {
      input?.focus();
      addAIMessage("👋 Hey! I'm the Shaurya Deals AI assistant. I'm not fully live yet, but I'll be able to help you find the best deals, compare products, and answer your questions. Stay tuned! 🚀");
    }
  });

  close?.addEventListener("click", () => panel.classList.remove("open"));

  const handleSend = () => {
    const val = input?.value?.trim();
    if (!val) return;

    addUserMessage(val);
    input.value = "";

    // Simulate AI response (placeholder for future integration)
    setTimeout(() => {
      addAIMessage("🤖 Thanks for your message! The AI assistant is coming soon. In the meantime, browse our products — you might find exactly what you need!");
    }, 800);
  };

  send?.addEventListener("click", handleSend);
  input?.addEventListener("keydown", e => { if (e.key === "Enter") handleSend(); });
}

function addAIMessage(text) {
  const msgs = document.getElementById("ai-chat-messages");
  if (!msgs) return;
  msgs.innerHTML += `
    <div class="ai-msg">
      <div class="ai-msg-avatar">🤖</div>
      <div class="ai-msg-bubble">${escapeHtml(text)}</div>
    </div>`;
  msgs.scrollTop = msgs.scrollHeight;
}

function addUserMessage(text) {
  const msgs = document.getElementById("ai-chat-messages");
  if (!msgs) return;
  msgs.innerHTML += `
    <div class="ai-msg" style="flex-direction:row-reverse">
      <div class="ai-msg-avatar" style="background:var(--accent-purple)">👤</div>
      <div class="ai-msg-bubble" style="border-radius:var(--radius-md) 0 var(--radius-md) var(--radius-md);text-align:right">${escapeHtml(text)}</div>
    </div>`;
  msgs.scrollTop = msgs.scrollHeight;
}

// ─── Skeleton Loading ─────────────────────────────────────────────────────────
function showGridSkeleton(container, count = 8) {
  if (!container) return;
  container.innerHTML = Array(count).fill(`
    <div class="product-card" style="pointer-events:none">
      <div class="skeleton" style="aspect-ratio:4/3;border-radius:0"></div>
      <div class="product-card-body">
        <div class="skeleton" style="height:12px;width:60%;margin-bottom:8px"></div>
        <div class="skeleton" style="height:20px;width:90%;margin-bottom:12px"></div>
        <div class="skeleton" style="height:14px;width:100%;margin-bottom:6px"></div>
        <div class="skeleton" style="height:14px;width:75%;margin-bottom:16px"></div>
        <div style="display:flex;gap:8px">
          <div class="skeleton" style="height:36px;flex:1;border-radius:999px"></div>
          <div class="skeleton" style="height:36px;flex:1;border-radius:999px"></div>
        </div>
      </div>
    </div>
  `).join("");
}

// ─── Counter Animation ─────────────────────────────────────────────────────────
function animateCounters() {
  const counters = document.querySelectorAll("[data-counter]");
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el  = entry.target;
      const end = parseInt(el.dataset.counter, 10);
      let   cur = 0;
      const step = Math.ceil(end / 50);
      const timer = setInterval(() => {
        cur = Math.min(cur + step, end);
        el.textContent = cur.toLocaleString();
        if (cur >= end) clearInterval(timer);
      }, 30);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

// ─── Card Animation ───────────────────────────────────────────────────────────
function applyCardEntryAnimation(card, index) {
  card.style.animationDelay = `${index * 0.06}s`;
  card.style.animation = "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both";
}

// ─── Toast Notification ───────────────────────────────────────────────────────
function showToast(message, type = "info", duration = 3500) {
  const icons = { success: "✅", error: "❌", info: "ℹ️" };
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || "ℹ️"}</span><span class="toast-msg">${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "fadeIn 0.3s ease reverse both";
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Expose globally
window.showToast = showToast;

// ─── Contact Form ─────────────────────────────────────────────────────────────
function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    const origText = btn.textContent;
    btn.textContent = "Sending…";
    btn.disabled = true;

    // Simulate form submission (integrate with Formspree / EmailJS / Firebase Functions)
    await delay(1500);
    showToast("Message sent! We'll get back to you soon. 🎉", "success");
    form.reset();
    btn.textContent = origText;
    btn.disabled = false;
  });
}

// Auto-init contact form if present
document.addEventListener("DOMContentLoaded", initContactForm);

// ─── Utilities ────────────────────────────────────────────────────────────────

function escapeHtml(str) {
  if (typeof str !== "string") return str || "";
  const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return str.replace(/[&<>"']/g, m => map[m]);
}

function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

function toTimestamp(val) {
  if (!val) return 0;
  if (val.seconds) return val.seconds * 1000;
  if (val instanceof Date) return val.getTime();
  return new Date(val).getTime() || 0;
}

function formatDate(val) {
  if (!val) return "Unknown";
  const ms = toTimestamp(val);
  if (!ms) return "Unknown";
  return new Date(ms).toLocaleDateString("en-IN", {
    year: "numeric", month: "long", day: "numeric"
  });
}

function setTextContent(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function setMeta(name, content) {
  let el = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(name.startsWith("og:") ? "property" : "name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function getCategoryIcon(cat) {
  const icons = {
    "Electronics":  "💻",
    "Fashion":      "👗",
    "Home":         "🏠",
    "Books":        "📚",
    "Sports":       "⚽",
    "Beauty":       "💄",
    "Toys":         "🎮",
    "Kitchen":      "🍳",
    "Health":       "💊",
    "Automotive":   "🚗",
    "Garden":       "🌱",
    "Pet Supplies": "🐾",
    "Music":        "🎵",
    "Tools":        "🔧",
    "Travel":       "✈️",
  };
  return icons[cat] || "🛒";
}

// Expose for inline usage
window.getCategoryIcon = getCategoryIcon;
