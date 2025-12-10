async function loadSiteConfig() {
    try {
        const response = await fetch('http://localhost:3002/api/config/site');
        const site = await response.json();
        
        if (!site) {
            console.warn('No site configuration found');
            return;
        }
        
        if (site.logo) {
            const logoImages = document.querySelectorAll('.logo-image');
            logoImages.forEach(img => {
                img.src = site.logo;
                img.alt = site.name || 'Logo';
            });
        }
        
    } catch (error) {
        console.error('Error loading site config:', error);
    }
}

loadSiteConfig();
