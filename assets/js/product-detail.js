// Get product ID from URL parameter
function getProductIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return parseInt(urlParams.get('id'));
}

// Load product details
async function loadProductDetails() {
    const productId = getProductIdFromURL();
    
    if (!productId) {
        window.location.href = 'index.html';
        return;
    }
    
    try {
        const response = await fetch('products.json');
        const products = await response.json();
        const product = products.find(p => p.id === productId);
        
        if (!product) {
            window.location.href = 'index.html';
            return;
        }
        
        displayProductDetails(product);
        loadRelatedProducts(products, productId);
        loadSocials();
        
    } catch (error) {
        console.error('Error loading product:', error);
        window.location.href = 'index.html';
    }
}

// Display product details
function displayProductDetails(product) {
    // Update page title
    document.getElementById('page-title').textContent = `${product.name} - Central Celulares`;
    document.getElementById('breadcrumb-product').textContent = product.name;
    
    // Update product image
    const productImage = document.getElementById('product-image');
    productImage.src = product.image;
    productImage.alt = product.name;
    
    // Update product title
    document.getElementById('product-title').textContent = product.name;
    
    // Display badges
    displayBadges(product);
    
    // Display pricing
    displayPricing(product);
    
    // Display installments
    displayInstallments(product);
    
    // Display specifications
    displaySpecifications(product);
    
    // Setup WhatsApp button
    setupWhatsAppButton(product);
}

// Display badges
function displayBadges(product) {
    const badgesContainer = document.getElementById('product-badges');
    badgesContainer.innerHTML = '';
    
    if (product.badges && product.badges.length > 0) {
        product.badges.forEach(badge => {
            const badgeSpan = document.createElement('span');
            badgeSpan.className = `shipping-badge ${badge.type}`;
            badgeSpan.textContent = badge.text;
            badgesContainer.appendChild(badgeSpan);
        });
    }
    
    // Default stock badge if in stock
    if (product.inStock && (!product.badges || product.badges.length === 0)) {
        const stockBadge = document.createElement('span');
        stockBadge.className = 'shipping-badge stock';
        stockBadge.textContent = 'En Stock';
        badgesContainer.appendChild(stockBadge);
    }
}

// Display pricing
function displayPricing(product) {
    const priceSection = document.getElementById('price-section');
    priceSection.innerHTML = '';
    
    const locale = 'es-PY';
    const currency = 'PYG';
    
    // Create price row
    const priceRow = document.createElement('div');
    priceRow.className = 'price-row';
    
    const priceLabel = document.createElement('span');
    priceLabel.className = 'price-label';
    priceLabel.textContent = 'Precio';
    
    const priceGroup = document.createElement('div');
    priceGroup.className = 'price-group';
    
    // Old price if exists
    if (product.oldPrice) {
        const oldPriceH2 = document.createElement('h2');
        oldPriceH2.className = 'product-price old-price';
        oldPriceH2.textContent = `${product.oldPrice.toLocaleString(locale)} ${currency}`;
        priceGroup.appendChild(oldPriceH2);
    }
    
    // Current price
    const currentPriceH2 = document.createElement('h2');
    currentPriceH2.className = 'product-price offer-price';
    currentPriceH2.textContent = `${product.price.toLocaleString(locale)} ${currency}`;
    priceGroup.appendChild(currentPriceH2);
    
    priceRow.appendChild(priceLabel);
    priceRow.appendChild(priceGroup);
    priceSection.appendChild(priceRow);
}

// Display installments
function displayInstallments(product) {
    const installmentsSection = document.getElementById('installments-section');
    installmentsSection.innerHTML = '';
    
    if (!product.installments || product.installments.length === 0) {
        return;
    }
    
    product.installments.forEach(installment => {
        const card = document.createElement('div');
        card.className = 'installment-card';
        
        const title = document.createElement('span');
        title.className = 'installment-title';
        title.textContent = `${installment.months} cuotas de`;
        
        const price = document.createElement('span');
        price.className = 'installment-price';
        price.textContent = `${installment.amount.toLocaleString('es-PY')} PYG`;
        
        card.appendChild(title);
        card.appendChild(price);
        installmentsSection.appendChild(card);
    });
}

