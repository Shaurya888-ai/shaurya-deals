import {
  auth,
  db,
  googleProvider,
  githubProvider
} from "./firebase-config.js";

import {
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const googleLoginBtn =
  document.getElementById("googleLoginBtn");

const githubLoginBtn =
  document.getElementById("githubLoginBtn");

const logoutBtn =
  document.getElementById("logoutBtn");

const productForm =
  document.getElementById("productForm");

const adminProducts =
  document.getElementById("adminProducts");

let currentUser = null;

/* -------------------- LOGIN -------------------- */

if (googleLoginBtn) {
  googleLoginBtn.addEventListener("click", async () => {
    try {
      await signInWithPopup(
        auth,
        googleProvider
      );
    } catch (error) {
      console.error(error);
    }
  });
}

if (githubLoginBtn) {
  githubLoginBtn.addEventListener("click", async () => {
    try {
      await signInWithPopup(
        auth,
        githubProvider
      );
    } catch (error) {
      console.error(error);
    }
  });
}

/* -------------------- LOGOUT -------------------- */

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
  });
}

/* -------------------- AUTH CHECK -------------------- */

onAuthStateChanged(auth, (user) => {

  currentUser = user;

  if (user) {
    console.log("Logged In:", user.email);
    loadProducts();
  } else {
    console.log("Not Logged In");
  }

});

/* -------------------- ADD PRODUCT -------------------- */

if (productForm) {

  productForm.addEventListener(
    "submit",
    async (e) => {

      e.preventDefault();

      if (!currentUser) {
        alert("Login First");
        return;
      }

      const product = {
        name:
          document.getElementById("productName").value,

        imageUrl:
          document.getElementById("productImage").value,

        description:
          document.getElementById("productDescription").value,

        affiliateLink:
          document.getElementById("affiliateLink").value,

        category:
          document.getElementById("productCategory").value,

        featured:
          document.getElementById("featuredProduct").checked,

        dateAdded:
          serverTimestamp()
      };

      try {

        await addDoc(
          collection(db, "products"),
          product
        );

        alert("Product Added");

        productForm.reset();

        loadProducts();

      } catch (error) {
        console.error(error);
      }

    }
  );

}

/* -------------------- LOAD PRODUCTS -------------------- */

async function loadProducts() {

  if (!adminProducts) return;

  adminProducts.innerHTML = "";

  const snapshot =
    await getDocs(
      collection(db, "products")
    );

  snapshot.forEach((item) => {

    const product = item.data();

    const div =
      document.createElement("div");

    div.className = "product-card";

    div.innerHTML = `
      <img
        src="${product.imageUrl}"
        alt="${product.name}"
      >

      <h3>${product.name}</h3>

      <p>${product.description}</p>

      <button
        class="delete-btn"
        data-id="${item.id}"
      >
        Delete
      </button>
    `;

    adminProducts.appendChild(div);

  });

  attachDeleteEvents();

}

/* -------------------- DELETE PRODUCT -------------------- */

function attachDeleteEvents() {

  document
    .querySelectorAll(".delete-btn")
    .forEach(btn => {

      btn.addEventListener(
        "click",
        async () => {

          const id =
            btn.dataset.id;

          const confirmDelete =
            confirm(
              "Delete this product?"
            );

          if (!confirmDelete)
            return;

          try {

            await deleteDoc(
              doc(
                db,
                "products",
                id
              )
            );

            loadProducts();

          } catch (error) {
            console.error(error);
          }

        }
      );

    });

}