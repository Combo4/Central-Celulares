const THEME_API_BASE_URL = window.API_BASE_URL || 'http://localhost:3002';

async function loadTheme() {
    try {
        const response = await fetch(`${THEME_API_BASE_URL}/api/config/theme`);
        const theme = await response.json();
        
        if (!theme || !theme.current) {
            console.warn('No theme configuration found, using default');
            return;
        }
        
        const themeName = theme.current;
        
        const themeLink = document.createElement('link');
        themeLink.rel = 'stylesheet';
        themeLink.href = `assets/css/themes/${themeName}.css`;
        themeLink.id = 'theme-stylesheet';
        
        const firstLink = document.querySelector('link[rel="stylesheet"]');
        if (firstLink) {
            firstLink.parentNode.insertBefore(themeLink, firstLink);
        } else {
            document.head.appendChild(themeLink);
        }
        
        console.log(`Theme loaded: ${themeName}`);
        
        if (theme.logoBackground) {
            document.documentElement.style.setProperty('--logo-bg', theme.logoBackground);
        }
        
        if (theme.headerBackground) {
            document.documentElement.style.setProperty('--header-bg', theme.headerBackground);
        }
        
        if (theme.headerActionsBackground) {
            document.documentElement.style.setProperty('--header-actions-bg', theme.headerActionsBackground);
        }
        
    } catch (error) {
        console.error('Error loading theme:', error);
    }
}

loadTheme();
