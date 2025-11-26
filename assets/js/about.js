// Load About Us content from config
async function loadAboutContent() {
    try {
        const response = await fetch('config.json');
        const config = await response.json();
        
        if (!config.aboutUs) {
            console.warn('No about us configuration found');
            return;
        }
        
        const aboutData = config.aboutUs;
        
        // Load hero content
        document.getElementById('about-title').textContent = aboutData.title;
        document.getElementById('about-subtitle').textContent = aboutData.subtitle;
        document.getElementById('about-description').textContent = aboutData.description;
        
        // Load stats
        const statsSection = document.getElementById('stats-section');
        statsSection.innerHTML = '';
        
        if (aboutData.stats && aboutData.stats.length > 0) {
            aboutData.stats.forEach(stat => {
                const statCard = document.createElement('div');
                statCard.className = 'stat-card';
                statCard.innerHTML = `
                    <span class="stat-number">${stat.number}</span>
                    <span class="stat-label">${stat.label}</span>
                `;
                statsSection.appendChild(statCard);
            });
        }
        
        // Load features/sections
        const featuresSection = document.getElementById('features-section');
        featuresSection.innerHTML = '';
        
        if (aboutData.sections && aboutData.sections.length > 0) {
            aboutData.sections.forEach(section => {
                const featureCard = document.createElement('div');
                featureCard.className = 'feature-card';
                featureCard.innerHTML = `
                    <span class="feature-icon">${section.icon}</span>
                    <h3 class="feature-title">${section.title}</h3>
                    <p class="feature-content">${section.content}</p>
                `;
                featuresSection.appendChild(featureCard);
            });
        }
        
        // Load social links in footer
        loadSocialLinks();
        
    } catch (error) {
        console.error('Error loading about content:', error);
    }
}

// Load social links
async function loadSocialLinks() {
    try {
        const response = await fetch('socials.json');
        const socials = await response.json();
        
        const socialLinksContainer = document.getElementById('social-links');
        socialLinksContainer.innerHTML = '';
        
        socials.forEach(social => {
            if (social.enabled) {
                const link = document.createElement('a');
                link.href = social.url;
                link.className = 'social-link';
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.innerHTML = social.icon + ' ' + social.name;
                socialLinksContainer.appendChild(link);
            }
        });
    } catch (error) {
        console.error('Error loading social links:', error);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadAboutContent();
});
