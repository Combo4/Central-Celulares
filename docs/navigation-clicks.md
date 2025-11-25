# Click-Based Navigation Dropdown

## Overview
The navigation dropdown menus have been updated to work with **clicks** instead of hover, making them fully functional on mobile devices and touch screens.

## Changes Made

### 1. JavaScript (assets/js/navigation.js)
- **Click Toggle**: Dropdown menus now open/close when clicking the navigation link
- **Close Others**: When opening a dropdown, all other dropdowns automatically close
- **Click Outside**: Clicking anywhere outside the dropdown closes it
- **Visual Indicator**: Added a small arrow (▼) next to dropdown items that rotates when active

### 2. CSS (assets/css/styles.css)
- **Active Class**: Added `.active` class support alongside `:hover` for dropdown visibility
- **Arrow Animation**: The dropdown arrow rotates 180° when the dropdown is open
- **Mobile Optimization**: 
  - Dropdowns on mobile use `position: relative` instead of `absolute`
  - Full-width dropdowns on small screens
  - Centered dropdown items

## How It Works

### Desktop
1. Click on "Productos", "Servicios", or "Nosotros" to open the dropdown
2. Click on a category (e.g., "iPhone", "Samsung") to navigate
3. Click anywhere outside to close the dropdown
4. Hover still works as before for better UX

### Mobile
1. Tap on navigation items with the ▼ arrow
2. Dropdown expands below the navigation item
3. Tap on a category to navigate
4. Tap outside or on another item to close

## Features

✅ **Touch-Friendly**: Works perfectly on mobile, tablet, and desktop
✅ **Accessible**: Clear visual indicator (arrow) shows clickable items
✅ **Smart Closing**: Automatically closes when clicking outside or opening another dropdown
✅ **Smooth Animations**: Arrow rotates and dropdown slides smoothly
✅ **Backward Compatible**: Hover still works on desktop for better UX

## Testing

### Test on Desktop:
1. Open http://localhost:8080 (or your local server)
2. Click "Productos" - dropdown should appear
3. Click "Samsung" - should filter to Samsung products
4. Click outside - dropdown should close

### Test on Mobile:
1. Open the site on a mobile device or use browser dev tools (F12 → Toggle Device Toolbar)
2. Tap navigation items
3. Verify dropdowns open and close properly
4. Test category filtering by tapping category names

## Configuration

All categories are configured in `config.json`:

```json
{
  "label": "Productos",
  "url": "index.html",
  "dropdown": [
    {"label": "iPhone", "url": "index.html?category=iPhone"},
    {"label": "Samsung", "url": "index.html?category=Samsung"},
    {"label": "Xiaomi", "url": "index.html?category=Xiaomi"},
    {"label": "Motorola", "url": "index.html?category=Motorola"}
  ]
}
```

To add more categories, simply add them to the `dropdown` array in config.json.
