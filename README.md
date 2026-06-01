# Shaurya Deals

Professional Affiliate Marketing Website built using:

- HTML5
- CSS3
- JavaScript
- Firebase Authentication
- Firebase Firestore
- GitHub Pages

---

# Features

## Public Website

- Homepage
- Product Listing
- Product Details Page
- Search Functionality
- Category Filtering
- Responsive Design
- SEO Friendly

## Admin Dashboard

- Google Login
- GitHub Login
- Add Products
- Delete Products
- Manage Affiliate Links
- Firebase Firestore Integration

## SEO

- Meta Tags
- Sitemap
- Robots.txt
- Open Graph Ready

---

# Folder Structure

```
project-root/

│
├── index.html
├── products.html
├── product-details.html
├── about.html
├── contact.html
├── privacy-policy.html
├── disclaimer.html
│
├── style.css
├── script.js
├── admin.js
├── firebase-config.js
│
├── admin.html
│
├── robots.txt
├── sitemap.xml
│
└── README.md
```

---

# Firebase Setup

## Step 1

Create Firebase Project:

https://console.firebase.google.com

---

## Step 2

Enable:

- Authentication
- Firestore Database

---

## Step 3

Authentication Providers:

Enable:

- Google
- GitHub

---

## Step 4

Copy Firebase Config

Project Settings → General → Web App

Paste credentials into:

firebase-config.js

Example:

```javascript
const firebaseConfig = {
 apiKey: "",
 authDomain: "",
 projectId: "",
 storageBucket: "",
 messagingSenderId: "",
 appId: ""
};
```

---

# Firestore Structure

Collection:

```
products
```

Document Example:

```json
{
  "name": "Laptop",
  "imageUrl": "https://...",
  "description": "Product Description",
  "affiliateLink": "https://...",
  "category": "laptops",
  "featured": true
}
```

---

# Security Rules

Recommended Firestore Rules:

```javascript
rules_version = '2';

service cloud.firestore {

 match /databases/{database}/documents {

  match /products/{document} {

   allow read: if true;

   allow write: if request.auth != null;

  }

 }

}
```

For production, restrict write access to admin users only.

---

# GitHub Pages Deployment

## Create Repository

Example:

```
shaurya-deals
```

---

## Upload Files

Upload all project files.

---

## Enable GitHub Pages

Repository →

Settings →

Pages →

Deploy from branch →

Main Branch

---

Website URL Example:

```
https://username.github.io/shaurya-deals
```

---

# Product Management

Login:

- Google
or
- GitHub

Go to:

```
admin.html
```

Add Product:

- Name
- Image URL
- Description
- Affiliate Link
- Category

Products automatically appear on website.

---

# SEO Setup

Replace:

```
https://your-domain.com
```

with:

Your actual domain.

Update:

- sitemap.xml
- robots.txt

---

# Custom Domain

Buy domain from:

- Namecheap
- Cloudflare
- GoDaddy

Connect domain inside:

GitHub Repository →

Settings →

Pages →

Custom Domain

---

# Future Improvements

- Product Editing
- Product Analytics
- Admin Roles
- AI Chat Assistant
- Email Newsletter
- Blog System
- AdSense Integration

---

# License

Personal Use License

Created for:

Shaurya Deals