# Central Celulares – Deployment Guide (GitHub Pages + Backend API)

This guide walks you step‑by‑step through:

1. Preparing the codebase for deployment
2. Deploying the **frontend** to GitHub Pages
3. Deploying the **backend API** to a Node host (Render as an example)
4. Connecting frontend ↔ backend
5. (Optional) Static‑only setup without backend

---

## 0. Prerequisites

- GitHub account
- Supabase project already created (as in the existing docs)
- Node.js installed (for local testing and backend deploy)

Directory structure (simplified):

```text
Central Celulares/
├── admin/
├── assets/
├── backend/
├── docs/
├── index.html
├── product.html
├── config.json
├── products.json
└── socials.json
```

---

## 1. Introduce a Shared API Base URL (Frontend)

Right now, many scripts call `http://localhost:3002` directly. We’ll centralize this so it works both locally and in production.

### 1.1. Create `assets/js/api-base.js`

Create a new file `assets/js/api-base.js` with:

```js
// Global API base URL helper
// - Local dev: points to localhost
// - Production (GitHub Pages): points to your deployed backend URL

window.API_BASE_URL = (function () {
  // Local development
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    return 'http://localhost:3002';
  }

  // TODO: REPLACE with your real backend URL after deployment
  // Example: return 'https://central-celulares-api.onrender.com';
  return 'https://your-backend-host.example.com';
})();
```

### 1.2. Include `api-base.js` in HTML pages

Add this **before** other JS files that use the API in your HTML files.

**Example: `index.html`**

Find the `<script>` tags near the bottom and make sure the order is:

```html
<script src="assets/js/api-base.js"></script>
<script src="assets/js/theme.js"></script>
<script src="assets/js/site-config.js"></script>
<script src="assets/js/navigation.js"></script>
<script src="assets/js/products.js"></script>
```

Do the same in other pages that use API‑calling scripts if needed.

---

## 2. Update Frontend JS Files to Use `API_BASE_URL`

### 2.1. `assets/js/site-config.js`

**Before:**

```js
const response = await fetch('http://localhost:3002/api/config/site');
```

**After:**

```js
const API_BASE_URL = window.API_BASE_URL || 'http://localhost:3002';
const response = await fetch(`${API_BASE_URL}/api/config/site`);
```

### 2.2. `assets/js/navigation.js`

**Before:**

```js
const response = await fetch('http://localhost:3002/api/config/navigation');
```

**After:**

```js
const API_BASE_URL = window.API_BASE_URL || 'http://localhost:3002';
const response = await fetch(`${API_BASE_URL}/api/config/navigation`);
```

### 2.3. `assets/js/products.js`

At the top (or near `loadConfig`), define:

```js
const API_BASE_URL = window.API_BASE_URL || 'http://localhost:3002';
```

Then update all hard‑coded URLs:

- In `loadConfig`:

```js
const response = await fetch(`${API_BASE_URL}/api/config`);
```

- In `loadProducts`:

```js
const response = await fetch(`${API_BASE_URL}/api/products`);
```

- In `searchProducts`:

```js
fetch(`${API_BASE_URL}/api/products`)
```

- In the Enter‑key handler:

```js
fetch(`${API_BASE_URL}/api/products`)
```

- In `loadSocials`:

```js
const response = await fetch(`${API_BASE_URL}/api/config/socials_data`);
```

### 2.4. `assets/js/product-detail.js`

Add near the top:

```js
const API_BASE_URL = window.API_BASE_URL || 'http://localhost:3002';
```

Change the products fetch:

```js
const response = await fetch(`${API_BASE_URL}/api/products`);
```

(Calls to `socials.json` can stay as they are; GitHub Pages will serve that file.)

---

## 3. Update Admin JS to Use `API_BASE_URL` and Work on GitHub Pages

### 3.1. `admin/js/dashboard.js`

**Before:**

```js
const API_URL = 'http://localhost:3002/api';
```

**After:**

```js
const API_BASE_URL = window.API_BASE_URL || 'http://localhost:3002';
const API_URL = `${API_BASE_URL}/api`;
```

### 3.2. `admin/js/products-manager.js`

Same change at the top:

```js
const API_BASE_URL = window.API_BASE_URL || 'http://localhost:3002';
const API_URL = `${API_BASE_URL}/api`;
```

### 3.3. `admin/js/settings.js`

**Before:**

```js
const API_URL = 'http://localhost:3002/api';
```

**After:**

```js
const API_BASE_URL = window.API_BASE_URL || 'http://localhost:3002';
const API_URL = `${API_BASE_URL}/api`;
```

### 3.4. Fix admin redirects to be repo‑aware (GitHub Pages)

GitHub Pages serves your project at:

```text
https://<username>.github.io/<repo-name>/
```

So absolute paths like `/admin/dashboard.html` will be wrong. Use relative redirects instead.

In `admin/js/auth.js`, replace every `window.location.href = '/admin/...';` with a repo‑safe version.

Define a helper at the top of the file (or just before the first redirect):

```js
function goToAdminPage(page) {
  const base = window.location.pathname.replace(/[^/]+$/, ''); // current directory
  window.location.href = base + page; // e.g. 'dashboard.html' or 'login.html'
}
```

Then change redirects:

- In `handleRedirectCallback`:

```js
// Before
window.location.href = '/admin/dashboard.html';

// After
goToAdminPage('dashboard.html');
```

- In `checkAuth` (redirect to login):

```js
// Before
window.location.href = '/admin/login.html';

// After
goToAdminPage('login.html');
```

- In `checkAuth` (user already logged in, on login page):

