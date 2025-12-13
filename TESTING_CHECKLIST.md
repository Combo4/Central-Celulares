# Testing Checklist

Use this checklist to verify all improvements are working correctly.

## 🔍 Visual/UI Tests

### Product Listing Page (index.html)
- [ ] Page loads without errors in browser console
- [ ] Loading spinner appears briefly when page loads
- [ ] Products display in grid layout
- [ ] Product images load (or show placeholder emoji)
- [ ] Prices formatted correctly with PYG currency
- [ ] Old prices show strikethrough when present
- [ ] Pagination controls appear (if more than 8 products)
- [ ] Pagination works when clicking page numbers

### Product Detail Page (product.html)
- [ ] Clicking a product navigates to detail page
- [ ] Product name appears in page title
- [ ] Product image displays
- [ ] Price shows correctly
- [ ] Specifications list displays
- [ ] "Comprar" WhatsApp button is visible
- [ ] Related products appear at bottom
- [ ] Clicking related product navigates correctly

### Navigation
- [ ] Logo visible in header
- [ ] Navigation menu loads dynamically
- [ ] Dropdown menus work on hover
- [ ] Category links filter products correctly
- [ ] Footer social links display

## ⌨️ Keyboard Accessibility Tests

### Product Cards
- [ ] Can tab to product cards
- [ ] Product cards have visible focus indicator
- [ ] Pressing Enter on card opens product detail
- [ ] Pressing Space on card opens product detail

### Navigation
- [ ] Can tab through all navigation links
- [ ] Dropdown menus accessible via keyboard
- [ ] Can navigate with arrow keys (if implemented)

## 🔎 Search Functionality Tests

### Basic Search
- [ ] Search input appears in header
- [ ] Typing triggers search after 300ms
- [ ] Search results update dynamically
- [ ] Searching for "iPhone" shows only iPhone products
- [ ] Searching for "Samsung" shows only Samsung products
- [ ] Search is case-insensitive
- [ ] Clearing search shows all products again

### Search Edge Cases
- [ ] Empty search shows all products
- [ ] Invalid search shows "No products found" message
- [ ] Special characters don't break search
- [ ] Search works after sorting
- [ ] Pressing Enter triggers search

## 🎨 Sorting Tests
- [ ] Sort dropdown appears
- [ ] "Price: Low to High" sorts correctly
- [ ] "Price: High to Low" sorts correctly
- [ ] "Newest" sorts by ID descending
- [ ] Sorting maintains search filter

## 🔗 Category Filtering Tests
- [ ] Clicking "iPhone" in menu shows only iPhones
- [ ] Clicking "Samsung" shows only Samsung products
- [ ] Page title updates to category name
- [ ] "New" condition filter works
- [ ] "Used" condition filter works (if products exist)

## 📱 Mobile Responsiveness Tests
- [ ] Header responsive on mobile (<768px)
- [ ] Navigation menu responsive
- [ ] Product grid shows 2 columns on tablet
- [ ] Product grid shows 1 column on mobile
- [ ] Search bar responsive
- [ ] Footer responsive

## ⚡ Performance Tests

### Caching
- [ ] First page load fetches products from API
- [ ] Searching doesn't trigger new API call
- [ ] Sorting doesn't trigger new API call
- [ ] Clearing search uses cached products

### Loading States
- [ ] Loading spinner shows during initial load
- [ ] Content replaces spinner when loaded
- [ ] No flash of unstyled content (FOUC)

### Images
- [ ] Images have `loading="lazy"` attribute
- [ ] Images don't load until scrolled into view
- [ ] Broken images show placeholder emoji

## 🔒 Security Tests

### XSS Prevention
- [ ] Search for `<script>alert('xss')</script>` - should not execute
- [ ] Search for `<img src=x onerror=alert('xss')>` - should not execute
- [ ] Product names with HTML are escaped
- [ ] Special characters display correctly

## 🐛 Error Handling Tests

### API Errors
- [ ] Stop backend server
- [ ] Reload page - should show error message
- [ ] Restart backend - page works again

### Missing Products
- [ ] Navigate to `product.html?id=99999` (non-existent)
- [ ] Should redirect to index.html

### Network Issues
- [ ] Throttle network in DevTools
- [ ] Page should still be usable (slower)
- [ ] Error messages clear and helpful

## 🌐 Browser Compatibility Tests

Test in at least 3 browsers:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if on Mac)

## 📊 Code Quality Checks

### Browser Console
- [ ] No JavaScript errors in console
- [ ] No 404 errors for missing files
- [ ] No CORS errors
- [ ] API requests return 200 status

### DevTools Network Tab
- [ ] All JS files load correctly
- [ ] All CSS files load correctly
- [ ] Images load (or 404 with fallback)
- [ ] API endpoints respond quickly (<500ms)

### Lighthouse Audit (Chrome DevTools)
- [ ] Performance score > 80
- [ ] Accessibility score > 90
- [ ] Best Practices score > 80
- [ ] SEO score > 80

## ✅ Configuration Tests

### Update config.json
- [ ] Change `itemsPerPage` to 4 - pagination updates
- [ ] Change `currency` to "USD" - prices show USD
- [ ] Change `whatsapp` number - WhatsApp button uses new number
- [ ] Change theme - colors update

### Update products.json
- [ ] Add new product - appears on page
- [ ] Remove product - disappears from page
- [ ] Update price - new price displays

## 📝 Documentation Tests
- [ ] README.md renders correctly on GitHub
- [ ] All code examples in README are valid
- [ ] Setup instructions are clear and complete
- [ ] .env.example has all required variables

## 🚀 Deployment Tests

If deploying to production:
- [ ] Update `api-base.js` with production URL
- [ ] Test all functionality in production
- [ ] Check SSL certificate
- [ ] Verify CORS allows production domain
- [ ] Test on real mobile devices
- [ ] Check Google Analytics (if implemented)

## Notes Section

Use this space to record any issues found:

```
Issue: [Description]
Severity: [Critical/High/Medium/Low]
Steps to reproduce: [1. 2. 3.]
Expected: [What should happen]
Actual: [What actually happens]
```

---

**Testing Date**: _______________
**Tested By**: _______________
**All Tests Passed**: [ ] Yes [ ] No
**Issues Found**: _______________
