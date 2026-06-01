/**
 * admin.js — Shaurya Deals Admin Dashboard
 * Handles authentication, product CRUD, statistics, and category management.
 */

"use strict";

// ─── State ─────────────────────────────────────────────────────────────────────
let currentUser    = null;
let allProducts    = [];
let editingProductId = null;
let activeSection  = "dashboard";

// ─── DOM Ready ─────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const SF = window.ShauryaFirebase;
  if (!SF) {
    console.error("firebase-config.js not loaded.");
    return;
  }

  if (window.ShauryaFirebase?.auth) {
    window.AdminSecurity.attachSecurity(window.ShauryaFirebase.auth);
  }
    
  const result = SF.initFirebase();
  if (!result) return;

  const { auth } = result;

  // Listen for auth state
  auth.onAuthStateChanged(user => {
    if (user && SF.isAdmin(user)) {
      currentUser = user;
      showAdminDashboard(user);
      loadDashboardData();
    } else if (user && !SF.isAdmin(user)) {
      // Signed in but not admin
      showAuthError("Access denied. Your account does not have admin privileges.");
      auth.signOut();
    } else {
      // Not signed in
      currentUser = null;
      showAuthScreen();
    }
  });
});

// ─── Auth Screen ───────────────────────────────────────────────────────────────
function showAuthScreen() {
  document.getElementById("auth-screen").style.display  = "flex";
  document.getElementById("admin-layout").style.display = "none";

  // Google sign-in
  const googleBtn = document.getElementById("google-signin-btn");
  if (googleBtn) {
    googleBtn.addEventListener("click", async () => {
      googleBtn.disabled = true;
      googleBtn.innerHTML = `<div class="spinner" style="width:20px;height:20px;border-width:2px"></div> Signing in…`;
      try {
        await window.ShauryaFirebase.signInWithGoogle();
      } catch (err) {
        console.error("Google sign-in error:", err);
        showAuthError(getAuthErrorMessage(err.code));
        googleBtn.disabled = false;
        googleBtn.innerHTML = `<span class="provider-icon">G</span> Continue with Google`;
      }
    });
  }

  // GitHub sign-in
  const githubBtn = document.getElementById("github-signin-btn");
  if (githubBtn) {
    githubBtn.addEventListener("click", async () => {
      githubBtn.disabled = true;
      githubBtn.innerHTML = `<div class="spinner" style="width:20px;height:20px;border-width:2px"></div> Signing in…`;
      try {
        await window.ShauryaFirebase.signInWithGitHub();
      } catch (err) {
        console.error("GitHub sign-in error:", err);
        showAuthError(getAuthErrorMessage(err.code));
        githubBtn.disabled = false;
        githubBtn.innerHTML = `<span class="provider-icon">⌥</span> Continue with GitHub`;
      }
    });
  }
}

function showAuthError(msg) {
  const el = document.getElementById("auth-error");
  if (el) {
    el.textContent = msg;
    el.style.display = "block";
    setTimeout(() => el.style.display = "none", 5000);
  }
}

function getAuthErrorMessage(code) {
  const messages = {
    "auth/popup-closed-by-user": "Sign-in popup was closed. Try again.",
    "auth/network-request-failed": "Network error. Check your connection.",
    "auth/too-many-requests": "Too many attempts. Try again later.",
    "auth/account-exists-with-different-credential": "Account exists with different login method.",
  };
  return messages[code] || "Sign-in failed. Please try again.";
}

