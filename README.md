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

- 📧 Email: shauryakumar210022@gmail.com
- 🌐 Website: https://shauryababuu.github.io/Shaurya-Deals/
- 🐛 Issues: Open a GitHub issue

---

**Built with ❤️ using HTML5, CSS3, Vanilla JavaScript, and Firebase.**
