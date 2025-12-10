// Inline editing functionality for admin product modal

function makeEditable(element, fieldName, currentValue, productId) {
    // Skip if already editing
    if (element.classList.contains('editing')) return;
    
    element.classList.add('editing');
    const originalContent = element.innerHTML;
    
    // Create input based on field type
    let input;
    if (fieldName === 'name') {
        input = document.createElement('input');
        input.type = 'text';
        input.value = currentValue;
        input.style.fontSize = '2rem';
        input.style.fontWeight = '700';
        input.style.width = '100%';
    } else if (fieldName === 'price' || fieldName === 'oldPrice') {
        input = document.createElement('input');
        input.type = 'number';
        input.value = currentValue || '';
        input.style.fontSize = fieldName === 'oldPrice' ? '1.25rem' : '1.75rem';
        input.style.fontWeight = '700';
        input.style.width = '150px';
    } else if (fieldName === 'category') {
        input = document.createElement('select');
        const brands = ['Apple', 'Samsung', 'Xiaomi', 'Motorola', 'Huawei', 'Oppo', 'Realme', 'Nokia', 'LG', 'Sony', 'Otro'];
        brands.forEach(brand => {
            const option = document.createElement('option');
            option.value = brand;
            option.textContent = brand;
            if (brand === currentValue) option.selected = true;
            input.appendChild(option);
        });
        input.style.fontSize = '16px';
        input.style.padding = '8px';
    } else if (fieldName === 'stock') {
        input = document.createElement('select');
        ['Disponible', 'Agotado'].forEach(status => {
            const option = document.createElement('option');
            option.value = status;
            option.textContent = status === 'Disponible' ? '✅ Disponible' : '❌ Agotado';
            if (status === currentValue) option.selected = true;
            input.appendChild(option);
        });
        input.style.fontSize = '14px';
        input.style.padding = '6px';
    } else if (fieldName.startsWith('spec_')) {
        input = document.createElement('input');
        input.type = 'text';
        input.value = currentValue;
        input.style.fontSize = '14px';
        input.style.width = '100%';
    }
    
    input.style.border = '2px solid #00BCD4';
    input.style.borderRadius = '6px';
    input.style.padding = '8px';
    input.style.fontFamily = 'inherit';
    input.style.color = '#2D2D2D';
    
    element.innerHTML = '';
    element.appendChild(input);
    input.focus();
    
    // Save on blur or Enter
    const saveValue = () => {
        const newValue = input.value;
        element.classList.remove('editing');
        
        if (newValue !== currentValue) {
            // Update the display
            if (fieldName === 'price' || fieldName === 'oldPrice') {
                element.innerHTML = `<span class="product-price ${fieldName === 'oldPrice' ? 'old-price' : 'offer-price'}">${parseInt(newValue).toLocaleString('es-PY')} PYG</span>`;
            } else if (fieldName === 'stock') {
                element.innerHTML = newValue === 'Disponible' ? '<span style="color: #27AE60;">✅ Disponible</span>' : '<span style="color: #e74c3c;">❌ Agotado</span>';
            } else {
                element.textContent = newValue;
            }
            
            // Store the change (you can batch these for saving later)
            if (!window.productChanges) window.productChanges = {};
            window.productChanges[fieldName] = newValue;
            
            // Show save bar
            if (typeof showSaveBar === 'function') {
                showSaveBar();
            }
        } else {
            element.innerHTML = originalContent;
        }
    };
    
    input.addEventListener('blur', saveValue);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            input.blur();
        }
    });
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            element.classList.remove('editing');
            element.innerHTML = originalContent;
        }
    });
}

// Initialize click-to-edit on all editable elements
function initializeEditMode() {
    document.querySelectorAll('[data-editable]').forEach(element => {
        element.style.cursor = 'pointer';
        element.style.transition = 'background 0.2s';
        
        element.addEventListener('mouseenter', () => {
            if (!element.classList.contains('editing')) {
                element.style.background = 'rgba(0, 188, 212, 0.1)';
                element.style.borderRadius = '4px';
                element.style.padding = '4px 8px';
                element.style.margin = '-4px -8px';
                element.style.position = 'relative';
                
                // Add edit icon
                const icon = document.createElement('span');
                icon.className = 'edit-icon-hint';
                icon.textContent = '✏️';
                icon.style.cssText = 'position: absolute; right: 2px; top: 2px; font-size: 12px; opacity: 0.7;';
                element.appendChild(icon);
            }
        });
        
        element.addEventListener('mouseleave', () => {
            if (!element.classList.contains('editing')) {
                element.style.background = '';
                element.style.padding = '';
                element.style.margin = '';
                element.style.position = '';
                
                // Remove edit icon
                const icon = element.querySelector('.edit-icon-hint');
                if (icon) icon.remove();
            }
        });
        
        element.addEventListener('click', () => {
            const fieldName = element.dataset.editable;
            const currentValue = element.dataset.value;
            const productId = element.dataset.productId;
            makeEditable(element, fieldName, currentValue, productId);
        });
    });
}