// ─── Admin Dashboard ────────────────────────────────────────────────────────────
function showAdminDashboard(user) {
  document.getElementById("auth-screen").style.display  = "none";
  document.getElementById("admin-layout").style.display = "grid";

  // Set user info
  const nameEl   = document.getElementById("admin-user-name");
  const avatarEl = document.getElementById("admin-user-avatar");
  if (nameEl)   nameEl.textContent = user.displayName || user.email?.split("@")[0] || "Admin";
  if (avatarEl && user.photoURL) avatarEl.innerHTML = `<img src="${user.photoURL}" alt="avatar">`;
  else if (avatarEl) avatarEl.textContent = (user.displayName || user.email || "A")[0].toUpperCase();

  // Sign out button
  const signOutBtn = document.getElementById("sign-out-btn");
  if (signOutBtn) {
    signOutBtn.addEventListener("click", async () => {
      await window.ShauryaFirebase.signOutUser();
      showToastAdmin("Signed out successfully.", "info");
    });
  }

  // Navigation
  document.querySelectorAll(".admin-nav-link").forEach(link => {
    link.addEventListener("click", () => {
      const section = link.dataset.section;
      if (section) switchSection(section);
    });
  });

  // Add Product button
  const addBtn = document.getElementById("add-product-btn");
  addBtn?.addEventListener("click", () => openProductModal());

  const addBtn2 = document.getElementById("add-product-btn-2");
  addBtn2?.addEventListener("click", () => openProductModal());

  // Search
  const searchInput = document.getElementById("admin-search-input");
  searchInput?.addEventListener("input", debounce(() => filterProductsTable(searchInput.value), 250));

  // Modal handlers
  initModalHandlers();
}

// ─── Section Navigation ─────────────────────────────────────────────────────────
function switchSection(section) {
  activeSection = section;

  document.querySelectorAll(".admin-section").forEach(s => s.style.display = "none");
  const target = document.getElementById(`section-${section}`);
  if (target) {
    target.style.display = "block";
    target.style.animation = "fadeUp 0.35s cubic-bezier(0.16,1,0.3,1) both";
  }

  document.querySelectorAll(".admin-nav-link").forEach(l => {
    l.classList.toggle("active", l.dataset.section === section);
  });

  if (section === "products") loadProductsTable();
  if (section === "categories") loadCategoriesSection();
}

// ─── Load Dashboard Data ────────────────────────────────────────────────────────
async function loadDashboardData() {
  try {
    allProducts = await window.ShauryaFirebase.getAllProducts();

    // Stats
    const totalEl    = document.getElementById("stat-total");
    const featEl     = document.getElementById("stat-featured");
    const catsEl     = document.getElementById("stat-categories");
    const clicksEl   = document.getElementById("stat-clicks");

    if (totalEl)  totalEl.textContent  = allProducts.length;
    if (featEl)   featEl.textContent   = allProducts.filter(p => p.featured).length;
    if (catsEl)   catsEl.textContent   = new Set(allProducts.map(p => p.category).filter(Boolean)).size;
    if (clicksEl) clicksEl.textContent = allProducts.reduce((sum, p) => sum + (p.clicks || 0), 0);

    // Recent products table on dashboard
    renderRecentProducts(allProducts.slice(0, 5));

  } catch (err) {
    console.error("loadDashboardData:", err);
    showToastAdmin("Failed to load dashboard data.", "error");
  }
}

function renderRecentProducts(products) {
  const tbody = document.getElementById("recent-products-body");
  if (!tbody) return;

  if (!products.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-muted)">No products yet. Add your first product!</td></tr>`;
    return;
  }

  tbody.innerHTML = products.map(p => `
    <tr>
      <td>
        <div style="display:flex;align-items:center;gap:10px">
          <img src="${escapeHtml(p.imageUrl || '')}" alt="" width="40" height="40"
               style="border-radius:6px;object-fit:cover;background:var(--bg-elevated)"
               onerror="this.src='https://via.placeholder.com/40?text=?'">
          <span>${escapeHtml(p.name || 'Unnamed')}</span>
        </div>
      </td>
      <td><span class="badge ${p.featured ? 'badge-featured' : ''}">${p.category || '—'}</span></td>
      <td>${p.featured ? '<span class="badge badge-featured">⭐ Yes</span>' : '<span style="color:var(--text-muted)">No</span>'}</td>
      <td>${p.clicks || 0}</td>
      <td>
        <div class="admin-table-actions">
          <button class="btn btn-ghost btn-sm" onclick="openProductModal('${p.id}')">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="confirmDeleteProduct('${p.id}', '${escapeHtml(p.name || '')}')">Delete</button>
        </div>
      </td>
    </tr>
  `).join("");
}

