// Global state
let allProducts = [];
let currentPage = 1;
let config = {};
let itemsPerPage = 12; // Default value, will be overridden by config

// Load configuration
async function loadConfig() {
    try {
        const response = await fetch('config.json');
        config = await response.json();
        itemsPerPage = config.pagination.itemsPerPage;
        
        // Apply column layout
        if (config.layout?.columnsPerRow) {
            applyColumnLayout(config.layout.columnsPerRow);
        }
    } catch (error) {
        console.warn('Error loading config, using defaults:', error);
        // Config already has default values
    }
}

// Apply dynamic column layout
function applyColumnLayout(columns) {
    const percentage = (100 / columns).toFixed(3);
    const style = document.createElement('style');
    style.id = 'dynamic-columns';
    style.textContent = `
        .product-card {
            flex: 1 1 calc(${percentage}% - 1.5rem) !important;
        }
    `;
    
    // Remove existing dynamic style if present
    const existing = document.getElementById('dynamic-columns');
    if (existing) existing.remove();
    
    document.head.appendChild(style);
}

// Load and display products from JSON file
async function loadProducts() {
    try {
        const response = await fetch('products.json');
        allProducts = await response.json();
        displayPage(1);
    } catch (error) {
        console.error('Error loading products:', error);
        // Show error message to user
        document.getElementById('product-grid').innerHTML = 
            '<p style="grid-column: 1/-1; text-align: center; color: #666;">Error loading products. Please refresh the page.</p>';
    }
}

// Display specific page of products
function displayPage(page) {
    currentPage = page;
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const productsToDisplay = allProducts.slice(startIndex, endIndex);
    
    displayProducts(productsToDisplay);
    updatePagination();
}

// Display products in the grid
function displayProducts(products) {
    const productGrid = document.getElementById('product-grid');
    productGrid.innerHTML = ''; // Clear existing products

    products.forEach(product => {
        const productCard = createProductCard(product);
        productGrid.appendChild(productCard);
    });
}

// Create a product card element
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    // Format price with thousand separators (using config or defaults)
    const locale = config.site?.locale || 'es-PY';
    const currency = config.site?.currency || 'PYG';
    const formattedPrice = product.price.toLocaleString(locale);
    const formattedOldPrice = product.oldPrice ? product.oldPrice.toLocaleString(locale) : null;
    
    // Check if image exists, otherwise use placeholder
    const placeholder = config.display?.productImagePlaceholder || '📱';
    const imageHTML = product.image 
        ? `<img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
           <div class="product-image-placeholder" style="display:none;">${placeholder}</div>`
        : `<div class="product-image-placeholder">${placeholder}</div>`;
    
    const showOldPrices = config.display?.showOldPrices !== false;
    const oldPriceHTML = (formattedOldPrice && showOldPrices)
        ? `<span class="old-price">${formattedOldPrice} ${currency}</span>`
        : '';
    
    card.innerHTML = `
        <div class="product-image-wrapper">
            ${imageHTML}
        </div>
        <div class="product-info">
            <h3 class="product-title">${product.name}</h3>
            <div class="product-pricing">
                ${oldPriceHTML}
                <span class="product-price">${formattedPrice} ${currency}</span>
            </div>
        </div>
    `;
    
    return card;
}

// Sort products
function sortProducts(sortType) {
    let sortedProducts = [...allProducts];
    
    switch(sortType) {
        case 'price-asc':
            sortedProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            sortedProducts.sort((a, b) => b.price - a.price);
            break;
        case 'newest':
            // Assuming higher ID means newer
            sortedProducts.sort((a, b) => b.id - a.id);
            break;
        default:
            // Default order (as in JSON)
            break;
    }
    
    allProducts = sortedProducts;
    displayPage(1); // Reset to page 1 after sorting
}

// Search products
function searchProducts(searchTerm) {
    fetch('products.json')
        .then(response => response.json())
        .then(products => {
            const filtered = products.filter(product => 
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.category.toLowerCase().includes(searchTerm.toLowerCase())
            );
            
            if (filtered.length === 0) {
                document.getElementById('product-grid').innerHTML = 
                    '<p style="grid-column: 1/-1; text-align: center; color: #666; padding: 2rem;">No se encontraron productos con "' + searchTerm + '"</p>';
                document.querySelector('.pagination').style.display = 'none';
            } else {
                allProducts = filtered;
                displayPage(1); // Reset to page 1 after search
            }
        });
}