// Display specifications
function displaySpecifications(product) {
    const specsUl = document.getElementById('product-specs');
    specsUl.innerHTML = '';
    
    if (!product.specifications || product.specifications.length === 0) {
        specsUl.innerHTML = '<li>No hay especificaciones disponibles.</li>';
        return;
    }
    
    product.specifications.forEach(spec => {
        const li = document.createElement('li');
        li.textContent = spec;
        specsUl.appendChild(li);
    });
}

// Setup WhatsApp button
function setupWhatsAppButton(product) {
    const whatsappBtn = document.getElementById('whatsapp-btn');
    const whatsappNumber = '595XXXXXXXXX'; // Update with actual WhatsApp number
    const message = encodeURIComponent(`Hola, me interesa ${product.name}`);
    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${message}`;
    
    whatsappBtn.onclick = () => {
        window.open(whatsappLink, '_blank');
    };
}

// Load related products
function loadRelatedProducts(allProducts, currentProductId) {
    const relatedGrid = document.getElementById('related-products-grid');
    relatedGrid.innerHTML = '';
    
    // Get products from same category, excluding current product
    const currentProduct = allProducts.find(p => p.id === currentProductId);
    let relatedProducts = allProducts.filter(p => 
        p.id !== currentProductId && 
        p.category === currentProduct.category
    );
    
    // If less than 3, add random products
    if (relatedProducts.length < 3) {
        const otherProducts = allProducts.filter(p => 
            p.id !== currentProductId && 
            !relatedProducts.includes(p)
        );
        relatedProducts = [...relatedProducts, ...otherProducts];
    }
    
    // Limit to 3 products
    relatedProducts = relatedProducts.slice(0, 3);
    
    relatedProducts.forEach(product => {
        const card = createRelatedProductCard(product);
        relatedGrid.appendChild(card);
    });
}

// Create related product card
function createRelatedProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.onclick = () => {
        window.location.href = `product.html?id=${product.id}`;
    };
    
    const formattedPrice = product.price.toLocaleString('es-PY');
    const formattedOldPrice = product.oldPrice ? product.oldPrice.toLocaleString('es-PY') : null;
    
    const imageHTML = product.image 
        ? `<img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
           <div class="product-image-placeholder" style="display:none;">📱</div>`
        : `<div class="product-image-placeholder">📱</div>`;
    
    const oldPriceHTML = formattedOldPrice 
        ? `<span class="old-price">${formattedOldPrice} PYG</span>`
        : '';
    
    card.innerHTML = `
        <div class="product-image-wrapper">
            ${imageHTML}
        </div>
        <div class="product-info">
            <h3 class="product-title">${product.name}</h3>
            <div class="product-pricing">
                ${oldPriceHTML}
                <span class="product-price">${formattedPrice} PYG</span>
            </div>
        </div>
    `;
    
    return card;
}

// Load social links (reuse from products.js logic)
async function loadSocials() {
    try {
        const response = await fetch('socials.json');
        const socials = await response.json();
        displaySocials(socials);
    } catch (error) {
        console.warn('Error loading socials:', error);
    }
}

function getSocialIcon(iconName) {
    const icons = {
        instagram: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
        facebook: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
        whatsapp: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>'
    };
    return icons[iconName] || '';
}

function displaySocials(socials) {
    const socialLinksContainer = document.getElementById('social-links');
    if (!socialLinksContainer) return;
    
    socialLinksContainer.innerHTML = '';
    
    const enabledSocials = socials.filter(social => social.enabled === true);
    
    enabledSocials.forEach(social => {
        const link = document.createElement('a');
        link.href = social.url;
        link.className = 'social-link';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        
        const iconSVG = getSocialIcon(social.icon);
        link.innerHTML = `${iconSVG}<span>${social.name}</span>`;
        
        socialLinksContainer.appendChild(link);
    });
}

// Setup contact button scroll
function setupContactButton() {
    const contactBtn = document.getElementById('contact-btn');
    if (contactBtn) {
        contactBtn.addEventListener('click', () => {
            const footer = document.getElementById('footer-contact');
            if (footer) {
                footer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadProductDetails();
    setupContactButton();
});