// ─── Products Table ─────────────────────────────────────────────────────────────
async function loadProductsTable() {
  const tbody = document.getElementById("products-table-body");
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="6" style="text-align:center"><div class="spinner" style="margin:1rem auto"></div></td></tr>`;

  try {
    allProducts = await window.ShauryaFirebase.getAllProducts();
    renderProductsTable(allProducts);
  } catch (err) {
    console.error("loadProductsTable:", err);
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--accent-red)">Failed to load products.</td></tr>`;
  }
}

function renderProductsTable(products) {
  const tbody = document.getElementById("products-table-body");
  if (!tbody) return;

  if (!products.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text-muted)">No products found.</td></tr>`;
    return;
  }

  tbody.innerHTML = products.map(p => `
    <tr>
      <td>
        <div style="display:flex;align-items:center;gap:12px">
          <img src="${escapeHtml(p.imageUrl || '')}" alt="" width="44" height="44"
               style="border-radius:8px;object-fit:cover;background:var(--bg-elevated);flex-shrink:0"
               onerror="this.src='https://via.placeholder.com/44?text=?'">
          <div>
            <div style="font-weight:600;color:var(--text-primary)">${escapeHtml(p.name || 'Unnamed')}</div>
            <div style="font-size:0.75rem;color:var(--text-muted);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
              ${escapeHtml(p.description?.substring(0, 60) || '')}
            </div>
          </div>
        </div>
      </td>
      <td>${escapeHtml(p.category || '—')}</td>
      <td>${p.featured ? '<span class="badge badge-featured">⭐ Featured</span>' : '<span style="color:var(--text-muted)">—</span>'}</td>
      <td>${p.clicks || 0}</td>
      <td>${formatDateShort(p.dateAdded)}</td>
      <td>
        <div class="admin-table-actions">
          <button class="btn btn-ghost btn-sm" onclick="openProductModal('${p.id}')">✏️ Edit</button>
          <button class="btn btn-danger btn-sm" onclick="confirmDeleteProduct('${p.id}', '${escapeHtml(p.name || '')}')">🗑️ Delete</button>
        </div>
      </td>
    </tr>
  `).join("");
}

function filterProductsTable(query) {
  const q = query.toLowerCase();
  const filtered = allProducts.filter(p =>
    p.name?.toLowerCase().includes(q) ||
    p.category?.toLowerCase().includes(q) ||
    p.description?.toLowerCase().includes(q)
  );
  renderProductsTable(filtered);
}

// ─── Product Modal ──────────────────────────────────────────────────────────────
function initModalHandlers() {
  const modal     = document.getElementById("product-modal");
  const closeBtn  = document.getElementById("modal-close-btn");
  const cancelBtn = document.getElementById("modal-cancel-btn");
  const form      = document.getElementById("product-form");

  closeBtn?.addEventListener("click",  closeProductModal);
  cancelBtn?.addEventListener("click", closeProductModal);

  // Close on backdrop click
  modal?.addEventListener("click", e => {
    if (e.target === modal) closeProductModal();
  });

  // Form submit
  form?.addEventListener("submit", handleProductSubmit);

  // Image URL preview
  const imgInput   = document.getElementById("field-imageUrl");
  const imgPreview = document.getElementById("img-preview");
  imgInput?.addEventListener("input", () => {
    const url = imgInput.value.trim();
    if (imgPreview) {
      imgPreview.src     = url || "https://via.placeholder.com/200x150?text=Preview";
      imgPreview.style.display = url ? "block" : "block";
    }
  });
}

