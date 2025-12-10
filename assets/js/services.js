const SERVICES_API_BASE_URL = window.API_BASE_URL || 'http://localhost:3002';

async function loadServicesContent() {
    try {
        const response = await fetch(`${SERVICES_API_BASE_URL}/api/config/services`);
        const services = await response.json();

        if (!services) {
            console.warn('No services configuration found');
            return;
        }

        const titleEl = document.querySelector('.about-title');
        const subtitleEl = document.querySelector('.about-subtitle');
        const descEl = document.querySelector('.about-description');

        if (titleEl) titleEl.textContent = services.title || 'Servicios';
        if (subtitleEl) subtitleEl.textContent = services.subtitle || '';
        if (descEl) descEl.textContent = services.description || '';

        const featuresSection = document.querySelector('.features-section');
        if (featuresSection) {
            featuresSection.innerHTML = '';

            if (Array.isArray(services.sections)) {
                services.sections.forEach(section => {
                    const card = document.createElement('div');
                    card.className = 'feature-card';
                    card.innerHTML = `
                        <span class="feature-icon">${section.icon || ''}</span>
                        <h3 class="feature-title">${section.title || ''}</h3>
                        <p class="feature-content">${section.content || ''}</p>
                    `;
                    featuresSection.appendChild(card);
                });
            }
        }
    } catch (error) {
        console.error('Error loading services content:', error);
    }
}

function setupServicesScrollAnimations() {
    const fadeElements = document.querySelectorAll('.fade-in-section');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    fadeElements.forEach(element => {
        observer.observe(element);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadServicesContent();
    setupServicesScrollAnimations();
});
