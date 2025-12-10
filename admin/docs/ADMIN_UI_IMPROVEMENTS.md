# Admin UI/UX Improvements

This document describes the plan and concrete steps to improve the visual quality, consistency, and usability of the Central Celulares admin interface.

## Goals

- Make the admin UI visually consistent across login, dashboard, products, and settings.
- Reduce inline styles and hard-coded values by centralizing them in shared CSS and JS utilities.
- Improve accessibility (focus styles, live regions, and clearer messages).
- Align authentication messaging and behavior with the actual 8-digit code flow.
- Provide a clear checklist for testing and rollback.

## Current Issues (Summary)

1. **Theme and styling inconsistencies**
   - Mixed use of CSS variables and hard-coded colors (e.g., `#00BCD4`, `#00A8B8`).
   - Some CSS variables defined but not used (`--secondary-color`, `--header-actions-bg`).
   - Global `body` styles in `admin/css/admin.css` center the page and use a gradient intended only for the login page.

2. **Missing / duplicated UI styles**
   - Components such as `old-price`, `product-image-wrapper`, `product-image`, and pricing blocks are styled inline in `products.html` instead of being shared via `admin.css`.
   - Settings UI pieces (`toggle-switch`, `toggle-slider`, `social-item`, `nav-item-editor`, `btn-add`, `btn-remove`) are defined inside `settings.html` and not reusable.

3. **Accessibility gaps**
   - Buttons and links mostly have hover effects but lack clear `:focus-visible` outlines for keyboard users.
   - The login status message (`#message`) does not declare `aria-live`, so screen readers may not announce auth status changes.

4. **Auth flow inconsistencies**
   - Login UI and copy mention an 8-digit code in some places, but existing messages refer to "código de 6 dígitos".
   - `verifyOtp` in `js/auth.js` uses `type: 'magiclink'` while the UI collects a numeric code, which is confusing.

5. **Formatting and messaging**
   - Some places format numbers with `toLocaleString()` without a locale; others already use `'es-PY'`. This should be consistent.
   - Some error messages reference an outdated backend port (3001) instead of the configured API.

6. **User feedback UX**
   - Many actions rely on `alert()` and `confirm()`. Confirms are fine for destructive actions, but `alert()` is blocking and visually inconsistent.

## Implementation Plan (Step-by-Step)

### 1. Standardize theme variables and base CSS (`css/admin.css`)

- Ensure `:root` contains a coherent set of theme variables:
  - `--primary-color`, `--primary-hover`
  - `--secondary-color`
  - `--header-bg`, `--header-actions-bg`
  - `--text-dark`
- Normalize `body` defaults:
  - Neutral background (`#F5F5F5`).
  - Standard system font stack.
  - No layout centering by default.
- Update button-related classes to rely on variables:
  - `.btn-primary`, `.btn-secondary`, `.btn-small`, `.btn-edit`.
- Add a shared `:focus-visible` outline for buttons, links, and form controls.

### 2. Scope login layout to the login page only

- Introduce a `.login-page` body class in `admin.css` which:
  - Applies the gradient background.
  - Centers content with flexbox.
- Update `admin/login.html` so `<body>` uses `class="login-page"`.
- Ensure dashboard, products, settings, and migration pages use the neutral `body` styling.

### 3. Add missing/global UI classes for products and settings (`css/admin.css`)

- Add shared styles for product cards and pricing:
  - `.old-price`, `.product-card`, `.product-image-wrapper`, `.product-image`, `.product-image-placeholder`, `.product-info`, `.product-title`, `.product-pricing`.
- Add shared styles for settings UI elements:
  - `.toggle-switch`, `.toggle-slider`
  - `.social-item`, `.nav-item-editor`, `.dropdown-items`, `.dropdown-item`
  - `.btn-add`, `.btn-remove`
- Keep inline styles in `products.html` and `settings.html` for now to avoid regressions, but ensure new classes match their current appearance.

### 4. Create a reusable toast notification helper (`js/ui.js` + CSS)

- Add toast styles to `admin.css`:
  - `#toast` container fixed in bottom-right.
  - `.toast`, `.toast.success`, `.toast.error`, `.toast.info`.
- Create `admin/js/ui.js` with a global `window.showToast(message, type)` helper which:
  - Ensures a `#toast` container with `aria-live="polite"` and `aria-atomic="true"` exists.
  - Creates a toast element with message and type, animates it in and out, then removes it.
- Include `js/ui.js` in:
  - `dashboard.html`
  - `products.html`
  - `settings.html`
  - (Optional) other admin pages that benefit from non-blocking notifications.

### 5. Accessibility tweaks for login