async function openProductModal(productId = null) {
  editingProductId = productId;

  const modal     = document.getElementById("product-modal");
  const modalTitle = document.getElementById("modal-title");
  const submitBtn  = document.getElementById("modal-submit-btn");
  const form       = document.getElementById("product-form");

  if (!modal || !form) return;

  // Reset form
  form.reset();
  document.getElementById("img-preview").src = "https://via.placeholder.com/200x150?text=Preview";

  if (productId) {
    // Edit mode
    modalTitle.textContent = "Edit Product";
    submitBtn.textContent  = "Save Changes";

    // Find product in local state first
    let product = allProducts.find(p => p.id === productId);
    if (!product) {
      try {
        product = await window.ShauryaFirebase.getProductById(productId);
      } catch (err) {
        showToastAdmin("Could not load product data.", "error");
        return;
      }
    }

    if (product) {
      document.getElementById("field-name").value        = product.name        || "";
      document.getElementById("field-imageUrl").value    = product.imageUrl    || "";
      document.getElementById("field-description").value = product.description || "";
      document.getElementById("field-affiliateLink").value = product.affiliateLink || "";
      document.getElementById("field-category").value    = product.category    || "";
      document.getElementById("field-featured").checked  = product.featured    || false;

      const preview = document.getElementById("img-preview");
      if (preview && product.imageUrl) preview.src = product.imageUrl;
    }
  } else {
    // Add mode
    modalTitle.textContent = "Add New Product";
    submitBtn.textContent  = "Add Product";
  }

  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
  document.getElementById("field-name").focus();
}

function closeProductModal() {
  const modal = document.getElementById("product-modal");
  if (modal) modal.style.display = "none";
  document.body.style.overflow = "";
  editingProductId = null;
}

