/**
 * firebase-config.js
 * Shaurya Deals – Firebase initialization & shared helpers
 *
 * SETUP:
 *  1. Go to https://console.firebase.google.com
 *  2. Create a project (or open an existing one)
 *  3. Add a Web App and copy the firebaseConfig object below
 *  4. Replace every placeholder value with your real credentials
 *  5. Enable Authentication → Sign-in providers: Google, GitHub
 *  6. Enable Firestore Database (start in test mode, then apply Security Rules)
 */

// ─── Firebase SDK (CDN imports are in each HTML file) ────────────────────────
// This file assumes the Firebase modules are already loaded via <script type="module">
// or via the compat CDN scripts included in every HTML page.

// ─── YOUR FIREBASE CONFIGURATION ─────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            "AIzaSyBEUMLcvD471WdTCzHvpN655NQScvMgx14",
  authDomain:        "shaurya-deals.firebaseapp.com",
  projectId:         "shaurya-deals",
  storageBucket:     "shaurya-deals.firebasestorage.app",
  messagingSenderId: "409948866094",
  appId:             "1:409948866094:web:e427f4adf4148b1f93c1bf",
  measurementId:     "G-14ZS0CVS51"   // optional – Analytics
};

// ─── ADMIN EMAILS ─────────────────────────────────────────────────────────────
// List every email address that should have admin access.
// These users will be able to add / edit / delete products via admin.html.
const ADMIN_EMAILS = [
  "babushaurya888@gmail.com",
  "shauryakumar210022@gmail.com"
];

// ─── SITE METADATA ────────────────────────────────────────────────────────────
const SITE_CONFIG = {
  name:        "Shaurya Deals",
  tagline:     "Discover the Best Deals Online",
  url:         "https://shaurya888-ai.github.io/shaurya-deals/",          // update after deployment
  description: "Premium affiliate deals curated for you. Find the best products at the best prices.",
  twitterHandle: "@Shaurya_Babu",
  contactEmail:  "shauryakumar210022@gmail.com"
};

// ─── FIRESTORE COLLECTION NAMES ───────────────────────────────────────────────
const COLLECTIONS = {
  products:   "products",
  categories: "categories",
  settings:   "settings"
};

// ─── FIREBASE INITIALIZATION ──────────────────────────────────────────────────
let app, db, auth;

function initFirebase() {
  // Guard: avoid double-initialization in single-page flows
  if (typeof firebase === "undefined") {
    console.error("Firebase SDK not loaded. Check your script tags.");
    return null;
  }

  if (!firebase.apps.length) {
    app  = firebase.initializeApp(firebaseConfig);
  } else {
    app  = firebase.apps[0];
  }

  db   = firebase.firestore();
  auth = firebase.auth();

  return { app, db, auth };
}

// ─── AUTH HELPERS ─────────────────────────────────────────────────────────────

/**
 * Sign in with Google popup.
 * @returns {Promise<firebase.auth.UserCredential>}
 */
async function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return auth.signInWithPopup(provider);
}

/**
 * Sign in with GitHub popup.
 * @returns {Promise<firebase.auth.UserCredential>}
 */
async function signInWithGitHub() {
  const provider = new firebase.auth.GithubAuthProvider();
  return auth.signInWithPopup(provider);
}

/**
 * Sign out the current user.
 * @returns {Promise<void>}
 */
async function signOutUser() {
  return auth.signOut();
}

/**
 * Check whether the currently signed-in user is an admin.
 * @param {firebase.User} user
 * @returns {boolean}
 */
function isAdmin(user) {
  if (!user) return false;
  return ADMIN_EMAILS.includes(user.email);
}

// ─── FIRESTORE PRODUCT HELPERS ────────────────────────────────────────────────

/**
 * Fetch all products ordered by dateAdded descending.
 * @returns {Promise<Array>}
 */
