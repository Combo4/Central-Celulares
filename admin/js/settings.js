const API_URL = (function () {
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
        return 'http://localhost:3002/api';
    }
    return 'https://endless-kevina-central-celulares-8eb37001.koyeb.app/api';
})();
let currentConfig = {};
let currentSocials = [];

document.querySelectorAll('.sidebar-nav li').forEach(item => {
    item.addEventListener('click', () => {
        const section = item.dataset.section;
        
        document.querySelectorAll('.sidebar-nav li').forEach(li => li.classList.remove('active'));
        item.classList.add('active');
        
        document.querySelectorAll('.settings-section').forEach(sec => sec.classList.remove('active'));
        document.getElementById(section).classList.add('active');
    });
});

async function loadAllConfig() {
    try {
        const response = await fetch(`${API_URL}/config`);
        const allConfig = await response.json();
        
        currentConfig = {
            pagination: allConfig.pagination || { itemsPerPage: 8 },
            layout: allConfig.layout || { columnsPerRow: 4 },
            site: allConfig.site || {},
            search: allConfig.search || {},
            display: allConfig.display || {},
            socials: allConfig.socials || {},
            theme: allConfig.theme || {},
            aboutUs: allConfig.aboutUs || {},
            navigation: allConfig.navigation || { items: [] }
        };
        
        currentSocials = allConfig.socials_data || [
            { name: 'Instagram', url: 'https://instagram.com', icon: 'instagram', enabled: false },
            { name: 'Facebook', url: 'https://facebook.com', icon: 'facebook', enabled: true },
            { name: 'WhatsApp', url: 'https://wa.me/', icon: 'whatsapp', enabled: true }
        ];
        
        populateAllForms();
    } catch (error) {
        console.error('Error loading config:', error);
        alert('Error cargando configuración. ¿Has migrado la configuración a la base de datos?');
    }
}

function populateAllForms() {
    document.getElementById('siteName').value = currentConfig.site?.name || '';
    document.getElementById('currency').value = currentConfig.site?.currency || '';
    document.getElementById('locale').value = currentConfig.site?.locale || '';
    document.getElementById('logo').value = currentConfig.site?.logo || '';
    document.getElementById('itemsPerPage').value = currentConfig.pagination?.itemsPerPage || 8;
    document.getElementById('columnsPerRow').value = currentConfig.layout?.columnsPerRow || 4;
    
    document.getElementById('currentTheme').value = currentConfig.theme?.current || 'cyan';
    document.getElementById('headerBackground').value = currentConfig.theme?.headerBackground || '#231F20';
    document.getElementById('headerBackgroundText').value = currentConfig.theme?.headerBackground || '#231F20';
    document.getElementById('headerActionsBackground').value = currentConfig.theme?.headerActionsBackground || '#3A3A3A';
    document.getElementById('headerActionsBackgroundText').value = currentConfig.theme?.headerActionsBackground || '#3A3A3A';
    
    document.getElementById('headerBackground').addEventListener('input', (e) => {
        document.getElementById('headerBackgroundText').value = e.target.value;
    });
    document.getElementById('headerBackgroundText').addEventListener('input', (e) => {
        document.getElementById('headerBackground').value = e.target.value;
    });
    document.getElementById('headerActionsBackground').addEventListener('input', (e) => {
        document.getElementById('headerActionsBackgroundText').value = e.target.value;
    });
    document.getElementById('headerActionsBackgroundText').addEventListener('input', (e) => {
        document.getElementById('headerActionsBackground').value = e.target.value;
    });
    
    renderSocials();
    renderNavigation();
    
    document.getElementById('aboutTitle').value = currentConfig.aboutUs?.title || '';
    document.getElementById('aboutSubtitle').value = currentConfig.aboutUs?.subtitle || '';
    document.getElementById('aboutDescription').value = currentConfig.aboutUs?.description || '';
    document.getElementById('historyTitle').value = currentConfig.aboutUs?.history?.title || '';
    document.getElementById('historyContent').value = currentConfig.aboutUs?.history?.content || '';
    
    renderStats();
    
    document.getElementById('locationAddress').value = currentConfig.aboutUs?.location?.address || '';
    document.getElementById('locationPhone').value = currentConfig.aboutUs?.location?.phone || '';
    document.getElementById('locationEmail').value = currentConfig.aboutUs?.location?.email || '';
    document.getElementById('locationHours').value = currentConfig.aboutUs?.location?.hours || '';
    
    document.getElementById('showOldPrices').checked = currentConfig.display?.showOldPrices !== false;
    document.getElementById('showStockBadge').checked = currentConfig.display?.showStockBadge || false;
    document.getElementById('showSocialsInFooter').checked = currentConfig.socials?.showInFooter !== false;
    document.getElementById('productPlaceholder').value = currentConfig.display?.productImagePlaceholder || '📱';
}

