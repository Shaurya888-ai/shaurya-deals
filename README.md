# ⚡ Shaurya Deals

**A production-ready affiliate marketing website powered by Firebase Firestore.**

> Browse → Click → Buy. Products managed dynamically from the cloud — no code editing needed.

---

## 📁 Project Structure

```
shaurya-deals/
├── index.html            # Homepage (hero, featured, trending, categories)
├── products.html         # Product listing with search, filter, sort
├── product-details.html  # Individual product detail page
├── about.html            # About us page
├── contact.html          # Contact form page
├── privacy-policy.html   # Privacy policy (legal)
├── disclaimer.html       # Affiliate disclosure + Terms of Use
├── admin.html            # Admin dashboard (Firebase Auth protected)
├── style.css             # All styles — dark cyber-tech theme
├── script.js             # Public website JavaScript
├── admin.js              # Admin dashboard JavaScript
├── firebase-config.js    # Firebase setup + all Firestore CRUD helpers
├── robots.txt            # SEO — search engine crawler rules
├── sitemap.xml           # SEO — sitemap for Google indexing
└── README.md             # This file
```

---

## 🚀 Quick Start

### 1. Clone / Download the project

```bash
git clone https://github.com/yourusername/shaurya-deals.git
cd shaurya-deals
```

Or simply unzip the downloaded archive and open the folder.

---

## 🔥 Firebase Setup (Required)

### Step 1 — Create a Firebase Project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"** → Give it a name (e.g. `shaurya-deals`)
3. Disable Google Analytics if not needed → Click **"Create project"**

### Step 2 — Register a Web App

1. In your Firebase project, click the **Web** icon (`</>`)
2. Give the app a nickname (e.g. `shaurya-deals-web`)
3. Check **"Also set up Firebase Hosting"** (optional)
4. Click **"Register app"**
5. Copy the `firebaseConfig` object shown

### Step 3 — Update `firebase-config.js`

Open `firebase-config.js` and replace the placeholder values:

```js
const firebaseConfig = {
  apiKey:            "YOUR_REAL_API_KEY",
  authDomain:        "your-project-id.firebaseapp.com",
  projectId:         "your-project-id",
  storageBucket:     "your-project-id.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId:             "YOUR_APP_ID",
  measurementId:     "YOUR_MEASUREMENT_ID"
};
```

Also set your admin emails:

```js
const ADMIN_EMAILS = [
  "your-real-email@gmail.com"
];
```

### Step 4 — Enable Authentication

1. In Firebase Console → **Authentication** → **Get started**
2. Click **Sign-in method** tab
3. Enable **Google** → Save
4. Enable **GitHub**:
   - Go to [github.com/settings/developers](https://github.com/settings/developers)
   - Create a new **OAuth App**
   - Homepage URL: `https://your-project-id.firebaseapp.com`
   - Callback URL: `https://your-project-id.firebaseapp.com/__/auth/handler`
   - Copy **Client ID** and **Client Secret** → paste into Firebase GitHub provider settings

### Step 5 — Enable Firestore Database

1. Firebase Console → **Firestore Database** → **Create database**
2. Choose **"Start in test mode"** → Select a region → **Enable**
3. Go to **Rules** tab → Paste these security rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null
                   && request.auth.token.email in [
                        "your-admin@gmail.com"
                      ];
    }

    match /categories/{catId} {
      allow read: if true;
      allow write: if request.auth != null
                   && request.auth.token.email in [
                        "your-admin@gmail.com"
                      ];
    }

    match /settings/{docId} {
      allow read, write: if request.auth != null
                         && request.auth.token.email in [
                              "your-admin@gmail.com"
                            ];
    }
  }
}
```

4. Click **Publish**

---

## 🛢️ Firestore Collection Structure

### `products` collection

Each document has the following fields:

| Field           | Type      | Description                              |
|-----------------|-----------|------------------------------------------|
| `name`          | string    | Product name                             |
| `imageUrl`      | string    | Direct URL to product image              |
| `description`   | string    | Product description                      |
| `affiliateLink` | string    | Your affiliate tracking URL              |
| `category`      | string    | e.g. "Electronics", "Fashion"            |
| `featured`      | boolean   | Show on homepage featured section        |
| `clicks`        | number    | Auto-incremented on affiliate link click |
| `dateAdded`     | timestamp | Auto-set by server on creation           |
| `dateModified`  | timestamp | Auto-set by server on update             |

---

## ➕ How to Add Products

### Via Admin Dashboard (Recommended)

1. Open `admin.html` in your browser
2. Sign in with your admin Google or GitHub account
3. Click **"Add Product"**
4. Fill in the form fields:
   - **Product Name** — required
   - **Image URL** — direct link to product image (use Amazon product images or Imgur)
   - **Description** — what makes this product great
   - **Affiliate Link** — your Amazon Associates link (amzn.to/xxxxx)
   - **Category** — choose from suggestions or type a new one
   - **Featured** — toggle on to show on homepage
5. Click **"Add Product"** → instantly appears on the public website ✅

### Via Firestore Console (Manual)

1. Go to Firebase Console → Firestore → `products` collection
2. Click **"+ Add document"** → Auto ID
3. Add fields manually as described in the schema above

---

## 🌐 Deployment

### Option A — GitHub Pages

1. Push all files to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/shaurya-deals.git
   git push -u origin main
   ```