async function getAllProducts() {
  const snap = await db
    .collection(COLLECTIONS.products)
    .orderBy("dateAdded", "desc")
    .get();
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Fetch featured products.
 * @param {number} limit
 * @returns {Promise<Array>}
 */
async function getFeaturedProducts(limit = 8) {
  const snap = await db
    .collection(COLLECTIONS.products)
    .where("featured", "==", true)
    .orderBy("dateAdded", "desc")
    .limit(limit)
    .get();
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Fetch trending products (most recently added, non-featured).
 * @param {number} limit
 * @returns {Promise<Array>}
 */
async function getTrendingProducts(limit = 8) {
  const snap = await db
    .collection(COLLECTIONS.products)
    .orderBy("dateAdded", "desc")
    .limit(limit)
    .get();
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Fetch products by category.
 * @param {string} category
 * @returns {Promise<Array>}
 */
async function getProductsByCategory(category) {
  const snap = await db
    .collection(COLLECTIONS.products)
    .where("category", "==", category)
    .orderBy("dateAdded", "desc")
    .get();
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Fetch a single product by ID.
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
async function getProductById(id) {
  const doc = await db.collection(COLLECTIONS.products).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

/**
 * Add a new product to Firestore.
 * @param {Object} productData
 * @returns {Promise<firebase.firestore.DocumentReference>}
 */
async function addProduct(productData) {
  return db.collection(COLLECTIONS.products).add({
    ...productData,
    dateAdded: firebase.firestore.FieldValue.serverTimestamp(),
    clicks:    0
  });
}

/**
 * Update an existing product.
 * @param {string} id
 * @param {Object} updates
 * @returns {Promise<void>}
 */
async function updateProduct(id, updates) {
  return db.collection(COLLECTIONS.products).doc(id).update({
    ...updates,
    dateModified: firebase.firestore.FieldValue.serverTimestamp()
  });
}

/**
 * Delete a product.
 * @param {string} id
 * @returns {Promise<void>}
 */
async function deleteProduct(id) {
  return db.collection(COLLECTIONS.products).doc(id).delete();
}

/**
 * Increment click count for a product (affiliate link click tracking).
 * @param {string} id
 * @returns {Promise<void>}
 */
async function trackProductClick(id) {
  return db.collection(COLLECTIONS.products).doc(id).update({
    clicks: firebase.firestore.FieldValue.increment(1)
  });
}

/**
 * Fetch all distinct categories from the products collection.
 * @returns {Promise<Array<string>>}
 */
async function getCategories() {
  const snap = await db.collection(COLLECTIONS.products).get();
  const cats = new Set();
  snap.docs.forEach(doc => {
    const c = doc.data().category;
    if (c) cats.add(c);
  });
  return Array.from(cats).sort();
}

/**
 * Search products by name (client-side filter after Firestore fetch).
 * For large catalogs, consider Algolia or Firebase Extensions: Search.
 * @param {string} query
 * @returns {Promise<Array>}
 */
async function searchProducts(query) {
  const all = await getAllProducts();
  const q   = query.toLowerCase();
  return all.filter(p =>
    p.name?.toLowerCase().includes(q) ||
    p.description?.toLowerCase().includes(q) ||
    p.category?.toLowerCase().includes(q)
  );
}

// ─── FIRESTORE SECURITY RULES (paste into Firebase Console) ──────────────────
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Products: public read, admin-only write
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null
                   && request.auth.token.email in [
                        "your-admin@gmail.com",
                        "another-admin@example.com"
                      ];
    }

    // Categories: public read, admin-only write
    match /categories/{catId} {
      allow read: if true;
      allow write: if request.auth != null
                   && request.auth.token.email in [
                        "your-admin@gmail.com",
                        "another-admin@example.com"
                      ];
    }

    // Settings: admin-only
    match /settings/{docId} {
      allow read, write: if request.auth != null
                         && request.auth.token.email in [
                              "your-admin@gmail.com",
                              "another-admin@example.com"
                            ];
    }
  }
}
*/

// Export for use in other scripts (non-module compat pattern)
window.ShauryaFirebase = {
  initFirebase,
  signInWithGoogle,
  signInWithGitHub,
  signOutUser,
  isAdmin,
  getAllProducts,
  getFeaturedProducts,
  getTrendingProducts,
  getProductsByCategory,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  trackProductClick,
  getCategories,
  searchProducts,
  SITE_CONFIG,
  COLLECTIONS,
  ADMIN_EMAILS
};
