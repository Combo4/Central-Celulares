// Load site configuration (logo, etc.)
async function loadSiteConfig() {
    try {
        const response = await fetch('config.json');
        const config = await response.json();
        
        if (!config.site) {
            console.warn('No site configuration found');
            return;
        }
        
        // Load logo if specified
        if (config.site.logo) {
            const logoImages = document.querySelectorAll('.logo-image');
            logoImages.forEach(img => {
                img.src = config.site.logo;
                img.alt = config.site.name || 'Logo';
            });
        }
        
    } catch (error) {
        console.error('Error loading site config:', error);
    }
}

// Load site config immediately
loadSiteConfig();
