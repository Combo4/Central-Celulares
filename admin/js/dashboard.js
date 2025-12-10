const API_URL = (function () {
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
        return 'http://localhost:3002/api';
    }
    return 'https://endless-kevina-central-celulares-8eb37001.koyeb.app/api';
})();

async function getAuthToken() {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
}

async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        const products = await response.json();
        
        const grid = document.getElementById('productsGrid');
        
        if (products.length === 0) {
            grid.innerHTML = '<p>No hay productos aún.</p>';
            return;
        }
        
        grid.innerHTML = products.map(product => `
            <div class="product-card">
                <h3>${product.name}</h3>
                <p><strong>Precio:</strong> ${Number(product.price || 0).toLocaleString('es-PY')} PYG</p>
                <p><strong>Categoría:</strong> ${product.category}</p>
                <p><strong>Stock:</strong> ${product.in_stock ? '✅ Disponible' : '❌ Agotado'}</p>
                <div class="product-actions">
                    <button class="btn-small btn-edit" onclick="editProduct(${product.id})">Editar</button>
                    <button class="btn-small btn-delete" onclick="deleteProduct(${product.id})">Eliminar</button>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading products:', error);
        document.getElementById('productsGrid').innerHTML = 
            '<p>Error cargando productos. Verifica que la API esté disponible.</p>';
        if (window.showToast) {
            showToast('Error cargando productos. Verifica que la API esté disponible.', 'error');
        }
    }
}

function editProduct(id) {
    // Reuse full edit page used in products manager
    window.location.href = `edit-product.html?id=${id}`;
}

async function deleteProduct(id) {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
        const token = await getAuthToken();
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Error al eliminar');

        if (window.showToast) {
            showToast('✅ Producto eliminado correctamente', 'success');
        } else {
            alert('✅ Producto eliminado correctamente');
        }
        loadProducts();
    } catch (error) {
        console.error('Error deleting product:', error);
        if (window.showToast) {
            showToast('❌ Error al eliminar el producto', 'error');
        } else {
            alert('❌ Error al eliminar el producto');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
});