```js
// Before
window.location.href = '/admin/dashboard.html';

// After
goToAdminPage('dashboard.html');
```

- In `logout()`:

```js
// Before
window.location.href = '/admin/login.html';

// After
goToAdminPage('login.html');
```

- In `onAuthStateChange` handler:

```js
// Before
window.location.href = '/admin/dashboard.html';

// After
goToAdminPage('dashboard.html');
```

and

```js
// Before
window.location.href = '/admin/login.html';

// After
goToAdminPage('login.html');
```

> Tip: the existing `emailRedirectTo` logic (`replace('login.html', 'dashboard.html')`) already works under GitHub Pages.

### 3.5. Configure Supabase redirects for GitHub Pages

In Supabase dashboard:

1. Go to **Authentication → URL Configuration** (or similar).
2. Add redirect URLs:
   - `https://<username>.github.io/<repo-name>/admin/login.html`
   - `https://<username>.github.io/<repo-name>/admin/dashboard.html`
3. Save changes.

These must match the URLs your users see in the magic link.

---

## 4. Backend (Node/Express) Configuration for Production

### 4.1. CORS

In `backend/server.js`:

```js
app.use(cors({
  origin: [
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));
```

Set `FRONTEND_URL` in your backend environment to your GitHub Pages origin, e.g.:

```env
FRONTEND_URL=https://<username>.github.io/<repo-name>
```

> On some hosts you can set this in a GUI; on others you use a `.env` or environment variables.

If you prefer, you can also hard‑code an extra allowed origin:

```js
origin: [
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  process.env.FRONTEND_URL,
  'https://<username>.github.io',
  'https://<username>.github.io/<repo-name>'
].filter(Boolean)
```

### 4.2. Supabase environment variables

`backend/src/config/supabase.js` expects:

```js
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
```

Set the following **on your backend host**:

- `SUPABASE_URL` – from Supabase settings → API
- `SUPABASE_SERVICE_KEY` – the `service_role` key (keep this secret, backend only)
- `NODE_ENV=production`
- `FRONTEND_URL` – as described above

Do **not** commit these to GitHub.

### 4.3. Example: Deploy backend to Render

You can pick any Node host; here is a Render‑style flow:

1. Push your project to a GitHub repo.
2. In Render:
   - New → **Web Service**.
   - Connect your repo.
   - Set **Root Directory** to `backend`.
   - Build command: `npm install`
   - Start command: `npm start`
3. Under **Environment** / **Variables** add:
   - `SUPABASE_URL` = `https://xxxx.supabase.co`
   - `SUPABASE_SERVICE_KEY` = `...` (service key)
   - `FRONTEND_URL` = `https://<username>.github.io/<repo-name>`
   - `NODE_ENV` = `production`
4. Deploy. Render will give you a URL like:
   - `https://central-celulares-api.onrender.com`

5. Update `assets/js/api-base.js` in the frontend to use this URL in production:

```js
window.API_BASE_URL = (function () {
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    return 'http://localhost:3002';
  }

  // Now that backend is deployed, point here:
  return 'https://central-celulares-api.onrender.com';
})();
```

---

## 5. Deploy Frontend to GitHub Pages

### 5.1. Initialize Git and push to GitHub

In the project root (`Central Celulares/`):

```bash
git init
git add .
git commit -m "Initial commit: Central Celulares website"
# Create a repo on GitHub, then:
git remote add origin https://github.com/<username>/<repo-name>.git
git push -u origin main
```

(If your default branch is `master`, replace `main` accordingly.)

### 5.2. Enable GitHub Pages

1. Go to your repo on GitHub.
2. **Settings → Pages**.
3. Under **Source**, choose:
   - `Deploy from a branch`
   - Branch: `main`
   - Folder: `/ (root)`
4. Save.
5. After a few minutes, your site will be at:

```text
https://<username>.github.io/<repo-name>/index.html
```

### 5.3. Test frontend ↔ backend

1. Open the GitHub Pages URL in your browser.
2. Open DevTools → Console / Network.
3. Ensure calls to `/api/...` are going to your backend host (not `localhost`).
4. Verify products load; navigation and config behave as expected.

If CORS errors appear, double‑check:

- Backend `origin` array (or `FRONTEND_URL` value)
- Exact protocol + domain + path of your GitHub Pages URL

---

## 6. Optional: Static‑Only Setup (No Backend)

If you want to get the catalog live **without** deploying the backend/API yet, you can:

1. Change `assets/js/products.js` to load from `products.json` instead of the API.
2. Change `assets/js/site-config.js` to load from `config.json`.
3. Change `assets/js/navigation.js` to read `navigation` from `config.json` instead of the API.
4. Ensure social links are loaded from `socials.json` (already done in `product-detail.js`).

Example patterns:

- In `assets/js/products.js`:

```js
const response = await fetch('products.json');
```

- In `assets/js/site-config.js`:

```js
const response = await fetch('config.json');
```

This makes the site fully static and GitHub Pages can serve everything directly. Later, you can switch back to the API endpoints and follow the steps above to wire up the backend.

---

## 7. Checklist

- [ ] `api-base.js` created and included in HTML
- [ ] All `http://localhost:3002` references replaced with `API_BASE_URL`
- [ ] Admin redirects changed to use relative paths (`goToAdminPage`)
- [ ] Supabase redirect URLs set to GitHub Pages URLs
- [ ] Backend deployed (Render/Railway/etc.) with environment variables configured
- [ ] `API_BASE_URL` in production points to deployed backend
- [ ] GitHub Pages enabled and site loads without JS errors

Once all items are checked, your website + admin + APIs should be working end‑to‑end in production.