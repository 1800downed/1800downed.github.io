# Not Your Grandma's Cellar, LLC — Landing Page
**Author:** GitHub/1800downed  
Canning & Farm Fresh Produce · Lincoln County, WV · Est. 2026

---

## Deploy to GitHub Pages

```
1. Create a new GitHub repository
2. Upload all files from this folder to the repo root
3. Settings → Pages → Source: Deploy from branch → main / root
4. Save — live URL ready in ~60 seconds:
   https://<username>.github.io/<repo-name>/
```

`.nojekyll` is included — it prevents GitHub Pages from running Jekyll,
which is required for correct asset path resolution.

---

## Formspree Setup (email form, no backend)

```
1. Sign up free at https://formspree.io
2. New Form → copy your form ID (e.g. xpzgwkrb)
3. In index.html, update: action="https://formspree.io/f/YOUR_ID"
4. In main.js line ~12, update: const FORMSPREE_ID = 'YOUR_ID';
5. Push → submit the form once → confirm email address with Formspree
```

Free tier: 50 submissions/month. Upgrade when needed.

---

## File Structure

```
nygc-site/
├── index.html         Single-page landing
├── style.css          Design system (IBM Plex, CSS tokens, responsive grid)
├── main.js            Nav, scroll reveal, form validation + Formspree handler
├── .nojekyll          GitHub Pages — disables Jekyll processing
├── assets/
│   ├── banner.jpg     Hero background (wide cellar shelf)
│   ├── bg-label.jpg   Products section texture (label artwork, low opacity)
│   └── logo-badge.jpg Brand mark (navbar + footer, circular crop)
└── README.md
```

---

## Customisation

| What | Where |
|------|-------|
| Brand colours / fonts / spacing | `:root {}` block at top of `style.css` |
| Business name, address, hours | `index.html` — About, Contact, Footer sections |
| Vendor / product names | `index.html` — Products section cards |
| Map embed | Replace `.map-stub` div in Contact section with `<iframe>` |
| Email fallback in error banner | `index.html` — `#formError` paragraph |
| Formspree endpoint | `index.html` form `action` + `FORMSPREE_ID` in `main.js` |
