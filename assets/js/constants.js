/**
 * Application-wide constants
 */

// Default configuration values
const DEFAULT_CONFIG = {
    pagination: {
        itemsPerPage: 8
    },
    layout: {
        columnsPerRow: 4
    },
    site: {
        locale: 'es-PY',
        currency: 'PYG',
        name: 'Central Celulares'
    },
    display: {
        showOldPrices: true,
        showStockBadge: false,
        productImagePlaceholder: '📱'
    },
    search: {
        minCharacters: 2,
        debounceTime: 300
    },
    socials: {
        showInFooter: true
    }
};

// Messages
const MESSAGES = {
    loading: 'Cargando...',
    noProducts: 'No hay productos en esta categoría.',
    noSearchResults: 'No se encontraron productos con',
    errorLoading: 'Error al cargar los productos. Por favor, recarga la página.',
    errorLoadingProduct: 'Error al cargar el producto. Redirigiendo...'
};

// Related products configuration
const RELATED_PRODUCTS_COUNT = 3;

// Cache duration (in milliseconds)
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