async function handleProductSubmit(e) {
  e.preventDefault();

  const submitBtn = document.getElementById("modal-submit-btn");
  const origText  = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = editingProductId ? "Saving…" : "Adding…";

  const productData = {
    name:          document.getElementById("field-name").value.trim(),
    imageUrl:      document.getElementById("field-imageUrl").value.trim(),
    description:   document.getElementById("field-description").value.trim(),
    affiliateLink: document.getElementById("field-affiliateLink").value.trim(),
    category:      document.getElementById("field-category").value.trim(),
    featured:      document.getElementById("field-featured").checked,
  };

  // Validation
  if (!productData.name) {
    showToastAdmin("Product name is required.", "error");
    submitBtn.disabled = false;
    submitBtn.textContent = origText;
    return;
  }

  try {
    if (editingProductId) {
      await window.ShauryaFirebase.updateProduct(editingProductId, productData);
      showToastAdmin("Product updated successfully! ✅", "success");
    } else {
      await window.ShauryaFirebase.addProduct(productData);
      showToastAdmin("Product added successfully! 🎉", "success");
    }

    closeProductModal();

    // Reload data
    await loadDashboardData();
    if (activeSection === "products") await loadProductsTable();

  } catch (err) {
    console.error("handleProductSubmit:", err);
    showToastAdmin(err.message || "Failed to save product.", "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = origText;
  }
}

// ─── Delete Product ─────────────────────────────────────────────────────────────
function confirmDeleteProduct(productId, productName) {
  const confirmModal = document.getElementById("confirm-modal");
  const confirmMsg   = document.getElementById("confirm-message");
  const confirmBtn   = document.getElementById("confirm-ok-btn");
  const cancelBtn    = document.getElementById("confirm-cancel-btn");

  if (!confirmModal) {
    // Fallback to browser confirm
    if (confirm(`Delete "${productName}"? This cannot be undone.`)) {
      deleteProduct(productId);
    }
    return;
  }

  confirmMsg.textContent = `Are you sure you want to delete "${productName}"? This action cannot be undone.`;
  confirmModal.style.display = "flex";

  const handleConfirm = async () => {
    confirmModal.style.display = "none";
    confirmBtn.removeEventListener("click", handleConfirm);
    cancelBtn.removeEventListener("click", handleCancel);
    await deleteProduct(productId);
  };

  const handleCancel = () => {
    confirmModal.style.display = "none";
    confirmBtn.removeEventListener("click", handleConfirm);
    cancelBtn.removeEventListener("click", handleCancel);
  };

  confirmBtn.addEventListener("click", handleConfirm);
  cancelBtn.addEventListener("click", handleCancel);
  confirmModal.addEventListener("click", e => {
    if (e.target === confirmModal) handleCancel();
  });
}

async function deleteProduct(productId) {
  try {
    await window.ShauryaFirebase.deleteProduct(productId);
    showToastAdmin("Product deleted successfully.", "success");
    await loadDashboardData();
    if (activeSection === "products") await loadProductsTable();
  } catch (err) {
    console.error("deleteProduct:", err);
    showToastAdmin("Failed to delete product.", "error");
  }
}

// Expose globally (called from inline onclick in table)
window.openProductModal       = openProductModal;
window.confirmDeleteProduct   = confirmDeleteProduct;

// ─── Categories Section ─────────────────────────────────────────────────────────
async function loadCategoriesSection() {
  const container = document.getElementById("categories-list");
  if (!container) return;

  container.innerHTML = `<div class="spinner" style="margin:2rem auto"></div>`;

  try {
    const cats = await window.ShauryaFirebase.getCategories();
    const counts = {};
    allProducts.forEach(p => { if (p.category) counts[p.category] = (counts[p.category] || 0) + 1; });

    if (!cats.length) {
      container.innerHTML = `<p style="color:var(--text-muted)">No categories yet. Add products with category names to see them here.</p>`;
      return;
    }

    container.innerHTML = cats.map(cat => `
      <div class="card" style="padding:1rem 1.5rem;display:flex;align-items:center;gap:1rem;margin-bottom:0.75rem">
        <span style="font-size:1.5rem">${getCategoryIcon(cat)}</span>
        <div style="flex:1">
          <div style="font-weight:600;color:var(--text-primary)">${escapeHtml(cat)}</div>
          <div style="font-size:0.8rem;color:var(--text-muted)">${counts[cat] || 0} product${counts[cat] !== 1 ? "s" : ""}</div>
        </div>
        <a href="../products.html?category=${encodeURIComponent(cat)}" target="_blank" class="btn btn-ghost btn-sm">View →</a>
      </div>
    `).join("");
  } catch (err) {
    console.error("loadCategoriesSection:", err);
    container.innerHTML = `<p style="color:var(--accent-red)">Failed to load categories.</p>`;
  }
}

function getCategoryIcon(cat) {
  const icons = {
    "Electronics": "💻", "Fashion": "👗", "Home": "🏠", "Books": "📚",
    "Sports": "⚽", "Beauty": "💄", "Toys": "🎮", "Kitchen": "🍳",
    "Health": "💊", "Automotive": "🚗", "Garden": "🌱", "Pet Supplies": "🐾",
    "Music": "🎵", "Tools": "🔧", "Travel": "✈️",
  };
  return icons[cat] || "🛒";
}

// ─── Admin Toast ────────────────────────────────────────────────────────────────
function showToastAdmin(message, type = "info") {
  const icons = { success: "✅", error: "❌", info: "ℹ️" };
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type]}</span><span class="toast-msg">${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ─── Utilities ──────────────────────────────────────────────────────────────────
function escapeHtml(str) {
  if (typeof str !== "string") return str || "";
  const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return str.replace(/[&<>"']/g, m => map[m]);
}

function debounce(fn, ms) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
}

function toTimestamp(val) {
  if (!val) return 0;
  if (val.seconds) return val.seconds * 1000;
  return new Date(val).getTime() || 0;
}

function formatDateShort(val) {
  if (!val) return "—";
  const ms = toTimestamp(val);
  if (!ms) return "—";
  return new Date(ms).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
}
