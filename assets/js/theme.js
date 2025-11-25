// Theme Loader
async function loadTheme() {
    try {
        const response = await fetch('config.json');
        const config = await response.json();
        
        if (!config.theme || !config.theme.current) {
            console.warn('No theme configuration found, using default');
            return;
        }
        
        const themeName = config.theme.current;
        
        // Create link element for theme CSS
        const themeLink = document.createElement('link');
        themeLink.rel = 'stylesheet';
        themeLink.href = `assets/css/themes/${themeName}.css`;
        themeLink.id = 'theme-stylesheet';
        
        // Insert before the main stylesheet so it loads first
        const firstLink = document.querySelector('link[rel="stylesheet"]');
        if (firstLink) {
            firstLink.parentNode.insertBefore(themeLink, firstLink);
        } else {
            document.head.appendChild(themeLink);
        }
        
        console.log(`Theme loaded: ${themeName}`);
        
    } catch (error) {
        console.error('Error loading theme:', error);
    }
}

// Load theme immediately
loadTheme();
