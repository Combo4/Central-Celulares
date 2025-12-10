const API_URL = 'http://localhost:3002/api';

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
                <p><strong>Precio:</strong> ${product.price.toLocaleString()} PYG</p>
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
            '<p>Error cargando productos. Asegúrate de que el backend esté corriendo.</p>';
    }
}

function editProduct(id) {
    alert(`Editar producto ${id} - Función en desarrollo`);
}

function deleteProduct(id) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
        alert(`Eliminar producto ${id} - Función en desarrollo`);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
});
