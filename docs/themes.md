# Theme System Documentation

## Overview
The website now supports multiple color themes that can be easily changed by editing the `config.json` file.

## Available Themes

### 1. Cyan (Default)
- **Primary Color**: #00BCD4 (Cyan/Turquoise)
- **Secondary Color**: #27AE60 (Green)
- **Best for**: Modern, tech-focused look

### 2. Green
- **Primary Color**: #27AE60 (Green)
- **Secondary Color**: #1E8449 (Darker Green)
- **Best for**: Eco-friendly, natural feel

### 3. Teal (Green-Blue)
- **Primary Color**: #009688 (Teal)
- **Secondary Color**: #00695C (Dark Teal)
- **Best for**: Professional, balanced look

## How to Change Theme

### Simple Method - Edit config.json

1. Open `config.json`
2. Find the `theme` section
3. Change the `current` value to one of: `"cyan"`, `"green"`, or `"teal"`

```json
"theme": {
  "current": "green",
  ...
}
```

4. Save the file
5. Refresh your browser

## What Colors Change

The theme affects:
- ✅ Top bar background
- ✅ CTA buttons (CONTACTAR button)
- ✅ Dropdown hover effects
- ✅ Product prices
- ✅ Stock badges
- ✅ Sort dropdown border/text
- ✅ Pagination buttons
- ✅ Social media link hovers
- ✅ Breadcrumb links

## Creating Custom Themes

### Option 1: Modify Existing Theme
Edit the color values in `assets/css/themes/[themename].css`:

```css
:root {
  --primary-color: #YOUR_COLOR;
  --primary-hover: #YOUR_DARKER_COLOR;
  --secondary-color: #YOUR_SECOND_COLOR;
  --secondary-hover: #YOUR_DARKER_SECOND_COLOR;
}
```

### Option 2: Create New Theme

1. Create a new CSS file in `assets/css/themes/` (e.g., `purple.css`)

```css
/* Purple Theme */
:root {
  --primary-color: #9C27B0;
  --primary-hover: #7B1FA2;
  --secondary-color: #673AB7;
  --secondary-hover: #512DA8;
  --header-bg: #231F20;
  --text-dark: #2D2D2D;
}
```

2. Add it to `config.json`:

```json
"theme": {
  "current": "purple",
  "available": [
    ...existing themes...,
    {
      "name": "purple",
      "label": "Purple",
      "primary": "#9C27B0",
      "secondary": "#673AB7"
    }
  ]
}
```

3. Refresh your browser

## Theme File Locations

- **Theme Configuration**: `config.json` → `theme` section
- **Theme CSS Files**: `assets/css/themes/`
  - `cyan.css` - Default cyan theme
  - `green.css` - Green theme
  - `teal.css` - Green-blue theme
- **Theme Loader**: `assets/js/theme.js`

## Technical Details

### How It Works
1. When the page loads, `theme.js` reads the `current` theme from `config.json`
2. It dynamically loads the corresponding CSS file from `assets/css/themes/`
3. The CSS file defines CSS variables (e.g., `--primary-color`)
4. The main stylesheets use these variables for colors

### CSS Variables Used
- `--primary-color`: Main brand color (buttons, highlights)
- `--primary-hover`: Hover state for primary elements
- `--secondary-color`: Secondary accent (prices, badges)
- `--secondary-hover`: Hover state for secondary elements
- `--header-bg`: Header background (usually unchanged)
- `--text-dark`: Main text color (usually unchanged)

## Troubleshooting

### Theme not changing?
1. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
2. Check `config.json` syntax is valid
3. Verify theme name matches filename (e.g., "green" → `green.css`)
4. Check browser console for errors (F12)

### Colors look wrong?
1. Ensure all CSS variables are defined in your theme file
2. Check that the theme CSS file is loading (Network tab in F12)
3. Verify hex color codes are valid (#RRGGBB format)

## Examples

### Switching to Green Theme
```json
"theme": {
  "current": "green"
}
```

### Switching to Teal Theme
```json
"theme": {
  "current": "teal"
}
```

### Back to Default (Cyan)
```json
"theme": {
  "current": "cyan"
}
```

## Best Practices

1. **Test on multiple pages**: Check both index.html and product.html
2. **Check contrast**: Ensure colors are readable (use contrast checkers)
3. **Mobile testing**: Verify theme looks good on mobile devices
4. **Backup**: Keep a copy of working theme settings before experimenting
5. **Consistency**: Use similar color tones for professional look

## Future Enhancements

Possible additions:
- Dark mode themes
- User-selectable theme switcher UI
- Seasonal themes (Christmas, Summer, etc.)
- A/B testing different themes
- Theme preview before applying
