async function loadTheme() {
    try {
        const response = await fetch('config.json');
        const config = await response.json();
        
        if (!config.theme || !config.theme.current) {
            console.warn('No theme configuration found, using default');
            return;
        }
        
        const themeName = config.theme.current;
        
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
        
        if (config.theme.logoBackground) {
            document.documentElement.style.setProperty('--logo-bg', config.theme.logoBackground);
        }
        
        if (config.theme.headerBackground) {
            document.documentElement.style.setProperty('--header-bg', config.theme.headerBackground);
        }
        
    } catch (error) {
        console.error('Error loading theme:', error);
    }
}

loadTheme();
