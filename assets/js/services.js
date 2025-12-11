const SERVICES_API_BASE_URL = window.API_BASE_URL || 'http://localhost:3002';

const DEFAULT_SERVICES_CONFIG = {
    title: 'Servicios',
    subtitle: 'Reparaciones y soluciones para tu dispositivo',
    description: 'En Central Celulares ofrecemos diferentes servicios para que tu teléfono siempre esté como nuevo. Trabajamos con repuestos de calidad y técnicos especializados.',
    sections: [
        {
            icon: '📱',
            title: 'Cambio de pantalla',
            content: 'Reemplazamos pantallas rotas o dañadas para la mayoría de las marcas y modelos. Utilizamos repuestos de alta calidad y garantizamos un resultado limpio y funcional.'
        },
        {
            icon: '🔌',
            title: 'Reparación de puerto de carga',
            content: 'Si tu teléfono ya no carga bien o hay que mover el cable para que funcione, revisamos y reparamos el puerto de carga o lo reemplazamos si es necesario.'
        },
        {
            icon: '🔋',
            title: 'Cambio de batería',
            content: '¿La batería ya no dura como antes? Cambiamos baterías desgastadas para que vuelvas a disfrutar de una buena autonomía durante todo el día.'
        },
        {
            icon: '🎧',
            title: 'Accesorios y cargadores',
            content: 'Contamos con cargadores, cables, fundas, protectores de pantalla, auriculares y más accesorios originales y de buena calidad para tu dispositivo.'
        },
        {
            icon: '🛠️',
            title: 'Otros servicios',
            content: 'También ofrecemos limpieza interna, cambio de micrófono y parlante, actualización de software y revisión general del equipo.'
        }
    ]
};

async function loadServicesContent() {
    let services;

    try {
        const response = await fetch(`${SERVICES_API_BASE_URL}/api/config/services`);
        if (!response.ok) {
            console.warn('Services config not found in API, using defaults');
            services = DEFAULT_SERVICES_CONFIG;
        } else {
            services = await response.json();
        }
    } catch (error) {
        console.error('Error loading services content from API, using defaults:', error);
        services = DEFAULT_SERVICES_CONFIG;
    }

    if (!services) {
        console.warn('No services configuration available');
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
                services.sections.forEach((section, index) => {
                    const card = document.createElement('div');
                    card.className = 'feature-card';
                    card.id = `service-${index}`;
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