// Update pagination buttons
function updatePagination() {
    const totalPages = Math.ceil(allProducts.length / itemsPerPage);
    const paginationDiv = document.querySelector('.pagination');
    
    if (totalPages <= 1) {
        paginationDiv.style.display = 'none';
        return;
    }
    
    paginationDiv.style.display = 'flex';
    paginationDiv.innerHTML = '';
    
    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.innerHTML = '«';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => { if (currentPage > 1) displayPage(currentPage - 1); };
    paginationDiv.appendChild(prevBtn);
    
    // Page buttons
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            const pageBtn = document.createElement('button');
            pageBtn.className = 'page-btn' + (i === currentPage ? ' active' : '');
            pageBtn.textContent = i;
            pageBtn.onclick = () => displayPage(i);
            paginationDiv.appendChild(pageBtn);
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            const dots = document.createElement('span');
            dots.textContent = '...';
            dots.style.padding = '0 0.5rem';
            paginationDiv.appendChild(dots);
        }
    }
    
    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.innerHTML = '»';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => { if (currentPage < totalPages) displayPage(currentPage + 1); };
    paginationDiv.appendChild(nextBtn);
    
    // Scroll to top on page change
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Load and display social links
async function loadSocials() {
    // Check if socials should be shown
    if (config.socials?.showInFooter === false) {
        const socialLinksContainer = document.getElementById('social-links');
        if (socialLinksContainer) {
            socialLinksContainer.style.display = 'none';
        }
        return;
    }
    
    try {
        const response = await fetch('socials.json');
        const socials = await response.json();
        displaySocials(socials);
    } catch (error) {
        console.warn('Error loading socials:', error);
    }
}

// Get SVG icon for social media
function getSocialIcon(iconName) {
    const icons = {
        instagram: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
        facebook: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
        whatsapp: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>'
    };
    return icons[iconName] || '';
}

// Display social links in footer
function displaySocials(socials) {
    const socialLinksContainer = document.getElementById('social-links');
    if (!socialLinksContainer) return;
    
    socialLinksContainer.innerHTML = '';
    
    // Filter only enabled socials
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

// Initialize when page loads
document.addEventListener('DOMContentLoaded', async () => {
    await loadConfig(); // Load config first
    loadProducts();
    loadSocials();
    
    // Add contact button scroll functionality
    const contactBtn = document.getElementById('contact-btn');
    if (contactBtn) {
        contactBtn.addEventListener('click', () => {
            const footer = document.getElementById('footer-contact');
            if (footer) {
                footer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }
    
    // Add sort functionality
    const sortSelect = document.querySelector('.sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            sortProducts(e.target.value);
        });
    }
    
    // Add search functionality
    const searchInput = document.querySelector('.search-input');
    const searchButton = document.querySelector('.search-button');
    
    if (searchInput && searchButton) {
        // Search on button click
        searchButton.addEventListener('click', () => {
            const searchTerm = searchInput.value.trim();
            if (searchTerm) {
                searchProducts(searchTerm);
            } else {
                loadProducts(); // Show all if empty
            }
        });
        
        // Search on Enter key
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const searchTerm = searchInput.value.trim();
                if (searchTerm) {
                    searchProducts(searchTerm);
                } else {
                    fetch('products.json')
                        .then(response => response.json())
                        .then(products => {
                            allProducts = products;
                            displayPage(1);
                        });
                }
            }
        });
        
        // Search as you type (debounced)
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const minChars = config.search?.minCharacters || 2;
            const debounce = config.search?.debounceTime || 300;
            searchTimeout = setTimeout(() => {
                const searchTerm = e.target.value.trim();
                if (searchTerm.length >= minChars) {
                    searchProducts(searchTerm);
                } else if (searchTerm.length === 0) {
                    loadProducts(); // Show all if cleared
                }
            }, debounce);
        });
    }
});
