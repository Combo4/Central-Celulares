const API_URL = 'http://localhost:3002/api';
let currentEditId = null;

async function getAuthToken() {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
}

async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        const products = await response.json();
        
        document.getElementById('productCount').textContent = products.length;
        
        const grid = document.getElementById('productsGrid');
        
        if (products.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;">No hay productos aún. Haz clic en "Agregar Producto" para comenzar.</p>';
            return;
        }
        
        grid.innerHTML = products.map(product => {
            const formattedPrice = product.price.toLocaleString('es-PY');
            const formattedOldPrice = product.old_price ? product.old_price.toLocaleString('es-PY') : null;

            const imageHTML = product.image 
                ? `<img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                   <div class="product-image-placeholder" style="display:none;">📱</div>`
                : `<div class="product-image-placeholder">📱</div>`;

            const oldPriceHTML = formattedOldPrice
                ? `<span class="old-price">${formattedOldPrice} PYG</span>`
                : '';

            return `
                <div class="product-card" onclick="viewProductDetail(${product.id})" style="cursor: pointer;">
                    <div class="product-image-wrapper">
                        ${imageHTML}
                    </div>
                    <div class="product-info">
                        <h3 class="product-title">${product.name}</h3>
                        <div class="product-pricing">
                            ${oldPriceHTML}
                            <span class="product-price">${formattedPrice} PYG</span>
                        </div>
                        <div class="product-actions">
                            <button class="btn-small btn-edit" onclick="event.stopPropagation(); editProduct(${product.id})">✏️ Editar</button>
                            <button class="btn-small btn-delete" onclick="event.stopPropagation(); deleteProduct(${product.id}, '${product.name.replace(/'/g, "\\'")}')">🗑️ Eliminar</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading products:', error);
        document.getElementById('productsGrid').innerHTML = 
            '<p style="color: red;">Error cargando productos. Verifica que el backend esté corriendo en el puerto 3001.</p>';
    }
}

function openAddModal() {
    currentEditId = null;
    document.getElementById('modalTitle').textContent = 'Agregar Producto';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    
    const preview = document.getElementById('imagePreview');
    const placeholder = document.getElementById('imagePlaceholder');
    preview.style.display = 'none';
    preview.src = '';
    if (placeholder) {
        placeholder.style.display = 'flex';
    }
    
    document.getElementById('badgesContainer').innerHTML = '';
    document.getElementById('specsContainer').innerHTML = '';
    
    // Add default specification fields
    const defaultSpecs = ['Pantalla', 'Memoria RAM', 'Almacenamiento', 'Cámara', 'Batería', 'Procesador'];
    defaultSpecs.forEach(label => addSpecInput(label, ''));
    
    document.getElementById('productModal').classList.add('active');
}

// New function to populate inline edit view
function populateInlineEditView(product) {
    // Set product title
    const titleEl = document.getElementById('editProductTitle');
    titleEl.textContent = product.name;
    titleEl.dataset.value = product.name;
    titleEl.dataset.productId = product.id;
    
    // Set prices
    const priceEl = document.getElementById('editCurrentPrice');
    priceEl.textContent = `${product.price.toLocaleString('es-PY')} PYG`;
    priceEl.dataset.value = product.price;
    priceEl.dataset.productId = product.id;
    
    const oldPriceContainer = document.getElementById('editOldPriceContainer');
    const oldPriceEl = document.getElementById('editOldPrice');
    if (product.old_price) {
        oldPriceEl.textContent = `${product.old_price.toLocaleString('es-PY')} PYG`;
        oldPriceEl.dataset.value = product.old_price;
        oldPriceEl.dataset.productId = product.id;
        oldPriceContainer.style.display = 'block';
    } else {
        oldPriceContainer.style.display = 'none';
    }
    
    // Set category
    const categoryEl = document.getElementById('editCategory');
    categoryEl.textContent = product.category;
    categoryEl.dataset.value = product.category;
    categoryEl.dataset.productId = product.id;
    
    // Set stock
    const stockEl = document.getElementById('editStock');
    const stockStatus = product.in_stock ? 'Disponible' : 'Agotado';
    stockEl.innerHTML = product.in_stock ? '<span style="color: #27AE60;">✅ Disponible</span>' : '<span style="color: #e74c3c;">❌ Agotado</span>';
    stockEl.dataset.value = stockStatus;
    stockEl.dataset.productId = product.id;
    
    // Set specifications
    const specsList = document.getElementById('editSpecsList');
    specsList.innerHTML = '';
    if (product.specifications && product.specifications.length > 0) {
        product.specifications.forEach((spec, index) => {
            const li = document.createElement('li');
            li.textContent = spec;
            li.dataset.editable = `spec_${index}`;
            li.dataset.value = spec;
            li.dataset.productId = product.id;
            li.style.cursor = 'pointer';
            li.title = 'Haz clic para editar';
            specsList.appendChild(li);
        });
    } else {
        specsList.innerHTML = '<li style="color: #999;">Sin especificaciones</li>';
    }
    
    // Initialize inline editing
    initializeEditMode();
}

function editProduct(id) {
    // Navigate to edit page
    window.location.href = `edit-product.html?id=${id}`;
}

async function deleteProduct(id, name) {
    if (!confirm(`¿Estás seguro de eliminar "${name}"?`)) return;
    
    try {
        const token = await getAuthToken();
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Error al eliminar');
        
        alert('✅ Producto eliminado correctamente');
        loadProducts();
        
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('❌ Error al eliminar el producto');
    }
}

async function saveProduct(event) {
    event.preventDefault();
    
    const formData = new FormData();
    formData.append('name', document.getElementById('name').value);
    formData.append('price', document.getElementById('price').value);
    formData.append('old_price', document.getElementById('oldPrice').value || '');
    formData.append('category', document.getElementById('category').value);
    formData.append('in_stock', document.getElementById('inStock').value);
    
    const badges = [];
    document.querySelectorAll('.badge-input input').forEach(input => {
        if (input.value.trim()) badges.push(input.value.trim());
    });
    formData.append('badges', JSON.stringify(badges));
    
    const specs = [];
    document.querySelectorAll('.spec-input').forEach(specDiv => {
        const inputs = specDiv.querySelectorAll('input');
        if (inputs.length === 2) {
            const label = inputs[0].value.trim();
            const value = inputs[1].value.trim();
            // Only add if both label and value are provided
            if (label && value) {
                specs.push(`${label}: ${value}`);
            }
        }
    });
    formData.append('specifications', JSON.stringify(specs));
    
    const imageFile = document.getElementById('image').files[0];
    if (imageFile) {
        formData.append('image', imageFile);
    }
    
    try {
        const token = await getAuthToken();
        const productId = document.getElementById('productId').value;
        const url = productId ? `${API_URL}/products/${productId}` : `${API_URL}/products`;
        const method = productId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al guardar');
        }
        
        alert(productId ? '✅ Producto actualizado correctamente' : '✅ Producto agregado correctamente');
        closeModal();
        loadProducts();
        
    } catch (error) {
        console.error('Error saving product:', error);
        alert('❌ Error: ' + error.message);
    }
}

function closeModal() {
    document.getElementById('productModal').classList.remove('active');
    document.getElementById('productForm').reset();
    currentEditId = null;
}

function previewImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('imagePreview');
            const placeholder = document.getElementById('imagePlaceholder');
            preview.src = e.target.result;
            preview.style.display = 'block';
            if (placeholder) {
                placeholder.style.display = 'none';
            }
        };
        reader.readAsDataURL(file);
    }
}

function addBadgeInput(value = '') {
    const container = document.getElementById('badgesContainer');
    const div = document.createElement('div');
    div.className = 'badge-input';
    div.innerHTML = `
        <input type="text" placeholder="Ej: Envío Gratis" value="${value}">
        <button type="button" onclick="this.parentElement.remove()" class="btn-small btn-delete" style="padding: 8px;">❌</button>
    `;
    container.appendChild(div);
}

function addSpecInput(label = '', value = '') {
    // If value is a full spec like "Pantalla: 6.1 pulgadas", split it
    if (!value && label.includes(':')) {
        const parts = label.split(':');
        label = parts[0].trim();
        value = parts.slice(1).join(':').trim();
    }
    
    // Define placeholder examples for each label
    const placeholders = {
        'Pantalla': '6.1 pulgadas OLED, 2532 x 1170',
        'Memoria RAM': '6GB / 8GB',
        'Almacenamiento': '128GB / 256GB',
        'Cámara': '12MP Triple (Principal + Ultra gran angular + Tele)',
        'Batería': '3095 mAh, Carga rápida 20W',
        'Procesador': 'Apple A15 Bionic / Snapdragon 888'
    };
    
    const placeholder = placeholders[label] || 'Ingresa el valor...';
    
    const container = document.getElementById('specsContainer');
    const div = document.createElement('div');
    div.className = 'spec-input';
    div.style.display = 'grid';
    div.style.gridTemplateColumns = '150px auto 1fr';
    div.style.gap = '8px';
    div.style.alignItems = 'center';
    
    div.innerHTML = `
        <input type="text" placeholder="Etiqueta" value="${label}" style="width: 100%; padding: 8px 12px; border: 2px solid #E0E0E0; border-radius: 6px; font-size: 13px; font-weight: 600;" readonly>
        <span style="color: #666; font-weight: bold;">:</span>
        <input type="text" placeholder="${placeholder}" value="${value}" style="width: 100%; padding: 8px 12px; border: 2px solid #E0E0E0; border-radius: 6px; font-size: 13px;">
    `;
    container.appendChild(div);
}

window.onclick = function(event) {
    const modal = document.getElementById('productModal');
    if (event.target === modal) {
        closeModal();
    }
}

let currentDetailProduct = null;

function viewProductDetail(id) {
    // Navigate directly to edit page
    window.location.href = `edit-product.html?id=${id}`;
}

// Keep old function for reference
async function viewProductDetailOld(id) {
    try {
        const response = await fetch(`${API_URL}/products/${id}`);
        const product = await response.json();
        
        currentDetailProduct = product;
        
        // Set image
        const detailImage = document.getElementById('detailImage');
        if (product.image) {
            detailImage.src = product.image;
            detailImage.style.display = 'block';
        } else {
            detailImage.src = '';
            detailImage.style.display = 'none';
        }
        
        // Set title
        document.getElementById('detailTitle').textContent = product.name;
        
        // Set badges
        const badgesContainer = document.getElementById('detailBadges');
        badgesContainer.innerHTML = '';
        if (product.badges && product.badges.length > 0) {
            product.badges.forEach(badge => {
                const span = document.createElement('span');
                span.textContent = badge;
                badgesContainer.appendChild(span);
            });
        }
        
        // Set pricing
        const priceContainer = document.getElementById('detailPrice');
        const formattedPrice = product.price.toLocaleString('es-PY');
        const formattedOldPrice = product.old_price ? product.old_price.toLocaleString('es-PY') : null;
        
        if (formattedOldPrice) {
            priceContainer.innerHTML = `
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <span style="font-size: 1.25rem; color: #999; text-decoration: line-through;">${formattedOldPrice} PYG</span>
                </div>
                <div>
                    <span style="font-size: 1.75rem; font-weight: 700; color: #00BCD4;">${formattedPrice} PYG</span>
                </div>
            `;
        } else {
            priceContainer.innerHTML = `
                <div>
                    <span style="font-size: 1.75rem; font-weight: 700; color: #00BCD4;">${formattedPrice} PYG</span>
                </div>
            `;
        }
        
        // Set category and stock
        document.getElementById('detailCategory').textContent = product.category;
        document.getElementById('detailStock').innerHTML = product.in_stock 
            ? '<span style="color: #27AE60;">✅ Disponible</span>' 
            : '<span style="color: #e74c3c;">❌ Agotado</span>';
        
        // Set specifications
        const specsContainer = document.getElementById('detailSpecs');
        const specsSection = document.getElementById('detailSpecsSection');
        
        if (product.specifications && product.specifications.length > 0) {
            specsContainer.innerHTML = product.specifications.map(spec => `<li>${spec}</li>`).join('');
            specsSection.style.display = 'block';
        } else {
            specsSection.style.display = 'none';
        }
        
        // Show modal
        document.getElementById('productDetailModal').classList.add('active');
        
    } catch (error) {
        console.error('Error loading product detail:', error);
        alert('Error al cargar los detalles del producto');
    }
}

function closeDetailModal() {
    document.getElementById('productDetailModal').classList.remove('active');
    currentDetailProduct = null;
}

async function editProductFromDetail() {
    if (currentDetailProduct) {
        const productId = currentDetailProduct.id;
        closeDetailModal();
        // Small delay to ensure detail modal is fully closed before opening edit modal
        setTimeout(() => {
            editProduct(productId);
        }, 100);
    }
}

// Close detail modal when clicking outside
window.addEventListener('click', function(event) {
    const detailModal = document.getElementById('productDetailModal');
    if (event.target === detailModal) {
        closeDetailModal();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
});