function renderSocials() {
    const container = document.getElementById('socialsContainer');
    container.innerHTML = '';
    
    currentSocials.forEach((social, index) => {
        const div = document.createElement('div');
        div.className = 'social-item';
        div.innerHTML = `
            <div class="social-item-header">
                <h4>${social.name}</h4>
                <label class="toggle-switch">
                    <input type="checkbox" ${social.enabled ? 'checked' : ''} onchange="toggleSocial(${index})">
                    <span class="toggle-slider"></span>
                </label>
            </div>
            <div class="form-group">
                <label>URL</label>
                <input type="url" value="${social.url}" onchange="updateSocialUrl(${index}, this.value)">
            </div>
        `;
        container.appendChild(div);
    });
}

function toggleSocial(index) {
    currentSocials[index].enabled = !currentSocials[index].enabled;
}

function updateSocialUrl(index, url) {
    currentSocials[index].url = url;
}

function renderNavigation() {
    const container = document.getElementById('navigationContainer');
    container.innerHTML = '';
    
    if (!currentConfig.navigation?.items) return;
    
    currentConfig.navigation.items.forEach((item, index) => {
        if (item.spacer) return;
        
        const div = document.createElement('div');
        div.className = 'nav-item-editor';
        div.innerHTML = `
            <div class="form-row">
                <div class="form-group">
                    <label>Etiqueta</label>
                    <input type="text" value="${item.label}" onchange="updateNavItem(${index}, 'label', this.value)">
                </div>
                <div class="form-group">
                    <label>URL</label>
                    <input type="text" value="${item.url}" onchange="updateNavItem(${index}, 'url', this.value)">
                </div>
            </div>
            ${item.dropdown && item.dropdown.length > 0 ? `
                <div class="dropdown-items">
                    <h5>Dropdown Items:</h5>
                    ${item.dropdown.map((drop, dIndex) => `
                        <div class="dropdown-item">
                            <input type="text" placeholder="Label" value="${drop.label}" onchange="updateNavDropdown(${index}, ${dIndex}, 'label', this.value)" style="width: 45%; margin-right: 10px;">
                            <input type="text" placeholder="URL" value="${drop.url}" onchange="updateNavDropdown(${index}, ${dIndex}, 'url', this.value)" style="width: 45%;">
                            <button class="btn-remove" onclick="removeNavDropdown(${index}, ${dIndex})">❌</button>
                        </div>
                    `).join('')}
                    <button class="btn-add" onclick="addNavDropdown(${index})">➕ Agregar Dropdown</button>
                </div>
            ` : ''}
            <button class="btn-remove" onclick="removeNavItem(${index})" style="margin-top: 10px;">🗑️ Eliminar Item</button>
        `;
        container.appendChild(div);
    });
}

function updateNavItem(index, field, value) {
    currentConfig.navigation.items[index][field] = value;
}

function updateNavDropdown(navIndex, dropIndex, field, value) {
    currentConfig.navigation.items[navIndex].dropdown[dropIndex][field] = value;
}

function addNavDropdown(navIndex) {
    if (!currentConfig.navigation.items[navIndex].dropdown) {
        currentConfig.navigation.items[navIndex].dropdown = [];
    }
    currentConfig.navigation.items[navIndex].dropdown.push({
        label: 'Nuevo Item',
        url: '#'
    });
    renderNavigation();
}

function removeNavDropdown(navIndex, dropIndex) {
    currentConfig.navigation.items[navIndex].dropdown.splice(dropIndex, 1);
    renderNavigation();
}

function addNavItem() {
    if (!currentConfig.navigation) currentConfig.navigation = { items: [] };
    currentConfig.navigation.items.push({
        label: 'Nuevo Item',
        url: '#',
        dropdown: []
    });
    renderNavigation();
}

function removeNavItem(index) {
    if (confirm('¿Eliminar este item de navegación?')) {
        currentConfig.navigation.items.splice(index, 1);
        renderNavigation();
    }
}

function renderStats() {
    const container = document.getElementById('statsContainer');
    container.innerHTML = '';
    
    if (!currentConfig.aboutUs?.stats) {
        currentConfig.aboutUs = currentConfig.aboutUs || {};
        currentConfig.aboutUs.stats = [];
    }
    
    currentConfig.aboutUs.stats.forEach((stat, index) => {
        const div = document.createElement('div');
        div.className = 'form-row';
        div.style.marginBottom = '15px';
        div.innerHTML = `
            <div class="form-group">
                <label>Número</label>
                <input type="text" value="${stat.number}" onchange="updateStat(${index}, 'number', this.value)">
            </div>
            <div class="form-group">
                <label>Label</label>
                <input type="text" value="${stat.label}" onchange="updateStat(${index}, 'label', this.value)">
            </div>
            <button class="btn-remove" onclick="removeStat(${index})">❌</button>
        `;
        container.appendChild(div);
    });
    
    const addBtn = document.createElement('button');
    addBtn.className = 'btn-add';
    addBtn.textContent = '➕ Agregar Estadística';
    addBtn.onclick = addStat;
    container.appendChild(addBtn);
}

function updateStat(index, field, value) {
    currentConfig.aboutUs.stats[index][field] = value;
}

function addStat() {
    currentConfig.aboutUs.stats.push({ number: '0', label: 'Nueva Estadística' });
    renderStats();
}

