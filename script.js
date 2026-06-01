// script.js

import { db } from './firebase-config.js';

import {
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const productsContainer = document.getElementById("productsContainer");
const featuredProducts = document.getElementById("featuredProducts");

async function loadProducts() {
  try {
    const q = query(
      collection(db, "products"),
      orderBy("dateAdded", "desc")
    );

    const snapshot = await getDocs(q);

    if (productsContainer) {
      productsContainer.innerHTML = "";
    }

    if (featuredProducts) {
      featuredProducts.innerHTML = "";
    }

    snapshot.forEach((doc) => {
      const product = doc.data();

      const card = `
        <div class="product-card">
          <img src="${product.imageUrl}" alt="${product.name}" loading="lazy">
          <h3>${product.name}</h3>
          <p>${product.description}</p>

          <a
            href="${product.affiliateLink}"
            target="_blank"
            class="btn"
          >
            Buy Now
          </a>
        </div>
      `;

      if (productsContainer) {
        productsContainer.innerHTML += card;
      }

      if (product.featured && featuredProducts) {
        featuredProducts.innerHTML += card;
      }
    });

  } catch (error) {
    console.error(error);
  }
}

loadProducts();

const searchInput = document.getElementById("searchInput");

if (searchInput) {
  searchInput.addEventListener("input", () => {

    const value = searchInput.value.toLowerCase();

    document.querySelectorAll(".product-card").forEach(card => {

      const text = card.textContent.toLowerCase();

      card.style.display =
        text.includes(value)
          ? "block"
          : "none";
    });

  });
}

document.querySelectorAll(".category-btn").forEach(button => {

  button.addEventListener("click", () => {

    const category =
      button.dataset.category.toLowerCase();

    document.querySelectorAll(".product-card")
      .forEach(card => {

        if (
          category === "all" ||
          card.innerText.toLowerCase().includes(category)
        ) {
          card.style.display = "block";
        } else {
          card.style.display = "none";
        }

      });

  });

});

console.log("Shaurya Deals Loaded");