/**
 * Shared utility functions for Central Celulares
 */

/**
 * Maps API product data to frontend format
 * @param {Object} apiProduct - Product data from API
 * @returns {Object} Formatted product object
 */
function mapProduct(apiProduct) {
    return {
        id: apiProduct.id,
        name: apiProduct.name,
        price: apiProduct.price,
        oldPrice: apiProduct.old_price || apiProduct.oldPrice,
        image: apiProduct.image,
        inStock: apiProduct.in_stock !== undefined ? apiProduct.in_stock : apiProduct.inStock,
        category: apiProduct.category,
        condition: apiProduct.condition || 'new',
        badges: apiProduct.badges ? (
            Array.isArray(apiProduct.badges) && typeof apiProduct.badges[0] === 'string'
                ? apiProduct.badges.map(text => ({ type: 'stock', text }))
                : apiProduct.badges
        ) : [],
        specifications: apiProduct.specifications || []
    };
}

/**
 * Formats price according to locale and currency
 * @param {number} price - Price to format
 * @param {string} locale - Locale string (default: 'es-PY')
 * @param {string} currency - Currency code (default: 'PYG')
 * @returns {string} Formatted price string
 */
function formatPrice(price, locale = 'es-PY', currency = 'PYG') {
    if (!price || isNaN(price)) return '0';
    return `${price.toLocaleString(locale)} ${currency}`;
}

/**
 * Sanitizes HTML string to prevent XSS
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeHTML(str) {
    if (!str) return '';
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

/**
 * Debounces a function call
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Shows loading state on an element
 * @param {HTMLElement} element - Element to show loading on
 * @param {string} message - Loading message (default: 'Cargando...')
 */
function showLoading(element, message = 'Cargando...') {
    if (!element) return;
    element.innerHTML = `<div class="loading-spinner">${message}</div>`;
}

/**
 * Hides loading state
 * @param {HTMLElement} element - Element to hide loading from
 */
function hideLoading(element) {
    if (!element) return;
    const spinner = element.querySelector('.loading-spinner');
    if (spinner) spinner.remove();
}

/**
 * Creates a product image HTML with fallback
 * @param {string} imageUrl - Image URL
 * @param {string} altText - Alt text for image
 * @param {string} placeholder - Placeholder emoji (default: '📱')
 * @returns {string} HTML string
 */
function createProductImage(imageUrl, altText, placeholder = '📱') {
    if (!imageUrl) {
        return `<div class="product-image-placeholder">${placeholder}</div>`;
    }
    return `<img src="${sanitizeHTML(imageUrl)}" alt="${sanitizeHTML(altText)}" class="product-image" 
            onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" loading="lazy">
           <div class="product-image-placeholder" style="display:none;">${placeholder}</div>`;
}

/**
 * Gets query parameter from URL
 * @param {string} param - Parameter name
 * @returns {string|null} Parameter value or null
 */
function getURLParameter(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

/**
 * Validates WhatsApp number format
 * @param {string} number - WhatsApp number
 * @returns {boolean} True if valid
 */
function isValidWhatsAppNumber(number) {
    if (!number) return false;
    // Remove common formatting characters
    const cleaned = number.replace(/[\s\-\(\)]/g, '');
    // Check if it's a valid international format (starts with + or digits, 10-15 digits)
    return /^\+?\d{10,15}$/.test(cleaned);
}

/**
 * Formats WhatsApp URL
 * @param {string} number - WhatsApp number
 * @param {string} message - Optional pre-filled message
 * @returns {string} WhatsApp URL
 */
function formatWhatsAppURL(number, message = '') {
    const cleanNumber = number.replace(/[\s\-\(\)+]/g, '');
    const encodedMessage = message ? `?text=${encodeURIComponent(message)}` : '';
    return `https://wa.me/${cleanNumber}${encodedMessage}`;
}