function removeStat(index) {
    currentConfig.aboutUs.stats.splice(index, 1);
    renderStats();
}

async function saveToBackend(key, value) {
    try {
        const token = await getAuthToken();
        
        if (!token) {
            console.error('No authentication token available');
            alert('❌ Error: No estás autenticado. Por favor recarga la página e inicia sesión.');
            return false;
        }
        
        console.log(`Saving config key: ${key}`);
        
        const response = await fetch(`${API_URL}/config/${key}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ value })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Server error:', errorData);
            throw new Error(errorData.error || `Error HTTP: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Save successful:', result);
        
        return true;
    } catch (error) {
        console.error('Error saving config:', error);
        alert(`❌ Error al guardar: ${error.message}`);
        return false;
    }
}

async function saveGeneral() {
    currentConfig.site = {
        name: document.getElementById('siteName').value,
        currency: document.getElementById('currency').value,
        locale: document.getElementById('locale').value,
        logo: document.getElementById('logo').value
    };
    
    currentConfig.pagination = {
        itemsPerPage: parseInt(document.getElementById('itemsPerPage').value)
    };
    
    currentConfig.layout = {
        columnsPerRow: parseInt(document.getElementById('columnsPerRow').value)
    };
    
    const success = await Promise.all([
        saveToBackend('site', currentConfig.site),
        saveToBackend('pagination', currentConfig.pagination),
        saveToBackend('layout', currentConfig.layout)
    ]);
    
    if (success.every(s => s)) {
        alert('✅ Configuración general guardada correctamente');
    } else {
        alert('❌ Error al guardar configuración');
    }
}

async function saveTheme() {
    if (!currentConfig.theme) currentConfig.theme = {};
    
    currentConfig.theme.current = document.getElementById('currentTheme').value;
    currentConfig.theme.headerBackground = document.getElementById('headerBackgroundText').value;
    currentConfig.theme.headerActionsBackground = document.getElementById('headerActionsBackgroundText').value;
    
    const success = await saveToBackend('theme', currentConfig.theme);
    
    if (success) {
        alert('✅ Tema guardado correctamente');
    } else {
        alert('❌ Error al guardar tema');
    }
}

async function saveSocials() {
    const success = await saveToBackend('socials_data', currentSocials);
    
    if (success) {
        alert('✅ Redes sociales guardadas correctamente');
    } else {
        alert('❌ Error al guardar redes sociales');
    }
}

async function saveNavigation() {
    const success = await saveToBackend('navigation', currentConfig.navigation);
    
    if (success) {
        alert('✅ Navegación guardada correctamente');
    } else {
        alert('❌ Error al guardar navegación');
    }
}

async function saveAbout() {
    currentConfig.aboutUs = currentConfig.aboutUs || {};
    currentConfig.aboutUs.title = document.getElementById('aboutTitle').value;
    currentConfig.aboutUs.subtitle = document.getElementById('aboutSubtitle').value;
    currentConfig.aboutUs.description = document.getElementById('aboutDescription').value;
    
    currentConfig.aboutUs.history = {
        title: document.getElementById('historyTitle').value,
        content: document.getElementById('historyContent').value
    };
    
    const success = await saveToBackend('aboutUs', currentConfig.aboutUs);
    
    if (success) {
        alert('✅ Sobre Nosotros guardado correctamente');
    } else {
        alert('❌ Error al guardar Sobre Nosotros');
    }
}

async function saveContact() {
    if (!currentConfig.aboutUs) currentConfig.aboutUs = {};
    
    currentConfig.aboutUs.location = {
        title: 'Ubicación',
        address: document.getElementById('locationAddress').value,
        phone: document.getElementById('locationPhone').value,
        email: document.getElementById('locationEmail').value,
        hours: document.getElementById('locationHours').value,
        mapEmbed: ''
    };
    
    const success = await saveToBackend('aboutUs', currentConfig.aboutUs);
    
    if (success) {
        alert('✅ Información de contacto guardada correctamente');
    } else {
        alert('❌ Error al guardar información de contacto');
    }
}

async function saveDisplay() {
    currentConfig.display = {
        showOldPrices: document.getElementById('showOldPrices').checked,
        showStockBadge: document.getElementById('showStockBadge').checked,
        productImagePlaceholder: document.getElementById('productPlaceholder').value
    };
    
    currentConfig.socials = currentConfig.socials || {};
    currentConfig.socials.showInFooter = document.getElementById('showSocialsInFooter').checked;
    
    const success = await Promise.all([
        saveToBackend('display', currentConfig.display),
        saveToBackend('socials', currentConfig.socials)
    ]);
    
    if (success.every(s => s)) {
        alert('✅ Opciones de visualización guardadas correctamente');
    } else {
        alert('❌ Error al guardar opciones de visualización');
    }
}

async function getAuthToken() {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
}

function logout() {
    supabase.auth.signOut();
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = 'login.html';
        return;
    }
    
    document.getElementById('userEmail').textContent = session.user.email;
    
    loadAllConfig();
});
