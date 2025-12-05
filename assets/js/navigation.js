async function loadNavigation() {
    try {
        const response = await fetch('config.json');
        const config = await response.json();
        
        if (!config.navigation || !config.navigation.items) {
            console.warn('No navigation config found');
            return;
        }
        
        const navMenu = document.querySelector('.nav-menu');
        if (!navMenu) return;
        
        navMenu.innerHTML = ''; // Clear existing nav
        
        config.navigation.items.forEach(item => {
            if (item.spacer) {
                const spacer = document.createElement('span');
                spacer.className = 'nav-spacer';
                spacer.setAttribute('aria-hidden', 'true');
                navMenu.appendChild(spacer);
                return;
            }
            
            if (item.dropdown !== undefined) {
                const dropdownDiv = document.createElement('div');
                dropdownDiv.className = 'nav-item-dropdown';
                
                const mainLink = document.createElement('a');
                mainLink.href = item.url;
                mainLink.className = 'nav-link nav-link-dropdown';
                if (item.active) mainLink.classList.add('active');
                mainLink.innerHTML = item.label + ' <span class="dropdown-arrow">▼</span>';
                
                if (item.dropdown.length > 0) {
                    mainLink.addEventListener('click', (e) => {
                        e.preventDefault();
                        
                        document.querySelectorAll('.nav-item-dropdown').forEach(dropdown => {
                            if (dropdown !== dropdownDiv) {
                                dropdown.classList.remove('active');
                            }
                        });
                        
                        dropdownDiv.classList.toggle('active');
                    });
                }
                
                const dropdownMenu = document.createElement('div');
                dropdownMenu.className = 'dropdown-menu';
                
                if (item.hideDropdown) {
                    dropdownMenu.style.display = 'none';
                }
                
                item.dropdown.forEach(dropdownItem => {
                    const dropdownLink = document.createElement('a');
                    dropdownLink.href = dropdownItem.url;
                    dropdownLink.className = 'dropdown-item';
                    dropdownLink.textContent = dropdownItem.label;
                    dropdownMenu.appendChild(dropdownLink);
                });
                
                dropdownDiv.appendChild(mainLink);
                dropdownDiv.appendChild(dropdownMenu);
                navMenu.appendChild(dropdownDiv);
            } else {
                const link = document.createElement('a');
                link.href = item.url;
                link.className = 'nav-link';
                if (item.active) link.classList.add('active');
                link.textContent = item.label;
                navMenu.appendChild(link);
            }
        });
        
    } catch (error) {
        console.error('Error loading navigation:', error);
    }
}

function setupDropdownCloseHandler() {
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-item-dropdown')) {
            document.querySelectorAll('.nav-item-dropdown').forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadNavigation();
    setupDropdownCloseHandler();
});
