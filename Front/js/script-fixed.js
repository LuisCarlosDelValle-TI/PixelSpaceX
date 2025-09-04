// Script principal simplificado

console.log('🔧 Script principal cargado');

// Sistema de navegación simple
const SectionManager = {
    currentSection: null,
    
    onSectionChange: function(newSection, oldSection) {
        console.log(`Cambio de sección: ${oldSection} → ${newSection}`);
        this.currentSection = newSection;
    }
};

// Función para obtener URL del API
function getApiUrl() {
    if (window.API_BASE_URL) {
        return window.API_BASE_URL;
    }
    
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3001/api';
    }
    return window.location.protocol + '//' + window.location.host + '/api';
}

async function loadSection(section) {
    try {
        const mainContent = document.getElementById('mainContent');
        if (!mainContent) {
            console.error('No se encontró mainContent');
            return;
        }
        
        // Mostrar loading
        mainContent.innerHTML = `
            <div class="flex justify-center items-center h-64">
                <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <span class="ml-4 text-gray-600">Cargando ${section}...</span>
            </div>`;
        
        // Actualizar navegación
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('bg-gray-100', 'text-blue-600');
            if (link.dataset.section === section) {
                link.classList.add('bg-gray-100', 'text-blue-600');
            }
        });

        if (section === 'dashboard') {
            await loadDashboardSection();
        } else if (section === 'ventas') {
            await loadVentasSection();
        } else if (section === 'productos') {
            await loadProductosSection();
        } else if (section === 'reportes') {
            await loadReportesSection();
        }
        
        SectionManager.onSectionChange(section, SectionManager.currentSection);
        
    } catch (error) {
        console.error('Error al cargar la sección:', error);
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <strong>Error:</strong> No se pudo cargar la sección ${section}.
                    <button onclick="location.reload()" class="ml-4 bg-red-500 text-white px-3 py-1 rounded">Reintentar</button>
                </div>`;
        }
    }
}

async function loadDashboardSection() {
    try {
        const response = await fetch('/Front/views/dashboard.html');
        const html = await response.text();
        document.getElementById('mainContent').innerHTML = html;
        document.title = 'Panel de Control | Papelería Luis';
        
        // Inicializar dashboard
        setTimeout(() => {
            if (typeof initializeDashboard === 'function') {
                console.log('🚀 Inicializando dashboard...');
                initializeDashboard();
            } else {
                console.error('Función initializeDashboard no encontrada');
            }
        }, 100);
        
    } catch (error) {
        console.error('Error cargando dashboard:', error);
        throw error;
    }
}

async function loadVentasSection() {
    try {
        const response = await fetch('/Front/views/ventas.html');
        const html = await response.text();
        document.getElementById('mainContent').innerHTML = html;
        document.title = 'Ventas | Papelería Luis';
        
        // Cargar script de ventas
        setTimeout(() => {
            loadVentasScript();
        }, 100);
        
    } catch (error) {
        console.error('Error cargando ventas:', error);
        throw error;
    }
}

async function loadProductosSection() {
    try {
        const response = await fetch('/Front/views/inventario.html');
        const html = await response.text();
        document.getElementById('mainContent').innerHTML = html;
        document.title = 'Gestión de Productos | Papelería Luis';
        
        // Cargar productos directamente
        setTimeout(() => {
            loadProductosDirecto();
        }, 100);
        
    } catch (error) {
        console.error('Error cargando productos:', error);
        throw error;
    }
}

async function loadReportesSection() {
    try {
        const response = await fetch('/Front/views/reportes.html');
        const html = await response.text();
        document.getElementById('mainContent').innerHTML = html;
        document.title = 'Reportes | Papelería Luis';
    } catch (error) {
        console.error('Error cargando reportes:', error);
        throw error;
    }
}

// Función para cargar ventas
async function loadVentasScript() {
    try {
        const apiUrl = getApiUrl();
        const response = await fetch(apiUrl + '/productos');
        const data = await response.json();
        
        const grid = document.getElementById('products-grid');
        if (grid && data.data) {
            grid.innerHTML = '';
            data.data.forEach(product => {
                const div = document.createElement('div');
                div.className = 'bg-white p-4 rounded-lg shadow hover:shadow-md cursor-pointer';
                div.innerHTML = `
                    <h3 class="font-semibold text-gray-800">${product.nombre}</h3>
                    <p class="text-sm text-gray-600">${product.categoria}</p>
                    <p class="text-lg font-bold text-green-600">$${product.precio_venta}</p>
                    <p class="text-sm text-gray-500">Stock: ${product.stock_actual}</p>
                `;
                grid.appendChild(div);
            });
        }
    } catch (error) {
        console.error('Error en ventas:', error);
    }
}

// Función para cargar productos
async function loadProductosDirecto() {
    try {
        const apiUrl = getApiUrl();
        const tbody = document.querySelector('#tabla-productos tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4">Cargando productos...</td></tr>';
        
        const response = await fetch(apiUrl + '/productos');
        const data = await response.json();
        
        tbody.innerHTML = '';
        
        if (data.data && data.data.length > 0) {
            data.data.forEach(producto => {
                const row = document.createElement('tr');
                row.className = 'hover:bg-gray-50';
                row.innerHTML = `
                    <td class="px-6 py-4">
                        <div class="text-sm font-medium text-gray-900">${producto.nombre}</div>
                        <div class="text-sm text-gray-500">${producto.codigo_barras || ''}</div>
                    </td>
                    <td class="px-6 py-4">
                        <span class="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                            ${producto.categoria}
                        </span>
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-500">
                        ${producto.stock_actual} ${producto.unidad_medida || 'pcs'}
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-500">
                        $${parseFloat(producto.precio_venta || 0).toFixed(2)}
                    </td>
                    <td class="px-6 py-4 text-right">
                        <button class="text-indigo-600 hover:text-indigo-900 mr-3" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="text-red-600 hover:text-red-900" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-gray-500">No hay productos registrados</td></tr>';
        }
    } catch (error) {
        console.error('Error cargando productos:', error);
        const tbody = document.querySelector('#tabla-productos tbody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-red-500">Error al cargar productos</td></tr>';
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM cargado, inicializando navegación...');
    
    // Cargar sección inicial
    const urlParams = new URLSearchParams(window.location.search);
    const section = urlParams.get('section') || 'dashboard';
    loadSection(section);
    
    // Event listeners para navegación
    document.addEventListener('click', function(e) {
        const navLink = e.target.closest('.nav-link');
        if (navLink) {
            e.preventDefault();
            const section = navLink.dataset.section;
            console.log('Navegando a:', section);
            window.history.pushState({}, '', `?section=${section}`);
            loadSection(section);
        }
    });
    
    // Manejar botón atrás/adelante
    window.addEventListener('popstate', function() {
        const urlParams = new URLSearchParams(window.location.search);
        const section = urlParams.get('section') || 'dashboard';
        loadSection(section);
    });
});

console.log('✅ Script principal configurado');