- In `login.html`:
  - Add `aria-live="polite"` on the `#message` element that displays login status.
  - The code input already constrains to 8 digits; confirm attributes:
    - `inputmode="numeric"`
    - `pattern="[0-9]{8}`
    - `maxlength="8"`
    - `autocomplete="one-time-code"`

### 6. Align auth copy and logic to the 8-digit code flow (`js/auth.js`)

- Update messages in `showMessage` consumers and elsewhere to consistently say:
  - "código de 8 dígitos".
- In the verify button logic:
  - Enforce an 8-digit numeric regex before calling Supabase.
  - Change `verifyOtp` payload to use `type: 'email'` for code-based auth.
- Optionally call `showToast` (if available) for non-blocking feedback in addition to updating `#message`.

### 7. Locale formatting consistency (`js/dashboard.js`, `js/products-manager.js`)

- Introduce a tiny helper where needed, e.g.:

  ```js
  const formatPY = (n) => Number(n || 0).toLocaleString('es-PY');
  ```

- Use this helper for product prices and any other numeric displays in:
  - `js/dashboard.js`
  - `js/products-manager.js`
- Replace any `toLocaleString()` without a locale in admin JS with `toLocaleString('es-PY')`.

### 8. Standardize messaging and remove stale references

- In `js/products-manager.js` and any other admin JS files:
  - Replace references to an outdated port (e.g. 3001) with a neutral message that uses `API_URL`.
  - Where appropriate, replace `alert()` used for non-destructive feedback with `showToast` calls.
  - Keep `confirm()` for destructive actions such as delete.

### 9. Minimal integration updates in `js/settings.js`

- Optionally wire successful save operations to `showToast`:
  - Example: `showToast('Configuración guardada correctamente.', 'success');`
- Keep error alerts for now, or gradually replace with toasts.
- Ensure any future numeric formatting uses the same `formatPY` helper or `toLocaleString('es-PY')`.

### 10. HTML cleanup (small, safe changes)

- In `dashboard.html` and `settings.html`:
  - Use neutral `body` background (already handled via `admin.css`).
  - Where not too intrusive, move obvious shared inline styles into CSS classes.
- For this pass, keep extensive inline `style` blocks (especially in `products.html`) to reduce regression risk; the new global classes will enable a future cleanup.

## Files Touched

Planned edits/additions:

- `admin/css/admin.css`
- `admin/js/ui.js` (new)
- `admin/js/auth.js`
- `admin/js/dashboard.js`
- `admin/js/products-manager.js`
- `admin/js/settings.js` (optional success toasts only)
- `admin/login.html`
- `admin/dashboard.html`
- `admin/products.html`
- `admin/settings.html`

## Verification Checklist

After implementing the steps above, verify:

### Login

- [ ] The login page is centered and uses a gradient background.
- [ ] Other admin pages (dashboard, products, settings, migrate) are not centered and use a neutral background.
- [ ] The login message area has `aria-live="polite"`.
- [ ] The UI copy mentions "código de 8 dígitos" everywhere the code is referenced.
- [ ] The code input enforces exactly 8 digits.
- [ ] Submitting an invalid code shows a clear, non-blocking error.

### Navigation and focus

- [ ] Tabbing through each admin page shows visible focus outlines on links, buttons, and inputs.
- [ ] Header navigation is consistent and not visually broken.

### Products UI

- [ ] Product cards look consistent across dashboard and products pages.
- [ ] Old prices use a strikethrough and a subdued color.
- [ ] Product images and placeholders render correctly and are not distorted.

### Settings UI

- [ ] Toggle switches, social items, and navigation editors share consistent styles across the page.
- [ ] Adding/removing navigation items looks visually coherent.

### Locale formatting

- [ ] All prices and numbers rendered by the admin JS use `es-PY` formatting.

### Toasts and feedback

- [ ] Save operations in settings show a success toast.
- [ ] Product operations (create/update/delete where wired) show toasts instead of only blocking alerts.
- [ ] Destructive operations still use `confirm()` to avoid accidental deletes.

## Rollback Instructions

- Before editing, create a separate branch or a backup of the `admin` folder.
- If regressions appear, you can:
  - Restore individual files from backup or version control.
  - Disable `js/ui.js` and remove the toast CSS if it conflicts.
  - Incrementally comment out new CSS rules if they cause layout issues.

## Notes

- Keep future changes aligned with these conventions:
  - Use CSS variables for brand colors and reusable values.
  - Prefer shared CSS classes and small JS utilities over inline styles.
  - Keep accessibility in mind: focus-visible, aria-live regions, and comprehensible error messages.