2. Go to repo **Settings** → **Pages**
3. Source: **Deploy from a branch** → Branch: `main` → Folder: `/ (root)`
4. Click **Save** → Your site will be live at `https://yourusername.github.io/shaurya-deals/`

**Important:** Update `robots.txt`, `sitemap.xml`, and `firebase-config.js` with your actual GitHub Pages URL.

Also add your GitHub Pages domain to Firebase:
- Firebase Console → Authentication → **Authorized domains** → Add your domain

### Option B — Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Select your project
# Public directory: . (current folder)
# Single page app: No
# Overwrite index.html: No
firebase deploy
```

Your site will be at `https://your-project-id.web.app`

### Option C — Any Static Host

Upload all files to Netlify, Vercel, Cloudflare Pages, or any web host that serves static files.

---

## 🔐 Admin Login Setup

1. Open `firebase-config.js`
2. Add your email to the `ADMIN_EMAILS` array:
   ```js
   const ADMIN_EMAILS = [
     "youremail@gmail.com",
     "teamember@gmail.com"
   ];
   ```
3. Make sure the same email is in your Firestore Security Rules
4. Visit `admin.html` and sign in with that Google/GitHub account

> ⚠️ If someone tries to log in with a non-admin email, they will be denied and automatically signed out.

---

## 🎨 Customisation

### Change Site Name / Branding

1. Open `firebase-config.js` → update `SITE_CONFIG`:
   ```js
   const SITE_CONFIG = {
     name:        "Your Brand Name",
     tagline:     "Your tagline here",
     url:         "https://your-domain.com",
     ...
   };
   ```
2. Replace "Shaurya Deals" text in all HTML files

### Change Theme Colors

Open `style.css` and update the CSS custom properties at the top:

```css
:root {
  --accent-cyan:   #00d4ff;  /* Primary accent */
  --accent-blue:   #0066ff;  /* Secondary accent */
  --bg-primary:    #080c14;  /* Main background */
  ...
}
```

### Add/Change Fonts

Replace the Google Fonts import at the top of `style.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=YourFont&display=swap');
```
Then update `--font-display` and `--font-body` variables.

---

## 🤖 AI Assistant

The AI assistant button (floating robot icon) is a **visual placeholder** ready for future AI integration.

To connect a real AI:
1. Get an API key from OpenAI, Anthropic, or Gemini
2. In `script.js`, find the `handleSend` function inside `initAIAssistant()`
3. Replace the simulated response with a real API call:

```js
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer YOUR_API_KEY`
  },
  body: JSON.stringify({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: val }]
  })
});
const data = await response.json();
addAIMessage(data.choices[0].message.content);
```

> ⚠️ Never expose API keys in client-side code in production. Use a backend proxy or Firebase Functions.

---

## 📈 SEO Optimisation

- Update `sitemap.xml` with your real domain before deploying
- Update `robots.txt` Sitemap URL
- Replace all `https://your-domain.com` references in HTML files
- Add a real `og-image.jpg` (1200×630px) to your project root
- Submit your sitemap to [Google Search Console](https://search.google.com/search-console)

---

## ⚡ Performance Tips

- Use compressed images (WebP format recommended)
- For large catalogs (500+ products), consider **Algolia** for search instead of client-side filtering
- Enable Firebase CDN caching in Firebase Hosting `firebase.json`:
  ```json
  {
    "hosting": {
      "headers": [{
        "source": "**/*.@(js|css)",
        "headers": [{ "key": "Cache-Control", "value": "max-age=31536000" }]
      }]
    }
  }
  ```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Products not loading | Check Firebase config credentials in `firebase-config.js` |
| Admin login denied | Ensure your email is in `ADMIN_EMAILS` array AND Firestore rules |
| GitHub sign-in fails | Verify GitHub OAuth callback URL matches Firebase auth domain |
| CORS errors | Deploy to a server (GitHub Pages/Firebase Hosting), not `file://` |
| Firestore permission denied | Check security rules are published and email is whitelisted |

---

## 📄 License

This project is open-source. You are free to use, modify, and deploy it for personal or commercial use. Attribution appreciated but not required.

---

## 💬 Support

- 📧 Email: contact@shauryadeals.com
- 🌐 Website: https://your-domain.com
- 🐛 Issues: Open a GitHub issue

---

**Built with ❤️ using HTML5, CSS3, Vanilla JavaScript, and Firebase.**
